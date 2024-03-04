/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import useUrlState from '@ahooksjs/use-url-state';
import classNames from 'classnames';
import styles from './Domains.module.scss';
import { doNavigate, handleHttpError, i18n, loadEditPageData, rateClickedHandler, setBreadcrumbEntityName, setDataModified, tagAddedHandler, tagDeletedHandler, updateArtifactsCount, updateEditPageReadOnly, uuid } from '../../utils';
import {
  createDomain,
  getDomain,
  getDomainVersions,
  updateDomain,
  deleteSystem,
  getDomainVersion,
} from '../../services/pages/domains';
import { Tags, TagProp } from '../../components/Tags';
import { Versions, VersionData } from '../../components/Versions';
import { Tabs } from '../../components/Tabs';
import { Table } from '../../components/Table';
import {
  systemsTableColumns,
  queriesTableColumns,
  assetsTableColumns,
  samplesTableColumns,
  entitiesTableColumns,
  indicatorsTableColumns,
  beTableColumns,
  prodTableColumns,
} from '../../mocks/systems';
import { FieldEditor } from '../../components/FieldEditor';
import { getSystemsUnlikedToDomain } from '../../services/pages/systems';
import { setRecentView } from '../../services/pages/recentviews';
import { WFItemControl } from '../../components/WFItemControl/WFItemControl';
import { Checkbox } from '../../components/Checkbox';

export function Domain() {
  const [state, setState] = useUrlState({
    t: '1', p1: '1', p2: '1', p3: '1', p4: '1', p5: '1', p6: '1', p7: '1', p8: '1',
  }, { navigateMode: 'replace' });
  const [, setLoading] = useState(true);

  const navigate = useNavigate();

  const [data, setData] = useState({
    entity: { name: null, description: '', system_ids: [] },
    metadata: { id: '', artifact_type: 'domain', version_id: '', tags: [], state: 'PUBLISHED', ancestor_draft_id: '', workflow_task_id: '' },
  });
  const [ratingData, setRatingData] = useState({ rating: 0, total_rates: 0 });
  const [ownRating, setOwnRating] = useState(0);
  const [versions, setVersions] = useState<VersionData[]>([]);
  const [tags, setTags] = useState<TagProp[]>([]);
  const [isCreateMode, setCreateMode] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const [isReadOnly, setReadOnly] = useState(true);
  const [isLoaded, setLoaded] = useState(false);

  const { id, version_id } = useParams();
  const [domainId, setDomainId] = useState<string>(id ?? '');
  const [domainVersionId, setDomainVersionId] = useState<string>(version_id ?? '');

  const [showAddSystemDlg, setShowAddSystemDlg] = useState(false);
  const [unlinkedSystemsList, setUnlinkedSystemsList] = useState([]);
  const [addSystemIds, setAddSystemIds] = useState<string[]>([]);

  const [showDelSystemDlg, setShowDelSystemDlg] = useState(false);
  const [delSystemData, setDelSystemData] = useState<any>({ id: '', name: '' });

  const tabs = [
    {
      key: 'tab-ind',
      title: i18n('ПОКАЗАТЕЛИ'),
      content: (
        <Table
          cookieKey='domain-indicators'
          key={`indicatorsTable${domainId}${domainVersionId || ''}${data ? data.entity.system_ids.length : ''}`}
          className={styles.table}
          columns={indicatorsTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={domainId === '' ? '' : `/v1/indicators/search_by_domain/${encodeURIComponent(domainVersionId ? data.metadata.ancestor_draft_id : domainId)}`}
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p6 - 1) * 5,
            filters: [],
            filters_preset: [],
            filters_for_join: [],
          }}
          showCreateBtn={false}
          onRowClick={(row: any) => {
            navigate(`/indicators/edit/${encodeURIComponent(row.id)}`);
          }}
          onPageChange={(page: number) => {
            setState(() => ({ p6: page }));
          }}
        />
      ),
    }, {
      key: 'tab-be',
      title: i18n('БИЗНЕС-СУЩНОСТИ'),
      content: (
        <Table
          cookieKey='domain-bes'
          key={`beTable${domainId}${domainVersionId || ''}${data ? data.entity.system_ids.length : ''}`}
          className={styles.table}
          columns={beTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={domainId === '' ? '' : '/v1/business_entities/search'}
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p7 - 1) * 5,
            filters: [],
            filters_preset: [{ column: 'domain_id', value: (domainVersionId ? data.metadata.ancestor_draft_id : (domainId ?? '')), operator: 'EQUAL' }],
            filters_for_join: [],
          }}
          showCreateBtn={false}
          onRowClick={(row: any) => {
            navigate(`/business-entities/edit/${encodeURIComponent(row.id)}`);
          }}
          onPageChange={(page: number) => {
            setState(() => ({ p7: page }));
          }}
        />
      ),
    }, {
      key: 'tab-prods',
      title: i18n('ПРОДУКТЫ'),
      content: (
        <Table
          cookieKey='domain-prods'
          key={`prodTable${domainId}${domainVersionId || ''}${data ? data.entity.system_ids.length : ''}`}
          className={styles.table}
          columns={prodTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={domainId === '' ? '' : '/v1/product/search'}
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p8 - 1) * 5,
            filters: [],
            filters_preset: [{ column: 'domain_id', value: (domainVersionId ? data.metadata.ancestor_draft_id : (domainId ?? '')), operator: 'EQUAL' }],
            filters_for_join: [],
          }}
          showCreateBtn={false}
          onRowClick={(row: any) => {
            navigate(`/products/edit/${encodeURIComponent(row.id)}`);
          }}
          onPageChange={(page: number) => {
            setState(() => ({ p8: page }));
          }}
        />
      ),
    },
    {
      key: 'tab-sys',
      title: i18n('СИСТЕМЫ'),
      content: (
        <Table
          cookieKey='domain-systems'
          key={`systemsTable${domainId}${domainVersionId || ''}${data ? data.entity.system_ids.length : ''}`}
          className={styles.table}
          columns={systemsTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={domainId === '' ? '' : '/v1/systems/search'}
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p1 - 1) * 5,
            filters: [],
            filters_preset: [],
            filters_for_join: [
              {
                table: 'system_to_domain',
                column: 'domain_id',
                value: `'${domainVersionId ? data.metadata.ancestor_draft_id : domainId}'`,
                on_column: 'id',
                equal_column: 'system_id',
                operator: 'EQUAL',
              },
            ],
          }}
          showCreateBtn={!domainVersionId}
          onRowClick={(row: any) => {
            navigate(`/systems/edit/${encodeURIComponent(row.id)}`);
          }}
          onCreateBtnClick={() => {
            setAddSystemIds([]);
            setShowAddSystemDlg(true);
            getSystemsUnlikedToDomain(domainVersionId ? data.metadata.ancestor_draft_id : domainId).then((json) => {
              setUnlinkedSystemsList(json.resources);
            });
            return false;
          }}
          onPageChange={(page: number) => {
            setState(() => ({ p1: page }));
          }}
        />
      ),
    },
    {
      key: 'tab-log',
      title: i18n('ЛОГИЧЕСКИЕ ОБЪЕКТЫ'),
      content: (
        <Table
          cookieKey='domain-ents'
          key={`logObjTable${domainId}${domainVersionId || ''}`}
          className={styles.table}
          columns={entitiesTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={
            domainId === '' ? '' : `/v1/entities/search_by_domain/${encodeURIComponent(domainVersionId ? data.metadata.ancestor_draft_id : domainId)}`
          }
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p2 - 1) * 5,
            filters: [],
            filters_preset: [],
            filters_for_join: [],
          }}
          onRowClick={(row: any) => {
            navigate(`/logic-objects/edit/${encodeURIComponent(row.id)}`);
          }}
          showCreateBtn={false}
          onPageChange={(page: number) => {
            setState(() => ({ p2: page }));
          }}
        />
      ),
    },
    {
      key: 'tab-req',
      title: i18n('ЗАПРОСЫ'),
      content: (
        <Table
          cookieKey='domain-queries'
          key={`reqTable${domainId}${domainVersionId || ''}`}
          className={styles.table}
          columns={queriesTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={
            domainId === '' ? '' : `/v1/queries/search_by_domain/${encodeURIComponent(domainVersionId ? data.metadata.ancestor_draft_id : domainId)}`
          }
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p3 - 1) * 5,
            filters: [],
            filters_preset: [],
            filters_for_join: [],
          }}
          onRowClick={(row: any) => {
            navigate(`/queries/edit/${encodeURIComponent(row.id)}`);
          }}
          showCreateBtn={false}
          onPageChange={(page: number) => {
            setState(() => ({ p3: page }));
          }}
        />
      ),
    },
    {
      key: 'tab-samples',
      title: i18n('СЭМПЛЫ'),
      content: (
        <Table
          cookieKey='domain-samples'
          key={`samplesTable${domainId}${domainVersionId || ''}`}
          className={styles.table}
          columns={samplesTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={
            domainId === '' ? '' : `/v1/samples/search_by_domain/${encodeURIComponent(domainVersionId ? data.metadata.ancestor_draft_id : domainId)}`
          }
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p4 - 1) * 5,
            filters: [],
            filters_preset: [],
            filters_for_join: [],
          }}
          showCreateBtn={false}
          onRowClick={(row: any) => {
            navigate(`/samples/edit/${encodeURIComponent(row.id)}`);
          }}
          onPageChange={(page: number) => {
            setState(() => ({ p4: page }));
          }}
        />
      ),
    },
    {
      key: 'tab-act',
      title: i18n('АКТИВЫ'),
      content: (
        <Table
          cookieKey='domain-assets'
          key={`activesTable${domainId}${domainVersionId || ''}`}
          className={styles.table}
          columns={assetsTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={domainId === '' ? '' : '/v1/data_assets/search'}
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p5 - 1) * 5,
            filters: [],
            filters_preset: [{ column: 'domain_id', value: (domainVersionId ? data.metadata.ancestor_draft_id : (domainId ?? '')), operator: 'EQUAL' }],
            filters_for_join: [],
          }}
          onRowClick={(row: any) => {
            navigate(`/data_assets/edit/${encodeURIComponent(row.id)}`);
          }}
          showCreateBtn={false}
          onPageChange={(page: number) => {
            setState(() => ({ p5: page }));
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    if (id) { setDomainId(id); }
    setDomainVersionId(version_id ?? '');
    setDataModified(true);
  }, [id, version_id]);

  const handleAddSystemDlgClose = () => {
    setShowAddSystemDlg(false);
    return false;
  };
  const handleDelSystemDlgClose = () => {
    setShowDelSystemDlg(false);
    return false;
  };

  const addSystemDlgSubmit = () => {
    setShowAddSystemDlg(false);
    setLoading(true);

    updateDomainField('system_ids', [...data.entity.system_ids, ...addSystemIds]);
  };

  const delSystemDlgSubmit = (identity: string) => {
    setShowDelSystemDlg(false);
    setLoading(true);
    deleteSystem(identity)
      .then(() => {
        setLoading(false);
      })
      .catch(handleHttpError);
    setDelSystemData({ id: '', name: '' });
  };

  useEffect(() => {
    setCreateMode(domainId === '');
    if (domainId) {
      if (!domainVersionId) { setRecentView('domain', domainId); }

      loadEditPageData(domainId, domainVersionId, setData, setTags, setLoading, setLoaded, getDomainVersion, getDomain,
        setRatingData, setOwnRating, getDomainVersions, setVersions, setReadOnly);
      
    } else {
      setData((prev) => ({ ...prev, metadata: { ...prev.metadata, state: 'DRAFT' } }));
      setReadOnly(false);
      setLoaded(true);
    }
  }, [domainId, domainVersionId]);

  useEffect(() => {
    if (isCreateMode) {
      if (data.entity.name) {
        createDomain({
          name: data.entity.name,
          description: data.entity.description,
        })
          .then((json) => {
            setDataModified(false);
            updateArtifactsCount();
            if (json.metadata.id) {
              setDomainId(json.metadata.id);
              window.history.pushState(
                {},
                '',
                `/domains/edit/${encodeURIComponent(json.metadata.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

  const updateDomainField = (field: string, value: string | string[]) => {
    if (domainId) {
      const d: any = {};
      d[field] = value;
      updateDomain(domainId, d)
        .then((json) => {
          if (json.metadata.id && json.metadata.id != domainId) {
            navigate(`/domains/edit/${encodeURIComponent(json.metadata.id)}`);
          }
          setDataModified(false);
        })
        .catch(handleHttpError);
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
      setDataModified(true);
    }
  };

  return (
    <div className={classNames(styles.page, styles.domainPage, { [styles.loaded]: isLoaded })}>
      <div className={styles.mainContent}>
        {!domainVersionId && (
          <WFItemControl
            key={`wfc-${uuid()}`}
            itemMetadata={data.metadata}
            itemIsReadOnly={isReadOnly}
            onEditClicked={() => { setReadOnly(false); }}
            onObjectIdChanged={(id) => {
              if (id) {
                setDomainId(id);
                window.history.pushState(
                  {},
                  '',
                  `/domains/edit/${encodeURIComponent(id)}`,
                );
              } else navigate('/domains/');
            }}
            onObjectDataChanged={(data) => {
              setData(data);
              setDataModified(false);
              setBreadcrumbEntityName(domainId, data.entity.name);
              setTags(data.metadata.tags ? data.metadata.tags.map((x: any) => ({ value: x.name })) : []);
              
              updateEditPageReadOnly(data, setReadOnly, () => {  setLoading(false); setLoaded(true); });
            }}
          />
        )}
        <div className={styles.title}>
          <FieldEditor
            isReadOnly={isReadOnly}
            labelPrefix={`${i18n('ДОМЕН')}: `}
            defaultValue={data.entity.name}
            className={styles.title}
            valueSubmitted={(val) => {
              updateDomainField('name', val.toString());
            }}
            isRequired
            onBlur={(val) => {
              updateDomainField('name', val);
            }}
            showValidation={showValidation}
          />
        </div>
        {!isCreateMode && (
          <button className={styles.btn_scheme} onClick={() => { doNavigate(`/domains-model/${encodeURIComponent(domainId)}`, navigate); }}>{i18n('Схема')}</button>
        )}
        {!isCreateMode && (
          <div className={styles.description}>
            <FieldEditor
              isReadOnly={isReadOnly}
              labelPrefix={`${i18n('Описание: ')} `}
              defaultValue={data.entity.description}
              className={styles.long_input}
              valueSubmitted={(val) => {
                updateDomainField('description', val.toString());
              }}
              isRequired
              onBlur={(val) => {
                updateDomainField('description', val);
              }}
            />
          </div>
        )}
        {!isCreateMode && (
          <Tags
            isReadOnly={isReadOnly}
            tags={tags}
            onTagAdded={(tagName: string) => tagAddedHandler(tagName, domainId, 'domain', data.metadata.state ?? '', tags, setLoading, setTags, '/domains/edit/', navigate)}
            onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, domainId, 'domain', data.metadata.state ?? '', setLoading, setTags, '/domains/edit/', navigate)}
          />
        )}
        {!isCreateMode && <Tabs tabs={tabs} tabNumber={state.t} onTabChange={(tab: number) => { setState(() => ({ t: tab })); }} />}
      </div>
      {!isCreateMode && (
        <div className={styles.rightBar}>
          {data.metadata.state == 'PUBLISHED' && (
            <Versions
              rating={ratingData.rating}
              ownRating={ownRating}
              version_id={domainVersionId || data.metadata.version_id}
              versions={versions}
              version_url_pattern={`/domains/${encodeURIComponent(domainId)}/version/{version_id}`}
              root_object_url={`/domains/edit/${encodeURIComponent(domainId)}`}
              onRateClick={r => rateClickedHandler(r, domainId, 'domain', setOwnRating, setRatingData)}
            />
          )}
        </div>
      )}

      <Modal
        show={showAddSystemDlg}
        backdrop={false}
        onHide={handleAddSystemDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Добавить системы</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.add_systems_list}>
            {unlinkedSystemsList.map((system: any) => (
              <div key={`sdiv-${system.metadata.id}`} className={styles.new_system_item}>
                <Checkbox
                  value={system.metadata.id}
                  label={system.entity.name}
                  className={styles.cb_add_system}
                  id={`cb-ns-${system.metadata.id}`}
                  checked={addSystemIds.filter((x) => x == system.id).length > 0}
                  onChange={(e) => { if (e.target.checked) setAddSystemIds((prev) => ([...prev, system.metadata.id])); else setAddSystemIds((prev) => prev.filter((x) => x != system.metadata.id)); }}
                />
              </div>
            ))}
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={addSystemDlgSubmit}
          >
            Добавить
          </Button>
          <Button
            variant="secondary"
            onClick={handleAddSystemDlgClose}
          >
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDelSystemDlg}
        backdrop={false}
        onHide={handleDelSystemDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Вы действительно хотите удалить
            {delSystemData.name}
            ?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body />
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => delSystemDlgSubmit(delSystemData.id)}
          >
            Удалить
          </Button>
          <Button
            variant="secondary"
            onClick={handleDelSystemDlgClose}
          >
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}
