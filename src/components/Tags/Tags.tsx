/* eslint-disable react/function-component-definition */
/* eslint-disable no-return-assign */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/require-default-props */
import React, {
  FC, useRef, useState, useEffect,
} from 'react';
import { i18n, uuid } from '../../utils';
import { Button } from '../Button';
import { Input } from '../Input';
import { Tag } from '../Tag/Tag';
import { ReactComponent as PlusBlue } from '../../assets/icons/plus-blue.svg';

import styles from './Tags.module.scss';
import { searchTags } from '../../services/pages/tags';
import { AutocompleteCreatable } from '../AutocompleteCreatable';
import { Autocomplete2 } from '../Autocomplete2';
import classNames from 'classnames';

type TagsProps = {
  tags: [] | TagProp[];
  tagPrefix?: string;
  inputPlaceholder?: string;
  addBtnText?: string;
  isReadOnly?: boolean;
  onTagAdded?: (tagName: string) => void;
  onTagIdAdded?: (id: string, name: string) => void;
  onTagObjAdded?: (tagObj: any) => void;
  onTagDeleted?: (tagName: string) => void;
  onTagIdDeleted?: (tagId: string) => void;
  onTagObjRemoved?: (tagObj: any) => void;
  getOptions?: (search: string) => Promise<any[]>;
  disableCreate?: boolean;
};

export type TagProp = { value: string, id?: string };

const eventHandler = (
  query: string,
  selectedId: string,
  selectedObj: any,
  addMode: boolean,
  setQuery: React.Dispatch<React.SetStateAction<string>>,
  setAddMode: React.Dispatch<React.SetStateAction<boolean>>,
  onTagAdded?: (tagName: string) => void,
  onTagObjAdded?: (tagObj: any) => void,
  onTagDeleted?: (tagName: string) => void,
  onTagIdDeleted?: (tagId: string) => void,
  onTagIdAdded?: (id: string, name: string) => void,
  onTagObjRemoved?: (tagObj: any) => void
) => {
  if (!addMode) {
    setAddMode((prev) => (prev = !prev));
  } else if (query) {
    const result = query.replaceAll('#', '');
    if (result) {
      if (onTagAdded)
        onTagAdded(result);
      if (onTagIdAdded)
        onTagIdAdded(selectedId, result);
      if (onTagObjAdded)
        onTagObjAdded(selectedObj);
      setAddMode(false);
    }
    
    setQuery('');
  } else {
    setAddMode(false);
  }
};

export const Tags: FC<TagsProps> = ({
  tags, onTagAdded, onTagDeleted, onTagIdDeleted, tagPrefix, inputPlaceholder, addBtnText, isReadOnly, getOptions, disableCreate, onTagIdAdded, onTagObjAdded, onTagObjRemoved
}) => {

  if (typeof tagPrefix === 'undefined')
    tagPrefix = '';

  if (typeof inputPlaceholder === 'undefined')
    inputPlaceholder = 'Введите новый тег';

  if (typeof addBtnText === 'undefined')
    addBtnText = 'Добавить';

  const tagsWrapperRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [selectedObj, setSelectedObj] = useState<any>();
  const [addMode, setAddMode] = useState(false);
  const [hideMode, setHideMode] = useState(true);
  const [hidden, setHidden] = useState(0);

  const getTagOptions = getOptions;
  const getTagOptionsDef = async (search: string) => searchTags(search).then(json => json.map((item:any) => ({ value: item.id, label: item.name })));

  useEffect(() => {

    let hiddenItem = 0;
    if (tagsWrapperRef && tagsWrapperRef.current) {
      Array.from(tagsWrapperRef.current.children).forEach((child: Element) => {
        if ((child as HTMLElement).style.display === 'none') {
          hiddenItem += 1;
        }
      });
    }
    if (hiddenItem) {
      setHidden(hiddenItem);
    }
  }, [tags]);

  return (
    <div className={classNames(styles.tags, {[styles.has_tags]: tags && tags.length > 0})}>
      <div className={styles.tag_adder}>
        {addMode && !disableCreate && (
          <AutocompleteCreatable  getOptions={getTagOptions ?? getTagOptionsDef}
            onChanged={(data:any) => { setQuery(data.label);  setSelectedId(data.value); setSelectedObj(data); }} 
            onCreateOption={s => { setQuery(s); eventHandler(
              s,
              '',
              undefined,
              addMode,
              setQuery,
              setAddMode,
              onTagAdded,
              onTagObjAdded,
              onTagDeleted,
              onTagIdDeleted,
              onTagIdAdded
            );}}
            />
            
        )}
        {addMode && !isReadOnly && disableCreate && getTagOptions && (
          <Autocomplete2  defaultInputValue={query} getOptions={getTagOptions} defaultOptions
          onChanged={(data:any) => { setQuery(data.label); setSelectedId(data.value); setSelectedObj(data); }} onInputChanged={(v) => { if (v) setQuery(v); } } onLinkOptionClick={() => setAddMode(false)}
          />
        )}
        {addMode && !isReadOnly && disableCreate && !getTagOptions && (
          <Input type="text" value={query} onChange={(e) => { setQuery(e.target.value); }} />
        )}
        {isReadOnly ? ('') : (
        <Button
          className={styles.btn}
          background="none"
          onClick={() => eventHandler(
            query,
            selectedId,
            selectedObj,
            addMode,
            setQuery,
            setAddMode,
            onTagAdded,
            onTagObjAdded,
            onTagDeleted,
            onTagIdDeleted,
            onTagIdAdded
          )}
        >
          <PlusBlue />
          {addMode ? '' : addBtnText}
        </Button>
        )}
      </div>
      <div
        className={styles.tags_wrapper}
        ref={tagsWrapperRef}
      >
        {tags.length == 0 && (<>—</>)}
        {tags.map((tag: TagProp) => (
          <Tag
            key={uuid()}
            wrapperRef={tagsWrapperRef}
            value={ tagPrefix + tag.value }
            valueId={tag.id}
            hideMode={hideMode}
            onDelete={(s) => { if (onTagDeleted) onTagDeleted(s); if (onTagObjRemoved) onTagObjRemoved(tag); }}
            onDeleteId={onTagIdDeleted}
            disableDelete={isReadOnly}
          />
        ))}
        {hideMode && hidden ? (
          <Tag
            moreTag
            value={`+${hidden}`}
            onClick={() => setHideMode(false)}
            disableDelete
          />
        ) : (
          ''
        )}
      </div>
    </div>
  );
};
