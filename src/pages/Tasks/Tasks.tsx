/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
import React, { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import { getQueryAutocompleteObjects, getQueryDisplayValue, getSystemConnectionAutocompleteObjects, getSystemConnectionDisplayValue, getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { Table } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { createTask, deleteTask } from '../../services/pages/tasks';
import styles from './Tasks.module.scss';
import { useNavigate } from "react-router-dom";
import classNames from 'classnames';
import { Button } from '../../components/Button';
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import { ModalDlg } from '../../components/ModalDlg';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { FieldCheckboxEditor } from '../../components/FieldCheckboxEditor';

export function Tasks() {

  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loaded, setLoaded] = useState(true);
  

  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delObjectData, setDelObjectData] = useState<any>({ id: '', name: '' });
  const [showCreateDlg, setShowCreateDlg] = useState(false);
  const [showCreateValidation, setShowCreateValidation] = useState(false);
  const [createData, setCreateData] = useState({ name: '', is_metadata_task : false, enabled: true, query_id: '', system_connection_id: '', schedule_params: JSON.stringify({datetime: (new Date().toISOString()).substring(0, 10) + ' 00:00:00'}), schedule_type: 'ONCE' });

  const renderDate = (row: any, dateField: string) => {
    if (row === undefined || row[dateField] === undefined) return '';
    return new Date(row[dateField]).toLocaleString('ru-RU');
  };
  const getTaskStatusName = (ts: string) => {
    return (ts ? (ts.length > 1 ? ts.substring(0, 1).toUpperCase() + ts.substring(1).toLowerCase() : ts.toUpperCase()) : '');
  }
  const columns = [
    { property: 'id', header: 'ID', isHidden: true },
    {
      property: 'num',
      header: i18n('Koд'),
      sortDisabled: true,
      filterDisabled: true,
      width: '55px'
    },
    {
      property: 'name',
      header: i18n('Название'),
    },
    {
      property: 'system_connection_name',
      header: i18n('Подключение'),
      render: (row: any) => <>{row.system_connection_name && (<span key={`sc-pill-${row.id}`} className={styles.pill}>{row.system_connection_name}</span>)}</>,
    },
    {
      property: 'query_name',
      header: i18n('Запрос'),
      render: (row: any) => <>{row.query_name && (<span key={`q-pill-${row.id}`} className={styles.pill}>{row.query_name}</span>)}</>,
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
      render: (row: any) => <div className={classNames(styles.pill, styles['status_' + getTaskStatusName(row.task_state).toLowerCase()])}>{getTaskStatusName(row.task_state)}</div>,
    },
  ];

  const handleDelDlgClose = () => {
    setShowDelDlg(false);
    return false;
  };

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    setLoaded(false);
    deleteTask(delObjectData.id)
      .then(() => {
        setLoaded(true);
        updateArtifactsCount();
      })
      .catch(handleHttpError);
    setDelObjectData({ id: '', name: '' });
  };

  const submitCreate = () => {
    if (createData.name && (createData.is_metadata_task || createData.query_id) && createData.system_connection_id) {
      setShowCreateDlg(false);

      createTask(createData).then(json => {
        if (json && json.metadata.id) {
          navigate(`/tasks/edit/${encodeURIComponent(json.metadata.id)}`);
        }
      }).catch(handleHttpError)
    } else {
      setShowCreateValidation(true);
    }
  }

  const [limitSteward, setLimitSteward] = useState((window as any).limitStewardSwitch.getLimitSteward());

  useEffect(() => {
    window.addEventListener('limitStewardChanged', function (e) {
      setLimitSteward((e as any).limitSteward);
    })
  }, []);

  return (
    <div className={classNames(styles.page, styles.scrollable, { [styles.loaded]: loaded })}>
      {!loaded ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('Задачи')}`}<Button background='blue' onClick={() => { setShowCreateValidation(false); setShowCreateDlg(true); }}>Создать задачу</Button></div>
          
          <Table
            artifactType='task'
            cookieKey='tasks'
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
            onRowClick={(row: any) => {
              navigate(`/tasks/edit/${encodeURIComponent(row.id)}`);
            }}
            onEditClicked={(row:any) => { navigate(`/tasks/edit/${encodeURIComponent(row.id)}`); }}
            onDeleteClicked={(row: any) => {
              setDelObjectData({ id: row.id, name: row.name });
              setShowDelDlg(true);
            }}
            onPageChange={(page: number) => (
              setState(() => ({ p: page }))
            )}
            onQueryChange={(query: string) => (
              setState(() => ({ p: undefined, q: query }))
            )}
            allowTilesView
          />
          
          <DeleteObjectModal show={showDelDlg} objectTitle={delObjectData.name} onClose={() => { setShowDelDlg(false); return false; }} onSubmit={delDlgSubmit} />
          <ModalDlg show={showCreateDlg} title={i18n('Создать задачу')} cancelBtnText={i18n('Отменить')} submitBtnText={i18n('Создать')} onClose={() => setShowCreateDlg(false)} dialogClassName={styles.dlg_create} onSubmit={submitCreate}>
            <div className={styles.fields}>
                <FieldTextEditor label={i18n('Название задачи')} isRequired showValidation={showCreateValidation} className='' defaultValue='' valueSubmitted={(v) => setCreateData((prev) => ({...prev, name: v ?? ''}))} />

                <FieldAutocompleteEditor label={i18n('Запрос')} defaultValue={undefined}
                  valueSubmitted={(v) => setCreateData((prev) => ({...prev, query_id: v ?? ''}))}
                  getDisplayValue={getQueryDisplayValue}
                  getObjects={getQueryAutocompleteObjects}
                  showValidation={showCreateValidation}
                  artifactType="entity_query"
                  isRequired={!createData.is_metadata_task}
                />

                <FieldAutocompleteEditor className='' label={i18n('Подключение')} defaultValue={''}
                  valueSubmitted={(v) => setCreateData((prev) => ({...prev, system_connection_id: v }))}
                  getDisplayValue={getSystemConnectionDisplayValue}
                  getObjects={getSystemConnectionAutocompleteObjects}
                  showValidation={showCreateValidation} isRequired
                  artifactType="system_connection"
                />

                <FieldCheckboxEditor label={i18n('Загрузка метаданных')} defaultValue={createData.is_metadata_task}
                  valueSubmitted={(val) => setCreateData((prev) => ({...prev, is_metadata_task: val}))}
                  isRequired={!createData.query_id}
                  showValidation={showCreateValidation} />
            </div>
          </ModalDlg>
        </>
      )}
    </div>
  );
}
