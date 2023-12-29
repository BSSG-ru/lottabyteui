/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable react/function-component-definition */
/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import React, { FC } from 'react';
import styles from './Textarea.module.scss';

export type TextareaProps = {
  id?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  label?: string;
  className?: string;
  name?: string;
  value?: string | undefined;
  defaultValue?: string | undefined;
  disabled?: boolean;
};

export const Textarea: FC<TextareaProps> = ({
  id,
  name,
  value,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  defaultValue,
  placeholder,
  onChange = () => {},
  label = '',
  className,
  disabled
}) => {
  const _className = className ?? '';

  return (
    <div className={classNames(styles.textarea_wrapper, { [_className]: _className })}>
      {label ? <div className={styles.label}>{label}</div> : ''}
      <textarea
        disabled={disabled ?? false}
        className={styles.textarea}
        name={name}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e)}
        id={id ?? ''}
      />
    </div>
  );
};
