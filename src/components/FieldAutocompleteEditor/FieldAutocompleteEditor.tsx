/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/require-default-props */
import React, { FC, useEffect, useState } from 'react';

import styles from './FieldAutocompleteEditor.module.scss';
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg';
import { getArtifactUrl, i18n, uuid } from '../../utils';
import { Autocomplete2 } from '../Autocomplete2';
import classNames from 'classnames';
import { ExtSearchDlg } from '../ExtSearchDlg';

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
  const [showExtSearch, setShowExtSearch] = useState(false);
  const [extSearchCookieKey, setExtSearchCookieKey] = useState('ext-s-' + artifactType);
  const useExtSearch = artifactType && ['domain', 'system', 'task', 'entity_query', 'entity', 'entity_sample', 'data_asset', 'indicator', 'etl', 'dq_rule', 'business_entity', 'product', 'metadata'].indexOf(artifactType) != -1;

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

  const getOptionsFunc = useExtSearch ? async (s:string) => { var a = await getObjects(s); return ([{id: '', name: i18n('Расширенный поиск'), isLink: true, onClick: () => setShowExtSearch(true)}, ...a])} : getObjects;

  return (
    <div className={classNames(styles.field_editor, className, { [styles.error]: isRequired && showValidation && !value })}>
      {label && (<div className={styles.label}>{label}{isRequired && (<span className={styles.req}>*</span>)}</div>)}
      <div className={styles.value}>
        {isReadOnly ? ( getDisplayValueHtml() ?? '—' ) : (
          <>
            <Autocomplete2 key={'ac2-' + controlKey}
              className={styles.autocomplete_comp}
              getOptions={getOptionsFunc}
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
            {useExtSearch && (<ExtSearchDlg cookieKey={extSearchCookieKey} show={showExtSearch} onClose={() => setShowExtSearch(false)} filter={[ { column: 'artifact_type', operator: 'EQUAL', value: artifactType } ]} 
              onSubmit={(row:any) => { setValue(row.id); setDisplayValue(row.name); if (valueSubmitted) valueSubmitted(row.id); setShowExtSearch(false); }} />)}
          </>
        )}
      </div>
    </div>
  );
};
