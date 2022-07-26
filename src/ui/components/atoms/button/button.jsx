import classnames from 'classnames';
import { THEME_COLOR } from 'ui/constants/colors';

import './button.scss';

const DEFAULT_TAG = 'button';

/**
 * Button Component
 * @param as(ElementType?): 다형성 태그를 위한 element string type
 * @param className(string?): add class
 * @param color(THEME_COLOR?): 타입 (error, warning, info, success)
 * @param submit(boolean?): 버튼 타입을 submit으로 설정할지 여부
 * @param prefixIcon(ReactElement?): 버튼 글자 왼쪽에 들어가는 아이콘
 * @param suffixIcon(ReactElement?): 버튼 글자 오른쪽에 들어가는 아이콘
 */
function Button({
  as,
  className,
  color = THEME_COLOR.DEFAULT,
  submit = false,
  prefixIcon,
  suffixIcon,
  children,
  ...buttonProps
}) {
  const Tag = as || DEFAULT_TAG;
  if (submit) {
    buttonProps.type = 'submit';
  }

  const CLASSNAME_BUTTON_COLOR = `button__${color}`;
  const buttonClassName = classnames(
    'button',
    CLASSNAME_BUTTON_COLOR,
    className,
  );

  return (
    <Tag className={buttonClassName} {...buttonProps}>
      {prefixIcon && <span className="button__prefix-icon">{prefixIcon}</span>}
      {children}
      {suffixIcon && <span className="button__suffix-icon">{suffixIcon}</span>}
    </Tag>
  );
}

Button.displayName = 'Button';

export default Button;
