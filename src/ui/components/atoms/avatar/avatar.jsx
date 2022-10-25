import classnames from 'classnames';

import Box from '../box';
import './avatar.scss';

/**
 * Avatar Component
 * @param as(ElementType?): 다형성 태그를 위한 element string type
 * @param className(string?): add class
 */
function Avatar({ as, className, imgUrl, ...avatarProps }) {
  const avatarClassName = classnames('atoms__avatar', className);

  return (
    <Box as={as} className={avatarClassName} {...avatarProps}>
      <Box className="atoms__avatar-wrapper">
        <img src={imgUrl} alt="avatar" />
      </Box>
    </Box>
  );
}

Avatar.displayName = 'Avatar';

export default Avatar;
