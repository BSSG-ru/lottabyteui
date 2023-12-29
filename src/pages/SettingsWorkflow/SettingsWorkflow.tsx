/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import useUrlState from '@ahooksjs/use-url-state';
import styles from './SettingsWorkflow.module.scss';
import { doNavigate, getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { renderDate, Table, TableDataRequest } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { useNavigate } from "react-router-dom";
import { deleteWorkflowSettings } from '../../services/pages/workflow';

export function SettingsWorkflow() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loading, setLoading] = useState(false);
  const [data] = useState([]);

  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delData, setDelData] = useState<any>({ id: '' });

  const columns = [
    { property: 'id', header: 'ID', isHidden: true },
    {
      property: 'num',
      header: i18n('Koд'),
      sortDisabled: true,
      filterDisabled: true,
    },
    {
      property: 'artifact_type_name',
      filter_property: 'at.name',
      sort_property: 'at.name',
      header: i18n('Тип объекта'),
    },
    {
        property: 'artifact_action',
        header: i18n('Событие'),
    },
    { property: 'description', header: i18n('Описание события') },
    {
      property: 'modified',
      header: i18n('Дата создания'),
      render: (row: any) => renderDate(row, 'modified'),
    }
  ];

  const handleDelDlgClose = () => {
    setShowDelDlg(false);
    return false;
  };

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    setLoading(true);
    deleteWorkflowSettings(delData.id)
      .then(json => {
        setLoading(false);

        if (json.metadata && json.metadata.id)
          navigate('/settings/workflows/edit/' + encodeURIComponent(json.metadata.id));
      })
      .catch(handleHttpError);
    setDelData({ id: '' });
  };

  return (
    <div className={styles.page}>
      {loading ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('Workflows')}`}</div>
          {data ? (
            <Table
              className={styles.table}
              columns={columns}
              paginate
              columnSearch
              globalSearch
              dataUrl="/v1/workflows/searchSettings"
              initialFetchRequest={{
                sort: 'at.name+',
                global_query: state.q !== undefined ? state.q : '',
                limit: getTablePageSize(),
                offset: (state.p - 1) * getTablePageSize(),
                filters: [],
                filters_preset: [],
                filters_for_join: [],
              }}
              showCreateBtn
              onCreateBtnClick={() => {
                navigate("/settings/workflows/edit/");
              }}
              onRowClick={(row: any) => {
                navigate(`/settings/workflows/edit/${encodeURIComponent(row.id)}`);
              }}
              renderActionsPopup={(row: any) => (
                <div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate('/settings/workflows/edit/');
                      return false;
                    }}
                    className={styles.btn_create}
                  />
                  <a
                    href={`/settings/workflows/edit/${encodeURIComponent(row.id)}`}
                    className={styles.btn_edit}
                    onClick={(e) => { e.preventDefault(); navigate(`/settings/workflows/edit/${encodeURIComponent(row.id)}`); }}
                  />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDelData({ id: row.id });
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

          <Modal
            show={showDelDlg}
            backdrop={false}
            onHide={handleDelDlgClose}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                Вы действительно хотите удалить
                {` ${delData.id}`}
                ?
              </Modal.Title>
            </Modal.Header>
            <Modal.Body />
            <Modal.Footer>
              <Button
                variant="primary"
                onClick={() => delDlgSubmit()}
              >
                Удалить
              </Button>
              <Button
                variant="secondary"
                onClick={handleDelDlgClose}
              >
                Отмена
              </Button>
            </Modal.Footer>
          </Modal>
        </>
      )}
    </div>
  );
}
