/* eslint-disable react/jsx-indent */
/* eslint-disable @typescript-eslint/indent */
/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/require-default-props */
import React, {
 ChangeEvent, FC, useEffect, useState,
} from 'react';

import styles from './CustomAttributeEditor.module.scss';
import { ReactComponent as PencilIcon } from '../../assets/icons/pencil.svg';
import { ReactComponent as OrangePencilIcon } from '../../assets/icons/pencil_org.svg';
import { Input } from '../Input';
import { Checkbox } from '../Checkbox';
import { RadioButton } from '../RadioButton';

export type CustomAttrDefElement = {
  id: string;
  name: string;
};

export type CustomAttrDefinition = {
  id: string;
  name: string;
  type: string;
  multiple_values: boolean;
  minimum: number;
  maximum: number;
  min_length: number;
  max_length: number;
  def_elements: CustomAttrDefElement[];
};

export type CustomAttributeEditorProps = {
  className?: string;
  isReadOnly?: boolean;
  label: string;
  defaultValue: any;
  custom_attr_definition: CustomAttrDefinition | undefined;
  onChanged: (value: any[]) => void;
};

export const CustomAttributeEditor: FC<CustomAttributeEditorProps> = ({
  className,
  isReadOnly,
  label,
  defaultValue,
  custom_attr_definition,
  onChanged,
}) => {
  const [isEditMode, setEditMode] = useState<boolean>(false);
  const [value, setValue] = useState<any[]>([]);
  const [storedValue, setStoredValue] = useState<any[]>([]);

  useEffect(() => {
    setValue(defaultValue);
    if (custom_attr_definition && custom_attr_definition.type === 'Date') {
      if (defaultValue && defaultValue.length > 0) setStoredValue([new Date(defaultValue[0]).toLocaleDateString('ru-RU')]);
      else setStoredValue([]);
    } else setStoredValue(defaultValue);
  }, [defaultValue]);

  const editClicked = () => {
    setEditMode(!isEditMode);
  };

  const saveClicked = () => {
    onChanged(value);
    if (custom_attr_definition && custom_attr_definition.type === 'Date') {
      if (value && value.length > 0) setStoredValue([new Date(value[0]).toLocaleDateString('ru-RU')]);
      else setStoredValue([]);
    } else setStoredValue(value);
    setEditMode(false);
  };

  const inputValueChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setValue([e.target.value]);
  };

  const radioValueChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setValue([e.target.value]);
    onChanged([e.target.value]);
  };

  const checkboxValueChanged = (v: string, checked: boolean) => {
    let newValue = [];
    if (checked) newValue = [...value, v];
    else newValue = value.filter((x) => x !== v);
    setValue(newValue);
    onChanged(newValue);
  };

  const getSingleValue = (v: any[]) => {
    if (v && v.length > 0) {
      return v[0];
    }
    return '';
  };

  const valuesContain = (v: any[], s: string) => v.indexOf(s) !== -1;

  return (
    <div
      className={`${styles.custom_attribute_editor} ${className ?? ''} ${
        custom_attr_definition ? styles[custom_attr_definition.type.toLowerCase()] : ''
      }`}
    >
      <div className={styles.row_value}>
        <div className={styles.label}>{label}</div>
        {custom_attr_definition
        && (custom_attr_definition.type === 'String'
          || custom_attr_definition.type === 'Date'
          || custom_attr_definition.type === 'Numeric') ? (
          <>
            <div className={styles.display_value}>{storedValue}</div>
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
          ''
        )}
      </div>
      <div
        className={`${styles.row_edit} ${
          custom_attr_definition ? styles[custom_attr_definition.type.toLowerCase()] : ''
        } ${
          isEditMode || (custom_attr_definition && custom_attr_definition.type === 'Enumerated')
            ? styles.show
            : ''
        }`}
      >
        {custom_attr_definition && custom_attr_definition.type === 'String' && (
          <Input
            className={styles.input}
            value={getSingleValue(value)}
            onChange={inputValueChanged}
          />
        )}
        {custom_attr_definition && custom_attr_definition.type === 'Numeric' && (
          <Input
            type="number"
            className={styles.input}
            value={getSingleValue(value)}
            onChange={inputValueChanged}
          />
        )}
        {custom_attr_definition && custom_attr_definition.type === 'Date' && (
          <Input
            type="date"
            className={styles.input}
            value={getSingleValue(value)}
            onChange={inputValueChanged}
          />
        )}
        {custom_attr_definition && custom_attr_definition.type === 'Enumerated' && (
          <>
            {custom_attr_definition.multiple_values ? (
              <>
                {custom_attr_definition.def_elements.map((def_elem: CustomAttrDefElement) => (
                  <Checkbox
                    key={`ca_${custom_attr_definition.id}_${def_elem.id}`}
                    id={`ca_${custom_attr_definition.id}_${def_elem.id}`}
                    name={`ca_cb_${custom_attr_definition.id}`}
                    label={def_elem.name}
                    className={styles.checkbox}
                    checked={valuesContain(value, def_elem.id)}
                    isReadOnly={isReadOnly}
                    value={def_elem.id}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      checkboxValueChanged(e.target.value, e.target.checked);
                    }}
                  />
                ))}
              </>
            ) : (
              <>
                {custom_attr_definition.def_elements.map((def_elem: CustomAttrDefElement) => (
                  <RadioButton
                    key={`ca_${custom_attr_definition.id}_${def_elem.id}`}
                    id={`ca_${custom_attr_definition.id}_${def_elem.id}`}
                    name={`ca_rb_${custom_attr_definition.id}`}
                    label={def_elem.name}
                    className={styles.radiobutton}
                    checked={getSingleValue(value) === def_elem.id}
                    value={def_elem.id}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      radioValueChanged(e);
                    }}
                  />
                ))}
              </>
            )}
          </>
        )}

        {custom_attr_definition
          && (custom_attr_definition.type === 'String'
            || custom_attr_definition.type === 'Date'
            || custom_attr_definition.type === 'Numeric') && (
            <a
              className={styles.btn_save}
              onClick={saveClicked}
            >
              <OrangePencilIcon />
            </a>
          )}
      </div>
    </div>
  );
};
