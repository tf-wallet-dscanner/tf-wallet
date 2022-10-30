export const BackgroundMessages = {
  INPAGE_TO_BG: 'inpage',
  GET_LATEST_BLOCK: 'getLatestBlock',
  GET_NETWORK_ID: 'getNetworkId',
  SET_RPC_TARGET: 'setRpcTarget',
  SET_PROVIDER_TYPE: 'setProviderType',
  GET_CURRENT_CHAIN_ID: 'getCurrentChainId',
  GET_NEW_MNEMONIC_BG: 'getNewMnemonic', // 신규 니모닉 얻기
  GET_MNEMONIC_VALIDATE_BG: 'getMnemonicValidate', // 니모닉 검증값 얻기
  NEW_ACCOUNT_BG: 'newAccount', // 새 계정 생성
  ADD_ACCOUNTS: 'addAccounts', // 계정 추가
  IMPORT_ACCOUNT_BG: 'importAccount', // 계정 복구
  VERIFY_PASSWORD: 'verifyPassword', // 패스워드 확인
  GET_EXPORT_PRIVATE_KEY_BG: 'getExportPrivateKey', // 비공개키 추출
  GET_EXPORT_PUBLIC_KEY_BG: 'getExportPublicKey', // 공개키 추출
  GET_EXPORT_KEYSTORE_V3_BG: 'getExportKeystoreV3', // 키스토어 V3 추출
  GET_IMPORT_ACCOUNT_STRATEGY_BG: 'getImportAccountStrategy', // 계정 가져오기(비공개키 or json 파일)
  GET_KEYSTORE_TO_PRIVKEY: 'getKeystoreToPrivKey', // keystoreV3로부터 privateKey 추출
  GET_STORE_ACCOUNTS: 'getStoreAccounts', // Store에서 Accounts 데이터 get
  SET_STORE_SELECTED_ADDRESS: 'setStoreSelectedAddress', // Store에서 Accounts SelectedAddress 값 set
  GET_BALANCE: 'getBalance', // 현재 EOA 기준 getBalance
  SEND_RAW_TRANSACTION: 'sendRawTransaction',
  GET_TOKENS: 'getTokens', // 선택된 계정의 token list 불러오기
  ADD_TOKEN: 'addToken', // Store에 추가된 token 정보 set (계정 별 token list 다름)
  SWITCH_ACCOUNTS: 'switchAccounts', // 변경된 Accounts로 token controller 재설정
  TRANSFER_ERC20: 'transferERC20', // ERC20 토큰 전송하기 (sendRawTransaction)
  GET_GAS_FEE_ESTIMATES_START_POLLING: 'getGasFeeEstimatesAndStartPolling',
  GET_GAS_FEE_ESTIMATES: 'getGasFeeEstimates',
  GET_NEXT_NONCE: 'getNextNonce',
  SET_UNAPPROVED_TX: 'setUnapprovedTx', // store에 currentNetworkTxList, unapproveTxs 추가
  RESET_UNAPPROVED_TX: 'resetUnapprovedTx', // store unapproveTxs 초기화
  GET_ETH_TX_HISTORY: 'getEthTxHistory',
  GET_ERC20_TRANSFER_HISTORY: 'getErc20TransferHistory',
  GET_ERC721_TRANSFER_HISTORY: 'getErc721TransferHistory',
  GET_KLAYTN_TX_HISTORY: 'getKlaytnTxHistory',
};
