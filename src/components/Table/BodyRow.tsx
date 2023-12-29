/* eslint-disable react/require-default-props */
/* eslint-disable import/no-cycle */
import React, { CSSProperties, FC } from 'react';
import { Column } from './Table';
import { DataItem } from '../../types/table';
import styles from './Table.module.scss';
import { uuid } from '../../utils';

type BodyRowProps = {
  row: DataItem;
  columns: Column[];
  renderActionsPopup?: (row: any) => React.ReactNode;
  onClick?: (row: any) => void;
  onDoubleClick?: (row: any) => void;
  rowClassName?: (row: any) => string;
  rowStyle?: (row: any) => CSSProperties;
};

export const BodyRow: FC<BodyRowProps> = ({
  row, columns, renderActionsPopup, onClick, onDoubleClick, rowClassName, rowStyle,
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
    {columns.map((column) => {
      if (column.isHidden) return '';

      const { property } = column;
      let result: React.ReactNode | string | number = row[property as keyof typeof row];

      let actionsPopup: React.ReactNode | string = '';

      if (column.render) {
        result = column.render(row) as React.ReactNode;
      }

      if (!column.isActionsPopupDisabled && renderActionsPopup) {
        actionsPopup = renderActionsPopup(row) as React.ReactNode;
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
