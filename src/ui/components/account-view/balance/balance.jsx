import React from 'react';

function Balance({ balance, symbol = 'KLAY' }) {
  return (
    <h4 className="flex justify-center text-white text-2xl">
      {`${parseInt(balance, 16)} ${symbol}`}
    </h4>
  );
}

export default Balance;
