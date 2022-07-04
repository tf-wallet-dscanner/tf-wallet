import classnames from 'classnames';
import type { ComponentPropsWithoutRef, ReactElement } from 'react';

import './tooltip.scss';

type Placement = 'bottom' | 'left' | 'right' | 'top';

interface TooltipProps {
  className?: string;
  placement?: Placement;
  message: string | ReactElement;
}

const DEFAULT_TAG = 'div';

function Tooltip({
  className,
  placement = 'bottom',
  message,
  children,
  ...tooltipProps
}: TooltipProps &
  Omit<ComponentPropsWithoutRef<typeof DEFAULT_TAG>, keyof TooltipProps>) {
  const tooltipClassName = classnames('tooltip', className);
  const tooltipPlacement = `tooltip__message-${placement}`;
  const tooltipMessageClassName = classnames(
    'tooltip__message',
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
