/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/require-default-props */
import React, {
    ChangeEvent, FC, useEffect, useState,
  } from 'react';
  import styles from './FieldCheckboxEditor.module.scss';
  import { uuid } from '../../utils';
import { Checkbox } from '../Checkbox';
import classNames from 'classnames';
  
  export type FieldCheckboxEditorProps = {
    className?: string;
    isReadOnly?: boolean;
    isRequired?: boolean;
    showValidation?: boolean;
    label?: string;
    defaultValue: boolean | null;
    valueSubmitted: (value: boolean) => void;
  };

  export const FieldCheckboxEditor: FC<FieldCheckboxEditorProps> = ({
    className = '',
    isReadOnly,
    label,
    defaultValue,
    isRequired,
    showValidation,
    valueSubmitted,
  }) => {
    const [value, setValue] = useState<boolean>(false);
    
    useEffect(() => {
      setValue(defaultValue ?? false);
    }, [defaultValue]);
  
    const inputChanged = (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.checked);
      if (valueSubmitted)
        valueSubmitted(e.target.checked);
    };
  
    return (
      <div className={classNames(styles.field_editor, className, { [styles.error]: isRequired && showValidation && value === undefined })}>
        
        <div className={styles.value}>
          <Checkbox id={'cb-dval-' + uuid()} checked={value} isReadOnly={isReadOnly} onChange={inputChanged} />
          {label && (<div className={styles.label}>{label}{isRequired && (<span className={styles.req}>*</span>)}</div>)}
        </div>
      </div>
    );
  };

  