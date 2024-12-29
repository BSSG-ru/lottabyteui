/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/require-default-props */
import React, { FC, useEffect, useState } from 'react';

import styles from './FieldAutocompleteEditor.module.scss';
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg';
import { getArtifactUrl, uuid } from '../../utils';
import { Autocomplete2 } from '../Autocomplete2';
import classNames from 'classnames';

export type FieldAutocompleteEditorProps = {
  className?: string;
  isReadOnly?: boolean;
  label: string;
  defaultValue: string | null | undefined;
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
  className = '',
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
  const [value, setValue] = useState('');
  const [displayValue, setDisplayValue] = useState('');
  const [controlKey, setControlKey] = useState(uuid());

  useEffect(() => {
    setValue(defaultValue ?? '');
  }, [defaultValue]);

  useEffect(() => {
    getDisplayValue(value ?? '').then((s) => {
      setDisplayValue(s ?? '');
    });
  }, [value]);

  useEffect(() => {
    setControlKey(uuid());
  }, [ displayValue ])

  /*useEffect(() => {
    if (value != storedValue)
      setDataModified(true);
  }, [ value, storedValue ]);*/

  

  const getDisplayValueHtml = () => {
    if (artifactType) {
      if (!value) return undefined;
      return <a href={getArtifactUrl(value, artifactType)}>{displayValue}</a>
    } else
      return displayValue;
  };

  return (
    <div className={classNames(styles.field_editor, className, { [styles.error]: isRequired && showValidation && !value })}>
      {label && (<div className={styles.label}>{label}{isRequired && (<span className={styles.req}>*</span>)}</div>)}
      <div className={styles.value}>
        {isReadOnly ? ( getDisplayValueHtml() ?? '—' ) : (
          <>
            <Autocomplete2 key={'ac2-' + controlKey}
              className={styles.autocomplete_comp}
              getOptions={getObjects}
              defaultOptions={defaultOptions}
              defaultInputValue={displayValue}
              onInputChanged={(v) => { if (!value) setDisplayValue(v); }}
              onChanged={(data: any) => {
                setDisplayValue(data.name);
                setValue(data.id);
                if (valueSubmitted)
                  valueSubmitted(data.id);
              }}
            />
            {allowClear && (<a className={styles.btn_clear} onClick={() => { setValue(''); setDisplayValue(''); if (valueSubmitted) valueSubmitted(''); }}><CloseIcon /></a>)}
          </>
        )}
      </div>
    </div>
  );
};
