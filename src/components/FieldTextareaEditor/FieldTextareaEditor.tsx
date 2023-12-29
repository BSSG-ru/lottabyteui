/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/require-default-props */
import React, {
  ChangeEvent, FC, useEffect, useState,
} from 'react';
import styles from './FieldTextareaEditor.module.scss';
import { ReactComponent as PencilIcon } from '../../assets/icons/pencil.svg';
import { ReactComponent as OrangePencilIcon } from '../../assets/icons/pencil_org.svg';
import { Input } from '../Input';

import { Textarea } from '../Textarea';
import { setDataModified } from '../../utils';

export type FieldTextareaEditorProps = {
  className: string;
  isReadOnly?: boolean;
  isRequired?: boolean;
  isMultiline?: boolean;
  showValidation?: boolean;
  labelPrefix: string;
  defaultValue: string | null;
  valueSubmitted: (value: string) => void;
};

export const FieldTextareaEditor: FC<FieldTextareaEditorProps> = ({
  className,
  isReadOnly,
  labelPrefix,
  defaultValue,
  isMultiline,
  isRequired,
  showValidation,
  valueSubmitted,
}) => {
  const [isEditMode, setEditMode] = useState<boolean>(false);
  const [value, setValue] = useState('');
  const [storedValue, setStoredValue] = useState('');

  useEffect(() => {
    setValue(defaultValue ?? '');
    setStoredValue(defaultValue ?? '');
  }, [defaultValue]);

  const editClicked = () => {
    setEditMode(!isEditMode);
  };

  const saveClicked = () => {
    setStoredValue(value ?? '');
    valueSubmitted(value);

    setEditMode(false);
  };

  const inputChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setDataModified(true);
  };

  const textareaChanged = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    setDataModified(true);
  };

  return (
    <div
      className={`${styles.field_editor} ${className}${
        showValidation && isRequired && !storedValue ? ` ${styles.error}` : ''
      }`}
    >
      <div className={styles.row_value}>
        
            <div className={styles.label}>{labelPrefix}</div>
            <div className={styles.sep}></div>
            
            {isReadOnly ? (
              ''
            ) : (
              <a
                className={styles.btn_edit}
                onClick={editClicked}
              >
                <PencilIcon />
              </a>
            )}
        
      </div>
      {!isEditMode && (
        <div className={styles.display_value}>
          <div className={styles.textarea} dangerouslySetInnerHTML={{ __html: (storedValue ?? '').replaceAll("\n", "<br/>") }}></div>
        </div>
      )}

      <div className={`${styles.row_edit} ${isEditMode ? styles.show : ''}`}>
        {isMultiline ? (
          <Textarea
            className={styles.input_value}
            value={value ?? ''}
            onChange={textareaChanged}
            
          />
        ) : (
          <Input
            className={styles.input_value}
            value={value}
            onChange={inputChanged}
          />
        )}
        <a
          className={styles.btn_save}
          onClick={saveClicked}
        >
          <OrangePencilIcon />
        </a>
      </div>
    </div>
  );
};
