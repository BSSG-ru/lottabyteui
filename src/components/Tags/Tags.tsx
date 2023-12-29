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
import { ReactComponent as PlusInCircle } from '../../assets/icons/plus-in-circle.svg';

import styles from './Tags.module.scss';
import { searchTags } from '../../services/pages/tags';
import { AutocompleteCreatable } from '../AutocompleteCreatable';
import { Autocomplete2 } from '../Autocomplete2';

type TagsProps = {
  tags: [] | TagProp[];
  tagPrefix?: string;
  inputPlaceholder?: string;
  addBtnText?: string;
  isReadOnly?: boolean;
  onTagAdded: (tagName: string) => void;
  onTagIdAdded?: (id: string) => void;
  onTagDeleted: (tagName: string) => void;
  onTagIdDeleted?: (tagId: string) => void;
  getOptions?: (search: string) => Promise<any[]>;
  disableCreate?: boolean;
};

export type TagProp = { value: string, id?: string };

const eventHandler = (
  query: string,
  selectedId: string,
  addMode: boolean,
  setQuery: React.Dispatch<React.SetStateAction<string>>,
  setAddMode: React.Dispatch<React.SetStateAction<boolean>>,
  onTagAdded: (tagName: string) => void,
  onTagDeleted: (tagName: string) => void,
  onTagIdDeleted?: (tagId: string) => void,
  onTagIdAdded?: (id: string) => void
) => {
  if (!addMode) {
    setAddMode((prev) => (prev = !prev));
  } else if (query) {
    const result = query.replaceAll('#', '');
    if (result) {
      onTagAdded(result);
      if (onTagIdAdded)
        onTagIdAdded(selectedId);
      setAddMode(false);
    }
    
    setQuery('');
  } else {
    setAddMode(false);
  }
};

export const Tags: FC<TagsProps> = ({
  tags, onTagAdded, onTagDeleted, onTagIdDeleted, tagPrefix, inputPlaceholder, addBtnText, isReadOnly, getOptions, disableCreate, onTagIdAdded
}) => {

  if (typeof tagPrefix === 'undefined')
    tagPrefix = '#';

  if (typeof inputPlaceholder === 'undefined')
    inputPlaceholder = 'Введите новый тег';

  if (typeof addBtnText === 'undefined')
    addBtnText = 'Добавить тег';

  const tagsWrapperRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('');
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
    <div className={styles.tags}>
      <div className={styles.tag_adder}>
        {addMode && !disableCreate && (
          <AutocompleteCreatable  getOptions={getTagOptions ?? getTagOptionsDef}
            onChanged={(data:any) => { setQuery(data.label);  setSelectedId(data.id); }} 
            onCreateOption={s => { setQuery(s); eventHandler(
              s,
              '',
              addMode,
              setQuery,
              setAddMode,
              onTagAdded,
              onTagDeleted,
              onTagIdDeleted,
              onTagIdAdded
            );}}
            />
            
        )}
        {addMode && disableCreate && getTagOptions && (
          <Autocomplete2  defaultInputValue={query} getOptions={getTagOptions} defaultOptions
          onChanged={(data:any) => { setQuery(data.label); setSelectedId(data.value); }} onInputChanged={(v) => { if (v) setQuery(v); } } 
          />
        )}
        {addMode && disableCreate && !getTagOptions && (
          <Input type="text" value={query} onChange={(e) => { setQuery(e.target.value); }} />
        )}
        {isReadOnly ? ('') : (
        <Button
          className={styles.btn}
          background="outlined-orange"
          onClick={() => eventHandler(
            query,
            selectedId,
            addMode,
            setQuery,
            setAddMode,
            onTagAdded,
            onTagDeleted,
            onTagIdDeleted,
            onTagIdAdded
          )}
        >
          <PlusInCircle />
          {addMode ? '' : addBtnText}
        </Button>
        )}
      </div>
      <div
        className={styles.tags_wrapper}
        ref={tagsWrapperRef}
      >
        {tags.map((tag: TagProp) => (
          <Tag
            key={uuid()}
            wrapperRef={tagsWrapperRef}
            value={ tagPrefix + tag.value }
            valueId={tag.id}
            hideMode={hideMode}
            onDelete={onTagDeleted}
            onDeleteId={onTagIdDeleted}
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
