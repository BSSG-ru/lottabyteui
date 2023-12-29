/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import { doNavigate, getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { renderDate, Table, TableDataRequest } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { deleteEntity } from '../../services/pages/dataEntities';
import styles from './LogicObjects.module.scss';
import { useNavigate } from "react-router-dom";
import { DeleteObjectModal } from '../../components/DeleteObjectModal';

export function LogicObjects() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loading, setLoading] = useState(false);
  const [data] = useState([]);

  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delLogicObjectData, setDelLogicObjectData] = useState<any>({ id: '', name: '' });

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
      property: 'system',
      header: i18n('Системы'),
      sortDisabled: true,
      filterDisabled: false,
      filter_property: 'systems',
      render: (row: any) => {
        return row.systems.map((s:any) => { return s.name; }).join(', ');
      },
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
      render: (row: any) => row.tags.join(', '),
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
    setLoading(true);
    deleteEntity(delLogicObjectData.id)
      .then(json => {
        updateArtifactsCount();
        setLoading(false);

        if (json.metadata && json.metadata.id)
          navigate('/logic-objects/edit/' + encodeURIComponent(json.metadata.id));
      })
      .catch(handleHttpError);
    setDelLogicObjectData({ id: '', name: '' });
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
          <div className={styles.title}>{`${i18n('ЛОГИЧЕСКИЕ ОБЪЕКТЫ')}`}</div>
          {data ? (
            <Table
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
              showCreateBtn
              onCreateBtnClick={() => {
                navigate("/logic-objects/edit/");
              }}
              renderActionsPopup={(row: any) => (
                <div>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      navigate('/logic-objects/edit/');
                      return false;
                    }}
                    className={styles.btn_create}
                  />
                  <a
                    href={`/logic-objects/edit/${encodeURIComponent(row.id)}`}
                    className={styles.btn_edit}
                    onClick={(e) => { e.preventDefault(); navigate(`/logic-objects/edit/${encodeURIComponent(row.id)}`); }}
                  />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setDelLogicObjectData({ id: row.id, name: row.name });
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
          
          <DeleteObjectModal show={showDelDlg} objectTitle={delLogicObjectData.name} onClose={() => { setShowDelDlg(false); return false; }} onSubmit={delDlgSubmit} />
        </>
      )}
    </div>
  );
}
