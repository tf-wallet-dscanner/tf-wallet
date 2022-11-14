import { BAOBAB_CHAIN_ID, CHAINID_TO_ID_MAP } from 'app/constants/network';
import { isEmpty } from 'lodash';
import { useEffect } from 'react';
import { MdOutlineCallMade } from 'react-icons/md';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useMount } from 'react-use';
import AccountView from 'ui/components/account-view';
import Balance from 'ui/components/account-view/balance';
import Header from 'ui/components/header';
import {
  useGetBalance,
  useGetStoreAccounts,
  useSetStoreSelectedAddress,
} from 'ui/data/account/account.hooks';
import { useGetCurrentChainId, useSetProviderType } from 'ui/data/provider';
import { useSwitchAccounts } from 'ui/data/token/token.hooks';
import getQueryParams from 'ui/utils/query-params';

function Home() {
  const navigation = useNavigate();
  const { pathname } = useLocation();

  const { data: currentChainId, refetch: getCurrentChainId } =
    useGetCurrentChainId();
  const { data: accounts, refetch: updateAccounts } = useGetStoreAccounts();
  const { refetch: switchAccounts } = useSwitchAccounts();
  const { mutateAsync: updateSelectedAddress } = useSetStoreSelectedAddress();

  const selectedEOA = accounts?.identities?.find(
    ({ address }) => accounts?.selectedAddress === address,
  );
  const { data: balance } = useGetBalance({
    address: accounts?.selectedAddress,
    currentChainId,
  });

  const { mutateAsync: changeProviderType } = useSetProviderType({
    onSuccess() {
      getCurrentChainId();
    },
  });

  const handleAccountChange = async (selectedAddress) => {
    await updateSelectedAddress(selectedAddress);
    await updateAccounts();
    await switchAccounts();
  };

  useMount(() => {
    const queryParams = getQueryParams();
    console.warn('queryParams: ', queryParams);
    if (!isEmpty(queryParams)) {
      changeProviderType(BAOBAB_CHAIN_ID).then(() => {
        navigation(`/home/sirloin-contract/${queryParams.contractAddress}`, {
          state: {
            type: queryParams.type,
            method: queryParams.method,
            inputData: queryParams.inputData,
          },
        });
      });
    } else {
      navigation('assets');
    }
  });

  useEffect(() => {
    if (accounts?.selectedAddress) {
      updateSelectedAddress(selectedEOA?.address).then(() => {
        updateAccounts();
      });
    }
  }, [currentChainId, accounts?.selectedAddress]);

  const isShowSendTransactionButton =
    pathname.includes('assets') || pathname.includes('history');
  const { ticker } = CHAINID_TO_ID_MAP[currentChainId || BAOBAB_CHAIN_ID];

  return (
    <main className="home">
      <Header
        currentChainId={currentChainId}
        changeProviderType={changeProviderType}
      />
      <AccountView
        accounts={accounts}
        selectedEOA={selectedEOA}
        handleAccountChange={handleAccountChange}
      />
      <hr className="mb-4" />
      <Balance balance={balance ?? '0x0'} symbol={ticker} />
      {isShowSendTransactionButton && (
        <section className="flex flex-col justify-center items-center mt-2 mb-4 text-[#F4F3EB]">
          <i
            className="border-[1px] border-solid border-[#565151] rounded-full bg-[#565151] p-1 mb-1 cursor-pointer"
            onClick={() => navigation('transaction')}
          >
            <MdOutlineCallMade className="text-2xl" />
          </i>
          <span>보내기</span>
        </section>
      )}
      <Outlet
        context={{
          currentChainId,
          selectedEOA,
        }}
      />
    </main>
  );
}

export default Home;
