/* eslint-disable react/require-default-props */
/* eslint-disable import/no-cycle */
import React, { CSSProperties, FC, ReactNode } from 'react';
import { Column } from './Table';
import { DataItem } from '../../types/table';
import styles from './Table.module.scss';
import { i18n, uuid } from '../../utils';
import classNames from 'classnames';

export type RowButton = {
  node: ReactNode;
  title?: string;
  onClick: (row:any) => void;
}

type BodyRowProps = {
  rowId: string;
  row: DataItem;
  columns: Column[];
  onDeleteClicked?: (row: any) => void;
  onEditClicked?: (row: any) => void;
  onFavClicked?: (row: any) => void;
  onClick?: (row: any) => void;
  onDoubleClick?: (row: any) => void;
  rowClassName?: (row: any) => string;
  rowStyle?: (row: any) => CSSProperties;
  rowButtons?: RowButton[];
};

export const BodyRow: FC<BodyRowProps> = ({
  row, columns, onDeleteClicked, onEditClicked, onClick, onDoubleClick, rowClassName, rowStyle, onFavClicked, rowButtons, rowId
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

      if (rowButtons && colIdx == columns.length - 1) {
        actionsPopup = <>
          {rowButtons.map((b, bi) => 
            <a key={rowId + '-' + bi} href="#"
              onClick={() => b.onClick(row)}
              className={styles.row_btn}
              title={b.title}
            >{b.node}</a>
          )}
        </>
      } else if (colIdx == columns.length - 1) {
        if (onFavClicked || onEditClicked || onDeleteClicked) {
          actionsPopup = <div className={styles.actions_popup}>
            {typeof row.is_in_fav !== 'undefined' && onFavClicked && (
              <a href="#" className={classNames(styles.btn_fav, {[styles.active]: row.is_in_fav})} title={row.is_in_fav ? i18n('Удалить из избранного') : i18n('Добавить в избранное')} onClick={(e) => { e.stopPropagation(); e.preventDefault(); onFavClicked(row); return false; }} />
            )}
            {onEditClicked && (<a href="#" onClick={(e) => { e.stopPropagation(); e.preventDefault(); onEditClicked(row); }} className={styles.btn_edit} />)}
            {onDeleteClicked && (<><div className={styles.btn_sep}></div><a href="#" onClick={(e) => { e.stopPropagation(); e.preventDefault(); onDeleteClicked(row); return false; }} className={styles.btn_del} /></>)}
          </div>
        }
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
