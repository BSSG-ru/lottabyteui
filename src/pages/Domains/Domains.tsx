
import React, { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import styles from './Domains.module.scss';
import { getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { renderDate, Table, TableDataRequest } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { createDomain, deleteDomain } from '../../services/pages/domains';
import { useNavigate } from "react-router-dom";
import classNames from 'classnames';
import { Button } from '../../components/Button';
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import { ModalDlg } from '../../components/ModalDlg';
import { FieldTextEditor } from '../../components/FieldTextEditor';

export function Domains() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loaded, setLoaded] = useState(true);

  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delDomainData, setDelDomainData] = useState<any>({ id: '', name: '' });
  const [showCreateDlg, setShowCreateDlg] = useState(false);
  const [showCreateValidation, setShowCreateValidation] = useState(false);
  const [createData, setCreateData] = useState({ name: '' });

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
      property: 'modified',
      header: i18n('Дата создания'),
      render: (row: any) => renderDate(row, 'modified'),
    },
    {
      property: 'stewards',
      header: i18n('Ответственный'),
      sortDisabled: true,
      
      render: (row: any) => <div className={styles.pills}>{row.stewards.map((st:any, i:number) => <span key={`st-pill-${row.id}-${i}`} className={styles.pill}>{st.name}</span>)}</div>,
    },
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
    deleteDomain(delDomainData.id)
      .then(json => {
        updateArtifactsCount();

        if (json.metadata && json.metadata.id)
          navigate('/domains/edit/' + encodeURIComponent(json.metadata.id));
      })
      .catch(handleHttpError);
    setDelDomainData({ id: '', name: '' });
  };

  const submitCreate = () => {
    if (createData.name) {
      setShowCreateDlg(false);

      createDomain(createData).then(json => {
        if (json && json.metadata.id) {
          navigate(`/domains/edit/${encodeURIComponent(json.metadata.id)}`);
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
          <div className={styles.title}>{`${i18n('Домены')}`}<Button background='blue' onClick={() => { setShowCreateValidation(false); setShowCreateDlg(true); }}>Создать домен</Button></div>
          
          <Table
            artifactType='domain'
            cookieKey='domains'
            className={styles.table}
            columns={columns}
            paginate
            columnSearch
            globalSearch
            dataUrl="/v1/domains/search"
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
              navigate(`/domains/edit/${encodeURIComponent(row.id)}`);
            }}
            onEditClicked={(row:any) => { navigate(`/domains/edit/${encodeURIComponent(row.id)}`); }}
            onDeleteClicked={(row:any) => {
              setDelDomainData({ id: row.id, name: row.name });
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
          

          <DeleteObjectModal show={showDelDlg} objectTitle={delDomainData.name} onClose={() => { setShowDelDlg(false); return false; }} onSubmit={delDlgSubmit} />
          <ModalDlg show={showCreateDlg} title={i18n('Создать домен')} cancelBtnText={i18n('Отменить')} submitBtnText={i18n('Создать')} onClose={() => setShowCreateDlg(false)} dialogClassName={styles.dlg_create} onSubmit={submitCreate}>
            <div className={styles.fields}>
                <FieldTextEditor label={i18n('Название домена')} isRequired showValidation={showCreateValidation} className='' defaultValue='' valueSubmitted={(v) => setCreateData((prev) => ({...prev, name: v ?? ''}))} />
            </div>
          </ModalDlg>
        </>
      )}
    </div>
  );
}
