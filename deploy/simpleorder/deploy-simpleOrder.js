/* eslint-disable func-names */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const Caver = require('caver-js');
// eslint-disable-next-line import/no-unresolved
const contract = require('../../contracts/simpleOrder.json');

const NETWORK_CHAIN_ID = {
  mainnet: 0x1,
  goerli: 0x5,
  cypress: 0x2019,
  baobab: 0x3e9,
};
const deployerPrivKey = process.env.DEPLOY_PRIVKEY;

const getKlaytnRpcUrl = ({ network }) =>
  `https://public-node-api.klaytnapi.com/v1/${network}`;

async function deploy() {
  try {
    const input = {
      network: process.argv[2], // baobab
      whitelist: process.argv[3], // EOA
    };

    const chainName = input.network;
    const chainId = NETWORK_CHAIN_ID[`${chainName}`];
    const caver = new Caver(getKlaytnRpcUrl({ network: chainName }));

    const deployerAcc =
      caver.klay.accounts.privateKeyToAccount(deployerPrivKey);
    const deployerAddr = deployerAcc.address;

    const contractInst = new caver.klay.Contract(contract.abi);
    const deployFunc = contractInst.deploy({
      data: contract.bytecode,
      arguments: [input.whitelist],
    });
    const deployData = deployFunc.encodeABI();

    const keyring = await caver.wallet.keyring.create(
      deployerAddr,
      deployerPrivKey,
    );
    const txCurCnt = await caver.rpc.klay.getTransactionCount(deployerAddr);
    await caver.wallet.add(keyring);

    const rawTx = {
      from: deployerAddr,
      nonce: txCurCnt,
      data: deployData,
      gas: 7500000,
      // gasPrice: 20000000000, // caverjs 에서 잡아주는 듯
      chainId,
    };

    const cbHash = async function (txHash) {
      console.log(`Deploy TX:['${txHash}'] Created!`);
    };
    const cbReceipt = async function (receipt) {
      console.log(`Deploy TX:['${receipt.transactionHash}'] Done!`);
      console.log(`- BlockNumber:[${parseInt(receipt.blockNumber, 10)}]`);
      console.log(`- contractAddress:[${receipt.contractAddress}]`);
      console.log(`- receipt:[${JSON.stringify(receipt)}]`);
    };
    const cbError = async function (error) {
      console.log(`Error:['${error}']`);
    };

    // const tx = new Tx(rawTx, { chain: chainName });
    const tx = caver.transaction.smartContractDeploy.create(rawTx);
    await caver.wallet.sign(keyring.address, tx);

    await caver.rpc.klay
      .sendRawTransaction(tx)
      .on('transactionHash', async function (txHash) {
        await cbHash(txHash);
      })
      .on('receipt', async function (receipt) {
        await cbReceipt(receipt);
      })
      .on('error', async function (error) {
        await cbError(error);
      });
  } catch (err) {
    console.log(err);
  }
}

deploy();
