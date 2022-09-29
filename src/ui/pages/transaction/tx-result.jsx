import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useResetUnapprovedTx } from 'ui/data/transaction';

function TxResult() {
  const params = useParams();
  console.log('params: ', params);

  const { mutate: resetUnapprovedTx } = useResetUnapprovedTx();

  // unmount 시점
  useEffect(() => {
    return () => {
      // unApprovedTx 정보 초기화
      resetUnapprovedTx();
    };
  }, []);

  return <div>TxResult: {`${JSON.stringify(params)}`}</div>;
}

export default TxResult;
