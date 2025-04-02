/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import React, { FC, FocusEvent, KeyboardEvent, useState } from 'react';
import { ReactComponent as SearchSmaller } from '../../assets/icons/search-smaller.svg';
import { ReactComponent as Filters } from '../../assets/icons/filters.svg';
import styles from './Input.module.scss';
import { Checkbox } from '../Checkbox';
import { uuid } from '../../utils';

export type InputProps = {
  id?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customKeyDownHandler?: CustomKeyDownHandler;
  customKeyUpHandler?: CustomKeyUpHandler;
  customSelectHandler?: CustomSelectHandler;
  customFocusHandler?: CustomFocusHandler;
  placeholder?: string;
  label?: string;
  className?: string;
  type?: string;
  name?: string;
  value?: string | undefined;
  defaultValue?: string | undefined;
  findBtn?: boolean;
  filter?: boolean;
  inputStyle?: string;
  readonly?: boolean;
  enterKeyBlursInput?: boolean;
  disableAutocomplete?: boolean;
};

type CustomKeyDownHandler = (e: KeyboardEvent) => void;
type CustomKeyUpHandler = (e: KeyboardEvent) => void;
type CustomSelectHandler = (e: any) => void;
type CustomFocusHandler = (e: FocusEvent) => void;

const keyDownHandler = (e: KeyboardEvent, customKeyDownHandler: CustomKeyDownHandler) => {
  customKeyDownHandler(e);
  if (e.code === 'Enter' || e.code === 'NumpadEnter') {
    const target = e.target as HTMLInputElement;
    target.blur();
  }
};

export const Input: FC<InputProps> = ({
  findBtn = false,
  filter = false,
  inputStyle = styles.input,
  type = 'text',
  id = 'input-' + uuid(),
  name,
  value,
  defaultValue,
  placeholder,
  onChange = () => {},
  customKeyDownHandler = () => {},
  customKeyUpHandler = () => {},
  customSelectHandler = () => {},
  customFocusHandler = () => {},
  onBlur = () => {},
  label = '',
  className,
  readonly = false,
  enterKeyBlursInput = true,
  disableAutocomplete
}) => {
  const localClassName = className ?? '';

  const [isShown, setIsShown] = useState(false);

  const togglePassword = () => {
    setIsShown(!isShown);
  };

  return (
    <div
      className={classNames(
        styles.input_wrapper,
        { [localClassName]: localClassName },
        { [styles.input_wrapper_findbtn]: findBtn },
      )}
    >
      {label ? <div className={styles.label}>{label}</div> : ''}

      {filter ? (
        <span className={styles.filter}>
          <Filters />
        </span>
      ) : (
        ''
      )}
      <input
        className={inputStyle}
        type={(type === 'password' && !isShown) ? 'password' : 'text'}
        name={name}
        value={value}
        readOnly={readonly}
        defaultValue={defaultValue}
        placeholder={placeholder}
        onChange={(e) => onChange(e)}
        onKeyDown={(e) => enterKeyBlursInput ? keyDownHandler(e, customKeyDownHandler) : customKeyDownHandler(e)}
        onKeyUp={(e) => customKeyUpHandler(e)}
        onSelect={(e) => customSelectHandler(e)}
        onFocus={(e) => customFocusHandler(e)}
        onBlur={onBlur}
        id={id ?? ''}
        autoComplete={disableAutocomplete ? 'off': ''}
      />
      {type === 'password' ? (
        <Checkbox
          className={styles.checkbox}
          name="show-pass"
          id={"show-pass-" + id}
          label="Показать пароль"
          checked={isShown}
          onChange={togglePassword}
        />
      ) : ('')}
      {findBtn ? (
        <span className={styles.btn}>
          <SearchSmaller />
        </span>
      ) : (
        ''
      )}
    </div>
  );
};
