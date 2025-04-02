/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/require-default-props */
import React, {
  FC, useEffect, useState,
} from 'react';
import styles from './FieldArrayEditor.module.scss';
import { i18n, setDataModified, uuid } from '../../utils';
import { Tags } from '../Tags';
import classNames from 'classnames';
import { ExtSearchDlg } from '../ExtSearchDlg';

export type FieldArrayEditorProps = {
  artifactType?: string;
  useExtSearch?: boolean;
  className?: string;
  isReadOnly?: boolean;
  isCreateMode?: boolean;
  isRequired?: boolean;
  showValidation?: boolean;
  label: string;
  defaultValue: string[] | null;
  valueSubmitted: (value: string[]) => void;
  inputPlaceholder: string;
  addBtnText?: string;
  getOptions?: (search: string) => Promise<any[]>;
  onValueIdAdded?: (id: string, name: string) => void;
  onValueIdRemoved?: (id: string) => void;
};

export const FieldArrayEditor: FC<FieldArrayEditorProps> = ({
  artifactType,
  useExtSearch,
  className = '',
  isReadOnly,
  label,
  defaultValue,
  isRequired,
  showValidation,
  valueSubmitted,
  inputPlaceholder,
  addBtnText = 'Добавить',
  getOptions,
  onValueIdAdded,
  onValueIdRemoved,
}) => {
  const [value, setValue] = useState<string[]>([]);
  const [showExtSearch, setShowExtSearch] = useState(false);
  const [extSearchCookieKey, setExtSearchCookieKey] = useState('ext-s-' + (artifactType ?? ''));

  useEffect(() => {
    setValue(defaultValue ?? []);
  }, [defaultValue]);

  const addValue = (s: string) => {
    if (valueSubmitted)
      valueSubmitted([...value, s]);
    setValue(prev => ([...prev, s]));
    setDataModified(true);
    
  };

  const delValue = (s: string) => {
    const newVal = [...value.filter(x => x != s)];
    if (valueSubmitted)
      valueSubmitted(newVal);
    setValue(newVal);
    setDataModified(true);
  };
  const delValueId = (id: string) => {
    if (id) {
      let newValue = [...value];
      newValue.splice(parseInt(id), 1);

      setValue(newValue);
      setDataModified(true);
      if (onValueIdRemoved)
        onValueIdRemoved(id);
    }
  };

  const getOptionsFunc = useExtSearch ? 
    async (s:string) => {
      var a = getOptions ? await getOptions(s) : []; 
      return ([{id: '', name: i18n('Расширенный поиск'), isLink: true, onClick: () => setShowExtSearch(true)}, ...a]);
    } 
  : getOptions;

  return (
    <div className={classNames(styles.field_editor, className, { [styles.error]: isRequired && showValidation && !value })}>
      {label && (<div className={styles.label}>{label}{isRequired && (<span className={styles.req}>*</span>)}</div>)}
      <div className={styles.value}>
          {isReadOnly ? (
            <Tags isReadOnly getOptions={getOptionsFunc} disableCreate={true} tagPrefix={''} tags={[...value]/*.sort(sortComparer)*/.map((x, k) => { return { id: k.toString(), value: x }; })} onTagAdded={addValue} onTagIdAdded={onValueIdAdded} onTagDeleted={delValue} onTagIdDeleted={delValueId} inputPlaceholder={inputPlaceholder} addBtnText={addBtnText} />
          ) : (
            <Tags getOptions={getOptionsFunc} disableCreate={true} tagPrefix={''} tags={[...value]/*.sort(sortComparer)*/.map((x, k) => { return { id: k.toString(), value: x }; })} onTagAdded={addValue} onTagIdAdded={onValueIdAdded} onTagDeleted={delValue} onTagIdDeleted={delValueId} inputPlaceholder={inputPlaceholder} addBtnText={addBtnText} />
          )}
      </div>
      {useExtSearch && (<ExtSearchDlg cookieKey={extSearchCookieKey} show={showExtSearch} onClose={() => setShowExtSearch(false)} showArtifactType filter={ artifactType ? [ { column: 'artifact_type', operator: 'EQUAL', value: artifactType } ] : []} 
              onSubmit={(row:any) => { if (onValueIdAdded) onValueIdAdded(row.id, row.name); addValue(row.name); setDataModified(true); setShowExtSearch(false); }} />)}
    </div>
  );
};
