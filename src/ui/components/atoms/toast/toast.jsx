import classnames from 'classnames';

import Alert from '../alert';
import './toast.scss';

/**
 * Alert Component
 * @param className(string?): add class
 * @param severity(string: error, warning, info, success): 타입
 * @param title(string?): 타이틀 제목
 * @param contents(string | ReactElement): Description 문구
 */
function Toast({ className, isShow, severity, title, contents }) {
  const toastClassName = classnames('toast', className);

  if (!isShow) return null;

  return (
    <Alert
      className={toastClassName}
      title={title}
      severity={severity}
      contents={contents}
    />
  );
}

Toast.displayName = 'Toast';

export default Toast;
