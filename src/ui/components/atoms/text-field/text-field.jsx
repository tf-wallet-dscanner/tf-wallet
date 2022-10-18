import classnames from 'classnames';

import './text-field.scss';

/**
 * TextField Component
 * @param password(boolean?): 패스워드 형식으로 사용할지 여부
 * @param className(string?): add class
 * @param model(string)
 * @param onChange(ChangeEvent<HTMLInputElement> => void?):
 * @param prefixIcon(ReactElement?): TextField 왼쪽에 들어가는 아이콘
 * @param suffixIcon(ReactElement?): TextField 오른쪽에 들어가는 아이콘
 */
function TextField({
  password,
  className,
  placeholder = '',
  onChange,
  prefixIcon,
  suffixIcon,
  ...textFieldProps
}) {
  const textFieldClassName = classnames(`text-field`, className);

  return (
    <>
      <div className={textFieldClassName}>
        {prefixIcon && (
          <span className="text-field__prefix-icon">{prefixIcon}</span>
        )}
        <input
          className="text-field__input"
          onChange={onChange}
          type={password ? 'password' : 'text'}
          placeholder={placeholder}
          {...textFieldProps}
        />
        {suffixIcon && (
          <span className="text-field__suffix-icon">{suffixIcon}</span>
        )}
      </div>
      <div className="text-field__rules">{/* validation */}</div>
    </>
  );
}

TextField.displayName = 'TextField';

export default TextField;
