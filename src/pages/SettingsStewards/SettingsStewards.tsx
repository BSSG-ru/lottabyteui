import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { useNavigate } from 'react-router-dom';
import styles from './SettingsSteward.module.scss';
import { getTablePageSize, handleHttpError, i18n, uuid } from '../../utils';
import { Table } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { deleteSteward } from '../../services/pages/stewards';

export const SettingsStewards = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [data] = useState([]);
  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delStewardData, setDelStewardData] = useState<any>({ id: '', name: '' });

  const handleDelDlgClose = () => {
    setShowDelDlg(false);
    return false;
  };

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    setLoading(true);
    deleteSteward(delStewardData.id)
      .then(() => {
        setLoading(false);
      })
      .catch(handleHttpError);
    setDelStewardData({ id: '', name: '' });
  };

  const columns = [
    { property: 'id', header: 'ID', isHidden: true },
    {
      property: 'name',
      header: i18n('Имя'),
    },
    {
      property: 'description',
      header: i18n('Описание'),
    },
    {
      property: 'domains',
      header: i18n('Домены'),
      sortDisabled: true,
      render: (item: any) => (
        <span className={styles.value}>
          {item.domains.map((t: any) => (
            <div key={uuid()} style={{ marginBottom: '5px' }}>{t.name}</div>
          ))}
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
          <div className={styles.title}>{`${i18n('Стюарды')}`}</div>
          {data ? (
            <Table
              className={styles.table}
              columns={columns}
              paginate
              columnSearch
              globalSearch
              dataUrl="/v1/stewards/search"
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
                navigate('/settings/stewards/edit/');
              }}
              onRowClick={(row: any) => {
                navigate(`/settings/stewards/edit/${encodeURIComponent(row.id)}`);
              }}
              renderActionsPopup={(row: any) => (
                <div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate('/settings/stewards/edit/');
                      return false;
                    }}
                    className={styles.btn_create}
                  />
                  <a
                    href={`/settings/stewards/edit/${encodeURIComponent(row.id)}`}
                    className={styles.btn_edit}
                    onClick={(e) => { e.preventDefault(); navigate(`/settings/stewards/edit/${encodeURIComponent(row.id)}`); }}
                  />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDelStewardData({ id: row.id, name: row.name });
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
                {delStewardData.name}
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
