import classnames from 'classnames';

import './typography.scss';

const DEFAULT_TAG = 'span';

/**
 * Button Component
 * @param as(ElementType?): 다형성 태그를 위한 element string type
 * @param className(string?): add class
 */
function Typography({ as, className, children, ...typographyProps }) {
  const Tag = as || DEFAULT_TAG;
  const typographyClassName = classnames('typography', className);

  return (
    <Tag className={typographyClassName} {...typographyProps}>
      {children}
    </Tag>
  );
}

Typography.displayName = 'Typography';

export default Typography;
