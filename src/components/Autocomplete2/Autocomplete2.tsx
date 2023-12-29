/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import React, { FC, useState } from 'react';
import styles from './Autocomplete2.module.scss';
import { i18n } from '../../utils';
import debounce from 'lodash.debounce';
import { useEffect } from 'react';

export type Autocomplete2Props = {
  id?: string;
  label?: string;
  className?: string;
  defaultValue?: string | undefined;
  defaultInputValue?: string | undefined;
  defaultOptions?: any;
  getOptions: (search: string) => Promise<any[]>;
  onChanged: (value: string) => void;
  onInputChanged?: (value: string) => void;
  placeholder?: string;
};

export const Autocomplete2: FC<Autocomplete2Props> = ({
  id,
  defaultInputValue,
  label = '',
  className,
  defaultOptions,
  getOptions,
  onChanged,
  onInputChanged,
  placeholder,
}) => {
  const localClassName = className ?? '';

  const [inputValue, setInputValue] = useState<string>(defaultInputValue ?? '');
  const [dropdownShown, setDropdownShown] = useState(false);
  const [dropdownItems, setDropdownItems] = useState<any[]>([]);

  const requestItems = (s:string) => {
    if (s || defaultOptions)
        getOptions(s).then(res => {
            setDropdownItems(res);
            setDropdownShown(res && res.length > 0);
        });
    else {
        setDropdownItems([]);
        setDropdownShown(false);
    }
  };

  const inputKeyUp = debounce((e:React.KeyboardEvent<HTMLInputElement>) => {
    requestItems((e.target as any).value);
  }, 300);

  const inputFocus = () => {
    requestItems('');
  };

  const dropdownItemClick = (item:any) => {
    setInputValue(item.name);
    onChanged(item);
    setDropdownShown(false);
  };

  const clickOutside = (e:any) => {
    if (e.target.classList.contains('autocomplete2') ||
        (e.target.parentElement && e.target.parentElement.classList.contains('autocomplete2')) ||
        (e.target.parentElement.parentElement && e.target.parentElement.parentElement.classList.contains('autocomplete2')) ||
        (e.target.parentElement.parentElement.parentElement && e.target.parentElement.parentElement.parentElement.classList.contains('autocomplete2'))
    ) {

    } else {
        setDropdownShown(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', clickOutside);
  }, []);

  return (
    <div className={classNames('autocomplete2', styles.autocomplete_wrapper, { [localClassName]: localClassName })}>
      {label ? <div className={styles.label}>{label}</div> : ''}
      <div className={styles.select_wrap}>
        <input type="text" className={styles.input_search} placeholder={placeholder} value={inputValue} onFocus={() => inputFocus()} onBlur={() => { setTimeout( () => { setDropdownShown(false); }, 200);}} onChange={(e) => setInputValue(e.target.value)} onKeyUp={(e) => inputKeyUp(e)} />
        <div className={styles.btn_open} onClick={() => { if (dropdownShown) setDropdownShown(false); else requestItems(''); }}></div>
        <div className={classNames(styles.dropdown, { [styles.opened]: dropdownShown })}>
            {dropdownItems.map(item => <div key={'dd-i-' + item.id} className={styles.item} onClick={() => dropdownItemClick(item)}>{item.name}</div>)}
        </div>
      </div>
    </div>
  );
};
