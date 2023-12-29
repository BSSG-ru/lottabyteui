/* eslint-disable import/no-cycle */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/function-component-definition */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable react/require-default-props */
/* eslint-disable react/no-unused-prop-types */
import React, { FC } from 'react';

import classNames from 'classnames';
import { Column } from './Table';
import { ReactComponent as Default } from '../../assets/icons/tables/arrow-default.svg';
import { ReactComponent as Asc } from '../../assets/icons/tables/arrow-asc.svg';
import { ReactComponent as Desc } from '../../assets/icons/tables/arrow-desc.svg';
import styles from './Table.module.scss';
import { Input } from '../Input';
import { i18n } from '../../utils';
import { TableFilter, TableFilters } from '../../types/redux/states';

type HeaderCellProps = {
  key?: string | number;
  column: Column;
  sort: null | string;
  searchMode: boolean;
  filters: TableFilters;
  sortChanged: (sort: string) => void;
  filtersChanged: (filters: TableFilters) => void;
};

function returnSortIcon(sort: null | string, property: string) {
  if (sort?.length && sort.slice(1) === property) {
    if (sort[0] === '+') {
      return <Asc />;
    }
    return <Desc />;
  }
  return <Default />;
}

function sortHandler(changeSort: (value: string) => void, sort: null | string, property: string) {
  if (sort) {
    const sortDesc = sort[0];
    const sortProp = sort.slice(1);
    let resultDesc = '';

    if (sortProp === property) {
      resultDesc = sortDesc === '+' ? '-' : '+';
    } else {
      resultDesc = '+';
    }
    changeSort(`${resultDesc}${property}`);
  } else {
    changeSort(`+${property}`);
  }
}

function filterHandler(
  changeFilters: (value: TableFilters) => void,
  filters: TableFilters,
  value: string,
  property: string,
) {
  const query = value.toLowerCase().trim();

  let resultFilters = JSON.parse(JSON.stringify(filters));
  const existFilters = resultFilters.map((filter: TableFilter) => filter.column);
  if (query) {
    if (existFilters.includes(property)) {
      resultFilters.forEach((filter: TableFilter) => {
        if (filter.column === property) {
          filter.value = query;
          if (filter.column === 'version_id') {
            filter.operator = 'EQUAL';
          } else {
            filter.operator = 'LIKE';
          }
        }
      });
    } else {
      let operator = 'LIKE';
      if (property === 'version_id') {
        operator = 'EQUAL';
      }
      resultFilters.push({
        column: property,
        value: `${query}`,
        operator,
      });
    }
    changeFilters(resultFilters);
  } else if (existFilters.includes(property)) {
    resultFilters = resultFilters.filter((filter: TableFilter) => filter.column !== property);
    changeFilters(resultFilters);
  }
}

export const HeaderCell: FC<HeaderCellProps> = ({
  column,
  sort,
  searchMode = false,
  filters,
  sortChanged,
  filtersChanged,
}) => {
  if (column.isHidden) return (<></>);

  let filterString = '';
  filters.forEach((tf: TableFilter) => {
    if (tf.column === column.property || tf.column === column.filter_property) filterString = tf.value;
  });

  return (
    <th>
      <div className={classNames(styles.header, { [styles.header_withsort]: sort })}>
        <span
          className={styles.header_name}
          onClick={() => {
            if (column.sortDisabled === undefined || !column.sortDisabled) sortHandler(sortChanged, sort, column.filter_property ?? column.property);
          }}
        >
          {(column.sortDisabled === undefined || !column.sortDisabled)
            && typeof sort === 'string' ? (
            <span className={styles.header_sort}>
              {returnSortIcon(sort, column.filter_property ?? column.property)}
            </span>
          ) : (
            ''
          )}
          {column.header}
        </span>
        {searchMode && (column.filterDisabled === undefined || !column.filterDisabled) ? (
          <Input
            filter
            inputStyle={styles.input_no_hover}
            className={styles.input_column}
            placeholder={i18n('фильтр')}
            defaultValue={filterString}
            onBlur={(e) => {
              filterHandler(
                filtersChanged,
                filters,
                e.target.value,
                column.filter_property ?? column.property,
              );
            }}
          />
        ) : (
          ''
        )}
      </div>
    </th>
  );
};
