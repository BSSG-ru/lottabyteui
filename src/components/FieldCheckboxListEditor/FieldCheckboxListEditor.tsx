/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/require-default-props */
import React, { FC, useEffect, useState } from 'react';
import styles from './FieldCheckboxListEditor.module.scss';
import { Checkbox } from '../Checkbox';
import classNames from 'classnames';

export type FieldCheckboxListEditorProps = {
  className?: string;
  isReadOnly?: boolean;
  label: string;
  defaultValue?: string[];
  isRequired?: boolean;
  showValidation?: boolean;
  valueSubmitted: (val: string[]) => void;
  getObjects: () => Promise<any[]>;
};

export const FieldCheckboxListEditor: FC<FieldCheckboxListEditorProps> = ({
  className = '',
  isReadOnly,
  label,
  defaultValue,
  isRequired,
  showValidation,
  valueSubmitted,
  getObjects,
}) => {
  const [value, setValue] = useState<string[]>([]);
  const [displayValue, setDisplayValue] = useState('');
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
  }, [defaultValue]);

  useEffect(() => {
    setDisplayValue(getDisplayValue(value ?? []));
  }, [value, items]);

  useEffect(() => {
    setDisplayValue(getDisplayValue(value ?? []));
    //valueSubmitted(value);
  }, [value]);

  
  return (
    <div className={classNames(styles.field_editor, className, { [styles.error]: isRequired && showValidation && !value })}>
      {label && (<div className={styles.label}>{label}{isRequired && (<span className={styles.req}>*</span>)}</div>)}
      <div className={styles.value}>
        {isReadOnly ? (displayValue) : (
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
                    if (e.target.checked && value.indexOf(item.id) === -1) {
                      setValue(() => [...value, item.id]);
                      valueSubmitted([...value, item.id]);
                    }
                    if (!e.target.checked) {
                      setValue(value.filter((x) => x !== item.id));
                      valueSubmitted(value.filter((x) => x !== item.id));
                    }
                  }}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
