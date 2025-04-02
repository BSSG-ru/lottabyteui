/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import { useNavigate } from 'react-router-dom';
import styles from './BusinessEntity.module.scss';
import { doNavigate, getDomainAutocompleteObjects, getDomainDisplayValue, getTablePageSize, handleHttpError, i18n, updateArtifactsCount, uuid } from '../../utils';
import { Loader } from '../../components/Loader';
import { createBusinessEntity, deleteBusinessEntity, getBETree, getBusinessEntities } from '../../services/pages/businessEntities';
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import { TreeTable, TreeTableSortEvent } from 'primereact/treetable';
import { Column, ColumnBodyOptions } from 'primereact/column';
import { Button } from '../../components/Button';
import classNames from 'classnames';
import Cookies from 'js-cookie';
import { Input } from '../../components/Input';
import { ReactComponent as Filters } from '../../assets/icons/filters.svg';
import { FilterMatchMode } from 'primereact/api';
import { ModalDlg } from '../../components/ModalDlg';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import './style.css';
import { ReactComponent as Default } from '../../assets/icons/tables/arrow-default.svg';
import { ReactComponent as Asc } from '../../assets/icons/tables/arrow-asc.svg';
import { ReactComponent as Desc } from '../../assets/icons/tables/arrow-desc.svg';
import { addToFav, delFromFav } from '../../services/pages/userfav';

export function BusinessEntities() {
  const navigate = useNavigate();

  const ck_sort = Cookies.get('bes-sort');
  const [sortData, setSortData] = useState<any>(ck_sort ? JSON.parse(ck_sort) : {});

  
  const [wfStatus, setWfStatus] = useState('PUBLISHED');

  const ck = Cookies.get('tree-state-be');
  const [treeState, setTreeState] = useState<any>(ck ? JSON.parse(ck) : { global_search: '' });
  const [searchMode, setSearchMode] = useState(false);

  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loaded, setLoaded] = useState(true);
  const [data, setData] = useState([]);
  
  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delObjectData, setDelObjectData] = useState<any>({ id: '', name: '' });
  const [showCreateDlg, setShowCreateDlg] = useState(false);
  const [showCreateValidation, setShowCreateValidation] = useState(false);
  const [createData, setCreateData] = useState({ name: '', domain_id: '' });
  
  const delDlgSubmit = () => {
    setShowDelDlg(false);
    deleteBusinessEntity(delObjectData.id)
      .then((json) => {
        updateArtifactsCount();

        if (json.metadata && json.metadata.id) { navigate(`/business-entities/edit/${encodeURIComponent(json.metadata.id)}`); }
      })
      .catch(handleHttpError);
    setDelObjectData({ id: '', name: '' });
  };

  const submitCreate = () => {
    if (createData.name) {
      setShowCreateDlg(false);

      createBusinessEntity({...createData, domain_id: createData.domain_id ? createData.domain_id : null}).then(json => {
        if (json && json.metadata.id) {
          navigate(`/business-entities/edit/${encodeURIComponent(json.metadata.id)}`);
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

  const loadData = () => {
    getBETree({ filters: [], filters_for_join: [], global_query: treeState.global_search ?? '', sort: sortData.field ? (sortData.field + (sortData.order == -1 ? '-' : '+')) : 'name+', state: wfStatus }).then(json => {
      setData(json);
      setLoaded(true);
    });
  }

  useEffect(() => {

    Cookies.set('tree-state-be', JSON.stringify(treeState), { expires: 500 });

    loadData();
  }, [ wfStatus, sortData, treeState ]);

  useEffect(() => {
    Cookies.set('bes-sort', JSON.stringify(sortData), { expires: 500 });
  }, [ sortData ]);

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
                      setDelObjectData({ id: node.key, name: node.data.name });
                      setShowDelDlg(true);
                    }}
                    className={styles.btn_del}
                  />
        </div>
    );
  };

  const columnBodyDomain = (node: any, opts: ColumnBodyOptions) => {
    
    return <div className={styles.col_body}>

      {node.data.domain_name && (<span key={`dm-pill-${node.data.id}`} className={styles.pill}>{node.data.domain_name}</span>)}
      
    </div>;
  };

  const columnBodySynonyms = (node: any, opts: ColumnBodyOptions) => {
    
    return <div className={styles.col_body}>

      <div className={styles.pills}>{node.data[opts.field].split(', ').map((tag:any, i:number) => <span key={`syn-pill-${node.data['id']}-${i}`}>{tag ? (<span className={styles.pill}>{tag}</span>) : ('')}</span> )}</div>

    </div>;
  };

  const onFavClick = (node:any) => {
    if (node.data.is_in_fav) {
      delFromFav(node.key).then(() => {
        loadData();
      }).catch(handleHttpError);
    } else {
      addToFav(node.key, 'business_entity').then(() => {
        loadData();
      }).catch(handleHttpError);
    }
  }

  const columnBodyWithActions = (node: any, opts: ColumnBodyOptions) => {
    
    return <div className={styles.col_body}>

      <div className={styles.pills}>{node.data[opts.field].split(', ').map((tag:any, i:number) => <span key={`tag-pill-${node.data['id']}-${i}`}>{tag ? (<span className={styles.pill}>{tag}</span>) : ('')}</span> )}</div>

      <div className={styles.actions_popup}>
        
        <a
          href="#"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            doNavigate('/business-entities/edit/' + node.key, navigate);
          }}
          className={styles.btn_edit}
        />
        <a
          href="#"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setDelObjectData({ id: node.key, name: node.data.name });
            setShowDelDlg(true);
          }}
          className={styles.btn_del}
        />
      </div>
    </div>;
  };

  const paginatorTpl = { layout: 'CurrentPageReport PrevPageLink PageLinks NextPageLink RowsPerPageDropdown' };

  return (
    <div className={classNames(styles.page, styles.scrollable, { [styles.loaded]: loaded })}>
      {!loaded ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('Глоссарий')}`}<Button background='blue' onClick={() => { setShowCreateValidation(false); setShowCreateDlg(true); }}>Создать глоссарий</Button></div>
          
          <div className={styles.wf_btns}>
            <Button background='none' className={classNames(styles.btn_published, { [styles.active]: (wfStatus == 'PUBLISHED') })} onClick={() => setWfStatus('PUBLISHED')}>{i18n('Опубликованные')}</Button>
            <div className={styles.sep}></div>
            <Button background='none' className={classNames(styles.btn_published, { [styles.active]: (wfStatus == 'DRAFT') })} onClick={() => setWfStatus('DRAFT')}>{i18n('Черновики')}</Button>
            <div className={styles.sep}></div>
            <Button background='none' className={classNames(styles.btn_published, { [styles.active]: (wfStatus == 'ARCHIVED') })} onClick={() => setWfStatus('ARCHIVED')}>{i18n('Архивные')}</Button>
          </div>
          <div className={styles.tree_global_search}>
            <Input placeholder={i18n('Поиск')} className={styles.inp_search} type='text' defaultValue={treeState.global_search} findBtn onBlur={(e) => {
              setTreeState((prev:any) => ({...prev, global_search: e.target.value}));
            }} />

            <Button
                key={uuid()}
                background="none-blue"
                className={styles.button}
                onClick={() => {
                  setSearchMode((prev) => {
                    const nextState = !prev;
                    if (!nextState) {
                      //setTreeState((prev:any) => ({...prev, filters: []}));
                      /*setFetchRequest((prevouse) => ({
                        sort: prevouse.sort,
                        global_query: prevouse.global_query,
                        limit: prevouse.limit,
                        offset: prevouse.offset,
                        filters: [],
                        filters_for_join: prevouse.filters_for_join,
                        filters_preset: prevouse.filters_preset,
                        limit_steward: prevouse.limit_steward,
                        state: prevouse.state,
                      }));*/
                      
                    }
                    return nextState;
                  });
                }}
              >
                <Filters key={uuid()} />
                {i18n(searchMode ? i18n('Сбросить фильтры') : i18n('Добавить фильтр'))}
              </Button>
          </div>
          
          {data ? (
            <>
              

              <TreeTable key={uuid()} value={data} sortField={sortData.field ? sortData.field : ''} sortOrder={sortData.order ? sortData.order : ''} sortIcon={(opts) => { if (opts.sorted && opts.sortOrder == 1) return <Asc />; else if (opts.sorted && opts.sortOrder == -1) return <Desc/>; else return <Default />;}}
                onSort={(e:TreeTableSortEvent) => { setSortData({ field: e.sortField, order: e.sortOrder }) }} className={styles.tree} tableStyle={{ minWidth: '50rem', marginTop: '30px' }} 
                onRowClick={(e) => { if (e.node && e.node.data) doNavigate('/business-entities/edit/' + e.node.key, navigate); }}
                paginator rows={getTablePageSize()} paginatorClassName='paginator' paginatorDropdownAppendTo='self' rowsPerPageOptions={[5,10,25,50]} paginatorTemplate={paginatorTpl} >
                <Column field="name" header={i18n('Название')} expander sortable filter={searchMode} filterMatchMode={FilterMatchMode.CONTAINS} filterPlaceholder={i18n('фильтр')}></Column>
                <Column field="tech_name" header={i18n('Техническое название')} sortable filter={searchMode} filterMatchMode={FilterMatchMode.CONTAINS} filterPlaceholder={i18n('фильтр')}></Column>
                <Column field="domain_name" header={i18n('Домен')} sortable body={columnBodyDomain} filter={searchMode} filterMatchMode={FilterMatchMode.CONTAINS} filterPlaceholder={i18n('фильтр')}></Column>
                <Column field="alt_names" header={i18n('Альтернативные наименования')} sortable filter={searchMode} filterMatchMode={FilterMatchMode.CONTAINS} filterPlaceholder={i18n('фильтр')}></Column>
                <Column field="synonyms" header={i18n('Синонимы')} body={columnBodySynonyms} sortable filter={searchMode} filterMatchMode={FilterMatchMode.CONTAINS} filterPlaceholder={i18n('фильтр')}></Column>
                <Column field="modified" header={i18n('Дата изменения')} sortable dataType='date' filter={searchMode} filterMatchMode={FilterMatchMode.CONTAINS} filterPlaceholder={i18n('фильтр')}></Column>              
                <Column field="tags" header={i18n('Теги')} sortable body={columnBodyWithActions} filter={searchMode} filterMatchMode={FilterMatchMode.CONTAINS} filterPlaceholder={i18n('фильтр')}></Column>
              </TreeTable>
            </>
          ) : (
            ''
          )}

          <DeleteObjectModal show={showDelDlg} objectTitle={delObjectData.name} onClose={() => { setShowDelDlg(false); return false; }} onSubmit={delDlgSubmit} />
          <ModalDlg show={showCreateDlg} title={i18n('Создать глоссарий')} cancelBtnText={i18n('Отменить')} submitBtnText={i18n('Создать')} onClose={() => setShowCreateDlg(false)} dialogClassName={styles.dlg_create} onSubmit={submitCreate}>
            <div className={styles.fields}>
                <FieldTextEditor label={i18n('Название актива')} isRequired showValidation={showCreateValidation} className='' defaultValue='' valueSubmitted={(v) => setCreateData((prev) => ({...prev, name: v ?? ''}))} />

                <FieldAutocompleteEditor
                  label={i18n('Домен')}
                  defaultValue=''
                  valueSubmitted={(v) => setCreateData((prev) => ({...prev, domain_id: v ?? ''}))}
                  getDisplayValue={getDomainDisplayValue}
                  getObjects={getDomainAutocompleteObjects}
                  showValidation={showCreateValidation}
                  artifactType='domain'
                />

            </div>
          </ModalDlg>

        </>
      )}
    </div>
  );
}
