export const BackgroundMessages = {
  INPAGE_TO_BG: 'inpage',
  GET_LATEST_BLOCK: 'getLatestBlock',
  GET_NETWORK_ID: 'getNetworkId',
  SET_RPC_TARGET: 'setRpcTarget',
  SET_PROVIDER_TYPE: 'setProviderType',
  GET_CURRENT_CHAIN_ID: 'getCurrentChainId',
  GENERATE_MNEMONIC_BG: 'generateMnemonic', // 니모닉 생성
  VALIDATE_MNEMONIC_BG: 'validateMnemonic', // 니모닉 검증
  NEW_ACCOUNT_BG: 'newAccount', // 새 계정 생성
  IMPORT_ACCOUNT_BG: 'importAccount', // 계정 복구
  EXPORT_PRIVATE_KEY_BG: 'exportPrivateKey', // 비공개키 추출
  EXPORT_PUBLIC_KEY_BG: 'exportPublicKey', // 공개키 추출
  EXPORT_KEYSTORE_V3_BG: 'exportKeystoreV3', // 키스토어 V3 추출
  IMPORT_ACCOUNT_STRATEGY_BG: 'importAccountStrategy', // 계정 가져오기(비공개키 or json 파일)
  GET_STORE_ACCOUNTS: 'getStoreAccounts', // Store에서 Accounts 데이터 get
  SET_STORE_SELECTED_ADDRESS: 'setStoreSelectedAddress', // Store에서 Accounts SelectedAddress 값 set
  SEND_RAW_TRANSACTION: 'sendRawTransaction',
  GET_TOKENS: 'getTokens', // 선택된 계정의 token list 불러오기
  ADD_TOKEN: 'addToken', // Store에 추가된 token 정보 set (계정 별 token list 다름)
  SWITCH_ACCOUNTS: 'switchAccounts', // 변경된 Accounts로 token controller 재설정
};
