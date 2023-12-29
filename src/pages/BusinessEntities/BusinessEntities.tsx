/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import { useNavigate } from 'react-router-dom';
import styles from './BusinessEntity.module.scss';
import { doNavigate, getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { renderDate, Table, TableDataRequest } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { deleteBusinessEntity, getBETree, getBusinessEntities } from '../../services/pages/businessEntities';
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import { TreeTable } from 'primereact/treetable';
import { TreeNode } from 'primereact/treenode';
import { Column, ColumnBodyOptions } from 'primereact/column';
import { Button } from '../../components/Button';
import classNames from 'classnames';
import { enableES5 } from 'immer';

export function BusinessEntities() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TreeNode[]>([]);

  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delBusinessEntityData, setDelBusinessEntityData] = useState<any>({ id: '', name: '' });
  const [wfStatus, setWfStatus] = useState('PUBLISHED');

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
      property: 'tech_name',
      header: i18n('Техническое название'),
    },
    {
      property: 'domain_id',
      filter_property: 'domain.name',
      header: i18n('Домен'),
      render: (item: any) => <span>{item.domain_name}</span>,
    },
    {
      property: 'alt_names',
      header: i18n('Альтернативные наименования'),
      render: (row: any) => <span>{row.alt_names ? row.alt_names.join(', ') : ''}</span>
    },
    {
      property: 'synonym',
      filter_property: 'synonyms',
      sortDisabled: true,
      header: i18n('Синонимы'),
      render: (row: any) => {
        return row.synonyms.map((s:any) => { return s.name; }).join(', ');
      },
    },
    {
      property: 'modified',
      header: i18n('Дата изменения'),
      render: (row: any) => renderDate(row, 'modified'),
    },
    {
      property: 'workflow_state',
      header: i18n('Тип'),
      render: (row: any) => row.workflow_state ?? 'В работе',
      isHiddenCallback: (fetchRequest: TableDataRequest) => !fetchRequest || fetchRequest.state !== 'DRAFT',
    },
    {
      property: 'tags',
      header: i18n('Теги'),
      filterDisabled: false,
      sortDisabled: true,
      render: (row: any) => row.tags.join(', '),
    }
  ];

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    setLoading(true);
    deleteBusinessEntity(delBusinessEntityData.id)
      .then((json) => {
        updateArtifactsCount();
        setLoading(false);

        if (json.metadata && json.metadata.id) { navigate(`/business-entities/edit/${encodeURIComponent(json.metadata.id)}`); }
      })
      .catch(handleHttpError);
    setDelBusinessEntityData({ id: '', name: '' });
  };

  const [limitSteward, setLimitSteward] = useState((window as any).limitStewardSwitch.getLimitSteward());

  useEffect(() => {
    window.addEventListener('limitStewardChanged', (e) => {
      setLimitSteward((e as any).limitSteward);
    });

    
  }, []);

  useEffect(() => {
    getBETree({ filters: [], filters_for_join: [], global_search: '', sort: 'name+', state: wfStatus }).then(json => {
      setData(json);
    });
  }, [ wfStatus ])

  const actionTemplate = (node:any) => {
    
    return (
        <div className={styles.actions}>
            <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate('/business-entities/edit/');
                      return false;
                    }}
                    className={styles.btn_create}
                  />
                  <a
                    href={`/business-entities/edit/${encodeURIComponent(node.key)}`}
                    className={styles.btn_edit}
                    onClick={(e) => { e.preventDefault(); navigate(`/business-entities/edit/${encodeURIComponent(node.key)}`); }}
                  />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDelBusinessEntityData({ id: node.key, name: node.data.name });
                      setShowDelDlg(true);
                    }}
                    className={styles.btn_del}
                  />
        </div>
    );
  };

  const columnBodyWithActions = (node: any, opts: ColumnBodyOptions) => {
    return <div className={styles.col_body}>{node.data[opts.field]}<div className={styles.actions_popup}>
      <a href="#"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            navigate('/business-entities/edit/');
            return false;
          }}
          className={styles.btn_create}
        />
        <a
          href={`/business-entities/edit/${encodeURIComponent(node.key)}`}
          className={styles.btn_edit}
          onClick={(e) => { e.preventDefault(); navigate(`/business-entities/edit/${encodeURIComponent(node.key)}`); }}
        />
        <a
          href="#"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setDelBusinessEntityData({ id: node.key, name: node.data.name });
            setShowDelDlg(true);
          }}
          className={styles.btn_del}
        />
      </div></div>;
  };

  return (
    <div className={styles.page}>
      {loading ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('БИЗНЕС-СУЩНОСТИ')}`}</div>
          <div className={styles.wf_bnts}>
            <Button className={classNames(styles.btn_published, { [styles.active]: (wfStatus == 'PUBLISHED') })} onClick={() => setWfStatus('PUBLISHED')}>{i18n('Опубликованные')}</Button>
            <Button className={classNames(styles.btn_published, { [styles.active]: (wfStatus == 'DRAFT') })} onClick={() => setWfStatus('DRAFT')}>{i18n('Черновики')}</Button>
          </div>
          <button className={styles.btn_create2} onClick={() => { navigate("/business-entities/edit/"); }}></button>
          {data ? (
            <TreeTable value={data} className={styles.tree} tableStyle={{ minWidth: '50rem', marginTop: '30px' }} onRowClick={(e) => { if (e.node && e.node.data) doNavigate('/business-entities/edit/' + e.node.key, navigate); }}>
              <Column field="name" header={i18n('Название')} expander sortable body={columnBodyWithActions}></Column>
              <Column field="techName" header={i18n('Техническое название')} sortable body={columnBodyWithActions}></Column>
              <Column field="domainName" header={i18n('Домен')} sortable body={columnBodyWithActions}></Column>
              <Column field="altNames" header={i18n('Альтернативные наименования')} sortable body={columnBodyWithActions}></Column>
              <Column field="synonyms" header={i18n('Синонимы')} sortable body={columnBodyWithActions}></Column>
              <Column field="modified" header={i18n('Дата изменения')} sortable dataType='date' body={columnBodyWithActions}></Column>              
              <Column field="tags" header={i18n('Теги')} sortable body={columnBodyWithActions}></Column>
            </TreeTable>
          ) : (
            ''
          )}

          <DeleteObjectModal show={showDelDlg} objectTitle={delBusinessEntityData.name} onClose={() => { setShowDelDlg(false); return false; }} onSubmit={delDlgSubmit} />

        </>
      )}
    </div>
  );
}
