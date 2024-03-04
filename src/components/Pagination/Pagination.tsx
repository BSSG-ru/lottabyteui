/* eslint-disable no-plusplus */
/* eslint-disable react/function-component-definition */
/* eslint-disable no-restricted-syntax */
/* eslint-disable react/require-default-props */
import React, { FC, useState } from 'react';

import classNames from 'classnames';
import styles from './Pagination.module.scss';
import { Button } from '../Button';
import { ReactComponent as ChevronLeft } from '../../assets/icons/pagination/chevron-left.svg';
import { ReactComponent as ChevronRight } from '../../assets/icons/pagination/chevron-right.svg';
import { getTablePageSize, i18n, setTablePageSize, uuid } from '../../utils';

type PaginationProps = {
  className?: string;
  page: number;
  pageSize: number;
  inTotal: number;
  setPage: (num: number) => void;
  setPageSize: (num: number) => void;
  label?: string;
};

function pagination(current: number, last: number) {
  const delta = 1;
  const left = last - current > 2 ? current - delta : current - delta - (6 - (last - current + 3));
  const right = current + delta + 1 > 6 ? current + delta + 1 : 6;
  const range = [];
  const rangeWithDots = [];
  let l;

  for (let i = 1; i <= last; i += 1) {
    if (i === 1 || i === last || (i >= left && i < right)) {
      range.push(i);
    }
  }

  for (const i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}

export const Pagination: FC<PaginationProps> = ({
  className = '',
  page,
  pageSize,
  inTotal,
  setPage,
  setPageSize,
  label = '',
}) => {
  const pages = pagination(page, inTotal);
  const [paginationPageSize, setPaginationPageSize] = useState<number>(pageSize);

  const clickHandler = (value: number) => {
    setPage(value);
  };

  return (
    <div className={classNames(styles.wrapper, { [className]: className })}>
      <div className={styles.page_size}>
        <span>{i18n('Показывать по:')}</span>
        <select value={paginationPageSize} onChange={(e) => { setPaginationPageSize(parseInt(e.target.value)); setPageSize(parseInt(e.target.value)); }}>
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
        </select>
      </div>
      <div className={styles.sep}></div>
      {inTotal > 1 ? (
        <>
          <span className={styles.label}>{label}</span>
          {inTotal > 1 ? (
            <span>
              <Button
                onClick={() => clickHandler(--page)}
                background="pagination-arrow"
                disabled={page === 1}
              >
                <ChevronLeft />
              </Button>
            </span>
          ) : (
            ''
          )}
          {pages.map((el) => (
            <span key={uuid()}>
              <Button
                onClick={() => {
                  if (typeof el === 'number') {
                    clickHandler(el);
                  }
                }}
                disabled={!!(el === page || typeof el === 'string')}
                background="pagination"
                className={classNames({ [styles.btn_active]: el === page })}
              >
                {el}
              </Button>
            </span>
          ))}
          {inTotal > 1 ? (
            <span>
              <Button
                onClick={() => clickHandler(++page)}
                background="pagination-arrow"
                disabled={page === pages.at(-1)}
              >
                <ChevronRight />
              </Button>
            </span>
          ) : (
            ''
          )}
        </>
      ) : (
        ''
      )}
    </div>
  );
};
