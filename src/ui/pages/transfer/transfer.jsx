import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Container from 'ui/components/atoms/container';
import { useGetGasFeeEstimates } from 'ui/data/transaction';
import { useTransactionStore } from 'ui/store';
import shallow from 'zustand/shallow';

function Tranfer() {
  const { data: estimateData } = useGetGasFeeEstimates();
  const { setEstimateData } = useTransactionStore(
    (state) => ({
      setEstimateData: state.setEstimateData,
    }),
    shallow,
  );

  useEffect(() => {
    if (estimateData) {
      setEstimateData(estimateData);
    }
  }, [estimateData]);

  return (
    <Container className="mt-8 border-t-[1px] border-solid border-[#F4F3EB]">
      <Outlet />
    </Container>
  );
}

export default Tranfer;
