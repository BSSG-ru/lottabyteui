/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './DQRules.module.scss';
import { doNavigate, getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { renderDate, Table, TableDataRequest } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { deleteDQRule } from '../../services/pages/dqRules';
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import { Button } from '../../components/Button';

export function DQRules() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loading, setLoading] = useState(false);
  const [data] = useState([]);

  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delDQRuleData, setDelDQRuleData] = useState<any>({ id: '', name: '' });

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
      property: 'rule_ref',
      header: i18n('Функция качества'),
      render: (item: any) => <span>{item.rule_ref}</span>,
    },
    {
      property: 'modified',
      header: i18n('Дата изменения'),
      render: (row: any) => renderDate(row, 'modified'),
    },
    {
      property: 'settings',
      header: i18n('Пример настройки'),
      render: (item: any) => <span>{item.settings}</span>,
    },
    {
      property: 'tags',
      header: i18n('Теги'),
      filterDisabled: false,
      sortDisabled: true,
      render: (row: any) => row.tags.join(', '),
    },
  ];

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    setLoading(true);
    deleteDQRule(delDQRuleData.id)
      .then((json) => {
        updateArtifactsCount();
        setLoading(false);
        if (json.metadata && json.metadata.id) { navigate(`/dq_rule/edit/${encodeURIComponent(json.metadata.id)}`); }
      })
      .catch(handleHttpError);
    setDelDQRuleData({ id: '', name: '' });
  };
  const openInNewTab = (url: string) => {
    window.open(url, '_blank', 'noreferrer');
  };
  return (
    <div className={styles.page}>
      {loading ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('ПРАВИЛА КАЧЕСТВА')}`}</div>
          <Button
            background="outlined-blue"
            className={styles.button}
            onClick={() => doNavigate('/quality-tasks', navigate)}
          >
            {i18n('Мониторинг DQ')}

          </Button>

          <Button
            background="outlined-blue"
            className={styles.button}
            onClick={() => doNavigate('/quality-schedule-tasks', navigate)}
          >
            {i18n('Задачи DQ')}

          </Button>
          {data ? (
            <Table
              className={styles.table}
              columns={columns}
              paginate
              columnSearch
              globalSearch
              dataUrl="/v1/dq_rule/search"
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
                navigate('/dq_rule/edit/');
              }}
              onRowClick={(row: any) => {
                navigate(`/dq_rule/edit/${encodeURIComponent(row.id)}`);
              }}
              renderActionsPopup={(row: any) => (
                <div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate('/dq_rule/edit/');
                      return false;
                    }}
                    className={styles.btn_create}
                  />
                  <a
                    href={`/dq_rule/edit/${encodeURIComponent(row.id)}`}
                    className={styles.btn_edit}
                    onClick={(e) => { e.preventDefault(); navigate(`/dq_rule/edit/${encodeURIComponent(row.id)}`); }}
                  />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDelDQRuleData({ id: row.id, name: row.name });
                      setShowDelDlg(true);
                      return false;
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

          <DeleteObjectModal show={showDelDlg} objectTitle={delDQRuleData.name} onClose={() => { setShowDelDlg(false); return false; }} onSubmit={delDlgSubmit} />

        </>
      )}
    </div>
  );
}
