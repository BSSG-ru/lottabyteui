import classNames from 'classnames';
import React, { ChangeEvent, FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Input } from '../Input';
import styles from './FieldTextEditor.module.scss';
import { EditorState, convertFromRaw, convertToRaw, RawDraftContentState } from 'draft-js';
import Editor from '@draft-js-plugins/editor';
import 'draft-js/dist/Draft.css';
import '@draft-js-plugins/mention/lib/plugin.css';
import createMentionPlugin, {
  MentionData,
} from '@draft-js-plugins/mention';
import { getArtifactUrl, handleHttpError } from '../../utils';
import { getEntityAttributesByIndicatorId, searchIndicators } from '../../services/pages/indicators';
import { getEntity } from '../../services/pages/dataEntities';


export type FieldTextEditorProps = {
    className?: string;
    isReadOnly?: boolean;
    isRequired?: boolean;
    isPassword?: boolean;
    showValidation?: boolean;
    label?: string;
    id?: string;
    defaultValue: string | undefined;
    valueSubmitted: (value: string | undefined) => void;
    isDraftJS?: boolean;
    mentionParameter?: string;
};

export const FieldTextEditor: FC<FieldTextEditorProps> = ({
    className = '', isReadOnly, isRequired, showValidation, label, defaultValue, valueSubmitted, isPassword, id = '', isDraftJS, mentionParameter
}) => {

    const [value, setValue] = useState<string>('');

    const { MentionSuggestions, plugins } = useMemo(() => {
        const mentionPlugin = createMentionPlugin({ theme: { mention: styles.m_mention, mentionSuggestions: styles.m_suggestions, mentionSuggestionsPopup: styles.m_suggestions_popup,
          mentionSuggestionsEntry: styles.m_suggestions_entry, mentionSuggestionsEntryFocused: styles.m_suggestions_entry_focused, mentionSuggestionsEntryText: styles.m_suggestions_entry_text },
          supportWhitespace: true });
        // eslint-disable-next-line no-shadow
        const { MentionSuggestions } = mentionPlugin;
        // eslint-disable-next-line no-shadow
        const plugins = [mentionPlugin];
        return { plugins, MentionSuggestions };
      }, []);

    const [editorState, setEditorState] = useState<EditorState>(EditorState.createEmpty());
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

    useEffect(() => {
      if (isDraftJS) {
        try {
          if (defaultValue)
            setEditorState(EditorState.createWithContent(convertFromRaw(JSON.parse(defaultValue.toString()))));
          else
            setEditorState(EditorState.createEmpty());
        } catch (e) {
          console.log('error', e);
          setEditorState(EditorState.createEmpty());
        }
      } else 
        setValue(defaultValue ?? '');
    }, [ defaultValue ]);

    const inputChanged = (e: ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        if (valueSubmitted)
            valueSubmitted(e.target.value);
    };

    return <div className={classNames(styles.field_editor, className, { [styles.error]: isRequired && showValidation && !value, [styles.is_readonly]: isReadOnly })}>
        {label && (<div className={styles.label}>{label}{isRequired && (<span className={styles.req}>*</span>)}</div>)}
        <div className={styles.value}>
            {isReadOnly ? (
              <>
                {isDraftJS ? (
                  <Editor editorState={editorState} readOnly onChange={v => { setEditorState(v); }} plugins={plugins} />
                ) : (
                  <>
                  {isPassword ? (<>******</>) : (value ? <div dangerouslySetInnerHTML={{__html: value}}></div> : '—')}
                  </>
                )}
              </>
            ) : (
                <>
                    {isDraftJS ? (
                        <>
                            <Editor editorState={editorState} onChange={v => { var vl = JSON.stringify(convertToRaw(v.getCurrentContent())); setValue(vl); if (valueSubmitted) valueSubmitted(vl); setEditorState(v); }} plugins={plugins} />
                            <MentionSuggestions open={open} onOpenChange={onOpenChange} suggestions={suggestions} onSearchChange={onSearchChange} onAddMention={()=>{}} />
                        </>
                    ) : (
                        <Input id={id} className={styles.input} value={value ?? ''} onChange={inputChanged} type={ isPassword ? 'password' : 'text'} />
                    )}
                </>
            )}
        </div>
    </div>
}