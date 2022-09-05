import { useParams } from 'react-router-dom';

function TxResult() {
  const params = useParams();
  console.log('params: ', params);
  return <div>TxResult</div>;
}

export default TxResult;
