/* eslint-disable react/button-has-type */
/* eslint-disable import/no-cycle */
/* eslint-disable react/require-default-props */
import React, { CSSProperties, FC, useEffect, useState } from 'react';
import classNames from 'classnames';
import { count } from 'console';
import styles from './Table.module.scss';
import {
  i18n, uuid, handleHttpResponse, handleHttpError, setTablePageSize,
} from '../../utils';
import { Button } from '../Button';
import { Input } from '../Input';
import { HeaderCell } from './HeaderCell';
import { BodyRow } from './BodyRow';
import { ReactComponent as Filters } from '../../assets/icons/filters.svg';
import { Pagination } from '../Pagination';
import { fetchWithRefresh } from '../../services/auth';
import {
  optionsGet, optionsPost, URL, usermgmtURL,
} from '../../services/requst_templates';
import { TableFilters } from '../../types/redux/states';
import Cookies from 'js-cookie';

type TableFilterRequest = {
  column: string;
  operator: string;
  value: string;
};

type TableFilterJoinRequest = {
  table: string;
  column: string;
  operator: string;
  value: string;
  on_column: string;
  equal_column: string;
};

export type TableDataRequest = {
  sort?: string;
  global_query?: string;
  limit?: number;
  offset?: number;
  filters?: TableFilterRequest[];
  filters_preset?: TableFilterRequest[];
  filters_for_join?: TableFilterJoinRequest[];
  limit_steward?: boolean;
  state?: string;
};

type TableButton = {
  text: string;
  onClick: () => void;
};

type TableProps = {
  className?: string;
  columns: Column[];
  paginate?: boolean;
  globalSearch?: boolean;
  columnSearch?: boolean;
  isGet?: boolean;
  dataUrl: string;
  initialFetchRequest?: TableDataRequest;
  initialData?: any[];
  showCreateBtn?: boolean;
  onRowClick?: (row: any) => void;
  onRowDoubleClick?: (row: any) => void;
  onCreateBtnClick?: () => void;
  renderActionsPopup?: (row: any) => React.ReactNode;
  onPageChange?: (page: number) => void;
  onQueryChange?: (query: string) => void;
  limitSteward?: boolean;
  supportsWorkflow?: boolean;
  fullWidthLayout?: boolean;
  subtitle?: string;
  processRows?: (rows: any[]) => Promise<any[]>;
  tableButtons?: TableButton[];
  rowClassName?: (row: any) => string;
  rowStyle?: (row: any) => CSSProperties;
  cookieKey?: string;
};

export type Column = {
  property: string;
  filter_property?: string;
  header: string;
  search?: boolean;
  sortDisabled?: boolean;
  isGet?: boolean;
  filterDisabled?: boolean;
  isHidden?: boolean;
  isHiddenCallback?: (fetchRequest: TableDataRequest) => boolean;
  render?: (item: any) => React.ReactNode;
  isActionsPopupDisabled?: boolean;
};

export const renderDate = (row: any, dateField: string) => {
  if (!row[dateField]) return '';
  return new Date(row[dateField]).toLocaleDateString('ru-RU');
};

export const Table: FC<TableProps> = ({
  className = '',
  columns,
  paginate = false,
  globalSearch = false,
  columnSearch = false,
  dataUrl,
  isGet = false,
  initialFetchRequest,
  showCreateBtn = false,
  onCreateBtnClick = () => { },
  renderActionsPopup,
  onRowClick,
  onRowDoubleClick,
  onPageChange = () => { },
  onQueryChange = () => { },
  limitSteward,
  supportsWorkflow,
  initialData,
  fullWidthLayout,
  subtitle,
  processRows,
  tableButtons,
  rowClassName,
  rowStyle,
  cookieKey
}) => {
  const [searchMode, setSearchMode] = useState(false);

  const ck = Cookies.get('table-state-' + cookieKey);
  const [tableState, setTableState] = useState<any>(ck ? JSON.parse(ck) : {});

  const [columnsList, setColumnsList] = useState<Column[]>(columns);
  const [total, setTotal] = useState<number>(0);
  const [rows, setRows] = useState<any[]>([]);
  const [fetchRequest, setFetchRequest] = useState<TableDataRequest>(initialFetchRequest ? { ...initialFetchRequest, limit_steward: limitSteward, state: supportsWorkflow ? 'PUBLISHED' : undefined, global_query: tableState.global_query ? tableState.global_query.toLowerCase().trim() : initialFetchRequest.global_query, sort: tableState.sort ? tableState.sort : initialFetchRequest.sort, filters: tableState.filters ? tableState.filters : initialFetchRequest.filters } : {});
  const [wfStatus, setWfStatus] = useState('PUBLISHED');

  const getData = async (request: any | null = null) => {
    if (dataUrl.length === 0) {
      return [];
    }
    if (request.filters_preset) request.filters = [...request.filters, ...request.filters_preset];

    if (isGet) {
      return fetchWithRefresh(
        `${dataUrl.indexOf('v1/usermgmt/') === -1 ? URL : usermgmtURL}${dataUrl}`,
        optionsGet(),
      ).then(handleHttpResponse);
    }

    return fetchWithRefresh(
      `${dataUrl.indexOf('v1/usermgmt/') === -1 ? URL : usermgmtURL}${dataUrl}`,
      optionsPost(request),
    ).then(handleHttpResponse);
  };

  useEffect(() => {
    setFetchRequest((prev) => ({ ...fetchRequest, limit_steward: limitSteward, state: wfStatus }));
  }, [limitSteward, wfStatus]);

  useEffect(() => {
    if (!initialData) {
      setColumnsList((prev) => prev.map((col) => ({
        ...col,
        isHidden: (col.isHiddenCallback ? col.isHiddenCallback(fetchRequest) : (typeof col.isHidden === 'undefined' ? false : col.isHidden)),
      })));

      getData(fetchRequest)
        .then((resp) => {
          if (processRows) { processRows(isGet ? resp : resp.items).then((rows) => setRows(rows)); } else { setRows(isGet ? resp : resp.items); }
          setTotal(resp.count);

          if (fetchRequest.offset && resp.count <= fetchRequest.offset) { setFetchRequest((prev) => ({ ...prev, offset: (Math.floor((resp.count - 1) / (fetchRequest.limit ?? 10))) * (fetchRequest.limit ?? 10) })); }
        })
        .catch(handleHttpError);
    }
  }, [fetchRequest, dataUrl]);

  useEffect(() => {
    if (initialData) {
      const fData = initialData.filter((row) => {
        let add = true;
        fetchRequest.filters?.forEach((f) => {
          switch (f.operator) {
            case 'LIKE':
              if (row[f.column].toLowerCase().indexOf(f.value.toLowerCase()) == -1) add = false;
              break;
          }
        });
        return add;
      });

      if (paginate) {
        const cpy = [...fData];
        setRows(cpy.splice(fetchRequest.offset ?? 0, fetchRequest.limit ?? 10));
      } else { setRows(fData); }
      setTotal(fData.length);
    }
  }, [initialData, initialData?.length, fetchRequest.filters]);

  useEffect(() => {
    Cookies.set('table-state-' + cookieKey, JSON.stringify(tableState), { expires: 500 });
  }, [ tableState ]);

  return (
    <div key={uuid()} className={classNames(styles.table_wrapper, { [className]: className })}>
      {supportsWorkflow && (
        <div className={styles.wf_bnts}>
          <Button className={classNames(styles.btn_published, { [styles.active]: (wfStatus == 'PUBLISHED') })} onClick={() => setWfStatus('PUBLISHED')}>{i18n('Опубликованные')}</Button>
          <Button className={classNames(styles.btn_published, { [styles.active]: (wfStatus == 'DRAFT') })} onClick={() => setWfStatus('DRAFT')}>{i18n('Черновики')}</Button>
        </div>
      )}
      {globalSearch ? (
        <Input
          key={uuid()}
          placeholder={i18n('Search')}
          findBtn
          className={styles.input_global}
          defaultValue={tableState.global_query ? tableState.global_query : fetchRequest.global_query}
          onBlur={(e) => {
            setTableState((prev:any) => ({...prev, global_query: e.target.value}));
            setFetchRequest((prev) => ({
              sort: prev.sort,
              global_query: e.target.value.toLowerCase().trim(),
              limit: prev.limit,
              offset: 0,
              filters: prev.filters,
              filters_for_join: prev.filters_for_join,
              filters_preset: prev.filters_preset,
              state: prev.state,
            }));
            onQueryChange(e.target.value);
          }}
        />
      ) : (
        ''
      )}

      {columnSearch ? (
        <Button
          key={uuid()}
          background="outlined-blue"
          className={styles.button}
          onClick={() => {
            setSearchMode((prev) => {
              const nextState = !prev;
              if (!nextState) {
                setFetchRequest((prevouse) => ({
                  sort: prevouse.sort,
                  global_query: prevouse.global_query,
                  limit: prevouse.limit,
                  offset: prevouse.offset,
                  filters: [],
                  filters_for_join: prevouse.filters_for_join,
                  filters_preset: prevouse.filters_preset,
                  limit_steward: prevouse.limit_steward,
                  state: prevouse.state,
                }));
              }
              return nextState;
            });
          }}
        >
          <Filters key={uuid()} />
          {i18n(searchMode ? i18n('Сбросить фильтры') : i18n('Фильтры'))}
        </Button>
      ) : (
        ''
      )}
      {tableButtons ? (tableButtons.map((tb) => <Button key={uuid()} background="outlined-blue" className={styles.table_button} onClick={tb.onClick}>{tb.text}</Button>)) : ('')}

      <div key={uuid()} className={styles.clear} />
      <div key={uuid()} className={classNames(styles.table_wrap, { [styles.full_width]: fullWidthLayout })}>
        <div key={uuid()} className={styles.flex}>
          <table
            key={uuid()}
            className={classNames(styles.table, { [styles.table_search]: searchMode })}
          >
            <thead key={uuid()}>

              <tr key={uuid()}>
                {columnsList.map((column) => (
                  <HeaderCell
                    key={column.header}
                    column={column}
                    sort={fetchRequest.sort ?? ''}
                    searchMode={searchMode}
                    filters={fetchRequest.filters ?? []}
                    sortChanged={(sort: string) => {
                      if (initialData) {
                        const prop = sort.replaceAll(/[\+\-]/ig, '');
                        const desc = sort.indexOf('-') != -1;
                        setFetchRequest((prev) => ({ ...prev, sort }));
                        const d = initialData.sort((a, b) => {
                          if (a[prop] < b[prop]) return desc ? 1 : -1;
                          if (a[prop] > b[prop]) return desc ? -1 : 1;
                          return 0;
                        });
                        setRows(d);
                      } else {
                        setTableState((prev:any) => ({...prev, sort: sort}));
                        setFetchRequest((prev) => ({
                          sort,
                          global_query: prev.global_query,
                          limit: prev.limit,
                          offset: prev.offset,
                          filters: prev.filters,
                          filters_for_join: prev.filters_for_join,
                          filters_preset: prev.filters_preset,
                          limit_steward: prev.limit_steward,
                          state: prev.state,
                        }));
                      }
                    }}
                    filtersChanged={(filters: TableFilters) => {
                      if (initialData) {
                        setRows(initialData.filter((row) => {
                          let add = true;
                          filters.forEach((f) => {
                            switch (f.operator) {
                              case 'LIKE':
                                if (row[f.column].toLowerCase().indexOf(f.value.toLowerCase()) == -1) { add = false; }
                                break;
                            }
                          });
                          return add;
                        }));
                        setFetchRequest((prev) => ({ ...prev, filters }));
                      } else {
                        setTableState((prev:any) => ({...prev, filters: filters}));
                        setFetchRequest((prev) => ({
                          sort: prev.sort,
                          global_query: prev.global_query,
                          limit: prev.limit,
                          offset: 0,
                          filters,
                          filters_for_join: prev.filters_for_join,
                          filters_preset: prev.filters_preset,
                          limit_steward: prev.limit_steward,
                          state: prev.state,
                        }));
                      }
                    }}
                  />
                ))}
              </tr>
              {subtitle && (
                <tr className={styles.tr_subtitle}>
                  <td colSpan={columns.length}>{subtitle}</td>
                </tr>
              )}
            </thead>
            <tbody key={uuid()}>
              {rows
                && rows.map((item) => (
                  <BodyRow
                    key={uuid()}
                    row={item}
                    columns={columnsList}
                    renderActionsPopup={renderActionsPopup}
                    onClick={onRowClick}
                    onDoubleClick={onRowDoubleClick}
                    rowClassName={rowClassName}
                    rowStyle={rowStyle}
                  />
                ))}
            </tbody>
          </table>
          {showCreateBtn && (
            <button
              className={styles.btn_create}
              onClick={onCreateBtnClick}
            />
          )}
        </div>
        {paginate && rows && rows.length > 0 ? (
          <Pagination
            key={uuid()}
            label={`${i18n('Показано с')} ${(fetchRequest.offset ?? 0) + 1} ${i18n('по')} ${(fetchRequest.offset ?? 0) + (fetchRequest.limit ?? 10) > total
              ? total
              : (fetchRequest.offset ?? 0) + (fetchRequest.limit ?? 10)
              } ${i18n('категории из')} ${total}`}
            page={(fetchRequest.offset ?? 0) / (fetchRequest.limit ?? 10) + 1}
            pageSize={fetchRequest.limit ?? 5}
            inTotal={Math.ceil(total / (fetchRequest.limit ?? 10))}
            setPage={(payload: number) => {
              setFetchRequest((prev) => ({
                ...prev,
                offset: (prev.limit ?? 10) * (payload - 1),
              }));

              if (initialData) {
                const cpy = [...initialData];
                setRows(cpy.splice((fetchRequest.limit ?? 10) * (payload - 1), fetchRequest.limit ?? 10));
              }

              onPageChange(payload);
            }}
            setPageSize={(size: number) => {
              setTablePageSize(size);

              setFetchRequest((prev) => ({ ...prev, limit: size }));

              if (initialData) {
                const cpy = [...initialData];
                setRows(cpy.splice(size * (fetchRequest.offset ?? 0), size));
              }
            }}
            className={styles.pagination_wrapper}
          />
        ) : (
          ''
        )}
      </div>
      <div className={styles.clear} />
    </div>
  );
};
