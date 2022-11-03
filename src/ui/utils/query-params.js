import qs from 'qs';

function getQueryParams() {
  if (window === undefined) return;

  const params = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });

  return params;
}

export default getQueryParams;
