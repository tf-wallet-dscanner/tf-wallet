import { useNavigate, useOutletContext } from 'react-router-dom';
import AssetList from 'ui/components/asset-list';
import Box from 'ui/components/atoms/box';
import Typography from 'ui/components/atoms/typography';
import { useGetTokens } from 'ui/data/token';

function Assets() {
  const navigation = useNavigate();
  const { currentChainId, selectedEOA } = useOutletContext();
  // provider나 account가 바뀔 때 getToken 실행
  const { data: accountTokenList } = useGetTokens({
    currentChainId,
    selectedEOA,
  });

  return (
    <Box className="mt-4">
      <Box className="grid grid-cols-2">
        <Box
          className="p-4 text-center cursor-pointer bg-dark-blue"
          onClick={() => navigation('/home/assets')}
        >
          <Typography className="text-sm">자산</Typography>
        </Box>
        <Box
          className="p-4 text-center border-b-[1px] border-solid border-dark-blue cursor-pointer"
          onClick={() => navigation('/home/history')}
        >
          <Typography className="text-sm">활동</Typography>
        </Box>
      </Box>
      <Box className="text-center">
        <AssetList accountTokenList={accountTokenList} />
        <Box
          className="text-[#cad74f] cursor-pointer pt-2"
          onClick={() => navigation('/create-token')}
        >
          [ 토큰 추가하기 ]
        </Box>
      </Box>
    </Box>
  );
}

export default Assets;
