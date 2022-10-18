import EventEmitter from 'events';

import { MAINNET_CHAIN_ID } from './constants/network';
import { SECOND } from './constants/time';
import { GasFeeController } from './controllers/gas/gas-fee-controller';
import HistoryController, {
  HISTORY_EVENTS,
} from './controllers/history-controller';
import KeyringController from './controllers/keyring-controller';
import ProviderController, {
  NETWORK_EVENTS,
} from './controllers/provider-controller';
import TokenController from './controllers/token-controller';
import TransactionController from './controllers/transactions/transaction-controller';
import ExtensionStore from './lib/localstore';

class Controller extends EventEmitter {
  constructor(remotePort) {
    super();
    this.store = new ExtensionStore();

    this.providerController = new ProviderController({
      store: this.store,
      infuraProjectId: process.env.INFURA_PROJECT_ID,
    });
    this.providerController.initializeProvider();

    this.keyringController = new KeyringController({
      store: this.store,
      ethQuery: this.providerController.query.bind(this.providerController),
    });

    this.gasFeeController = new GasFeeController({
      interval: SECOND * 10,
      ethQuery: this.providerController.query.bind(this.providerController),
      onNetworkStateChange: this.providerController.on.bind(
        this.providerController,
        NETWORK_EVENTS.NETWORK_DID_CHANGE,
      ),
      getCurrentNetworkEIP1559Compatibility:
        this.providerController.getEIP1559Compatibility.bind(
          this.providerController,
        ),
      getCurrentNetworkLegacyGasAPICompatibility: () => {
        const chainId = this.providerController.getCurrentChainId();
        return chainId === MAINNET_CHAIN_ID;
      },
      getChainId: () => {
        return this.providerController.getCurrentChainId();
      },
    });

    this.txController = new TransactionController({
      store: this.store,
      ethQuery: this.providerController.query.bind(this.providerController),
      getBlockTracker: this.providerController.getBlockTracker.bind(
        this.providerController,
      ),
      unlockKeyrings: this.keyringController.unlockKeyrings.bind(
        this.keyringController,
      ),
      signTransaction: this.keyringController.signTransaction.bind(
        this.keyringController,
      ),
      getEIP1559Compatibility:
        this.providerController.getEIP1559Compatibility.bind(
          this.providerController,
        ),
      txHistoryLimit: 60,
      getNetworkId: this.providerController.getNetworkId.bind(
        this.providerController,
      ),
      getCurrentChainId: () => {
        return this.providerController.getCurrentChainId();
      },
    });
    this.txController.initializeTransaction();

    /**
     * switchNetwork 시점에 store에 저장되어있던 unapproved 정보를 clear하기 위해 추가함
     */
    this.providerController.on(NETWORK_EVENTS.NETWORK_WILL_CHANGE, () => {
      this.txController.txStateManager.clearUnapprovedTxs();
      this.keyringController.updateStoreSelectedAddress(
        this.store.accounts?.selectedAddress,
      );
    });

    this.tokenController = new TokenController({
      store: this.store,
      ethQuery: this.providerController.query.bind(this.providerController),
      sendRawTransaction: this.txController.sendRawTransaction.bind(
        this.txController,
      ),
    });
    this.tokenController.initializeTokens();

    this.historyController = new HistoryController({
      store: this.store,
      onNetworkStateChange: this.providerController.on.bind(
        this.providerController,
        NETWORK_EVENTS.NETWORK_DID_CHANGE,
      ),
    });

    this.onEthHistoryChange = this.historyController.on.bind(
      this.historyController,
      HISTORY_EVENTS.TX_LIST_DID_CHANGE,
    );

    this.onKlaytnHistoryChange = this.historyController.on.bind(
      this.historyController,
      HISTORY_EVENTS.KLAYTN_TX_LIST_DID_CHANGE,
    );

    this.onEthHistoryChange(async () => {
      try {
        remotePort.postMessage({
          ethTransactions: this.historyController.ethTransactions,
        });
      } catch (e) {
        console.warn(e);
      }
    });
  }

  getLatestBlock = async () => {
    const block = await this.providerController.getLatestBlock();
    return {
      block,
    };
  };

  getNetworkId = async () => {
    const networkId = await this.providerController.getNetworkId();
    return {
      networkId,
    };
  };

  setRpcTarget = (_, { rpcUrl, chainId }) => {
    return Promise.resolve(
      this.providerController.setRpcTarget(rpcUrl, chainId),
    );
  };

  setProviderType = (_, { chainId }) => {
    return Promise.resolve(this.providerController.setProviderType(chainId));
  };

  getCurrentChainId = async () => {
    const chainId = await this.providerController.getCurrentChainId();
    return {
      chainId,
    };
  };

  // 신규 니모닉 구문 얻기
  getNewMnemonic = async () => {
    return Promise.resolve(this.keyringController.getNewMnemonic());
  };

  // 니모닉 코드 검증
  getMnemonicValidate = async (_, { mnemonic }) => {
    return Promise.resolve(
      this.keyringController.getMnemonicValidate(mnemonic),
    );
  };

  // 신규 계정 생성
  newAccount = async (_, { password, mnemonic }) => {
    const accounts = await this.keyringController.createNewAccount({
      password,
      mnemonic,
    });
    return accounts;
  };

  // 계정 복구
  importAccount = async (_, { password, mnemonic }) => {
    const accounts = await this.keyringController.createNewVaultAndRestore({
      password,
      mnemonic,
    });
    return accounts;
  };

  // 사용자 입력 패스워드를 통해 잠금 해제
  verifyPassword = async (_, { password }) => {
    // 비밀번호 검증
    const verifyResult = await this.keyringController.verifyPassword(password);
    return verifyResult;
  };

  // 비공개키 추출
  getExportPrivateKey = async (_, { address, password }) => {
    // 비밀번호 검증
    await this.keyringController.verifyPassword(password);
    const privateKey = await this.keyringController.getExportKey({
      keyType: 'private',
      address,
    });
    return privateKey;
  };

  // 공개키 추출
  getExportPublicKey = async (_, { address, password }) => {
    // 비밀번호 검증
    await this.keyringController.verifyPassword(password);
    const publicKey = await this.keyringController.getExportKey({
      keyType: 'public',
      address,
    });
    return publicKey;
  };

  // 키스토어 v3 추출
  getExportKeystoreV3 = async (_, { privateKey, password }) => {
    const keystoreV3 = await this.keyringController.getExportKeystoreV3({
      privateKey,
      password,
    });
    return keystoreV3;
  };

  // 계정 가져오기 (비공개 키 or json 파일)
  getImportAccountStrategy = (_, { strategy, args }) => {
    const selectedAddress = this.keyringController.getImportAccountStrategy({
      strategy,
      args,
    });
    return selectedAddress;
  };

  // keystore -> privKey 추출
  getKeystoreToPrivKey = async (_, { fileContents, password }) => {
    const privKey = await this.keyringController.getKeystoreToPrivKey({
      fileContents,
      password,
    });
    return { privKey };
  };

  // store get accounts
  getStoreAccounts = async (_) => {
    const accounts = await this.keyringController.getStoreAccounts();
    return accounts;
  };

  // store set selected address
  setStoreSelectedAddress = async (_, { selectedAddress }) => {
    return Promise.resolve(
      this.keyringController.updateStoreSelectedAddress(selectedAddress),
    );
  };

  // transaction send test
  sendRawTransaction = async (_, txMeta) => {
    const txHash = await this.txController.sendRawTransaction(txMeta);
    return {
      txHash,
    };
  };

  // 가스비를 polling하면서 가져오는 함수
  getGasFeeEstimatesAndStartPolling = async () => {
    const gasFeeEstimatesResult =
      await this.gasFeeController.getGasFeeEstimatesAndStartPolling();
    return gasFeeEstimatesResult;
  };

  // 가스비를 가져오는 함수
  getGasFeeEstimates = async () => {
    const estimateData = await this.gasFeeController.fetchGasFeeEstimates();
    return estimateData;
  };

  // 특정 task 삭제
  disconnectPoller = (pollToken) => {
    return new Promise((resolve, reject) => {
      try {
        this.gasFeeController.disconnectPoller(pollToken);
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  };

  // polling stop
  stopPolling = () => {
    return new Promise((resolve, reject) => {
      try {
        this.gasFeeController.stopPolling();
        resolve(true);
      } catch (e) {
        reject(e);
      }
    });
  };

  // polling stop
  getGasFeeTimeEstimate = (maxPriorityFeePerGas, maxFeePerGas) => {
    return new Promise((resolve, reject) => {
      try {
        const timeEstimates = this.gasFeeController.getTimeEstimate(
          maxPriorityFeePerGas,
          maxFeePerGas,
        );
        resolve({
          ...timeEstimates,
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  // get tokens for selected address
  getTokens = async () => {
    const tokens = await this.tokenController.getTokens();
    return { tokens };
  };

  // store set add tokens
  addToken = async (_, { tokenAddress, symbol, decimals, image }) => {
    const tokenResult = await this.tokenController.addToken(
      tokenAddress,
      symbol,
      decimals,
      image,
    );
    return { tokenResult };
  };

  // swith main accounts
  switchAccounts = async () => {
    const address = await this.tokenController.switchAccounts();
    return { address };
  };

  // next nonce
  getNextNonce = async (_, { address }) => {
    const nonceLock = await this.txController.nonceTracker.getNonceLock(
      address,
    );
    nonceLock.releaseLock();
    return nonceLock.nextNonce;
  };

  // set unapproved tx
  setUnapprovedTx = async (_, { txParams }) => {
    const txMeta = await this.txController.setUnapprovedTx({ txParams });
    return txMeta;
  };

  // reset unapproved tx
  resetUnapprovedTx = async () => {
    const res = await this.txController.resetUnapprovedTx();
    return res;
  };

  // transfer erc20 token
  transferERC20 = async (_, { receiver, amount }) => {
    const txResult = await this.tokenController.transferERC20(receiver, amount);
    return {
      txResult,
    };
  };

  getEthTxHistory = () => {
    const { ethTransactions } = this.historyController;
    return Promise.resolve(ethTransactions);
  };

  getErc20TransferHistory = () => {
    const { erc20transfers } = this.historyController;
    return Promise.resolve(erc20transfers);
  };

  getErc721TransferHistory = () => {
    const { erc721transfers } = this.historyController;
    return Promise.resolve(erc721transfers);
  };

  getKlaytnTxHistory = () => {
    const { klaytnTransactions } = this.historyController;
    return Promise.resolve(klaytnTransactions);
  };
}

export default Controller;
