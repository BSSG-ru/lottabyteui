/* eslint-disable react/button-has-type */
/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import React from 'react';
import styles from './Button.module.scss';

export type ButtonProps = {
  isSubmit?: boolean;
  children?: React.ReactNode;
  background?: ButtonBackgroung;
  size?: 'standart' | 'big';
  icon?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
  disabled?: boolean;
  reff?: React.MutableRefObject<HTMLButtonElement>;
};

type ButtonBackgroung =
  | 'orange'
  | 'blue'
  | 'outlined-blue'
  | 'pagination'
  | 'pagination-arrow'
  | 'outlined-orange'
  | 'none';

export function Button({
  isSubmit = false,
  background = 'orange',
  size = 'standart',
  icon = false,
  children,
  className = '',
  onClick = () => {},
  disabled = false,
  reff,
}: ButtonProps) {
  const buttonType = isSubmit ? 'submit' : 'button';

  const classesStr = classNames(
    styles.button,
    styles[`button_${background}`],
    styles[`button_${size}`],
    { [styles.button_icon]: icon },
    { [className]: !!className },
  );

  return (
    <button
      type={buttonType}
      className={classesStr}
      onClick={onClick}
      disabled={disabled}
      ref={reff}
    >
      {children}
    </button>
  );
}
