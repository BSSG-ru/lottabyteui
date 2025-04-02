/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import { getDomainAutocompleteObjects, getDomainDisplayValue, getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { renderDate, Table, TableDataRequest } from '../../components/Table';
import { Loader } from '../../components/Loader';
import styles from './Products.module.scss';
import { useNavigate } from "react-router-dom";
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import { createProduct, deleteProduct } from '../../services/pages/products';
import classNames from 'classnames';
import { Button } from '../../components/Button';
import { ModalDlg } from '../../components/ModalDlg';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';

export function Products() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loaded, setLoaded] = useState(true);

  const [showDelDlg, setShowDelDlg] = useState(false);
  const [showCreateDlg, setShowCreateDlg] = useState(false);
  const [showCreateValidation, setShowCreateValidation] = useState(false);
  const [createData, setCreateData] = useState({ name: '', domain_id: '' });
  const [delProductData, setDelProductData] = useState<any>({ id: '', name: '' });

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
      property: 'domain_id',
      filter_property: 'domain.name',
      header: i18n('Домен'),
      render: (row: any) => <>{row.domain_name && (<span key={`dm-pill-${row.id}`} className={styles.pill}>{row.domain_name}</span>)}</>,
    },
    {
      property: 'product_type',
      filter_property: 'product_types',
      sortDisabled: true,
      header: i18n('Тип продукта'),
      render: (row: any) => {
        return row.product_types.map((s:any) => { return s.name; }).join(', ');
      },
    },
    {
      property: 'modified',
      header: i18n('Дата'),
      render: (row: any) => renderDate(row, 'modified'),
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
      width: '200px'
    }
  ];

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    deleteProduct(delProductData.id)
      .then(json => {
        updateArtifactsCount();

        if (json.metadata && json.metadata.id)
          navigate('/products/edit/' + encodeURIComponent(json.metadata.id));
      })
      .catch(handleHttpError);
    setDelProductData({ id: '', name: '' });
  };

  const submitCreate = () => {
    if (createData.name && createData.domain_id) {
      setShowCreateDlg(false);

      createProduct(createData).then(json => {
        if (json && json.metadata.id) {
          navigate(`/products/edit/${encodeURIComponent(json.metadata.id)}`);
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
          <div className={styles.title}>{`${i18n('Продукты')}`}<Button background='blue' onClick={() => { setShowCreateValidation(false); setShowCreateDlg(true); }}>Создать продукт</Button></div>
          
            <Table
              artifactType='product'
              cookieKey='products'
              className={styles.table}
              columns={columns}
              paginate
              columnSearch
              globalSearch
              dataUrl="/v1/product/search"
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
                navigate(`/products/edit/${encodeURIComponent(row.id)}`);
              }}
              onEditClicked={(row:any) => { navigate(`/products/edit/${encodeURIComponent(row.id)}`); }}
              
              onDeleteClicked={(row: any) => {
                setDelProductData({ id: row.id, name: row.name });
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
          
          <DeleteObjectModal show={showDelDlg} objectTitle={delProductData.name} onClose={() => { setShowDelDlg(false); return false; }} onSubmit={delDlgSubmit} />
          <ModalDlg show={showCreateDlg} title={i18n('Создать продукт')} cancelBtnText={i18n('Отменить')} submitBtnText={i18n('Создать')} onClose={() => setShowCreateDlg(false)} dialogClassName={styles.dlg_create} onSubmit={submitCreate}>
            <div className={styles.fields}>
                <FieldTextEditor label={i18n('Название продукта')} isRequired showValidation={showCreateValidation} className='' defaultValue='' valueSubmitted={(v) => setCreateData((prev) => ({...prev, name: v ?? ''}))} />
                <FieldAutocompleteEditor className='' label={i18n('Домен')} defaultValue={undefined}
                  valueSubmitted={(v) => setCreateData((prev) => ({...prev, domain_id: v ?? ''}))}
                  getDisplayValue={getDomainDisplayValue}
                  getObjects={getDomainAutocompleteObjects}
                  showValidation={showCreateValidation} isRequired
                  artifactType="domain"
                />                
            </div>
          </ModalDlg>
        </>
      )}
    </div>
  );
}
