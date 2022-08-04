import { FaBeer } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import Container from 'ui/components/atoms/container';
import Tooltip from 'ui/components/atoms/tooltip';
import { THEME_COLOR } from 'ui/constants/colors';
import { useCounterStore } from 'ui/store';

function Home() {
  const navigation = useNavigate();
  const { bears, increasePopulation } = useCounterStore((state) => ({
    bears: state.bears,
    increasePopulation: state.increasePopulation,
  }));

  const onNextPage = () => {
    navigation('/about');
  };

  return (
    <Container className="p-4">
      <Button
        className="mb-10"
        prefixIcon={<FaBeer />}
        onClick={() => navigation('/provider')}
      >
        Provider
      </Button>
      <Button prefixIcon={<FaBeer />} onClick={onNextPage}>
        About
      </Button>
      <Button
        color={THEME_COLOR.ERROR}
        className="font-bold pl-5"
        suffixIcon={<FaBeer />}
        onClick={() => {
          navigation('/hong');
        }}
      >
        Hong
      </Button>
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
      <div>{bears}</div>
      <Button color={THEME_COLOR.WARNING} onClick={increasePopulation}>
        Click!
      </Button>
      <div className="mt-10 ml-12">
        <Tooltip message="top tooltip" placement="top">
          <Button color={THEME_COLOR.WARNING}>top!!</Button>
        </Tooltip>
      </div>
      <div className="mt-2 ml-12">
        <Tooltip message="bottom  tooltip" placement="bottom">
          <Button color={THEME_COLOR.WARNING}>bottom!!</Button>
        </Tooltip>
      </div>
      <div className="mt-12 ml-20">
        <Tooltip message="left  tooltip" placement="left">
          <Button color={THEME_COLOR.WARNING}>left!!</Button>
        </Tooltip>
      </div>
      <div className="mt-2 ml-12">
        <Tooltip message="right tooltip" placement="right">
          <Button color={THEME_COLOR.WARNING}>right!!</Button>
        </Tooltip>
      </div>
    </Container>
  );
}

export default Home;
