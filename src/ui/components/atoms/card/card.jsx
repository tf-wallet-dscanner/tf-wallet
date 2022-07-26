import classnames from 'classnames';

import Typography from '../typography';
import './card.scss';

function CardHeader({ title }) {
  if (!title) return <></>;

  const isTitleString = typeof title === 'string';

  return (
    <div className="card__title">
      {isTitleString ? <Typography>{title}</Typography> : <>{title}</>}
    </div>
  );
}

function CardContent({ content }) {
  if (!content) return <></>;

  const isContentString = typeof content === 'string';

  return (
    <div className="card__content">
      {isContentString ? <Typography>{content}</Typography> : <>{content}</>}
    </div>
  );
}

/**
 * Card Component
 * @param className(string?): add class
 * @param outlined(boolean?): 테두리 여부
 * @param title(string? | ReactElement?): 카드 제목
 * @param content(string? | ReactElement?): 카드 본문 내용
 */
function Card({ className, outlined, title, content, children, ...cardProps }) {
  const cardClassName = classnames(
    'card',
    {
      card__outlined: Boolean(outlined),
    },
    className,
  );

  return (
    <div className={cardClassName} {...cardProps}>
      <CardHeader title={title} />
      <CardContent content={content} />
      {children}
    </div>
  );
}

Card.displayName = 'Card';

export default Card;
