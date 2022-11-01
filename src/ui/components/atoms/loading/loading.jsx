import classnames from 'classnames';
import React from 'react';
import ReactLoading from 'react-loading';

import Box from '../box';
import './loading.scss';

function Loading({ as, className, ...loadingProps }) {
  const loadingClassName = classnames('atoms__loading', className);

  return (
    <Box as={as} className={loadingClassName} {...loadingProps}>
      <ReactLoading type="spin" color="#fff" />
    </Box>
  );
}

export default Loading;
