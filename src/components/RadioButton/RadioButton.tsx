/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-return-assign */
/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import React, {
  ChangeEvent, FC, useEffect, useState,
} from 'react';
import { i18n } from '../../utils';

import styles from './RadioButton.module.scss';

type RadioButtonProps = {
  checked?: boolean;
  name: string;
  id: string;
  label?: string;
  value?: string;
  className?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
};

export const RadioButton: FC<RadioButtonProps> = ({
  onChange = () => {},
  checked,
  className = '',
  id,
  name,
  value,
  label = '',
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
      )}
    >
      <input
        className={styles.input}
        name={name}
        type="radio"
        checked={check}
        id={id}
        value={value}
        onChange={(e) => {
          onChange(e);
          setCheck((prev) => (prev = e.target.checked));
        }}
      />
      <label
        className={styles.label}
        htmlFor={id}
      >
        {i18n(label)}
      </label>
    </span>
  );
};
