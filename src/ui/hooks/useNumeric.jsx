import { isEmpty } from 'lodash';
import { useCallback, useState } from 'react';

function useNumeric() {
  const [numericValue, setNumericValue] = useState('');

  const handleNumericValue = useCallback((event) => {
    const { value } = event.target;
    // 숫자만 입력
    if (/^[0-9]*.[0-9]*$/.test(value) || isEmpty(value)) {
      setNumericValue(value);
    }
  }, []);

  return [numericValue, handleNumericValue];
}

export default useNumeric;
