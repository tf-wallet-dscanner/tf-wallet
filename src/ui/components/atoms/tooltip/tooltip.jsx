import classnames from 'classnames';

import './tooltip.scss';

/**
 * Tooltip Component
 * @param className(string?): add class
 * @param placement(Placement?): 'bottom' | 'left' | 'right' | 'top'
 * @param message(string | ReactElement): 툴팁에 표시될 메세지
 */
function Tooltip({
  className,
  placement = 'bottom',
  message,
  children,
  ...tooltipProps
}) {
  const tooltipClassName = classnames('atoms__tooltip', className);
  const tooltipPlacement = `atoms__tooltip__message-${placement}`;
  const tooltipMessageClassName = classnames(
    'atoms__tooltip__message',
    tooltipPlacement,
  );

  return (
    <div className={tooltipClassName} {...tooltipProps}>
      {children}
      <div className={tooltipMessageClassName}>{message}</div>
    </div>
  );
}

Tooltip.displayName = 'Tooltip';

export default Tooltip;
