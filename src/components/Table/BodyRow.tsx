/* eslint-disable react/require-default-props */
/* eslint-disable import/no-cycle */
import React, { CSSProperties, FC } from 'react';
import { Column } from './Table';
import { DataItem } from '../../types/table';
import styles from './Table.module.scss';
import { uuid } from '../../utils';
import classNames from 'classnames';

type BodyRowProps = {
  row: DataItem;
  columns: Column[];
  onDeleteClicked?: (row: any) => void;
  onFavClicked?: (row: any) => void;
  onClick?: (row: any) => void;
  onDoubleClick?: (row: any) => void;
  rowClassName?: (row: any) => string;
  rowStyle?: (row: any) => CSSProperties;
};

export const BodyRow: FC<BodyRowProps> = ({
  row, columns, onDeleteClicked, onClick, onDoubleClick, rowClassName, rowStyle, onFavClicked
}) => (
  <tr
    key={uuid()}
    onClick={() => {
      if (onClick) onClick(row);
    }}
    onDoubleClick={() => {
      if (onDoubleClick) onDoubleClick(row);
    }}
    className={rowClassName ? rowClassName(row) : ''}
    style={rowStyle ? { ...rowStyle(row), cursor: onClick ? 'pointer' : 'default' } : { cursor: onClick ? 'pointer' : 'default' }}
  >
    {columns.map((column, colIdx) => {
      if (column.isHidden) return '';

      const { property } = column;
      let result: React.ReactNode | string | number = row[property as keyof typeof row];

      let actionsPopup: React.ReactNode | string = '';

      if (column.render) {
        result = column.render(row) as React.ReactNode;
      }

      if (onDeleteClicked && colIdx == columns.length - 1) {
        actionsPopup = <>
          {typeof row.is_in_fav !== 'undefined' && onFavClicked && (
            <a href="#" className={classNames(styles.btn_fav, {[styles.active]: row.is_in_fav})} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onFavClicked(row); return false; }} />
          )}
          <a href="#"
            onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDeleteClicked(row); return false; }}
            className={styles.btn_del}
          />
        </>
      }

      return (
        <td
          className={styles.body_cell}
          key={uuid()}
        >
          <div key={uuid()}>{result ?? '-'}</div>
          {actionsPopup && (
            <div
              key={uuid()}
              className={styles.actions_popup}
            >
              {actionsPopup ?? ''}
            </div>
          )}
        </td>
      );
    })}
  </tr>
);
