import { FaBeer } from 'react-icons/fa';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import Button from 'ui/components/atoms/button';
import Container from 'ui/components/atoms/container';
import { THEME_COLOR } from 'ui/constants/colors';
import { useCounterStore } from 'ui/store';

function Home() {
  const navigation: NavigateFunction = useNavigate();
  const { bears, increasePopulation } = useCounterStore((state) => ({
    bears: state.bears,
    increasePopulation: state.increasePopulation,
  }));

  const onNextPage = (): void => {
    navigation('/about');
  };

  return (
    <Container>
      <div className="h-28">asd</div>
      <span>Home page111</span>
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
      <div>{bears}</div>
      <Button color={THEME_COLOR.WARNING} onClick={increasePopulation}>
        Click!
      </Button>
    </Container>
  );
}

export default Home;
