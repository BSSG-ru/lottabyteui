/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-return-assign */
/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import React, {
  ChangeEvent, FC, useEffect, useState,
} from 'react';
import { i18n } from '../../utils';

import styles from './Checkbox.module.scss';

type CheckboxProps = {
  checked?: boolean;
  name?: string;
  id: string;
  label?: string;
  value?: string;
  className?: string;
  isReadOnly?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const Checkbox: FC<CheckboxProps> = ({
  onChange = () => {},
  checked,
  className = '',
  id,
  name,
  value,
  label = '',
  isReadOnly
}) => {
  const [check, setCheck] = useState(false);

  useEffect(() => {
    setCheck(checked ?? false);
  }, [checked]);

  return (
    <span
      className={classNames(
        styles.wrapper,
        { [styles.wrapper_active]: check },
        { [className]: className },
        { 'readonly': isReadOnly }
      )}
    >
      <input
        className={styles.input}
        name={name}
        type="checkbox"
        value={value ?? ''}
        checked={check}
        readOnly={isReadOnly}
        id={id}
        onChange={(e) => {
          onChange(e);
          setCheck((prev) => (prev = e.target.checked));
        }}
      />
      <label
        className={styles.label}
        htmlFor={id}
        onClick={(e) => { if (isReadOnly) { e.preventDefault(); } }}
      >
        {i18n(label)}
      </label>
    </span>
  );
};
