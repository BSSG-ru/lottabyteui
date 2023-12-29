/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/require-default-props */
import React, {
  ChangeEvent, FC, useCallback, useEffect, useMemo, useState,
} from 'react';
import styles from './FieldEditor.module.scss';
import { ReactComponent as PencilIcon } from '../../assets/icons/pencil.svg';
import { ReactComponent as OrangePencilIcon } from '../../assets/icons/pencil_org.svg';
import { Input } from '../Input';
import { EditorState, convertFromRaw, convertToRaw, RawDraftContentState } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import 'draft-js/dist/Draft.css';
import '@draft-js-plugins/mention/lib/plugin.css';
import createMentionPlugin, {
  defaultSuggestionsFilter, MentionData,
} from '@draft-js-plugins/mention';

import { Textarea } from '../Textarea';
import { MentionSuggestions } from '@draft-js-plugins/mention';
import { searchIndicatorReference } from '../../services/pages/products';
import { getArtifactUrl, handleHttpError, setDataModified } from '../../utils';
import { getEntityAttributesByIndicatorId, searchIndicators } from '../../services/pages/indicators';
import { getEntity } from '../../services/pages/dataEntities';

export type FieldEditorProps = {
  className: string;
  isReadOnly?: boolean;
  isCreateMode?: boolean;
  isRequired?: boolean;
  isMultiline?: boolean;
  isDraftJS?: boolean;
  showValidation?: boolean;
  type?: string;
  labelPrefix: string;
  layout?: string;
  defaultValue: string | null | RawDraftContentState;
  mentionParameter?: string;
  valueSubmitted: (value: string | RawDraftContentState) => void;
  onBlur?: (value: string) => void;
};

export const FieldEditor: FC<FieldEditorProps> = ({
  className,
  isReadOnly,
  labelPrefix,
  defaultValue,
  layout,
  isMultiline,
  isDraftJS,
  mentionParameter,
  isRequired,
  showValidation,
  valueSubmitted,
  type = 'text',
  isCreateMode = false,
  onBlur,
}) => {
  const [isEditMode, setEditMode] = useState<boolean>(false);
  const [value, setValue] = useState<string | RawDraftContentState>('');
  const [storedValue, setStoredValue] = useState<string | RawDraftContentState>('');
  const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
  
  useEffect(() => {
    if (isDraftJS) {
      try {
        if (defaultValue)
          setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(defaultValue.toString()))));
        else
          setEditorState(EditorState.createEmpty());
      } catch (e) {
        setEditorState(EditorState.createEmpty());
      }
    }
  }, [ defaultValue ]);

  useEffect(() => {
    setValue((type !== 'password' && defaultValue) ? defaultValue : '');
    setStoredValue(defaultValue ?? '');
  }, [defaultValue]);

  useEffect(() => {
    if (value != storedValue) {
      if (!isDraftJS || (storedValue))
        setDataModified(true);
    }
  }, [ value, storedValue ]);

  const editClicked = () => {
    setEditMode(!isEditMode);
    if (type === 'password') {
      setValue('');
    }
  };

  const saveClicked = () => {
    setStoredValue((type !== 'password' && value) ? value : '******');
    valueSubmitted(value);

    setEditMode(false);
  };

  const inputChanged = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
  };

  const textareaChanged = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  };

  

  const { MentionSuggestions, plugins } = useMemo(() => {
    const mentionPlugin = createMentionPlugin();
    // eslint-disable-next-line no-shadow
    const { MentionSuggestions } = mentionPlugin;
    // eslint-disable-next-line no-shadow
    const plugins = [mentionPlugin];
    return { plugins, MentionSuggestions };
  }, []);

  const mentions: MentionData[] = [];
  
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState(mentions);
  const onOpenChange = useCallback((_open: boolean) => {
    setOpen(_open);
  }, []);
  const onSearchChange = useCallback(({ value }: { value: string }) => {
    setSuggestions([]);
    if (mentionParameter) {
      let attrCount = 0;
      getEntityAttributesByIndicatorId(mentionParameter).then(json => {
        
        Object.keys(json).forEach(entityId => {
          getEntity(entityId).then(jsonEntity => {
            json[entityId].forEach((attr:any) => {
              if (attr.name.toLowerCase().indexOf(value.toLowerCase()) != -1 /*&& attrCount < 10*/) {
                setSuggestions(prev => ([...prev, { ...attr, entityId: entityId, entityName: jsonEntity.entity.name, attrName: attr.name, name: jsonEntity.entity.name + '/' + attr.name, link: getArtifactUrl(entityId, 'entity') }]));
                attrCount++;
              }
            });
          }).catch(handleHttpError);
          
        })
      }).catch(handleHttpError);

      searchIndicators({ sort: 'name+', filters: value ? [{ column: 'name', value: value, operator: 'LIKE' }] : [], filters_for_join: [], global_query: '', limit: 5, offset: 0, state: 'PUBLISHED' }).then(json => {
        setSuggestions(prev => ([...prev, ...json.items.map((item:any) => ({ id: item.id, name: item.name, artifact_type: 'indicator', link: getArtifactUrl(item.id, 'indicator') }))]))
      }).catch(handleHttpError);
    }
  }, []);

  return (
    <div
      className={`${styles.field_editor} ${className}${showValidation && isRequired && !storedValue ? ` ${styles.error}` : ''}`}
    >
      <div className={styles.row_value}>
        {layout === 'separated' ? (
          <>
            <div className={styles.label}>{labelPrefix}</div>
            <div className={styles.display_value}>
              {isDraftJS ? (
              <Editor editorState={editorState} onChange={v => { setEditorState(v); }} readOnly />
              ) : (
                <>{(type === 'password' && !isCreateMode) ? '******' : storedValue.toString()}</>
              )}
              
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
        ) : (
          <>
            <div className={styles.value}>
              <>
              {labelPrefix}
              {storedValue}
              </>
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
        {isMultiline && (
          <Textarea
            className={styles.input_value}
            value={value ? value.toString() : ''}
            onChange={textareaChanged}
          />
        )} 
      
        {isDraftJS && (
          <div className={styles.draftjs_wrap}>
            <Editor editorState={editorState} onChange={v => { setValue(JSON.stringify(convertToRaw(v.getCurrentContent()))); setEditorState(v); }} plugins={plugins} />
            <MentionSuggestions open={open} onOpenChange={onOpenChange} suggestions={suggestions} onSearchChange={onSearchChange} onAddMention={()=>{}} />
          </div>
        )}
        {!isMultiline && !isDraftJS && (
          <Input
            className={styles.input_value}
            value={value ? value.toString() : ''}
            onChange={inputChanged}
            type={type}
          />
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
