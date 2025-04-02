/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import styles from './Drafts.module.scss';
import { getArtifactUrl, getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { renderDate, Table } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { useNavigate } from "react-router-dom";
import classNames from 'classnames';

export function Drafts() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(true);
  

  const columns = [
    { property: 'id', header: 'ID', isHidden: true },
    {
      property: 'num',
      header: i18n('Koд'),
      sortDisabled: true,
      filterDisabled: true,
      width: '70px'
    },
    {
        property: 'artifact_type_name',
        filter_property: 'at.name',
        header: i18n('Тип'),
    },
    {
      property: 'name',
      filter_property: 'tbl1.name',
      header: i18n('Название'),
    },
    { property: 'short_description', header: i18n('Описание') },
    {
      property: 'modified',
      filter_property: 'tbl1.modified',
      header: i18n('Дата обновления'),
      render: (row: any) => renderDate(row, 'modified'),
    },
    {
      property: 'workflow_state_name',
      filter_property: 'ws.name',
      header: i18n('Статус'),
      filterDisabled: true,
      sortDisabled: true,
      render: (row: any) => <div className={styles.pill}>{row.workflow_state_name ?? row.workflow_state ?? i18n('В работе')}</div>
      
    },
    {
      property: 'user_name',
      filter_property: 'ws.user_name',
      header: i18n('Ответственный'),
      filterDisabled: true,
      sortDisabled: true,
      render: (row: any) => <div className={styles.pills}>{row.user_name.split(', ').map((tag:any, i:number) => <span key={`rsp-pill-${row.id}-${i}`} className={styles.pill}>{tag}</span>)}</div>,
    }
  ];

  const [limitSteward, setLimitSteward] = useState((window as any).limitStewardSwitch ? (window as any).limitStewardSwitch.getLimitSteward() : true);

  useEffect(() => {
    window.addEventListener('limitStewardChanged', function (e) {
      setLimitSteward((e as any).limitSteward);
    })
  }, []);

  return (
    <div className={classNames(styles.page, styles.scrollable, { [styles.loaded]: loaded })}>
      {!loaded ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('Заявки')}`}</div>
          <Table
            cookieKey='drafts'
            className={styles.table}
            columns={columns}
            paginate
            columnSearch
            globalSearch
            dataUrl="/v1/artifacts/drafts"
            limitSteward={limitSteward}
            initialFetchRequest={{
              sort: 'tbl1.name+',
              global_query: state.q !== undefined ? state.q : '',
              limit: getTablePageSize(),
              offset: (state.p - 1) * getTablePageSize(),
              filters: [],
              filters_preset: [],
              filters_for_join: [],
            }}
            onRowClick={(row: any) => {
              navigate(getArtifactUrl(row.id, row.artifact_type));
            }}
            onEditClicked={(row:any) => { navigate(getArtifactUrl(row.id, row.artifact_type)); }}
            onPageChange={(page: number) => (
              setState(() => ({ p: page }))
            )}
            onQueryChange={(query: string) => (
              setState(() => ({ p: undefined, q: query }))
            )}
            allowTilesView
          />
          
        </>
      )}
    </div>
  );
}
