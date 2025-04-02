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
  id: string;
  label?: string;
  value?: string;
  className?: string;
  onChange?: (check: boolean) => void;
};

export const RadioButton: FC<RadioButtonProps> = ({
  onChange = () => {},
  checked,
  className = '',
  id,
  value,
  label = '',
}) => {

  useEffect(() => {
    console.log('ch', checked);
  }, [checked]);

  return (
    <span
      className={classNames(
        styles.wrapper,
        { [styles.wrapper_active]: checked },
        { [className]: className },
      )}
    >
      <label className={styles.label} onClick={() => { onChange(!checked); }}>{i18n(label)}</label>
    </span>
  );
};
