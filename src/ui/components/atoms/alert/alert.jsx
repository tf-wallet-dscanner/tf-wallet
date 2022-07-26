import classnames from 'classnames';
import AlertIcon from 'ui/components/atoms/alert-icon/alert-icon';

import './alert.scss';

/**
 * Alert Component
 * @param className(string?): add class
 * @param severity(string: error, warning, info, success): 타입
 * @param title(string?): 타이틀 제목
 * @param contents(string | ReactElement): Description 문구
 */
function Alert({ className, severity, title, contents }) {
  const themeArray = {
    bg: {
      error: 'bg-error',
      warning: 'bg-warning',
      info: 'bg-info',
      success: 'bg-success',
    },
  };
  const alertClassName = classnames(
    `alert__container alert__${severity}-text-color ${themeArray.bg[severity]}`,
    className,
  );

  return (
    <div className={alertClassName}>
      <div className="alert__icon">
        <AlertIcon severity={severity} />
      </div>
      <div className="alert__text-wrap">
        {title && <div className="alert__text-wrap-title">{title}</div>}
        <div className="alert__text-wrap-contents">{contents}</div>
      </div>
    </div>
  );
}

Alert.displayName = 'Alert';

export default Alert;
