/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import useUrlState from '@ahooksjs/use-url-state';
import styles from './Samples.module.scss';
import { doNavigate, getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { Table } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import { createSample, deleteSample } from '../../services/pages/samples';
import { useNavigate } from "react-router-dom";

export function Samples() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loading, setLoading] = useState(false);
  const [data] = useState([]);
  const [showAddDlg, setShowAddDlg] = useState(false);
  const [newSampleData, setNewSampleData] = useState<any>({});

  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delSampleData, setDelSampleData] = useState<any>({ id: '', name: '' });

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
      property: 'entity_query_id',
      filter_property: 'entity_query.name',
      header: i18n('Запрос'),
      render: (item: any) => <span>{item.entity_query_name}</span>,
    },
    {
      property: 'tags',
      header: i18n('Теги'),
      filterDisabled: false,
      sortDisabled: true,
      render: (row: any) => row.tags.join(', '),
    }
  ];

  const handleAddDlgClose = () => {
    setShowAddDlg(false);
    return false;
  };
  const handleDelDlgClose = () => {
    setShowDelDlg(false);
    return false;
  };

  const addDlgSubmit = () => {
    setShowAddDlg(false);
    setLoading(true);
    createSample(newSampleData)
      .then(() => {
        setLoading(false);
      })
      .catch(handleHttpError);
    setNewSampleData({});
  };

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    setLoading(true);
    deleteSample(delSampleData.id)
      .then(() => {
        updateArtifactsCount();
        setLoading(false);
      })
      .catch(handleHttpError);
    setDelSampleData({ id: '', name: '' });
  };

  const [limitSteward, setLimitSteward] = useState((window as any).limitStewardSwitch ? (window as any).limitStewardSwitch.getLimitSteward() : true);

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
          <div className={styles.title}>{`${i18n('СЭМПЛЫ')}`}</div>
          {data ? (
            <Table
              cookieKey='samples'
              className={styles.table}
              columns={columns}
              paginate
              columnSearch
              globalSearch
              dataUrl="/v1/samples/search"
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
                navigate("/samples/edit/");
              }}
              onRowClick={(row: any) => {
                navigate(`/samples/edit/${encodeURIComponent(row.id)}`);
              }}
              renderActionsPopup={(row: any) => (
                <div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate('/samples/edit/');
                    }}
                    className={styles.btn_create}
                  />
                  <a
                    href={`/samples/edit/${encodeURIComponent(row.id)}`}
                    className={styles.btn_edit}
                    onClick={(e) => { e.preventDefault(); navigate(`/samples/edit/${encodeURIComponent(row.id)}`); }}
                  />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDelSampleData({ id: row.id, name: row.name });
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
            show={showAddDlg}
            backdrop={false}
            onHide={handleAddDlgClose}
          >
            <Modal.Header closeButton>
              <Modal.Title>Создание нового сэмпла</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Input
                label={i18n('Название')}
                value={newSampleData.name}
                onChange={(e) => {
                  setNewSampleData((prev: any) => ({ ...prev, name: e.target.value }));
                }}
              />
              <Textarea
                label={i18n('Описание')}
                value={newSampleData.description}
                onChange={(e) => {
                  setNewSampleData((prev: any) => ({ ...prev, description: e.target.value }));
                }}
              />
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="primary"
                onClick={addDlgSubmit}
              >
                Создать
              </Button>
              <Button
                variant="secondary"
                onClick={handleAddDlgClose}
              >
                Отмена
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={showDelDlg}
            backdrop={false}
            onHide={handleDelDlgClose}
          >
            <Modal.Header closeButton>
              <Modal.Title>
                Вы действительно хотите удалить
                {delSampleData.name}
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
