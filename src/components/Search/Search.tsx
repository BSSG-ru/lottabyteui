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


type SearchProps = {
  query?: string | null;
};

export const Search: FC<SearchProps> = ({ query }) => {
  const [value, setValue] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setValue(query ?? '');
  }, [query]);

  return (
    <div className={styles.search_wrapper}>
      <div className={styles.search}>
        <Input
          className={styles.search_input}
          id="#search-input"
          placeholder={i18n('Search')}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          customKeyDownHandler={(e: KeyboardEvent) => {
            if ((e.code === 'Enter' || e.code === 'NumpadEnter') && value) {
              navigate(`/search/?q=${encodeURIComponent(value)}`);
            }
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
      </div>
      <div className={styles.tags} />
    </div>
  );
};
