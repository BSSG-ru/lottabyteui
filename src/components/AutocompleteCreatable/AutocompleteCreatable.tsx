/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import React, { FC } from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import styles from './AutocompleteCreatable.module.scss';
import { i18n } from '../../utils';

export type AutocompleteCreatableProps = {
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
  onCreateOption?: (value: string) => void;
  placeholder?: string;
};

export const AutocompleteCreatable: FC<AutocompleteCreatableProps> = ({
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
  onCreateOption,
  placeholder,
}) => {
  const localClassName = className ?? '';

  return (
    <div className={classNames(styles.autocomplete_wrapper, { [localClassName]: localClassName })}>
      {label ? <div className={styles.label}>{label}</div> : ''}
      <AsyncCreatableSelect
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
        
        onChange={(data: any) => onChanged(data)} onInputChange={onInputChanged} defaultInputValue={value}
        createOptionPosition='first'
        allowCreateWhileLoading={true}
        formatCreateLabel={x => { return <span>{i18n('Создать') + ' "' + x + '"'}</span>; }}
        onCreateOption={onCreateOption}
      />
    </div>
  );
};
