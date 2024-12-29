/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import styles from './Samples.module.scss';
import { getEntityAutocompleteObjects, getEntityDisplayValue, getQueryAutocompleteObjects, getQueryDisplayValue, getSystemAutocompleteObjects, getSystemDisplayValue, getTablePageSize, handleHttpError, i18n, updateArtifactsCount, uuid } from '../../utils';
import { Table } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { createSample, deleteSample } from '../../services/pages/samples';
import { useNavigate } from "react-router-dom";
import classNames from 'classnames';
import { Button } from '../../components/Button';
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import { ModalDlg } from '../../components/ModalDlg';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';

export function Samples() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loaded, setLoaded] = useState(true);
  const [tableKey, setTableKey] = useState(uuid());

  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delObjectData, setDelObjectData] = useState<any>({ id: '', name: '' });
  const [showCreateDlg, setShowCreateDlg] = useState(false);
  const [showCreateValidation, setShowCreateValidation] = useState(false);
  const [createData, setCreateData] = useState({ name: '', system_id: '', entity_id: '', entity_query_id: '', sample_type: 'table' });

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
      width: '125px'
    },
    {
      property: 'entity_id',
      filter_property: 'entity.name',
      header: i18n('Модель'),
      render: (row: any) => <>{row.entity_name && (<span key={`e-pill-${row.id}`} className={styles.pill}>{row.entity_name}</span>)}</>,
    },
    {
      property: 'entity_query_id',
      filter_property: 'entity_query.name',
      header: i18n('Запрос'),
      render: (row: any) => <>{row.entity_query_name && (<span key={`eq-pill-${row.id}`} className={styles.pill}>{row.entity_query_name}</span>)}</>,
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
    deleteSample(delObjectData.id)
      .then(() => {
        updateArtifactsCount();
        setTableKey(uuid());
      })
      .catch(handleHttpError);
    setDelObjectData({ id: '', name: '' });
  };

  const submitCreate = () => {
    if (createData.name && createData.entity_id && createData.system_id && createData.entity_query_id) {
      setShowCreateDlg(false);

      createSample(createData).then(json => {
        if (json && json.metadata.id) {
          navigate(`/samples/edit/${encodeURIComponent(json.metadata.id)}`);
        }
      }).catch(handleHttpError)
    } else
      setShowCreateValidation(true);
  }

  const [limitSteward, setLimitSteward] = useState((window as any).limitStewardSwitch ? (window as any).limitStewardSwitch.getLimitSteward() : true);

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
          <div className={styles.title}>{`${i18n('Сэмплы')}`}<Button background='blue' onClick={() => { setShowCreateValidation(false); setShowCreateDlg(true); }}>Создать сэмпл</Button></div>
          <Table
            artifactType='entity_sample'
            key={tableKey}
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
            onRowClick={(row: any) => {
              navigate(`/samples/edit/${encodeURIComponent(row.id)}`);
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
          <ModalDlg show={showCreateDlg} title={i18n('Создать сэмпл')} cancelBtnText={i18n('Отменить')} submitBtnText={i18n('Создать')} onClose={() => setShowCreateDlg(false)} dialogClassName={styles.dlg_create} onSubmit={submitCreate}>
            <div className={styles.fields}>
                <FieldTextEditor label={i18n('Название сэмпла')} isRequired showValidation={showCreateValidation} className='' defaultValue='' valueSubmitted={(v) => setCreateData((prev) => ({...prev, name: v ?? ''}))} />

                <FieldAutocompleteEditor
                  label={i18n('Модель')}
                  defaultValue={''}
                  valueSubmitted={(v) => setCreateData((prev) => ({...prev, entity_id: v ?? ''}))}
                  getDisplayValue={getEntityDisplayValue}
                  getObjects={getEntityAutocompleteObjects}
                  isRequired
                  showValidation={showCreateValidation}
                  artifactType="entity"
                />

                <FieldAutocompleteEditor
                  label={i18n('Система')}
                  defaultValue={''}
                  valueSubmitted={(v) => setCreateData((prev) => ({...prev, system_id: v ?? ''}))}
                  getDisplayValue={getSystemDisplayValue}
                  getObjects={getSystemAutocompleteObjects}
                  isRequired
                  showValidation={showCreateValidation}
                  artifactType="system"
                />
                
                <FieldAutocompleteEditor
                  label={i18n('Запрос')}
                  defaultValue={''}
                  valueSubmitted={(v) => setCreateData((prev) => ({...prev, entity_query_id: v ?? ''}))}
                  getDisplayValue={getQueryDisplayValue}
                  getObjects={getQueryAutocompleteObjects}
                  isRequired
                  showValidation={showCreateValidation}
                  artifactType="entity_query"
                />
            </div>
          </ModalDlg>
        </>
      )}
    </div>
  );
}
