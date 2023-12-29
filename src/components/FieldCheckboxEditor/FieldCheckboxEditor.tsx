/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/require-default-props */
import React, {
    ChangeEvent, FC, useCallback, useEffect, useMemo, useState,
  } from 'react';
  import styles from './FieldCheckboxEditor.module.scss';
  import { ReactComponent as PencilIcon } from '../../assets/icons/pencil.svg';
  import { ReactComponent as OrangePencilIcon } from '../../assets/icons/pencil_org.svg';
  import { Input } from '../Input';
  import { getArtifactUrl, handleHttpError, setDataModified, uuid } from '../../utils';
import { CheckBox } from 'grommet';
import { Checkbox } from '../Checkbox';
  
  export type FieldCheckboxEditorProps = {
    className: string;
    isReadOnly?: boolean;
    isCreateMode?: boolean;
    isRequired?: boolean;
    showValidation?: boolean;
    labelPrefix: string;
    layout?: string;
    defaultValue: boolean | null;
    valueSubmitted: (value: boolean) => void;
  };

  export const FieldCheckboxEditor: FC<FieldCheckboxEditorProps> = ({
    className,
    isReadOnly,
    labelPrefix,
    defaultValue,
    layout,
    isRequired,
    showValidation,
    valueSubmitted,
    isCreateMode = false,
  }) => {
    const [isEditMode, setEditMode] = useState<boolean>(false);
    const [value, setValue] = useState<boolean>(false);
    const [storedValue, setStoredValue] = useState<boolean>(false);
    
    useEffect(() => {
      setValue(defaultValue ?? false);
      setStoredValue(defaultValue ?? false);
    }, [defaultValue]);
  
    useEffect(() => {
      if (value != storedValue)
        setDataModified(true);
    }, [ value, storedValue ]);

    const editClicked = () => {
      setEditMode(!isEditMode);
    };
  
    const saveClicked = () => {
      setStoredValue(value ?? false);
      valueSubmitted(value);
  
      setEditMode(false);
    };
  
    const inputChanged = (e: ChangeEvent<HTMLInputElement>) => {
      setValue(e.target.checked);
    };
  
    return (
      <div
        className={`${styles.field_cb_editor} ${className}${showValidation && isRequired && !storedValue ? ` ${styles.error}` : ''}`}
      >
        <div className={styles.row_value}>
          {layout === 'separated' ? (
            <>
              <div className={styles.label}>{labelPrefix}</div>
              <div className={styles.display_value}>
                
                  <Checkbox id={'cb-dval-' + uuid()} checked={storedValue} isReadOnly={true} />
                
                
              </div>
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
            </>
          ) : (
            <>
              <div className={styles.value}>
                <>
                {labelPrefix}
                <Checkbox id={'cb-dval-' + uuid()} checked={storedValue} isReadOnly={true} />
                </>
              </div>
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
            </>
          )}
        </div>
  
        <div className={`${styles.row_edit} ${isEditMode ? styles.show : ''}`}>
          
          <div className={styles.spacer}></div>
          <div className={styles.cb_wrap}>
            <Checkbox
                id={'cb-ed-val-' + uuid()}
              className={styles.input_value}
              checked={value}
              
              onChange={inputChanged}
              
            />
          </div>
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
  