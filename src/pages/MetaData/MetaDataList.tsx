import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTablePageSize, handleHttpError, i18n, uuid } from '../../utils';
import styles from './MetaData.module.scss';
import { Loader } from '../../components/Loader';
import useUrlState from '@ahooksjs/use-url-state';
import { renderDate, Table } from '../../components/Table';
import classNames from 'classnames';

export function MetaDataList() {
    const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
    const [loaded, setLoaded] = useState(true);

    const navigate = useNavigate();

    const columns = [
      { property: 'id', header: 'ID', isHidden: true },
      {
        property: 'num',
        header: i18n('Koд'),
        sortDisabled: true,
        filterDisabled: true,
        width: '55px'
      },
      {
        property: 'name',
        header: i18n('Название'),
      },
      {
        property: 'driver_class_name',
        sortDisabled: true,
        header: i18n('Тип'),
      },
      {
        property: 'jdbc_url',
        sortDisabled: true,
        header: i18n('Сервер'),
      },
      {
        property: 'modified',
        header: i18n('Дата изменения'),
        render: (row: any) => renderDate(row, 'modified'),
      },
      
    ];

    return (
      <div className={classNames(styles.page, styles.scrollable, { [styles.loaded]: loaded })}>
      {!loaded ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('Метаданные')}`}</div>
          
            <Table
              artifactType='meta_database'
              cookieKey='meta_dbs'
              className={styles.table}
              columns={columns}
              paginate
              columnSearch
              globalSearch
              dataUrl="/v1/metadata/db/search"
              limitSteward={false}
              initialFetchRequest={{
                sort: 'name+',
                global_query: state.q !== undefined ? state.q : '',
                limit: getTablePageSize(),
                offset: (state.p - 1) * getTablePageSize(),
                filters: [],
                filters_preset: [],
                filters_for_join: [],
                state: 'PUBLISHED'
              }}
              onRowClick={(row: any) => {
                navigate(`/metadata/${encodeURIComponent(row.id)}`);
              }}
              onPageChange={(page: number) => (
                setState(() => ({ p: page }))
              )}
              onQueryChange={(query: string) => (
                setState(() => ({ p: undefined, q: query }))
              )}
            />
        </>
      )}
    </div>
    );
}
