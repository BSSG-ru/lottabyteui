/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import React, { FC, KeyboardEvent, useState } from 'react';
import { ReactComponent as SearchSmaller } from '../../assets/icons/search-smaller.svg';
import { ReactComponent as Filters } from '../../assets/icons/filters.svg';
import styles from './Input.module.scss';
import { Checkbox } from '../Checkbox';

export type InputProps = {
  id?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  customKeyDownHandler?: CustomKeyDownHandler;
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
};

type CustomKeyDownHandler = (e: KeyboardEvent) => void;

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
  id,
  name,
  value,
  defaultValue,
  placeholder,
  onChange = () => {},
  customKeyDownHandler = () => {},
  onBlur = () => {},
  label = '',
  className,
  readonly = false
}) => {
  const localClassName = className ?? '';

  const [isShown, setIsSHown] = useState(false);

  const togglePassword = () => {
    setIsSHown(!isShown);
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
        onKeyDown={(e) => keyDownHandler(e, customKeyDownHandler)}
        onBlur={onBlur}
        id={id ?? ''}
      />
      {type === 'password' ? (
        <Checkbox
          className={styles.checkbox}
          name="show-pass"
          id="show-pass"
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
