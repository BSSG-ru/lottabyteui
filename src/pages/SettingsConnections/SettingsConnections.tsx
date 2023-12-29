/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import styles from './SettingsConnections.module.scss';
import { getTablePageSize, handleHttpError, i18n } from '../../utils';
import { Table } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { deleteSystemConnection } from '../../services/pages/systemConnections';
import { useNavigate } from "react-router-dom";

export function SettingsConnections() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data] = useState([]);
  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delConnectionData, setDelConnectionData] = useState<any>({ id: '', name: '' });

  const handleDelDlgClose = () => {
    setShowDelDlg(false);
    return false;
  };

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    setLoading(true);
    deleteSystemConnection(delConnectionData.id)
      .then(() => {
        setLoading(false);
      })
      .catch(handleHttpError);
    setDelConnectionData({ id: '', name: '' });
  };

  const columns = [
    { property: 'id', header: 'ID', isHidden: true },
    {
      property: 'name',
      header: i18n('Название'),
    },
    {
      property: 'connector_id',
      filter_property: 'connector.name',
      header: i18n('Тип подключения'),
      render: (item: any) => <span>{item.connector_name}</span>,
    },
    {
      property: 'system_id',
      filter_property: 'system.name',
      header: i18n('Система'),
      render: (item: any) => <span>{item.system_name}</span>,
    },
  ];

  return (
    <div className={styles.page}>
      {loading ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('ПОДКЛЮЧЕНИЯ')}`}</div>
          {data ? (
            <Table
              className={styles.table}
              columns={columns}
              paginate
              columnSearch
              globalSearch
              dataUrl="/v1/system_connections/search"
              initialFetchRequest={{
                sort: 'name+',
                global_query: '',
                limit: getTablePageSize(),
                offset: 0,
                filters: [],
                filters_preset: [],
                filters_for_join: [],
              }}
              showCreateBtn
              onCreateBtnClick={() => {
                navigate('/settings/connections/edit/');
              }}
              onRowClick={(row: any) => {
                navigate(`/settings/connections/edit/${encodeURIComponent(row.id)}`);
              }}
              renderActionsPopup={(row: any) => (
                <div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate('/settings/connections/edit/');
                      return false;
                    }}
                    className={styles.btn_create}
                  />
                  <a
                    href={`/settings/connections/edit/${encodeURIComponent(row.id)}`}
                    className={styles.btn_edit}
                    onClick={(e) => { e.preventDefault(); navigate(`/settings/connections/edit/${encodeURIComponent(row.id)}`); }}
                  />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDelConnectionData({ id: row.id, name: row.name });
                      setShowDelDlg(true);
                      return false;
                    }}
                    className={styles.btn_del}
                  />
                </div>
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
                {delConnectionData.name}
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
