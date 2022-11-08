import qs from 'qs';

/**
 * type ContractMessage
 * @param {string} contractAddress
 * @param {string} type
 * @param {string} method
 * @param {string} inputData
 */
/**
 * explorer로부터 querystring으로 받은 smart contract data를 parsing하는 함수
 * @returns {typeof ContractMessage}
 */
function getQueryParams() {
  if (window === undefined) return;

  const params = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });

  return params;
}

export default getQueryParams;
