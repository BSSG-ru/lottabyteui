/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import useUrlState from '@ahooksjs/use-url-state';
import { useNavigate } from 'react-router-dom';
import styles from './Queries.module.scss';
import { doNavigate, getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { renderDate, Table, TableDataRequest } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { deleteEntityQuery } from '../../services/pages/entityQueries';
import { DeleteObjectModal } from '../../components/DeleteObjectModal';

export function Queries() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loading, setLoading] = useState(false);
  const [data] = useState([]);

  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delQueryData, setDelQueryData] = useState<any>({ id: '', name: '' });

  const columns = [
    { property: 'id', header: 'ID', isHidden: true },
    {
      property: 'num',
      header: i18n('Koд'),
      sortDisabled: true,
      filterDisabled: true,
    },
    {
      property: 'name',
      header: i18n('Название'),
    },
    {
      property: 'system_id',
      filter_property: 'system.name',
      header: i18n('Система'),
      render: (item: any) => <span>{item.system_name}</span>,
    },
    {
      property: 'entity_id',
      filter_property: 'entity.name',
      header: i18n('Логический объект'),
      render: (item: any) => <span>{item.entity_name}</span>,
    },
    {
      property: 'modified',
      header: i18n('Дата изменения'),
      render: (row: any) => renderDate(row, 'modified'),
    },
    {
      property: 'workflow_state',
      header: i18n('Состояние'),
      render: (row: any) => row.workflow_state ?? 'В работе',
      isHiddenCallback: (fetchRequest: TableDataRequest) => !fetchRequest || fetchRequest.state !== 'DRAFT',
    },
    {
      property: 'tags',
      header: i18n('Теги'),
      filterDisabled: false,
      sortDisabled: true,
      render: (row: any) => row.tags.join(', '),
    }
  ];

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    setLoading(true);
    deleteEntityQuery(delQueryData.id)
      .then((json) => {
        updateArtifactsCount();
        setLoading(false);
        if (json.metadata && json.metadata.id) { navigate(`/queries/edit/${encodeURIComponent(json.metadata.id)}`); }
      })
      .catch(handleHttpError);
    setDelQueryData({ id: '', name: '' });
  };

  const [limitSteward, setLimitSteward] = useState((window as any).limitStewardSwitch.getLimitSteward());

  useEffect(() => {
    window.addEventListener('limitStewardChanged', (e) => {
      setLimitSteward((e as any).limitSteward);
    });
  }, []);

  return (
    <div className={styles.page}>
      {loading ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('ЗАПРОСЫ')}`}</div>
          {data ? (
            <Table
              className={styles.table}
              columns={columns}
              paginate
              columnSearch
              globalSearch
              dataUrl="/v1/queries/search"
              limitSteward={limitSteward}
              supportsWorkflow
              initialFetchRequest={{
                sort: 'name+',
                global_query: state.q !== undefined ? state.q : '',
                limit: getTablePageSize(),
                offset: (state.p - 1) * getTablePageSize(),
                filters: [],
                filters_preset: [],
                filters_for_join: [],
              }}
              showCreateBtn
              onCreateBtnClick={() => {
                navigate('/queries/edit/');
              }}
              onRowClick={(row: any) => {
                navigate(`/queries/edit/${encodeURIComponent(row.id)}`);
              }}
              renderActionsPopup={(row: any) => (
                <div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate('/queries/edit/');
                    }}
                    className={styles.btn_create}
                  />
                  <a
                    href={`/queries/edit/${encodeURIComponent(row.id)}`}
                    className={styles.btn_edit}
                    onClick={(e) => { e.preventDefault(); navigate(`/queries/edit/${encodeURIComponent(row.id)}`); }}
                  />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDelQueryData({ id: row.id, name: row.name });
                      setShowDelDlg(true);
                    }}
                    className={styles.btn_del}
                  />
                </div>
              )}
              onPageChange={(page: number) => (
                setState(() => ({ p: page }))
              )}
              onQueryChange={(query: string) => (
                setState(() => ({ p: undefined, q: query }))
              )}
            />
          ) : (
            ''
          )}

          <DeleteObjectModal show={showDelDlg} objectTitle={delQueryData.name} onClose={() => { setShowDelDlg(false); return false; }} onSubmit={delDlgSubmit} />

        </>
      )}
    </div>
  );
}
