/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import useUrlState from '@ahooksjs/use-url-state';
import { useNavigate } from 'react-router-dom';

import { doNavigate, getTablePageSize, handleHttpError, i18n, updateArtifactsCount, uuid } from '../../utils';
import { runTask, getQualityRuleRuns } from '../../services/pages/qualityTasks';
import { Table } from '../../components/Table';
import { Loader } from '../../components/Loader';
import styles from './QualityTaskSchedule.module.scss';

type DateiledElementType = {
  entity: {
    name: string, time: string, rule_id: string, state: string,
  }
};

export function QualityTaskSchedule() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loading, setLoading] = useState(false);
  const [data] = useState([]);
  const [currentRow, setCurrentRow] = useState<any>(null);
  const [detailData, setDetailData] = useState([]);
  const [showRunDetail, setShowRunDetail] = useState(false);
  const [showConfirmDetail, setShowConfirmDetail] = useState(false);

  const renderLink = (row: any, dateFieldName: string, dateFieldId: string, prefix: string) => {
    if (row === undefined || row[dateFieldName] === undefined) return '';
    return (
      <a href={`${prefix}/${row[dateFieldId]}`}>
        {' '}
        <span className={styles.link}>
          {row[dateFieldName]}
        </span>
      </a>
    );
  };
  const renderDate = (row: any, dateField: string) => {
    if (row === undefined || row[dateField] === undefined) return '';
    return new Date(row[dateField]).toLocaleString('ru-RU');
  };
  const renderState = (row: any, dateField: string) => {
    if (!row[dateField]) return '';
    if (row[dateField] === '0') return i18n('Новая задача');
    if (row[dateField] === '1') return i18n('Задача запущена');
    if (row[dateField] === '2') return i18n('Задача выполнена');
    return i18n('Ошибка');
  };
  const columns = [

    {
      property: 'is_crontab',
      filter_property: 'is_crontab',
      header: i18n('Запланировано'),
      render: (row: any) => <span>{row.is_crontab === '1' ? i18n('Да') : ''}</span>,
    },
    {
      property: 'rule_name',
      filter_property: 'rule_name',
      header: i18n('Название правила'),
      render: (row: any) => renderLink(row, 'rule_name', 'rule_id', '/dq_rule/edit'),
    },
    {
      property: 'rule_ref',
      filter_property: 'rule_ref',
      header: i18n('Реализация правила'),
      with: '30px',

    },
    {
      property: 'rule_settings',
      filter_property: 'rule_settings',
      header: i18n('Настройки'),
    },
    {
      property: 'data_asset_name',
      filter_property: 'data_asset_name',
      header: i18n('Актив'),
      render: (row: any) => renderLink(row, 'data_asset_name', 'data_asset_id', '/data_assets/edit'),
    },
    {
      property: 'indicator_name',
      filter_property: 'indicator_name',
      header: i18n('Показатель'),
      render: (row: any) => renderLink(row, 'indicator_name', 'indicator_id', '/indicators/edit'),
    },
    {
      property: 'product_name',
      filter_property: 'product_name',
      header: i18n('Продукт'),
      render: (row: any) => renderLink(row, 'product_name', 'product_id', '/products/edit'),
    },
    {
      property: 'entity_sample_name',
      filter_property: 'entity_sample_name',
      header: i18n('Сэмпл'),
      render: (row: any) => renderLink(row, 'entity_sample_name', 'entity_sample_id', '/samples/edit'),
    },

  ];

  const columnsDetail = [

    {
      property: 'name',
      filter_property: 'name',
      header: i18n('Название правила'),
    },
    {
      property: 'time',
      header: i18n('Дата изменения'),
      render: (row: any) => renderDate(row, 'time'),
    },
    {
      property: 'state',
      filter_property: 'state',
      header: i18n('Состояние'),
      render: (row: any) => renderState(row, 'state'),
    },
  ];

  const rowStyle = (row: any) => {
    if (row.state === '0') {
      return styles.red_row_class;
    } if (row.state === '1') {
      return styles.yellow_row_class;
    }

    return styles.green_row_class;
  };
  const onRowDoubleClick = (row: any) => {
    if (row.is_crontab === '1') {
      getQualityRuleRuns(row.entity_sample_to_dq_rule_id).then((json) => {
        setCurrentRow(row);
        setDetailData(json);
        setShowRunDetail(true);
      }).catch(handleHttpError);
    }
  };

  const ruleRun = () => {
    if (currentRow) {
      runTask(currentRow.entity_sample_to_dq_rule_id).then((json) => {
        setShowConfirmDetail(true);
      }).catch(handleHttpError);
    }
  };
  const handleCloseConfirm = () => {
    if (currentRow) {
      getQualityRuleRuns(currentRow.entity_sample_to_dq_rule_id).then((json) => {
        setDetailData(json);
        setShowConfirmDetail(false);
      }).catch(handleHttpError);
    }
    return false;
  };
  const ruleRefresh = () => {
    if (currentRow) {
      getQualityRuleRuns(currentRow.entity_sample_to_dq_rule_id).then((json) => {
        setDetailData(json);
      }).catch(handleHttpError);
    }
  };
  const handleCloseRuns = () => {
    setShowRunDetail(false);
    return false;
  };
  return (
    <div className={styles.page}>
      {loading ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('Задачи DQ')}`}</div>
          <Button
            className={styles.button}
            onClick={() => doNavigate('/quality-tasks', navigate)}
          >
            {i18n('Мониторинг DQ')}

          </Button>
          {data !== undefined ? (
            <Table
              className={styles.table}
              columns={columns}
              paginate
              columnSearch
              dataUrl="/v1/quality_tasks/search_rules"
              limitSteward={false}
              initialFetchRequest={{
                sort: '-is_crontab',
                global_query: state.q !== undefined ? state.q : '',
                limit: getTablePageSize(),
                offset: (state.p - 1) * getTablePageSize(),
                filters: [],
                filters_preset: [],
                filters_for_join: [],
              }}
              showCreateBtn={false}
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

        </>
      )}
      <Modal
        show={showConfirmDetail}
        backdrop={false}
        onHide={handleCloseConfirm}
        dialogClassName={styles.modal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Задача запланирована</Modal.Title>

        </Modal.Header>
        <Modal.Body>
          <span />
        </Modal.Body>
        <Modal.Footer>

          <Button
            variant="secondary"
            onClick={handleCloseConfirm}
          >
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showRunDetail}
        backdrop={false}
        onHide={handleCloseRuns}
        dialogClassName={styles.modal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Список вызовов</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.table_wrap}>
            <table className={styles.table_data}>

              <thead>
                <tr>
                  {columnsDetail.map((rec: any) => (
                    <th key={uuid()}>{rec.header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {
                  detailData.map((row: DateiledElementType) => (
                    <tr key={uuid()} className={rowStyle(row.entity)}>
                      {columnsDetail.map((rec: any) => (
                        <td>{rec.render ? rec.render(row.entity) : row.entity[rec.property as keyof typeof row.entity]}</td>
                      ))}
                    </tr>
                  ))
                }

              </tbody>
            </table>
          </div>
        </Modal.Body>
        <Modal.Footer>

          <Button
            variant="primary"
            onClick={handleCloseRuns}
          >
            Закрыть
          </Button>
          <Button
            variant="secondary"
            onClick={ruleRun}
          >
            Запустить задание
          </Button>
          <Button
            variant="secondary"
            onClick={ruleRefresh}
          >
            Обновить
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
