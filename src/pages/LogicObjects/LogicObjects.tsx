/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import { getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { renderDate, Table, TableDataRequest } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { createEntity, deleteEntity } from '../../services/pages/dataEntities';
import styles from './LogicObjects.module.scss';
import { useNavigate } from "react-router-dom";
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import classNames from 'classnames';
import { Button } from '../../components/Button';
import { ModalDlg } from '../../components/ModalDlg';
import { FieldTextEditor } from '../../components/FieldTextEditor';

export function LogicObjects() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loaded, setLoaded] = useState(true);

  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delObjectData, setDelObjectData] = useState<any>({ id: '', name: '' });
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
      property: 'system',
      header: i18n('Системы'),
      sortDisabled: true,
      filterDisabled: false,
      filter_property: 'systems',
      render: (row: any) => <div className={styles.pills}>{row.systems.map((sys:any, i:number) => <span key={`sys-pill-${row.id}-${i}`} className={styles.pill}>{sys.name}</span>)}</div>,
    },
    {
      property: 'modified',
      header: i18n('Дата'),
      render: (row: any) => renderDate(row, 'modified'),
    },
    {
      property: 'tags',
      header: i18n('Теги'),
      filterDisabled: false,
      sortDisabled: true,
      render: (row: any) => <div className={styles.pills}>{row.tags.map((tag:any, i:number) => <span key={`tag-pill-${row.id}-${i}`} className={styles.pill}>#{tag}</span>)}</div>,
    },
    {
      property: 'workflow_state',
      header: i18n('Состояние'),
      render: (row: any) => row.workflow_state ?? 'В работе',
      isHiddenCallback: (fetchRequest: TableDataRequest) => {
        return !fetchRequest || fetchRequest.state != 'DRAFT';
      }
    }
  ];

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    deleteEntity(delObjectData.id)
      .then(json => {
        updateArtifactsCount();

        if (json.metadata && json.metadata.id)
          navigate('/logic-objects/edit/' + encodeURIComponent(json.metadata.id));
      })
      .catch(handleHttpError);
    setDelObjectData({ id: '', name: '' });
  };

  const [limitSteward, setLimitSteward] = useState((window as any).limitStewardSwitch.getLimitSteward());

  useEffect(() => {
    window.addEventListener('limitStewardChanged', function (e) {
      setLimitSteward((e as any).limitSteward);
    })
  }, []);

  const submitCreate = () => {
    if (createData.name) {
      setShowCreateDlg(false);

      createEntity(createData).then(json => {
        if (json && json.metadata.id) {
          navigate(`/logic-objects/edit/${encodeURIComponent(json.metadata.id)}`);
        }
      }).catch(handleHttpError)
    } else
      setShowCreateValidation(true);
  }

  return (
    <div className={classNames(styles.page, styles.scrollable, { [styles.loaded]: loaded })}>
      {!loaded ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('Модели')}`}<Button background='blue' onClick={() => { setShowCreateValidation(false); setShowCreateDlg(true); }}>Создать модель</Button></div>
        
          <Table
            artifactType='entity'
            cookieKey='ents'
            className={styles.table}
            columns={columns}
            paginate
            columnSearch
            globalSearch
            dataUrl="/v1/entities/search"
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
              navigate(`/logic-objects/edit/${encodeURIComponent(row.id)}`);
            }}
            onEditClicked={(row:any) => { navigate(`/logic-objects/edit/${encodeURIComponent(row.id)}`); }}
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
          <ModalDlg show={showCreateDlg} title={i18n('Создать модель')} cancelBtnText={i18n('Отменить')} submitBtnText={i18n('Создать')} onClose={() => setShowCreateDlg(false)} dialogClassName={styles.dlg_create} onSubmit={submitCreate}>
            <div className={styles.fields}>
                <FieldTextEditor label={i18n('Название')} isRequired showValidation={showCreateValidation} className='' defaultValue='' valueSubmitted={(v) => setCreateData((prev) => ({...prev, name: v ?? ''}))} />
            </div>
          </ModalDlg>
        </>
      )}
    </div>
  );
}
