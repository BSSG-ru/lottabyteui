/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import { useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './DQRules.module.scss';
import { doNavigate, getRuleTypeAutocompleteObjects, getRuleTypeDisplayValue, getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { renderDate, Table, TableDataRequest } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { createDQRule, deleteDQRule } from '../../services/pages/dqRules';
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import { Button } from '../../components/Button';
import { ModalDlg } from '../../components/ModalDlg';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';

export function DQRules() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loaded, setLoaded] = useState(true);
  
  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delObjectData, setDelObjectData] = useState<any>({ id: '', name: '' });
  const [showCreateDlg, setShowCreateDlg] = useState(false);
  const [showCreateValidation, setShowCreateValidation] = useState(false);
  const [createData, setCreateData] = useState({ name: '', rule_type_id: '' });

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
      property: 'rule_ref',
      header: i18n('Функция качества'),
      render: (item: any) => <span>{item.rule_ref}</span>,
    },
    {
      property: 'modified',
      header: i18n('Дата изменения'),
      render: (row: any) => renderDate(row, 'modified'),
    },
    {
      property: 'settings',
      header: i18n('Пример настройки'),
      render: (item: any) => <span>{item.settings}</span>,
    },
    {
      property: 'tags',
      header: i18n('Теги'),
      filterDisabled: false,
      sortDisabled: true,
      render: (row: any) => <div className={styles.pills}>{row.tags.map((tag:any, i:number) => <span key={`tag-pill-${row.id}-${i}`} className={styles.pill}>#{tag}</span>)}</div>,
    },
  ];

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    deleteDQRule(delObjectData.id)
      .then((json) => {
        updateArtifactsCount();
        if (json.metadata && json.metadata.id) { navigate(`/dq_rule/edit/${encodeURIComponent(json.metadata.id)}`); }
      })
      .catch(handleHttpError);
    setDelObjectData({ id: '', name: '' });
  };

  const submitCreate = () => {
    if (createData.name && createData.rule_type_id) {
      setShowCreateDlg(false);

      createDQRule(createData).then(json => {
        if (json && json.metadata.id) {
          navigate(`/dq_rule/edit/${encodeURIComponent(json.metadata.id)}`);
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
          <div className={styles.title}>{`${i18n('Правила качества')}`}
            <div className={styles.btns}>
              <Button background='blue' onClick={() => { setShowCreateValidation(false); setShowCreateDlg(true); }}>Создать правило</Button>
              <Button background="outlined-blue" className={styles.button2} onClick={() => doNavigate('/dq_rule/quality-tasks', navigate)}>{i18n('Мониторинг DQ')}</Button>
              <Button background="outlined-blue" className={styles.button2} onClick={() => doNavigate('/dq_rule/quality-schedule-tasks', navigate)}>{i18n('Задачи DQ')}</Button>
            </div>
          </div>
          

          <Table
            artifactType='dq_rule'
            cookieKey='dqrules'
            className={styles.table}
            columns={columns}
            paginate
            columnSearch
            globalSearch
            dataUrl="/v1/dq_rule/search"
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
              navigate(`/dq_rule/edit/${encodeURIComponent(row.id)}`);
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
          <ModalDlg show={showCreateDlg} title={i18n('Создать правило')} cancelBtnText={i18n('Отменить')} submitBtnText={i18n('Создать')} onClose={() => setShowCreateDlg(false)} dialogClassName={styles.dlg_create} onSubmit={submitCreate}>
            <div className={styles.fields}>
                <FieldTextEditor label={i18n('Название правила')} isRequired showValidation={showCreateValidation} className='' defaultValue='' valueSubmitted={(v) => setCreateData((prev) => ({...prev, name: v ?? ''}))} />

                <FieldAutocompleteEditor
                  label={i18n('Тип')}
                  defaultValue=''
                  valueSubmitted={(v) => setCreateData((prev) => ({...prev, rule_type_id: v ?? ''}))}
                  getDisplayValue={getRuleTypeDisplayValue}
                  getObjects={getRuleTypeAutocompleteObjects}
                  showValidation={showCreateValidation}
                />

            </div>
          </ModalDlg>

        </>
      )}
    </div>
  );
}
