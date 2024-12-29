/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/require-default-props */
import React, { ChangeEvent, FC, useEffect, useState } from 'react';

import styles from './FieldMultipleCheckboxEditor.module.scss';
import { Checkbox } from '../Checkbox';
import { uuid } from '../../utils';
import classNames from 'classnames';

export type DataSetType = {
  name: string;
  id: string;
};

export type FieldMultipleCheckboxEditorProps = {
  className?: string;
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
  className = '',
  isReadOnly,
  isScroll,
  label,
  defaultValues,
  isRequired,
  showValidation,
  valueSubmitted,
  dataSet,
}) => {
  const [values, setValues] = useState<string[]>([]);
  const [displayValues, setDisplayValues] = useState<string[]>([]);
  const [options, setOptions] = useState<DataSetType[]>([]);

  useEffect(() => {
    setValues(defaultValues ?? []);
  }, [defaultValues]);

  useEffect(() => {
    if (options.length > 0) {
      const displayVals: string[] = [];
      for (let i = 0; i < values.length; i += 1) {
        const el = options.find((x) => x.id === values[i]);
        if (el) displayVals.push(el.name);
      }
      setDisplayValues(displayVals);
    }
  }, [values, options]);

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
    valueSubmitted(p);
  };

  return (
    <div className={classNames(styles.field_editor, className, { [styles.error]: isRequired && showValidation && (!values || values.length == 0) })} key={uuid()}>
      {label && (<div className={styles.label}>{label}{isRequired && (<span className={styles.req}>*</span>)}</div>)}
      <div className={styles.value} key={uuid()}>
        
        
        {isReadOnly ? (
          <div className={styles.display_value} key={uuid()}>{displayValues.join(', ')}</div>
        ) : (
          <>
            {options && (
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
            )}
          </>
        )}
      </div>
    </div>
  );
};
