/* eslint-disable react/require-default-props */
import React, {
  FC, useState, KeyboardEvent, useEffect,
} from 'react';
import classNames from 'classnames';
import styles from './Search.module.scss';
import { ReactComponent as SearchIcon } from '../../assets/icons/search.svg';
import { i18n } from '../../utils';
import { Button } from '../Button';
import { Input } from '../Input';
import { useNavigate } from 'react-router';
import { getTags, searchTags } from '../../services/pages/tags';


type SearchProps = {
  query?: string | null;
};

export const Search: FC<SearchProps> = ({ query }) => {
  const [value, setValue] = useState('');
  const navigate = useNavigate();
  const [mode, setMode] = useState('default');
  const [tagSearch, setTagSearch] = useState('');
  const [tags, setTags] = useState<any[]>([]);
  const [tagIndex, setTagIndex] = useState(-1);
  const [tagStartPos, setTagStartPos] = useState(-1);
  const [tagEndPos, setTagEndPos] = useState(-1);

  useEffect(() => {
    setValue(query ?? '');
  }, [query]);

  useEffect(() => {
    if (tagSearch) {
      searchTags(tagSearch).then(json => {
        console.log('tags', json);
        setTags(json);
        if (json.length > 0)
          setTagIndex(0);
        else
          setTagIndex(-1);
      });
    } else {
      setTags([]);
      setTagIndex(-1);
    }
  }, [ tagSearch ]);

  const tagsPopup = (target: HTMLInputElement) => {

    var s = target.value;
    //console.log('s', s);
    var pos = target.selectionStart;
    if (pos) {
      var start = pos - 1;
      var end = pos;

      while (start >= 0 && s.at(start) != ' ')
        start--;
      while (end < s.length && s.at(end) != ' ')
        end++;

      //console.log('start', start);
      //console.log('end', end);

      if (s.at(start+1) == '@' && end - start > 2) {
        setMode('select-tag');
        setTagSearch(s.substring(start + 2, end));
        setTagStartPos(start+ 2);
        setTagEndPos(end);
      } else {
        setMode('default');
        setTagStartPos(-1);
        setTagEndPos(-1);
      }
    }
  };

  const tagItemClick = (name: string) => {

    setValue(value.substring(0, tagStartPos) + name + (tagEndPos == value.length ? ' ' : '') + value.substring(tagEndPos, value.length));
    var inp = document.getElementById('search-input');
    if (inp) {
      inp.focus();
      (inp as HTMLInputElement).setSelectionRange(tagStartPos + name.length + 1, tagStartPos + name.length + 1);
      
    }

    setMode('default');
  };

  return (
    <div className={styles.search_wrapper}>
      <div className={styles.search}>
        <Input
          className={styles.search_input}
          id="search-input"
          placeholder={i18n('Search')}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          enterKeyBlursInput={false}
          customKeyUpHandler={(e: KeyboardEvent) => {
            /*if (e.key == '@') {
              setMode('select-tag');
              setTagSearch('');
            } else if (e.code == 'Backspace') {
              if (mode == 'select-tag' && tagSearch) {
                setTagSearch(tagSearch.substring(0, tagSearch.length - 1));
              }
            } else if (e.key.match(/^[a-zA-Zа-яА-Я\.\-_=]$/)) {
              setTagSearch(tagSearch + e.key);
            } else if (e.code == 'ArrowDown') {
              if (tagIndex < tags.length - 1)
                setTagIndex(tagIndex + 1);

            } else if (e.code == 'ArrowUp') {
              if (tagIndex > 0)
                setTagIndex(tagIndex - 1);
            } else {
              setMode('default');
            }*/

            tagsPopup(e.target as HTMLInputElement);

            if (e.code == 'ArrowDown') {
              if (tagIndex < tags.length - 1)
                setTagIndex(tagIndex + 1);
              e.preventDefault();

            } else if (e.code == 'ArrowUp') {
              if (tagIndex > 0)
                setTagIndex(tagIndex - 1);
              e.preventDefault();
            } else if (e.code == 'Enter' || e.code == 'NumpadEnter') {
              if (mode == 'select-tag')
                tagItemClick(tags[tagIndex].name);
              else
                navigate(`/search/?q=${encodeURIComponent(value)}`);
            }
            
          }}
          customSelectHandler={(e:any) => {
            tagsPopup(e.target as HTMLInputElement);
          }}
        />
        <Button
          disabled={!value}
          background="blue"
          onClick={() => {
            if (value) navigate(`/search/?q=${encodeURIComponent(value)}`);
          }}
          className={classNames(styles.search_button, { [styles.search_button_active]: value })}
        >
          <SearchIcon />
        </Button>
        {mode == 'select-tag' && tagSearch != '' && (
          <div className={styles.tags_popup}>
            <div className={styles.list}>
              {tags.map((tag, i) => <div onClick={() => tagItemClick(tag.name)} className={classNames(styles.item, { [styles.active]: i == tagIndex })}>{tag.name}</div>)}
              {tags.length == 0 && (<span>Не найдено</span>)}
            </div>
          </div>
        )}
      </div>
      <div className={styles.tags} />
    </div>
  );
};
