import { useNavigate } from 'react-router-dom';

function About() {
  const navigation = useNavigate();

  const onNextPage = () => {
    navigation('/');
  };

  return (
    <div style={{ padding: 16 }}>
      <span>About page</span>
      <button type="button" onClick={onNextPage}>
        Home
      </button>
    </div>
  );
}

export default About;
