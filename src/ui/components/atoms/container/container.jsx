import classnames from 'classnames';

import Box from '../box';
import './container.scss';

const DEFAULT_TAG = 'div';

/**
 * Container Component
 * @param as(ElementType?): 다형성 태그를 위한 element string type
 * @param className(string?): add class
 */
function Container({ as, className, children, ...containerProps }) {
  const Tag = as || DEFAULT_TAG;
  const containerClassName = classnames('atoms__container', className);

  return (
    <Tag className={containerClassName} {...containerProps}>
      <Box className="atoms__container-wrapper">{children}</Box>
    </Tag>
  );
}

Container.displayName = 'Container';

export default Container;
