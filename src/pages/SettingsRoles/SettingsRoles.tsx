import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import styles from './SettingsRoles.module.scss';
import { getTablePageSize, handleHttpError, i18n } from '../../utils';
import { Table } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { deleteRole } from '../../services/pages/roles';
import { useNavigate } from "react-router-dom";

export const SettingsRoles = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data] = useState([]);
  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delRoleData, setDelRoleData] = useState<any>({ id: '', name: '' });

  const handleDelDlgClose = () => {
    setShowDelDlg(false);
    return false;
  };

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    setLoading(true);
    deleteRole(delRoleData.id)
      .then(() => {
        setLoading(false);
      })
      .catch(handleHttpError);
    setDelRoleData({ id: '', name: '' });
  };

  const columns = [
    { property: 'id', header: 'ID', isHidden: true },
    {
      property: 'name',
      header: i18n('Название'),
    },
    {
      property: 'description', header: i18n('Описание'),
    },
  ];

  return (
    <div className={styles.page}>
      {loading ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('Роли')}`}</div>
          {data ? (
            <Table
              className={styles.table}
              columns={columns}
              paginate
              columnSearch
              globalSearch
              dataUrl="/v1/usermgmt/roles/search"
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
                navigate('/settings/roles/edit/');
              }}
              onRowClick={(row: any) => {
                navigate(`/settings/roles/edit/${encodeURIComponent(row.id)}`);
              }}
              renderActionsPopup={(row: any) => (
                <div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate('/settings/roles/edit/');
                      return false;
                    }}
                    className={styles.btn_create}
                  />
                  <a
                    href={`/settings/roles/edit/${encodeURIComponent(row.id)}`}
                    className={styles.btn_edit}
                    onClick={(e) => { e.preventDefault(); navigate(`/settings/roles/edit/${encodeURIComponent(row.id)}`); }}
                  />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDelRoleData({ id: row.id, name: row.name });
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
                {' '}
                {delRoleData.name}
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
};
