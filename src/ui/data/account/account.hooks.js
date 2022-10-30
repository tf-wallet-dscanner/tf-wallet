import { SECOND } from 'app/constants/time';
import { useMutation, useQuery } from 'react-query';

import {
  addAccounts,
  getBalance,
  getExportKeystoreV3,
  getExportPrivateKey,
  getExportPublicKey,
  getImportAccountStrategy,
  getKeystoreToPrivKey,
  getMnemonicValidate,
  getNewMnemonic,
  getStoreAccounts,
  importAccount,
  newAccount,
  setStoreSelectedAddress,
  verifyPassword,
} from './account.api';

// 신규 니모닉 얻기
export function useGetNewMnemonic(options) {
  return useQuery(['/account/getNewMnemonic'], getNewMnemonic, {
    retry: false,
    enabled: false,
    ...options,
  });
}

// 니모닉 검증 결과 얻기
export function useGetMnemonicValidate({ mnemonic }, options) {
  return useQuery(
    ['/account/getMnemonicValidate', mnemonic],
    () => getMnemonicValidate(mnemonic),
    {
      retry: false,
      enabled: false,
      ...options,
    },
  );
}

// 신규 계정 생성
export function useNewAccount(options) {
  return useMutation(['/account/newAccount'], newAccount, {
    retry: false,
    ...options,
  });
}

// 계정 추가
export function useAddAccounts(options) {
  return useMutation(['/account/addAccounts'], addAccounts, {
    retry: false,
    ...options,
  });
}

// 계정 복구
export function useImportAccount(options) {
  return useMutation(['/account/importAccount'], importAccount, {
    retry: false,
    ...options,
  });
}

// 패스워드 확인
export function useGetVerifyPassword({ password }, options) {
  return useQuery(
    ['/account/verifyPassword', { password }],
    () => verifyPassword({ password }),
    {
      retry: false,
      enabled: false,
      ...options,
    },
  );
}

// 개인키 추출
export function useGetExportPrivateKey({ address, password }, options) {
  return useQuery(
    ['/account/getExportPrivateKey', { address, password }],
    () => getExportPrivateKey({ address, password }),
    {
      retry: false,
      enabled: false,
      ...options,
    },
  );
}

// 공개키 추출
export function useGetExportPublicKey({ address, password }, options) {
  return useQuery(
    ['/account/getExportPublicKey', { address, password }],
    () => getExportPublicKey({ address, password }),
    {
      retry: false,
      enabled: false,
      ...options,
    },
  );
}

// keystore.json 추출(V3)
export function useGetExportKeystoreV3({ privateKey, password }, options) {
  return useQuery(
    ['/account/getExportKeystoreV3', { privateKey, password }],
    () => getExportKeystoreV3({ privateKey, password }),
    {
      retry: false,
      enabled: false,
      ...options,
    },
  );
}

/**
 * 비공개키 / keystore.json으로 주소값 뽑기
 * @param {string} strategy - import 유형 (Private Key, JSON File)
 * @param {object} args - { password: 비밀번호, privateKey || fileContents: 타입에 따라 비공개 키 or JSON File }
 */
export function useGetImportAccountStrategy({ strategy, args }, options) {
  return useQuery(
    ['/account/getImportAccountStrategy', { strategy, args }],
    () => getImportAccountStrategy({ strategy, args }),
    {
      retry: false,
      enabled: false,
      ...options,
    },
  );
}

// store에 저장된 계정 리스트 얻기
export function useGetStoreAccounts(options) {
  return useQuery(['/account/getStoreAccounts'], getStoreAccounts, {
    retry: false,
    ...options,
  });
}

// store에 selectedAddress update
export function useSetStoreSelectedAddress(options) {
  return useMutation(
    ['/account/setStoreSelectedAddress'],
    setStoreSelectedAddress,
    {
      retry: false,
      ...options,
    },
  );
}

// keystore.json으로 비공개키 추출
export function useGetKeystoreToPrivKey({ fileContents, password }, options) {
  return useQuery(
    ['/account/getKeystoreToPrivKey', { fileContents, password }],
    () => getKeystoreToPrivKey({ fileContents, password }),
    {
      enabled: false,
      ...options,
    },
  );
}

export function useGetBalance({ address, currentChainId }, options) {
  return useQuery(
    ['/account/getBalance', address, currentChainId],
    () => getBalance(address),
    {
      retry: false,
      refetchInterval: SECOND * 5,
      ...options,
    },
  );
}
