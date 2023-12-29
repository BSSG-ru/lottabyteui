/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/require-default-props */
import React, { FC, useEffect, useState } from 'react';

import styles from './FieldAutocompleteEditor.module.scss';
import { ReactComponent as PencilIcon } from '../../assets/icons/pencil.svg';
import { ReactComponent as OrangePencilIcon } from '../../assets/icons/pencil_org.svg';
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg';
import { Autocomplete } from '../Autocomplete';
import { getArtifactUrl, i18n, setDataModified, uuid } from '../../utils';
import { Autocomplete2 } from '../Autocomplete2';

export type FieldAutocompleteEditorProps = {
  className: string;
  isReadOnly?: boolean;
  label: string;
  defaultValue: string | null;
  defaultOptions?: any;
  isRequired?: boolean;
  showValidation?: boolean;
  valueSubmitted: (id: string) => void;
  getDisplayValue: (id: string) => Promise<string|void>;
  getObjects: (search: string) => Promise<any[]>;
  allowClear?: boolean;
  artifactType?: string;
};

export const FieldAutocompleteEditor: FC<FieldAutocompleteEditorProps> = ({
  className,
  isReadOnly,
  label,
  defaultOptions = true,
  defaultValue,
  isRequired,
  showValidation,
  artifactType,
  valueSubmitted,
  getDisplayValue,
  getObjects,
  allowClear
}) => {
  const [isEditMode, setEditMode] = useState<boolean>(false);
  const [value, setValue] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [storedValue, setStoredValue] = useState('');
  const [storedDisplayValue, setStoredDisplayValue] = useState('');
  const [controlKey, setControlKey] = useState(uuid());

  useEffect(() => {
    setValue(defaultValue ?? '');
    setStoredValue(defaultValue ?? '');
  }, [defaultValue]);

  useEffect(() => {
    getDisplayValue(storedValue ?? '').then((s) => {
      setStoredDisplayValue(s ?? '');
    });
  }, [storedValue]);

  useEffect(() => {
    getDisplayValue(value ?? '').then((s) => {
      setDisplayValue(s ?? '');
    });
  }, [value]);

  useEffect(() => {
    setControlKey(uuid());
  }, [ displayValue ])

  useEffect(() => {
    if (value != storedValue)
      setDataModified(true);
  }, [ value, storedValue ]);

  const editClicked = () => {
    setEditMode(!isEditMode);
  };

  const saveClicked = () => {
    setStoredValue(value);
    valueSubmitted(value);
    setEditMode(false);
  };

  const getStoredDisplayValueHtml = () => {
    if (artifactType) {
      return <a href={getArtifactUrl(storedValue, artifactType)}>{storedDisplayValue}</a>
    } else
      return storedDisplayValue;
  };

  return (
    <div
      className={`${styles.field_autocomplete_editor} ${className}${
        showValidation && isRequired && !storedValue ? ` ${styles.error}` : ''
      }`}
    >
      <div className={styles.row_value}>
        <div className={label === '' ? styles.close_label : styles.label}>{label}</div>
        <div className={styles.display_value}>{storedValue ? getStoredDisplayValueHtml() : i18n('Выберите...')}</div>
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
      <div className={`${styles.row_edit} ${isEditMode ? styles.show : ''}`}>
        <Autocomplete2 key={'ac2-' + controlKey}
          className={styles.autocomplete_comp}
          getOptions={getObjects}
          defaultOptions={defaultOptions}
          defaultInputValue={displayValue}
          onInputChanged={(v) => { if (!value) setDisplayValue(v); }}
          onChanged={(data: any) => {
            setDisplayValue(data.name);
            setValue(data.id);
          }}
        />
        {allowClear && (<a className={styles.btn_clear} onClick={() => { setValue(''); setDisplayValue(''); }}><CloseIcon /></a>)}
        
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
