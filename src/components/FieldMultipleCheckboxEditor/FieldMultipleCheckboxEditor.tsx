/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/require-default-props */
import React, { ChangeEvent, FC, useEffect, useState } from 'react';

import styles from './FieldMultipleCheckboxEditor.module.scss';
import { ReactComponent as PencilIcon } from '../../assets/icons/pencil.svg';
import { ReactComponent as OrangePencilIcon } from '../../assets/icons/pencil_org.svg';
import { Checkbox } from '../Checkbox';
import { uuid } from '../../utils';

export type DataSetType = {
  name: string;
  id: string;
};

export type FieldMultipleCheckboxEditorProps = {
  className: string;
  isReadOnly?: boolean;
  isScroll?: boolean;
  label: string;
  defaultValues: string[] | null;
  isRequired?: boolean;
  dataSet: (search: string) => Promise<any[]>;
  showValidation?: boolean;
  valueSubmitted: (ids: string[]) => void;
};

export const FieldMultipleCheckboxEditor: FC<FieldMultipleCheckboxEditorProps> = ({
  className,
  isReadOnly,
  isScroll,
  label,
  defaultValues,
  isRequired,
  showValidation,
  valueSubmitted,
  dataSet,
}) => {
  const [isEditMode, setEditMode] = useState<boolean>(false);
  const [values, setValues] = useState<string[]>([]);
  const [storedValues, setStoredValues] = useState<string[]>([]);
  const [storedDisplayValues, setStoredDisplayValues] = useState<string[]>([]);
  const [options, setOptions] = useState<DataSetType[]>([]);

  useEffect(() => {
    setValues(defaultValues ?? []);
    setStoredValues(defaultValues ?? []);
  }, [defaultValues]);

  useEffect(() => {
    if (options.length > 0) {
      const displayVals: string[] = [];
      for (let i = 0; i < storedValues.length; i += 1) {
        const el = options.find((x) => x.id === storedValues[i]);
        if (el) displayVals.push(el.name);
      }
      setStoredDisplayValues(displayVals);
    }
  }, [isEditMode, storedValues, values, options]);

  useEffect(() => {
    dataSet('').then((json) => {
      setOptions(
        json.map((x: any) => ({
          name: x.name,
          id: x.id,
        })),
      );
    });
  }, []);

  /* useEffect(() => {
    const displayVals: string[] = [];
    for (let i = 0; i < values.length; i += 1) {
      const el = options.find((x) => x.id === values[i]);
      displayVals.push(el ? el.name : '');
    }
    setStoredDisplayValues(displayVals);
  }, [values]); */

  const editClicked = () => {
    setEditMode(!isEditMode);
  };

  const saveClicked = () => {
    setStoredValues(values);
    valueSubmitted(values);
    setEditMode(false);
  };

  const valuesContain = (s: string) => values.some((val) => val === s);

  const valueChanged = (v: string, checked: boolean) => {
    const p = values ? [...values] : [];
    if (checked) {
      p.push(v);
    } else {
      const index = p.indexOf(v);
      if (index !== -1) {
        p.splice(index, 1);
      }
    }
    setValues(p);
  };

  return (
    <div
      className={`${styles.field_autocomplete_editor} ${className}${showValidation
        && isRequired
        && (!storedValues || storedValues.length === 0) ? ` ${styles.error}` : ''}`}
      key={uuid()}
    >
      <div className={styles.row_value} key={uuid()}>
        <div className={label === '' ? styles.close_label : styles.label} key={uuid()}>{label}</div>
        <div className={styles.display_value} key={uuid()}>{storedDisplayValues.join(', ')}</div>
        {isReadOnly ? (
          ''
        ) : (
          <a
            className={styles.btn_edit}
            onClick={editClicked}
            key={uuid()}
          >
            <PencilIcon key={uuid()} />
          </a>
        )}
      </div>
      <div className={`${styles.row_edit} ${isEditMode ? styles.show : ''}`} key={uuid()}>
        {options ? (
          <div className={`${styles.checkboxes} ${isScroll ? styles.data_scroll : ''}`} key={uuid()}>
            {options.map((option: DataSetType) => (
              <div className={styles.row} key={uuid()}>
                <Checkbox
                  // eslint-disable-next-line react/no-array-index-key
                  key={uuid()}
                  id={option.id}
                  name={option.name}
                  label={option.name}
                  className={styles.checkbox}
                  checked={valuesContain(option.id)}
                  value={option.id}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    valueChanged(e.target.value, e.target.checked);
                  }}
                />
              </div>
            ))}
          </div>
        ) : (
          <> </>
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
