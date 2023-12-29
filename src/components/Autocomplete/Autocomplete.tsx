/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import React, { FC } from 'react';
import AsyncSelect from 'react-select/async';
import styles from './Autocomplete.module.scss';
import { i18n } from '../../utils';

export type AutocompleteProps = {
  id?: string;
  label?: string;
  className?: string;
  name?: string;
  value?: string | undefined;
  defaultValue?: string | undefined;
  inputValue?: string | undefined;
  defaultOptions?: any;
  getOptions: (search: string) => Promise<any[]>;
  onChanged: (value: string) => void;
  onInputChanged?: (value: string) => void;
  placeholder?: string;
};

export const Autocomplete: FC<AutocompleteProps> = ({
  id,
  name,
  value,
  defaultValue,
  inputValue,
  label = '',
  className,
  defaultOptions,
  getOptions,
  onChanged,
  onInputChanged,
  placeholder,
}) => {
  const localClassName = className ?? '';

  return (
    <div className={classNames(styles.autocomplete_wrapper, { [localClassName]: localClassName })}>
      {label ? <div className={styles.label}>{label}</div> : ''}
      <AsyncSelect
        className={styles.async_select}
        placeholder={!placeholder ? i18n('Выберите...') : placeholder}
        cacheOptions={false}
        maxMenuHeight={200}
        loadOptions={(val: string, callback) => {
          getOptions(val).then((r) => {
            callback(r);
          });
        }}
        defaultValue={defaultValue}
        value={value}
        inputValue={inputValue}
        defaultOptions={defaultOptions}
        getOptionValue={(data: any) => data.id}
        getOptionLabel={(data: any) => data.name ?? data.description}
        onChange={(data: any) => onChanged(data)} onInputChange={onInputChanged}
      />
    </div>
  );
};
