/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/require-default-props */
import React, {
  ChangeEvent, FC, useEffect, useState,
} from 'react';
import styles from './FieldTextareaEditor.module.scss';

import { Textarea } from '../Textarea';
import classNames from 'classnames';

export type FieldTextareaEditorProps = {
  className?: string;
  isReadOnly?: boolean;
  isRequired?: boolean;
  showValidation?: boolean;
  label?: string;
  defaultValue: string | undefined;
  valueSubmitted: (value: string | undefined) => void;
};

export const FieldTextareaEditor: FC<FieldTextareaEditorProps> = ({
  className = '',
  isReadOnly,
  label,
  defaultValue,
  isRequired,
  showValidation,
  valueSubmitted,
}) => {
  const [value, setValue] = useState('');

  useEffect(() => {
    setValue(defaultValue ?? '');
  }, [defaultValue]);

  const textareaChanged = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    if (valueSubmitted)
      valueSubmitted(e.target.value);
  };

  return (
    <div className={classNames(styles.field_editor, className, { [styles.error]: isRequired && showValidation && !value })}>
      {label && (<div className={styles.label}>{label}{isRequired && (<span className={styles.req}>*</span>)}</div>)}
      <div className={styles.value}>
            {isReadOnly ? (<pre>{value ? value : '—'}</pre>) : (
                <Textarea className={styles.input} value={value ?? ''} onChange={textareaChanged} />
            )}
        </div>
    </div>
  );
};
