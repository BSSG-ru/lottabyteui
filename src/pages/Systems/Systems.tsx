/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable no-plusplus */
import React, { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import { getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { Table, TableDataRequest } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { createSystem, deleteSystem, getSystemTypes } from '../../services/pages/systems';
import styles from './Systems.module.scss';
import { useNavigate } from "react-router-dom";
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import classNames from 'classnames';
import { Button } from '../../components/Button';
import { ModalDlg } from '../../components/ModalDlg';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';

export function Systems() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loaded, setLoaded] = useState(true);
  
  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delObjectData, setDelObjectData] = useState<any>({ id: '', name: '' });
  const [showCreateDlg, setShowCreateDlg] = useState(false);
  const [showCreateValidation, setShowCreateValidation] = useState(false);
  const [createData, setCreateData] = useState({ name: '', system_type: '' });

  const [systemTypes, setSystemTypes] = useState();

  const getSystemTypeDisplayValue = async (i: string) => {
    if (!i) return '';
    // @ts-ignore
    return systemTypes ? systemTypes.get(i) : '??';
  };

  const getSystemType = async (search: string) => getSystemTypes().then((json) => {
    const res:any[] = [];
    const map = new Map();
    for (let i = 0; i < json.length; i += 1) {
      res.push({ id: json[i].id, name: json[i].description });
      map.set(json[i].id, json[i].description);
    }
    // @ts-ignore
    setSystemTypes(map);
    return res.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
  });

  useEffect(() => {
    getSystemTypes().then((json) => {
      
      const map = new Map();
      for (let i = 0; i < json.length; i += 1) {
        
        map.set(json[i].id, json[i].description);
      }
      // @ts-ignore
      setSystemTypes(map);
    }).catch(handleHttpError);
  }, []);

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
    //{ property: 'description', header: i18n('Описание') },
    {
      property: 'workflow_state',
      header: i18n('Состояние'),
      render: (row: any) => row.workflow_state ?? 'В работе',
      isHiddenCallback: (fetchRequest: TableDataRequest) => {
        return !fetchRequest || fetchRequest.state != 'DRAFT';
      }
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
    deleteSystem(delObjectData.id)
      .then(json => {
        updateArtifactsCount();

        if (json.metadata && json.metadata.id)
          navigate('/systems/edit/' + encodeURIComponent(json.metadata.id));
      })
      .catch(handleHttpError);
    setDelObjectData({ id: '', name: '' });
  };

  const submitCreate = () => {
    if (createData.name && createData.system_type) {
      setShowCreateDlg(false);

      createSystem(createData).then(json => {
        if (json && json.metadata.id) {
          navigate(`/systems/edit/${encodeURIComponent(json.metadata.id)}`);
        }
      }).catch(handleHttpError)
    } else
      setShowCreateValidation(true);
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
          <div className={styles.title}>{`${i18n('Системы')}`}<Button background='blue' onClick={() => { setShowCreateValidation(false); setShowCreateDlg(true); }}>Создать систему</Button></div>
          <Table
            artifactType='system'
            cookieKey='systems'
            className={styles.table}
            columns={columns}
            paginate
            columnSearch
            globalSearch
            dataUrl="/v1/systems/search"
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
              navigate(`/systems/edit/${encodeURIComponent(row.id)}`);
            }}
            onEditClicked={(row:any) => { navigate(`/systems/edit/${encodeURIComponent(row.id)}`); }}
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
          <ModalDlg show={showCreateDlg} title={i18n('Создать систему')} cancelBtnText={i18n('Отменить')} submitBtnText={i18n('Создать')} onClose={() => setShowCreateDlg(false)} dialogClassName={styles.dlg_create} onSubmit={submitCreate}>
            <div className={styles.fields}>
                <FieldTextEditor label={i18n('Название системы')} isRequired showValidation={showCreateValidation} className='' defaultValue='' valueSubmitted={(v) => setCreateData((prev) => ({...prev, name: v ?? ''}))} />

                <FieldAutocompleteEditor
                  className=''
                  label={i18n('Тип')}
                  defaultValue=''
                  valueSubmitted={(identity) => setCreateData((prev) => ({...prev, system_type: identity ?? ''}))}
                  getDisplayValue={getSystemTypeDisplayValue}
                  getObjects={getSystemType}
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
