/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import useUrlState from '@ahooksjs/use-url-state';
import { doNavigate, getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { Table } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { deleteTask } from '../../services/pages/tasks';
import styles from '../Systems/Systems.module.scss';
import { useNavigate } from "react-router-dom";

export function Tasks() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loading, setLoading] = useState(false);
  const [data] = useState([]);

  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delTaskData, setDelTaskData] = useState<any>({ id: '', name: '' });
  const renderDate = (row: any, dateField: string) => {
    if (row === undefined || row[dateField] === undefined) return '';
    return new Date(row[dateField]).toLocaleString('ru-RU');
  };
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
      property: 'system_connection_name',
      header: i18n('Подключение'),
    },
    {
      property: 'query_name',
      header: i18n('Запрос'),
    },
    {
      property: 'last_updated',
      filter_property: 'last_updated',
      header: i18n('Дата последнего выполнения'),
      render: (row: any) => renderDate(row, 'last_updated'),
    },
    {
      property: 'task_state',
      header: i18n('Статус'),
      render: (row: any) => (row.task_state ? (row.task_state.length > 1 ? row.task_state.substring(0, 1).toUpperCase() + row.task_state.substring(1).toLowerCase() : row.task_state.toUpperCase()) : ''),
    },
  ];

  const handleDelDlgClose = () => {
    setShowDelDlg(false);
    return false;
  };

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    setLoading(true);
    deleteTask(delTaskData.id)
      .then(() => {
        updateArtifactsCount();
        setLoading(false);
      })
      .catch(handleHttpError);
    setDelTaskData({ id: '', name: '' });
  };

  const [limitSteward, setLimitSteward] = useState((window as any).limitStewardSwitch.getLimitSteward());

  useEffect(() => {
    window.addEventListener('limitStewardChanged', function (e) {
      setLimitSteward((e as any).limitSteward);
    })
  }, []);

  return (
    <div className={styles.page}>
      {loading ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('ЗАДАЧИ')}`}</div>
          {data !== undefined ? (
            <Table
              className={styles.table}
              columns={columns}
              paginate
              columnSearch
              globalSearch
              dataUrl="/v1/tasks/search"
              limitSteward={limitSteward}
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
                navigate("/tasks/edit/");
              }}
              onRowClick={(row: any) => {
                navigate(`/tasks/edit/${encodeURIComponent(row.id)}`);
              }}
              renderActionsPopup={(row: any) => (
                // eslint-disable-next-line jsx-a11y/anchor-has-content
                <div>
                  <a
                    aria-label="a"
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate('/tasks/edit/');
                    }}
                    className={styles.btn_create}
                  />
                  <a
                    aria-label="a"
                    href={`/tasks/edit/${encodeURIComponent(row.id)}`}
                    className={styles.btn_edit}
                    onClick={(e) => { e.preventDefault(); navigate(`/tasks/edit/${encodeURIComponent(row.id)}`); }}
                  />
                  <a
                    aria-label="a"
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDelTaskData({ id: row.id, name: row.name });
                      setShowDelDlg(true);
                      e.preventDefault();
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
                {delTaskData.name}
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
