import React, { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import { useNavigate } from 'react-router-dom';
import styles from './ETL.module.scss';
import { getETLTypeAutocompleteObjects, getETLTypeDisplayValue, getSystemAutocompleteObjects, getSystemDisplayValue, getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { renderDate, Table, TableDataRequest } from '../../components/Table';
import classNames from 'classnames';
import { Loader } from '../../components/Loader';
import { Button } from '../../components/Button';
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import { ModalDlg } from '../../components/ModalDlg';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { createETL, deleteETL } from '../../services/pages/etls';

export function ETLs() {
    const navigate = useNavigate();
    const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
    const [loaded, setLoaded] = useState(true);
    
    const [showDelDlg, setShowDelDlg] = useState(false);
    const [delObjectData, setDelObjectData] = useState<any>({ id: '', name: '' });
    const [showCreateDlg, setShowCreateDlg] = useState(false);
    const [showCreateValidation, setShowCreateValidation] = useState(false);
    const [createData, setCreateData] = useState({ name: '', etl_type_id: '', system_id: '' });
  
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
        render: (row: any) => <>{row.system_name && (<span key={`dm-pill-${row.id}`} className={styles.pill}>{row.system_name}</span>)}</>,
      },
      {
        property: 'etl_type_id',
        filter_property: 'etl_type.name',
        header: i18n('Тип'),
        render: (item: any) => <span>{item.etl_type_name}</span>,
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
      deleteETL(delObjectData.id)
        .then((json) => {
          updateArtifactsCount();
          if (json.metadata && json.metadata.id) { navigate(`/etl/edit/${encodeURIComponent(json.metadata.id)}`); }
        })
        .catch(handleHttpError);
      setDelObjectData({ id: '', name: '' });
    };
  
    const submitCreate = () => {
      if (createData.name && createData.etl_type_id && createData.system_id) {
        setShowCreateDlg(false);
  
        createETL(createData).then(json => {
          if (json && json.metadata.id) {
            navigate(`/etl/edit/${encodeURIComponent(json.metadata.id)}`);
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
            <div className={styles.title}>{`${i18n('Трансформации')}`}<Button background='blue' onClick={() => { setShowCreateValidation(false); setShowCreateDlg(true); }}>Создать трансформацию</Button></div>
            <Table
              artifactType='etl'
              cookieKey='etls'
              className={styles.table}
              columns={columns}
              paginate
              columnSearch
              globalSearch
              dataUrl="/v1/etl/search"
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
                navigate(`/etl/edit/${encodeURIComponent(row.id)}`);
              }}
              onEditClicked={(row:any) => { navigate(`/etl/edit/${encodeURIComponent(row.id)}`); }}
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
            <ModalDlg show={showCreateDlg} title={i18n('Создать трансформацию')} cancelBtnText={i18n('Отменить')} submitBtnText={i18n('Создать')} onClose={() => setShowCreateDlg(false)} dialogClassName={styles.dlg_create} onSubmit={submitCreate}>
              <div className={styles.fields}>
                  <FieldTextEditor label={i18n('Название трансформации')} isRequired showValidation={showCreateValidation} className='' defaultValue='' valueSubmitted={(v) => setCreateData((prev) => ({...prev, name: v ?? ''}))} />
  
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
                    label={i18n('Тип')}
                    defaultValue=''
                    valueSubmitted={(v) => setCreateData((prev) => ({...prev, etl_type_id: v ?? ''}))}
                    getDisplayValue={getETLTypeDisplayValue}
                    getObjects={getETLTypeAutocompleteObjects}
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
  
