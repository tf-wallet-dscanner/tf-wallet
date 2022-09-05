import { FaBeer } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import Card from 'ui/components/atoms/card';
import Container from 'ui/components/atoms/container';
import { THEME_COLOR } from 'ui/constants/colors';
import {
  useGetStoreAccounts,
  useSetStoreSelectedAddress,
} from 'ui/data/account/account.hooks';

function Home() {
  const navigation = useNavigate();

  // Store에서 정보 받아오기
  const { data: accounts, refetch: updateAccounts } = useGetStoreAccounts();

  // Store에 selectedAddress Update
  const { mutate: updateSelectedAddress } = useSetStoreSelectedAddress({
    onSuccess() {
      updateAccounts();
    },
  });

  // account change
  const handleAccountChange = (event) => {
    const { value: selectedAddress } = event.target;
    updateSelectedAddress(selectedAddress);
  };

  return (
    <Container className="p-4">
      <Button
        className="mb-10"
        color={THEME_COLOR.ERROR}
        prefixIcon={<FaBeer />}
        onClick={() => navigation('/provider')}
      >
        Provider
      </Button>

      {accounts && (
        <select
          className="w-full"
          name="accounts"
          onChange={handleAccountChange}
          value={accounts?.selectedAddress}
        >
          {accounts?.identities.map(({ address, name }, index) => (
            <option key={index} value={address}>
              {name}
            </option>
          ))}
        </select>
      )}

      {accounts && (
        <Card title="Selected Address" content={accounts.selectedAddress} />
      )}

      <Button
        color={THEME_COLOR.INFO}
        className="my-5"
        suffixIcon={<FaBeer />}
        onClick={() => {
          navigation('/new-account');
        }}
      >
        New Account
      </Button>
      <Button
        color={THEME_COLOR.SUCCESS}
        className="my-5"
        suffixIcon={<FaBeer />}
        onClick={() => {
          navigation('/import-account');
        }}
      >
        Import Account
      </Button>
      <Button
        color={THEME_COLOR.WARNING}
        className="my-5"
        suffixIcon={<FaBeer />}
        onClick={() => {
          navigation('/json-file');
        }}
      >
        Json File
      </Button>
      <Button
        color={THEME_COLOR.INFO}
        className="my-5"
        suffixIcon={<FaBeer />}
        onClick={() => {
          navigation('/token');
        }}
      >
        Token
      </Button>
    </Container>
  );
}

export default Home;
