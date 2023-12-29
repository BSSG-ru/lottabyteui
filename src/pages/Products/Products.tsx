/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import { doNavigate, getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { renderDate, Table, TableDataRequest } from '../../components/Table';
import { Loader } from '../../components/Loader';
import styles from './Products.module.scss';
import { useNavigate } from "react-router-dom";
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import { deleteProduct } from '../../services/pages/products';

export function Products() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loading, setLoading] = useState(false);
  const [data] = useState([]);

  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delProductData, setDelProductData] = useState<any>({ id: '', name: '' });

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
      property: 'domain_id',
      filter_property: 'domain.name',
      header: i18n('Домен'),
      render: (item: any) => <span>{item.domain_name}</span>,
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
      render: (row: any) => row.tags.join(', '),
    }
  ];

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    setLoading(true);
    deleteProduct(delProductData.id)
      .then(json => {
        updateArtifactsCount();
        setLoading(false);

        if (json.metadata && json.metadata.id)
          navigate('/products/edit/' + encodeURIComponent(json.metadata.id));
      })
      .catch(handleHttpError);
    setDelProductData({ id: '', name: '' });
  };

  const [limitSteward, setLimitSteward] = useState((window as any).limitStewardSwitch.getLimitSteward());

  useEffect(() => {
    window.addEventListener('limitStewardChanged', function (e) {
      setLimitSteward((e as any).limitSteward);
    })
  }, []);

  return (
    <div className={styles.page}>
      {loading ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('ПРОДУКТЫ')}`}</div>
          {data ? (
            <Table
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
              showCreateBtn
              onCreateBtnClick={() => {
                navigate("/products/edit/");
              }}
              renderActionsPopup={(row: any) => (
                <div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate('/products/edit/');
                      return false;
                    }}
                    className={styles.btn_create}
                  />
                  <a
                    href={`/products/edit/${encodeURIComponent(row.id)}`}
                    className={styles.btn_edit}
                    onClick={(e) => { e.preventDefault(); navigate(`/products/edit/${encodeURIComponent(row.id)}`); }}
                  />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDelProductData({ id: row.id, name: row.name });
                      setShowDelDlg(true);
                    }}
                    className={styles.btn_del}
                  />
                </div>
              )}
              onPageChange={(page: number) => (
                setState(() => ({ p: page }))
              )}
              onQueryChange={(query: string) => (
                setState(() => ({ p: undefined, q: query }))
              )}
            />
          ) : (
            ''
          )}
          
          <DeleteObjectModal show={showDelDlg} objectTitle={delProductData.name} onClose={() => { setShowDelDlg(false); return false; }} onSubmit={delDlgSubmit} />
        </>
      )}
    </div>
  );
}
