/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/require-default-props */
import React, { FC, useEffect, useState } from 'react';
import styles from './FieldCheckboxListEditor.module.scss';
import { ReactComponent as PencilIcon } from '../../assets/icons/pencil.svg';
import { ReactComponent as OrangePencilIcon } from '../../assets/icons/pencil_org.svg';
import { Checkbox } from '../Checkbox';

export type FieldCheckboxListEditorProps = {
  className: string;
  isReadOnly?: boolean;
  label: string;
  defaultValue?: string[];
  isRequired?: boolean;
  showValidation?: boolean;
  valueSubmitted: (val: string[]) => void;
  getObjects: () => Promise<any[]>;
};

export const FieldCheckboxListEditor: FC<FieldCheckboxListEditorProps> = ({
  className,
  isReadOnly,
  label,
  defaultValue,
  isRequired,
  showValidation,
  valueSubmitted,
  getObjects,
}) => {
  const [isEditMode, setEditMode] = useState<boolean>(false);
  const [value, setValue] = useState<string[]>([]);
  const [, setDisplayValue] = useState('');
  const [storedValue, setStoredValue] = useState<string[]>([]);
  const [storedDisplayValue, setStoredDisplayValue] = useState('');
  const [items, setItems] = useState<any[]>([]);

  const getDisplayValue = (val: string[]) => {
    const parts: string[] = [];
    val.forEach((v) => {
      const item = items.find((x) => x.id === v);
      if (item) parts.push(item.name);
    });
    return parts.join(', ');
  };

  useEffect(() => {
    getObjects().then((data) => setItems(data));
  }, []);

  useEffect(() => {
    setValue(defaultValue ?? []);
    setStoredValue(defaultValue ?? []);
  }, [defaultValue]);

  useEffect(() => {
    setStoredDisplayValue(getDisplayValue(storedValue ?? []));
  }, [storedValue, items]);

  useEffect(() => {
    setDisplayValue(getDisplayValue(value ?? []));
  }, [value]);

  const editClicked = () => {
    setEditMode(!isEditMode);
  };

  const saveClicked = () => {
    setStoredValue(value);
    valueSubmitted(value);
    setEditMode(false);
  };

  return (
    <div
      className={`${styles.field_cb_list_editor} ${className}${
        showValidation && isRequired && !storedValue ? ` ${styles.error}` : ''
      }`}
    >
      <div className={styles.row_value}>
        <div className={label === '' ? styles.close_label : styles.label}>{label}</div>
        <div className={styles.display_value}>{storedDisplayValue}</div>
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
        <div className={styles.cb_list}>
          {items.map((item) => (
            <div
              key={`cb_${item.id}`}
              className={styles.cb_item}
            >
              <Checkbox
                label={item.name}
                id={`input_cb_${item.id}`}
                checked={value.filter((x) => x === item.id).length > 0}
                onChange={(e) => {
                  if (e.target.checked && value.indexOf(item.id) === -1) setValue(() => [...value, item.id]);
                  if (!e.target.checked) {
                    setValue(value.filter((x) => x !== item.id));
                  }
                }}
              />
            </div>
          ))}
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
