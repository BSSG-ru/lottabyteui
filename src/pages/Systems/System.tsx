/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useUrlState from '@ahooksjs/use-url-state';
import classNames from 'classnames';
import styles from './Systems.module.scss';
import { handleHttpError, i18n, getDomainDisplayValue, getDomainAutocompleteObjects, updateArtifactsCount, setDataModified, doNavigate, tagAddedHandler, tagDeletedHandler, loadEditPageData, rateClickedHandler, updateEditPageReadOnly, setBreadcrumbEntityName } from '../../utils';
import {
  getSystem,
  getSystemVersions,
  updateSystem,
  createSystem,
  getSystemTypes,
  getSystemVersion,
} from '../../services/pages/systems';
import { Tags, TagProp } from '../../components/Tags';
import { Versions, VersionData } from '../../components/Versions';
import { Tabs } from '../../components/Tabs';
import { Table } from '../../components/Table';
import {
  queriesTableColumns,
  assetsTableColumns,
  samplesTableColumns,
  entitiesTableColumns,
} from '../../mocks/systems';
import { FieldEditor } from '../../components/FieldEditor';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { ReactComponent as PlusInCircle } from '../../assets/icons/plus-in-circle.svg';
import { ReactComponent as Close } from '../../assets/icons/close.svg';
import { setRecentView } from '../../services/pages/recentviews';
import { WFItemControl } from '../../components/WFItemControl/WFItemControl';

export function System() {
  const [state, setState] = useUrlState({
    t: '1', p1: '1', p2: '1', p3: '1', p4: '1',
  }, { navigateMode: 'replace' });
  const [, setLoading] = useState(true);
  const [data, setData] = useState({
    entity: {
      name: null,
      system_type: '',
      description: '',
      domain_ids: [],
    },
    metadata: { id: '', artifact_type: 'system', version_id: '', tags: [], state: 'PUBLISHED', ancestor_draft_id: '' },
  });
  const [ratingData, setRatingData] = useState({ rating: 0, total_rates: 0 });
  const [ownRating, setOwnRating] = useState(0);
  const [versions, setVersions] = useState<VersionData[]>([]);
  const [tags, setTags] = useState<TagProp[]>([]);
  const [isCreateMode, setCreateMode] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const [systemTypes, setSystemTypes] = useState();

  const [isReadOnly, setReadOnly] = useState(true);
  const [isLoaded, setLoaded] = useState(false);

  const { id, version_id } = useParams();

  const [systemId, setSystemId] = useState<string>(id ?? '');
  const [systemVersionId, setSystemVersionId] = useState<string>(version_id ?? '');

  const navigate = useNavigate();

  const getSystemTypeDisplayValue = async (i: string) => {
    if (!i) return '';
    // @ts-ignore
    return systemTypes.get(i);
  };

  const getSystemType = async (search: string) => getSystemTypes().then((json) => {
    const res = [];
    const map = new Map();
    for (let i = 0; i < json.length; i += 1) {
      res.push({ id: json[i].id, name: json[i].description });
      map.set(json[i].id, json[i].description);
    }
    // @ts-ignore
    setSystemTypes(map);
    return res.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
  });

  const tabs = [
    {
      key: 'tab-log',
      title: i18n('ЛОГИЧЕСКИЕ ОБЪЕКТЫ'),
      content: (
        <Table
          cookieKey='sys-ents'
          key={"logObjTable" + systemId + (systemVersionId ? systemVersionId : '')}
          className={styles.table}
          columns={entitiesTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={systemId === '' ? '' : '/v1/entities/search'}
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p1 - 1) * 5,
            filters: [],
            filters_preset: [],
            filters_for_join: [
              {
                table: 'entity_to_system',
                column: 'system_id',
                value: `'${ systemVersionId ? data.metadata.ancestor_draft_id : systemId}'`,
                on_column: 'id',
                equal_column: 'entity_id',
                operator: 'EQUAL',
              },
            ],
          }}
          onRowClick={(row: any) => {
            navigate(`/logic-objects/edit/${encodeURIComponent(row.id)}`);
          }}
          showCreateBtn={false}
          onPageChange={(page: number) => {
            setState(() => ({ p1: page }));
          }}
        />
      ),
    },
    {
      key: 'tab-req',
      title: i18n('ЗАПРОСЫ'),
      content: (
        <Table
          cookieKey='sys-queries'
          key={"reqTable" + systemId + (systemVersionId ? systemVersionId : '')}
          className={styles.table}
          columns={queriesTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={systemId === '' ? '' : '/v1/queries/search'}
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p2 - 1) * 5,
            filters: [],
            filters_preset: [{ column: 'system_id', value: systemVersionId ? data.metadata.ancestor_draft_id : (systemId ?? ''), operator: 'EQUAL' }],
            filters_for_join: [],
          }}
          onRowClick={(row: any) => {
            navigate(`/queries/edit/${encodeURIComponent(row.id)}`);
          }}
          showCreateBtn={false}
          onPageChange={(page: number) => {
            setState(() => ({ p2: page }));
          }}
        />
      ),
    },
    {
      key: 'tab-samples',
      title: i18n('СЭМПЛЫ'),
      content: (
        <Table
          cookieKey='sys-samples'
          key={"samplesTable" + systemId + (systemVersionId ? systemVersionId : '')}
          className={styles.table}
          columns={samplesTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={systemId === '' ? '' : '/v1/samples/search'}
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p3 - 1) * 5,
            filters: [],
            filters_preset: [{ column: 'system_id', value: systemVersionId ? data.metadata.ancestor_draft_id : (systemId ?? ''), operator: 'EQUAL' }],
            filters_for_join: [],
          }}
          showCreateBtn={false}
          onRowClick={(row: any) => {
            navigate(`/samples/edit/${encodeURIComponent(row.id)}`);
          }}
          onPageChange={(page: number) => {
            setState(() => ({ p3: page }));
          }}
        />
      ),
    },
    {
      key: 'tab-act',
      title: i18n('АКТИВЫ'),
      content: (
        <Table
          cookieKey='sys-assets'
          key={"activesTable" + systemId + (systemVersionId ? systemVersionId : '')}
          className={styles.table}
          columns={assetsTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={systemId === '' ? '' : '/v1/data_assets/search'}
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p4 - 1) * 5,
            filters: [],
            filters_preset: [{ column: 'system_id', value: systemVersionId ? data.metadata.ancestor_draft_id : (systemId ?? ''), operator: 'EQUAL' }],
            filters_for_join: [],
          }}
          onRowClick={(row: any) => {
            navigate(`/data_assets/edit/${encodeURIComponent(row.id)}`);
          }}
          showCreateBtn={false}
          onPageChange={(page: number) => {
            setState(() => ({ p4: page }));
          }}
        />
      ),
    },
  ];

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

  useEffect(() => {
    if (id) setSystemId(id);
    setSystemVersionId(version_id ?? '');
    setDataModified(false);
  }, [id, version_id]);

  useEffect(() => {
    setCreateMode(systemId === '');
    if (systemId) {
      if (!systemVersionId) { setRecentView('system', systemId); }

      loadEditPageData(systemId, systemVersionId, setData, setTags, setLoading, setLoaded, getSystemVersion, getSystem, setRatingData,
        setOwnRating, getSystemVersions, setVersions, setReadOnly);
      
    } else {
      setData((prev) => ({ ...prev, metadata: { ...prev.metadata, state: 'DRAFT' } }));
      setReadOnly(false);
      setLoaded(true);
    }
  }, [systemId, systemVersionId]);

  useEffect(() => {
    if (isCreateMode) {
      if (data.entity.name && data.entity.system_type) {
        createSystem({
          name: data.entity.name,
          system_type: data.entity.system_type,
          description: data.entity.description,
        })
          .then((json) => {
            setDataModified(false);
            updateArtifactsCount();
            if (json.metadata.id) {
              setSystemId(json.metadata.id);
              window.history.pushState(
                {},
                '',
                `/systems/edit/${encodeURIComponent(json.metadata.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

  const addDomain = () => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, domain_ids: [...prev.entity.domain_ids, ''] } }));
  };

  const delDomain = (k: number) => {
    const arr: string[] = [...data.entity.domain_ids];
    arr.splice(k, 1);

    updateSystemField('domain_ids', arr.filter((x) => x));
  };

  const updateSystemDomainId = (k: number, id: string) => {
    const arr: string[] = [...data.entity.domain_ids];
    if (arr.length > k) { arr[k] = id; } else { arr.push(id); }

    updateSystemField('domain_ids', arr.filter((x) => x));
  };

  const updateSystemField = (field: string, value: string | string[]) => {
    if (systemId) {
      const d: any = {};
      d[field] = value;
      updateSystem(systemId, d)
        .then((json) => {
          setDataModified(false);
          if (json.metadata.id && json.metadata.id != systemId) {
            
            navigate(`/systems/edit/${encodeURIComponent(json.metadata.id)}`);
          } else {
            setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
          }
        })
        .catch(handleHttpError);
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
      setDataModified(false);
    }
  };

  return (
    <div className={classNames(styles.page, styles.systemPage, { [styles.loaded]: isLoaded })}>
      <div className={styles.mainContent}>
        {!systemVersionId && (
          <WFItemControl
            itemMetadata={data.metadata}
            itemIsReadOnly={isReadOnly}
            onEditClicked={() => { setReadOnly(false); }}
            onObjectIdChanged={(id:string) => {
              if (id) {
                setSystemId(id);
                window.history.pushState(
                  {},
                  '',
                  `/systems/edit/${encodeURIComponent(id)}`,
                );
              } else navigate('/systems/');
            }}
            onObjectDataChanged={(data:any) => {
              setData(data);
              setDataModified(false);
              setBreadcrumbEntityName(systemId, data.entity.name);
              setTags(data.metadata.tags ? data.metadata.tags.map((x: any) => ({ value: x.name })) : []);
              
              updateEditPageReadOnly(data, setReadOnly, () => {  setLoading(false); setLoaded(true); });
            }}
          />
        )}
        <div className={styles.title}>
          <FieldEditor
            isReadOnly={isReadOnly}
            labelPrefix={`${i18n('СИСТЕМА')}: `}
            defaultValue={data.entity.name}
            className={styles.title}
            valueSubmitted={(val) => {
              updateSystemField('name', val.toString());
            }}
            isRequired
            onBlur={(val) => {
              updateSystemField('name', val);
            }}
            showValidation={showValidation}
          />
        </div>
        {!isCreateMode && (
          <button className={styles.btn_scheme} onClick={() => { doNavigate('/systems-model/' + encodeURIComponent(systemId), navigate); }}>{i18n('Схема')}</button>
        )}
        <FieldAutocompleteEditor
          className={styles.long_input}
          label={i18n('Тип: ')}
          isReadOnly={isReadOnly}
          defaultValue={data.entity.system_type}
          valueSubmitted={(identity) => updateSystemField('system_type', identity)}
          getDisplayValue={getSystemTypeDisplayValue}
          getObjects={getSystemType}
          isRequired
          showValidation={showValidation}
        />
        {!isCreateMode && (
          <div className={styles.domains_wrap}>
          <div className={styles.domains_head}>
            <label>{`${i18n('Домены')}:`}</label>
            {!isReadOnly && (<PlusInCircle onClick={addDomain} />)}
          </div>
          {data.entity.domain_ids.map((sId, k) => (
            <div className={styles.domain_item} key={`dse${k}`}>
              <FieldAutocompleteEditor
                key={`se${k}`}
                className={styles.long_input}
                isReadOnly={isReadOnly}
                label=""
                defaultValue={sId}
                valueSubmitted={(identity) => updateSystemDomainId(k, identity)}
                getDisplayValue={getDomainDisplayValue}
                getObjects={getDomainAutocompleteObjects}
                artifactType='domain'
              />
              {!isReadOnly && (<Close key={`ds${k}`} onClick={() => delDomain(k)} />)}
            </div>
          ))}

        </div>
        )}

        {!isCreateMode && (
          <div className={styles.description}>
            <FieldEditor
              isReadOnly={isReadOnly}
              labelPrefix={`${i18n('Описание: ')} `}
              defaultValue={data.entity.description}
              className={styles.long_input}
              valueSubmitted={(val) => {
                updateSystemField('description', val.toString());
              }}
              isRequired
              onBlur={(val) => {
                updateSystemField('description', val);
              }}
            />
          </div>
        )}
        {!isCreateMode && (
          <Tags
            tags={tags}
            isReadOnly={isReadOnly}
            onTagAdded={(tagName: string) => tagAddedHandler(tagName, systemId, 'system', data.metadata.state ?? '', tags, setLoading, setTags, '/systems/edit/', navigate)}
            onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, systemId, 'system', data.metadata.state ?? '', setLoading, setTags, '/systems/edit/', navigate)}
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
              version_id={systemVersionId || data.metadata.version_id}
              versions={versions}
              version_url_pattern={`/systems/${encodeURIComponent(systemId)}/version/{version_id}`}
              root_object_url={`/systems/edit/${encodeURIComponent(systemId)}`}
              onRateClick={r => rateClickedHandler(r, systemId, 'system', setOwnRating, setRatingData)}
            />
          )}
        </div>
      )}

    </div>
  );
}
