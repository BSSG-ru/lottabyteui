/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import styles from './SettingsGroups.module.scss';
import { getTablePageSize, handleHttpError, i18n, uuid } from '../../utils';
import { Table } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { deleteGroup } from '../../services/pages/groups';
import { getPermissions, getRoles } from '../../services/pages/users';

export function SettingsGroups() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data] = useState([]);
  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delGroupData, setDelGroupData] = useState<any>({ id: '', name: '' });
  const [allRoles, setAllRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);

  const handleDelDlgClose = () => {
    setShowDelDlg(false);
    return false;
  };

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    setLoading(true);
    deleteGroup(delGroupData.id)
      .then(() => {
        setLoading(false);
      })
      .catch(handleHttpError);
    setDelGroupData({ id: '', name: '' });
  };

  const columns = [
    { property: 'id', header: 'ID', isHidden: true },
    {
      property: 'name',
      header: i18n('Название группы'),
    },
    {
      property: 'user_roles',
      filter_property: 'user_roles.name',
      header: i18n('Роли'),
      render: (item: any) => (
        <span className={styles.value}>
          { item.user_roles.join(', ') }
        </span>
      ),
    },
    {
      property: 'permissions',
      filter_property: 'permissions.name',
      header: i18n('Разрешения'),
      render: (item: any) => (
        <span className={styles.value}>
          {item.permissions.join(', ')}
        </span>
      ),
    }
  ];

  return (
    <div className={styles.page}>
      {loading ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('ГРУППЫ')}`}</div>
          {data ? (
            <Table
              className={styles.table}
              columns={columns}
              paginate
              columnSearch
              globalSearch
              dataUrl="/v1/usermgmt/external_group/search"
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
                navigate('/settings/groups/edit/');
              }}
              onRowClick={(row: any) => {
                navigate(`/settings/groups/edit/${encodeURIComponent(row.id)}`);
              }}
              processRows={async (rows:any[]) => {
                return getRoles().then(roles => {

                  return getPermissions().then(perms => {
                    return rows.map((r:any) => ({...r, user_roles: r.user_roles.map((rid:string) => { let d = roles.find((rf:any) => rf.id == rid); return d ? d.name : '-'; })
                    , permissions: r.permissions.map((rid:string) => { let d = perms.find((rf:any) => rf.id == rid); return d ? d.name : '-'; })}));
                  });
                });
              }}
              renderActionsPopup={(row: any) => (
                <div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate('/settings/groups/edit/');
                      return false;
                    }}
                    className={styles.btn_create}
                  />
                  <a
                    href={`/settings/groups/edit/${encodeURIComponent(row.id)}`}
                    className={styles.btn_edit}
                    onClick={(e) => { e.preventDefault(); navigate(`/settings/groups/edit/${encodeURIComponent(row.id)}`); }}
                  />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDelGroupData({ id: row.id, name: row.name });
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
                {delGroupData.name}
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
