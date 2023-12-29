/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import styles from './SettingsUsers.module.scss';
import { getTablePageSize, handleHttpError, i18n, uuid } from '../../utils';
import { Table } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { deleteUser } from '../../services/pages/users';

export function SettingsUsers() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data] = useState([]);
  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delUserData, setDelUserData] = useState<any>({ id: '', username: '' });

  const handleDelDlgClose = () => {
    setShowDelDlg(false);
    return false;
  };

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    setLoading(true);
    deleteUser(delUserData.id)
      .then(() => {
        setLoading(false);
      })
      .catch(handleHttpError);
    setDelUserData({ id: '', username: '' });
  };

  const columns = [
    { property: 'id', header: 'ID', isHidden: true },
    {
      property: 'username',
      header: i18n('Логин'),
    },
    {
      property: 'display_name',
      header: i18n('Имя'),
    },
    {
      property: 'user_roles',
      filter_property: 'user_roles.name',
      header: i18n('Роли'),
      render: (item: any) => (
        <span className={styles.value}>
          {item.user_roles.join(', ')}
        </span>
      ),
    },
  ];

  return (
    <div className={styles.page}>
      {loading ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('ПОЛЬЗОВАТЕЛИ КОМПАНИИ')}`}</div>
          {data ? (
            <Table
              className={styles.table}
              columns={columns}
              paginate
              columnSearch
              globalSearch
              dataUrl="/v1/usermgmt/user/search"
              initialFetchRequest={{
                sort: 'username+',
                global_query: '',
                limit: getTablePageSize(),
                offset: 0,
                filters: [],
                filters_preset: [],
                filters_for_join: [],
              }}
              showCreateBtn
              onCreateBtnClick={() => {
                navigate('/settings/users/edit/');
              }}
              onRowClick={(row: any) => {
                navigate(`/settings/users/edit/${encodeURIComponent(row.id)}`);
              }}
              renderActionsPopup={(row: any) => (
                <div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate('/settings/users/edit/');
                      return false;
                    }}
                    className={styles.btn_create}
                  />
                  <a
                    href={`/settings/users/edit/${encodeURIComponent(row.id)}`}
                    className={styles.btn_edit}
                    onClick={(e) => { e.preventDefault(); navigate(`/settings/users/edit/${encodeURIComponent(row.id)}`); }}
                  />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDelUserData({ id: row.id, username: row.username });
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
                {delUserData.username}
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
