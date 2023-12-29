/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/require-default-props */
import React, {
    ChangeEvent, FC, useEffect, useState,
  } from 'react';
  import styles from './FieldArrayEditor.module.scss';
  import { ReactComponent as PencilIcon } from '../../assets/icons/pencil.svg';
  import { ReactComponent as OrangePencilIcon } from '../../assets/icons/pencil_org.svg';
  import { ReactComponent as PlusInCircleIcon } from '../../assets/icons/plus-in-circle.svg';
  import { Input } from '../Input';
import { setDataModified, uuid } from '../../utils';
import { Tags } from '../Tags';
  
  export type FieldArrayEditorProps = {
    className: string;
    isReadOnly?: boolean;
    isCreateMode?: boolean;
    isRequired?: boolean;
    showValidation?: boolean;
    type?: string;
    labelPrefix: string;
    layout?: string;
    defaultValue: string[] | null;
    valueSubmitted: (value: string[]) => void;
    inputPlaceholder: string;
    addBtnText: string;
    getOptions?: (search:string) => Promise<any[]>;
    onValueIdAdded?: (id:string) => void;
    onValueIdRemoved?: (id:string) => void;
  };
  
  export const FieldArrayEditor: FC<FieldArrayEditorProps> = ({
    className,
    isReadOnly,
    labelPrefix,
    defaultValue,
    layout,
    isRequired,
    showValidation,
    valueSubmitted,
    inputPlaceholder,
    addBtnText,
    getOptions,
    onValueIdAdded,
    onValueIdRemoved
  }) => {
    const [isEditMode, setEditMode] = useState<boolean>(false);
    const [value, setValue] = useState<string[]>([]);
    const [storedValue, setStoredValue] = useState<string[]>([]);
  
    useEffect(() => {
      setValue(defaultValue ?? []);
      setStoredValue(defaultValue ?? []);
    }, [defaultValue]);
  
    const editClicked = () => {
      setEditMode(!isEditMode);
    };
  
    const saveClicked = () => {
        const v = value.filter(x => { return x; });
      setStoredValue(v);
      valueSubmitted(v);
  
      setEditMode(false);
    };

    const addClicked = () => {
        setValue(prev => ([...prev, '']));
        
    };

    const addValue = (s:string) => {
      setValue(prev => ([...prev, s]));
      setDataModified(true);
    };

    const delValue = (s:string) => {
    };
    const delValueId = (id:string) => {
      if (id) {
        let newValue = [...value];
        newValue.splice(parseInt(id), 1);

        setValue(newValue);
        setDataModified(true);
        if (onValueIdRemoved)
          onValueIdRemoved(id);
      }
    };

    return (
      <div
        className={`${styles.field_editor} ${className}${showValidation && isRequired && !storedValue ? ` ${styles.error}` : ''}`}
      >
        <div className={styles.row_value}>
          {layout === 'separated' ? (
            <>
              <div className={styles.label}>{labelPrefix}</div>
              <div className={styles.display_value} dangerouslySetInnerHTML={{ __html: storedValue.join(', ') }}></div>
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
                {labelPrefix + ' '}
                <span dangerouslySetInnerHTML={{ __html: storedValue.join(', ') }}></span>
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
            <Tags getOptions={getOptions} disableCreate={true} tagPrefix={''} tags={value.map((x,k) => { return { id: k.toString(), value: x }; })} onTagAdded={addValue} onTagIdAdded={onValueIdAdded} onTagDeleted={delValue} onTagIdDeleted={delValueId} inputPlaceholder={inputPlaceholder} addBtnText={addBtnText} />
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
  