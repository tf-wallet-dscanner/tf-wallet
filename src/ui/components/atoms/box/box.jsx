import classnames from 'classnames';
import { forwardRef } from 'react';

import './box.scss';

// props에 as 안썼을때 기본으로 사용될 태그
const DEFAULT_TAG = 'div';

/**
 * Box Component
 * @param as(ElementType?): 다형성 태그를 위한 element string type
 * @param className(string?): add class
 */
function Box({ as, className, children, ...boxProps }, ref) {
  const Tag = as || DEFAULT_TAG;
  const boxClassName = classnames('box', className);
  return (
    <Tag ref={ref} className={boxClassName} {...boxProps}>
      {children}
    </Tag>
  );
}

Box.displayName = 'Box';

export default forwardRef(Box);
