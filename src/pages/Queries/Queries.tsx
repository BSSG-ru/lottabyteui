/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import { useNavigate } from 'react-router-dom';
import styles from './Queries.module.scss';
import { getEntityAutocompleteObjects, getEntityDisplayValue, getSystemAutocompleteObjects, getSystemDisplayValue, getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { renderDate, Table, TableDataRequest } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { createEntityQuery, deleteEntityQuery } from '../../services/pages/entityQueries';
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import classNames from 'classnames';
import { Button } from '../../components/Button';
import { ModalDlg } from '../../components/ModalDlg';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';

export function Queries() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loaded, setLoaded] = useState(true);
  
  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delObjectData, setDelObjectData] = useState<any>({ id: '', name: '' });
  const [showCreateDlg, setShowCreateDlg] = useState(false);
  const [showCreateValidation, setShowCreateValidation] = useState(false);
  const [createData, setCreateData] = useState({ name: '', system_id: '', entity_id: '', query_text: '' });

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
      property: 'system_id',
      filter_property: 'system.name',
      header: i18n('Система'),
      render: (row: any) => <>{row.system_name && (<span key={`sys-pill-${row.id}`} className={styles.pill}>{row.system_name}</span>)}</>,
    },
    {
      property: 'entity_id',
      filter_property: 'entity.name',
      header: i18n('Модель'),
      render: (row: any) => <>{row.entity_name && (<span key={`e-pill-${row.id}`} className={styles.pill}>{row.entity_name}</span>)}</>,
    },
    {
      property: 'modified',
      header: i18n('Дата изменения'),
      render: (row: any) => renderDate(row, 'modified'),
    },
    {
      property: 'workflow_state',
      header: i18n('Состояние'),
      render: (row: any) => row.workflow_state ?? 'В работе',
      isHiddenCallback: (fetchRequest: TableDataRequest) => !fetchRequest || fetchRequest.state !== 'DRAFT',
    },
    {
      property: 'tags',
      header: i18n('Теги'),
      filterDisabled: false,
      sortDisabled: true,
      render: (row: any) => <div className={styles.pills}>{row.tags.map((tag:any, i:number) => <span key={`tag-pill-${row.id}-${i}`} className={styles.pill}>#{tag}</span>)}</div>,
    }
  ];

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    deleteEntityQuery(delObjectData.id)
      .then((json) => {
        updateArtifactsCount();
        if (json.metadata && json.metadata.id) { navigate(`/queries/edit/${encodeURIComponent(json.metadata.id)}`); }
      })
      .catch(handleHttpError);
    setDelObjectData({ id: '', name: '' });
  };

  const submitCreate = () => {
    if (createData.name && createData.system_id && createData.entity_id && createData.query_text) {
      setShowCreateDlg(false);

      createEntityQuery(createData).then(json => {
        if (json && json.metadata.id) {
          navigate(`/queries/edit/${encodeURIComponent(json.metadata.id)}`);
        }
      }).catch(handleHttpError)
    } else
      setShowCreateValidation(true);
  }

  const [limitSteward, setLimitSteward] = useState((window as any).limitStewardSwitch.getLimitSteward());

  useEffect(() => {
    window.addEventListener('limitStewardChanged', (e) => {
      setLimitSteward((e as any).limitSteward);
    });
  }, []);

  return (
    <div className={classNames(styles.page, styles.scrollable, { [styles.loaded]: loaded })}>
      {!loaded ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('Запросы')}`}<Button background='blue' onClick={() => { setShowCreateValidation(false); setShowCreateDlg(true); }}>Создать запрос</Button></div>
          <Table
            artifactType='entity_query'
            cookieKey='queries'
            className={styles.table}
            columns={columns}
            paginate
            columnSearch
            globalSearch
            dataUrl="/v1/queries/search"
            limitSteward={limitSteward}
            supportsWorkflow
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
              navigate(`/queries/edit/${encodeURIComponent(row.id)}`);
            }}
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
          />

          <DeleteObjectModal show={showDelDlg} objectTitle={delObjectData.name} onClose={() => { setShowDelDlg(false); return false; }} onSubmit={delDlgSubmit} />
          <ModalDlg show={showCreateDlg} title={i18n('Создать запрос')} cancelBtnText={i18n('Отменить')} submitBtnText={i18n('Создать')} onClose={() => setShowCreateDlg(false)} dialogClassName={styles.dlg_create} onSubmit={submitCreate}>
            <div className={styles.fields}>
                <FieldTextEditor label={i18n('Название запроса')} isRequired showValidation={showCreateValidation} className='' defaultValue='' valueSubmitted={(v) => setCreateData((prev) => ({...prev, name: v ?? ''}))} />

                <FieldAutocompleteEditor
                  label={i18n('Система')}
                  defaultValue=''
                  valueSubmitted={(v) => setCreateData((prev) => ({...prev, system_id: v ?? ''}))}
                  getDisplayValue={getSystemDisplayValue}
                  getObjects={getSystemAutocompleteObjects}
                  isRequired
                  showValidation={showCreateValidation}
                  artifactType='system'
                />

                <FieldAutocompleteEditor
                  label={i18n('Модель')}
                  defaultValue=''
                  valueSubmitted={(v) => setCreateData((prev) => ({...prev, entity_id: v ?? ''}))}
                  getDisplayValue={getEntityDisplayValue}
                  getObjects={getEntityAutocompleteObjects}
                  isRequired
                  showValidation={showCreateValidation}
                  artifactType='entity'
                />

                <FieldTextareaEditor
                  label={i18n('Текст запроса')}
                  defaultValue=''
                  valueSubmitted={(v) => setCreateData((prev) => ({...prev, query_text: v ?? ''}))}
                  isRequired
                  showValidation={showCreateValidation}
                />
            </div>
          </ModalDlg>
        </>
      )}
    </div>
  );
}
