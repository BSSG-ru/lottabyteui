/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import useUrlState from '@ahooksjs/use-url-state';
import styles from './DataAssets.module.scss';
import { doNavigate, getDomainAutocompleteObjects, getDomainDisplayValue, getDQRuleAutocompleteObjects, getDQRuleDisplayValue, getDQRuleSettings, getEntityDisplayValue, getSystemAutocompleteObjects, getSystemDisplayValue, getTablePageSize, handleHttpError, i18n, loadEditPageData, rateClickedHandler, setBreadcrumbEntityName, setDataModified, tagAddedHandler, tagDeletedHandler, updateArtifactsCount, updateEditPageReadOnly, uuid } from '../../utils';
import {
  createDataAsset,
  getAsset,
  getAssetVersion,
  getAssetVersions,
  updateAsset,
} from '../../services/pages/dataAssets';
import { Tags, TagProp } from '../../components/Tags';
import { Versions, VersionData } from '../../components/Versions';

import { FieldEditor } from '../../components/FieldEditor';
import { getEntities } from '../../services/pages/dataEntities';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import {
  CustomAttrDefinition,
  CustomAttributeEditor,
} from '../../components/CustomAttributeEditor';
import { getCustomAttrDefinitions } from '../../services/pages/customAttrs';
import { setRecentView } from '../../services/pages/recentviews';
import { WFItemControl } from '../../components/WFItemControl/WFItemControl';
import { Table } from '../../components/Table';
import { attributesTableColumns, samplesTableColumns } from '../../mocks/logic_objects';
import { Tabs } from '../../components/Tabs';
import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';
import { ReactComponent as PlusInCircle } from '../../assets/icons/plus-in-circle.svg';
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg';
import { AssetData, TData, TDQRule } from '../../types/data';
import { v4 } from 'uuid';
import { FieldCheckboxEditor } from '../../components/FieldCheckboxEditor';
import { userInfoRequest } from '../../services/auth';

export function DataAsset() {
  const navigate = useNavigate();
  const [, setLoading] = useState(true);
  const [data, setData] = useState<AssetData>({
    entity: {
      name: '',
      domain_id: '',
      system_id: null,
      entity_id: null,
      description: '',
      custom_attributes: [],
      dq_rules: [],
      roles: ''
    },
    metadata: { id: '', artifact_type: 'data_asset', version_id: '', tags: [], state: 'PUBLISHED' },
  });
  const [ratingData, setRatingData] = useState({ rating: 0, total_rates: 0 });
  const [ownRating, setOwnRating] = useState(0);
  const [versions, setVersions] = useState<VersionData[]>([]);
  const [tags, setTags] = useState<TagProp[]>([]);
  const [customAttrDefinitions, setCustomAttrDefinitions] = useState<CustomAttrDefinition[]>([]);
  const [isCreateMode, setCreateMode] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const [defaultSystemObjects, setDefaultSystemObjects] = useState([]);
  const [defaultEntityObjects, setDefaultEntityObjects] = useState([]);
  const [isReadOnly, setReadOnly] = useState(true);
  const [isLoaded, setLoaded] = useState(false);

  const { id, version_id } = useParams();
  const [assetId, setAssetId] = useState<string>(id ?? '');
  const [assetVersionId, setAssetVersionId] = useState<string>(version_id ?? '');

  const [state, setState] = useUrlState({
    t: '1', p1: '1', p2: '1',
  }, { navigateMode: 'replace' });

  const tabs = [
    {
      key: 'tab-log',
      title: i18n('АТРИБУТЫ'),
      content: (
        <Table
          cookieKey='asset-attrs'
          key={id + (version_id ?? '')}
          className={styles.table}
          columns={attributesTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={
            data.entity.entity_id ? `/v1/entities/search_attributes_by_entity_id/${encodeURIComponent(data.entity.entity_id)}` : ''
          }
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: getTablePageSize(),
            offset: (state.p1 - 1) * getTablePageSize(),
            filters: [],
            filters_preset: [],
            filters_for_join: [],
          }}
          showCreateBtn={false}
          onPageChange={(page: number) => {
            setState(() => ({ p1: page }));
          }}
        />
      ),
    },
    {
      key: 'tab-samples',
      title: i18n('СЭМПЛЫ'),
      content: (
        <Table
          cookieKey='asset-samples'
          key={`samplesTable${data.entity.entity_id}${version_id ?? ''}`}
          className={styles.table}
          columns={samplesTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={(data.entity.entity_id && data.entity.system_id) ? '/v1/samples/search' : ''}
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p2 - 1) * 5,
            filters: [],
            filters_preset: [
              { column: 'entity_id', value: data.entity.entity_id ?? '00000000-0000-0000-0000-000000000000', operator: 'EQUAL' },
              { column: 'system_id', value: data.entity.system_id ?? '00000000-0000-0000-0000-000000000000', operator: 'EQUAL' },
            ],
            filters_for_join: [],
          }}
          onRowClick={(row: any) => {
            navigate(`/samples/edit/${encodeURIComponent(row.id)}`);
          }}
          showCreateBtn={false}
          onPageChange={(page: number) => {
            setState(() => ({ p2: page }));
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    if (id) setAssetId(id);
    setAssetVersionId(version_id ?? '');
    setDataModified(false);
  }, [id, version_id]);

  const getEntityObjects = async (search: string) => {
    const filtersForJoin = data.entity.domain_id
      ? [
        {
          table: 'entity_to_system',
          column: 'system_id',
          value: data.entity.system_id
            ? `'${data.entity.system_id}'`
            : "'00000000-0000-0000-0000-000000000000'",
          on_column: 'id',
          equal_column: 'entity_id',
          operator: 'EQUAL',
        },
      ]
      : [];
    return getEntities({
      sort: 'name+',
      global_query: search,
      limit: 10,
      offset: 0,
      filters: [],
      filters_for_join: filtersForJoin,
    }).then((json) => json.items);
  };

  useEffect(() => {
    getSystemAutocompleteObjects('').then((items) => setDefaultSystemObjects(items));
  }, [data.entity.domain_id]);

  useEffect(() => {
    getEntityObjects('').then((items) => setDefaultEntityObjects(items));
  }, [data.entity.system_id]);

  const loadAssetData = () => {
    loadEditPageData(assetId, assetVersionId, setData, setTags, setLoading, setLoaded, getAssetVersion, getAsset, setRatingData, setOwnRating, getAssetVersions, setVersions, setReadOnly, () => {
      getCustomAttrDefinitions('data_asset')
      .then((json) => {
        setCustomAttrDefinitions(
          json.resources.map((item: any) => ({
            id: item.metadata.id,
            name: item.entity.name,
            type: item.entity.type,
            multiple_values: item.entity.multiple_values,
            minimum: item.entity.minimum,
            maximum: item.entity.maximum,
            min_length: item.entity.min_length,
            max_length: item.entity.max_length,
            def_elements: item.entity.def_elements
              ? item.entity.def_elements.map((elem: any) => ({ id: elem.id, name: elem.name }))
              : [],
          })),
        );
      })
      .catch(handleHttpError);
    });
    
  };

  useEffect(() => {
    setCreateMode(assetId === '');

    if (assetId) {
      if (!assetVersionId) { setRecentView('data_asset', assetId); }

      loadAssetData();
    } else {

      userInfoRequest().then(resp => {
        resp.json().then(data => {
          setData((prev) => ({ ...prev, metadata: { ...prev.metadata, state: 'DRAFT' }, entity: { ...prev.entity, domain_id: data.user_domains ? data.user_domains[0] : null} }));
          setDataModified(false);
          setReadOnly(false);
          setLoaded(true);
        });
      });

    }
  }, [assetId, assetVersionId]);

  useEffect(() => {
    if (isCreateMode) {
      if (data.entity.name && data.entity.domain_id) {
        createDataAsset({
          name: data.entity.name,
          description: data.entity.description,
          domain_id: data.entity.domain_id,
          system_id: data.entity.system_id,
          entity_id: data.entity.entity_id,
        })
          .then((json) => {
            setDataModified(false);
            updateArtifactsCount();
            if (json.metadata.id) {
              setAssetId(json.metadata.id);
              window.history.pushState(
                {},
                '',
                `/data_assets/edit/${encodeURIComponent(json.metadata.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

  const updateAssetField = (field: string, value: string | string[] | [] | TDQRule[]) => {
    if (assetId) {
      const d: any = {};
      if (typeof value !== 'string' && !Array.isArray(value)) { d[field] = JSON.stringify(value); } else { d[field] = value; }
      updateAsset(assetId, d)
        .then((json) => {
          setDataModified(false);
          if (json.metadata.id && json.metadata.id != assetId) {
            navigate(`/data_assets/edit/${encodeURIComponent(json.metadata.id)}`);
          } else { setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } })); }
        })
        .catch((err) => { handleHttpError(err); loadAssetData(); });
        
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
      setDataModified(false);
    }
  };

  const updateAssetFields = (d: any) => {
    if (assetId) {
      updateAsset(assetId, d)
        .then((json) => {
          setDataModified(false);
          if (json.metadata.id && json.metadata.id != assetId) {
            navigate(`/data_assets/edit/${encodeURIComponent(json.metadata.id)}`);
          } else { setData((prev: any) => ({ ...prev, entity: { ...prev.entity, ...d } })); }
        })
        .catch(handleHttpError);
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, ...d } }));
    }
  };

  const customAttributeValueChanged = (attr: any, value: any[]) => {
    if (assetId) {
      const customAttributes = data.entity.custom_attributes.map((custom_attr: any) => {
        if (attr.id === custom_attr.custom_attribute_definition_id) {
          return {
            ...custom_attr,
            values: value.map((s) => ({ value: attr.type === 'Enumerated' ? { id: s } : s })),
          };
        }
        return custom_attr;
      });

      if (
        customAttributes.find((item: any) => item.custom_attribute_definition_id === attr.id)
        == null
      ) {
        const newAttrData = {
          custom_attribute_definition_id: attr.id,
          name: attr.name,
          object_id: assetId,
          object_type: 'data_asset',
          values: [],
        };
        switch (attr.type) {
          case 'Numeric':
            (newAttrData.values as any[]).push({
              value: value.length > 0 ? parseFloat(value[0]) : null,
            });
            break;
          case 'Date':
            (newAttrData.values as any[]).push({ value: value.length > 0 ? value[0] : null });
            break;
          case 'Enumerated':
            (newAttrData as any).values = value.map((identity) => ({ value: { id: identity } }));

            break;
          default:
            (newAttrData.values as any[]).push({ value: value.length > 0 ? value[0] : null });
        }
        customAttributes.push(newAttrData);
      }

      const newData: AssetData = {
        ...data,
        entity: {
          ...data.entity,
          custom_attributes: customAttributes as [],
        },
      };

      setData(newData);

      updateAsset(assetId, newData.entity)
        .then((json) => {
          if (json.metadata.id && json.metadata.id != assetId) {
            navigate(`/data_assets/edit/${encodeURIComponent(json.metadata.id)}`);
          } else { data.metadata.version_id = json.metadata.version_id; }

          getAssetVersions(assetId)
            .then((jsonInner) => {
              setVersions(
                jsonInner.resources.map((x: any) => ({
                  name: x.entity.name,
                  description: x.entity.description,
                  version_id: x.metadata.version_id,
                  created_at: new Date(x.metadata.created_at).toLocaleString(),
                })),
              );
            })
            .catch(handleHttpError);
        })
        .catch(handleHttpError);
    }
  };

  const addDQRule = () => {
    setData((prev: any) => ({
      ...prev,
      entity: {
        ...prev.entity,
        dq_rules: [...prev.entity.dq_rules, {
          entity: {
            id: '',
            asset_id: assetId,
            dq_rule_id: '',
            settings: '',
            disabled: 'false',
            send_mail: 'true',
          },
          metadata: {
            id: '',
          },
        }],
      },
    }));
  };

  const delDQRule = (index: number, ruleId: string) => {
    if (ruleId !== '') {
      const arr: TDQRule[] = [...data.entity.dq_rules];
      arr.splice(index, 1);
      updateAssetField('dq_rules', arr);
    }
  };

  const updateDQRuleField = async (index: number, rowId: string, field: string, value: string) => {
    if (rowId !== '') {
      (data.entity.dq_rules[index] as TData).entity[field as keyof TDQRule] = value;
      updateAssetField('dq_rules', data.entity.dq_rules);

    } else {
      const uid = v4();
      (data.entity.dq_rules[index] as TData).entity.disabled = 'false';
      (data.entity.dq_rules[index] as TData).entity.send_mail = 'true';
      if (field === 'dq_rule_id') {
        (data.entity.dq_rules[index] as TData).entity.dq_rule_id = value;
        const s = await getDQRuleSettings(value);
        (data.entity.dq_rules[index] as TData).entity.settings = s;
      } else {
        (data.entity.dq_rules[index] as TData).entity[field as keyof TDQRule] = value;
      }
      (data.entity.dq_rules[index] as TData).entity.id = uid;
      (data.entity.dq_rules[index] as TData).metadata.id = uid;
      updateAssetField('dq_rules', data.entity.dq_rules);
    }
    setDataModified(false);
  };

  return (
    <div className={classNames(styles.page, styles.dataAssetPage, { [styles.loaded]: isLoaded })}>
      <div className={styles.mainContent}>
        {!assetVersionId && (
          <WFItemControl
            key={`wfc-${uuid()}`}
            itemMetadata={data.metadata}
            itemIsReadOnly={isReadOnly}
            onEditClicked={() => { setReadOnly(false); }}
            onObjectIdChanged={(id) => {
              if (id) {
                setAssetId(id);
                window.history.pushState(
                  {},
                  '',
                  `/data_assets/edit/${encodeURIComponent(id)}`,
                );
              } else navigate('/data_assets/');
            }}
            onObjectDataChanged={(d) => {
              setData(d);
              setDataModified(false);
              setBreadcrumbEntityName(assetId, d.entity.name);
              setTags(d.metadata.tags ? d.metadata.tags.map((x: any) => ({ value: x.name })) : []);
              updateEditPageReadOnly(d, setReadOnly, () => {  setLoading(false); setLoaded(true); });
            }}
          />
        )}
        <div className={styles.title}>
          <FieldEditor
            isReadOnly={isReadOnly}
            labelPrefix={`${i18n('АКТИВ')}: `}
            defaultValue={data.entity.name}
            className={styles.title}
            valueSubmitted={(val) => {
              updateAssetField('name', val.toString());
            }}
            isRequired
            showValidation={showValidation}
          />
        </div>
        {!isCreateMode && (
          <button className={styles.btn_scheme} onClick={() => { doNavigate(`/assets-model/${encodeURIComponent(assetId)}`, navigate); }}>{i18n('Схема')}</button>
        )}
        {!isCreateMode && (
          <Tags
            tags={tags}
            isReadOnly={isReadOnly}
            onTagAdded={(tagName: string) => tagAddedHandler(tagName, assetId, 'data_asset', data.metadata.state ?? '', tags, setLoading, setTags, '/data_assets/edit/', navigate)}
            onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, assetId, 'data_asset', data.metadata.state ?? '', setLoading, setTags, '/data_assets/edit/', navigate)}
          />
        )}

        {!isCreateMode && (
            <div className={styles.description}>
              <FieldTextareaEditor 
                isReadOnly={isReadOnly}
                labelPrefix={i18n('Описание')}
                isMultiline
                defaultValue={data.entity.description}
                className={styles.editor}
                valueSubmitted={(val) => {
                  updateAssetField('description', val as string);
                }}
              />
              
            </div>
          )}

        <div className={styles.general_data}>
          
          <div className={styles.data_row}>
            <FieldAutocompleteEditor
              className=""
              isReadOnly={isReadOnly}
              label={i18n('Домен')}
              defaultValue={data.entity.domain_id}
              valueSubmitted={(identity) => {
                updateAssetFields({ domain_id: identity, system_id: null, entity_id: null });
              }}
              getDisplayValue={getDomainDisplayValue}
              getObjects={getDomainAutocompleteObjects}
              artifactType="domain"
              allowClear
              isRequired
              showValidation={showValidation}
            />
          </div>
          <div className={styles.data_row}>
            <FieldAutocompleteEditor
              className=""
              isReadOnly={isReadOnly}
              label={i18n('Система')}
              defaultValue={data.entity.system_id}
              defaultOptions={defaultSystemObjects}
              valueSubmitted={(identity) => {
                updateAssetFields({ system_id: identity, entity_id: null });
              }}
              getDisplayValue={getSystemDisplayValue}
              getObjects={getSystemAutocompleteObjects}
              artifactType="system"
              allowClear
            />
          </div>
          <div className={styles.data_row}>
            <FieldAutocompleteEditor
              className=""
              isReadOnly={isReadOnly}
              label={i18n('Логический объект')}
              defaultValue={data.entity.entity_id}
              defaultOptions={defaultEntityObjects}
              valueSubmitted={(identity) => {
                updateAssetField('entity_id', identity);
              }}
              getDisplayValue={getEntityDisplayValue}
              getObjects={getEntityObjects}
              artifactType="entity"
              allowClear
            />
          </div>
          {!isCreateMode && (
            <div className={styles.data_row}>
              <FieldEditor
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${i18n('Ключевые роли процесса')} `}
                defaultValue={data.entity.roles}
                className={styles.editor}
                valueSubmitted={(val) => {
                  updateAssetField('roles', val.toString());
                }}
              />
            </div>
          )}
        </div>

        {!isCreateMode && (
          <div className={styles.dqrule_wrap}>
            <div className={styles.dqrule_head}>
              <label>{`${i18n('Правила проверки качества')}:`}</label>
              {!isReadOnly && (<PlusInCircle onClick={addDQRule} />)}
            </div>
            {data.entity.dq_rules && data.entity.dq_rules.map((v, index) => (
              <div key={`d${(v as TData).metadata.id}`} className={styles.dqrule_item}>
                <FieldAutocompleteEditor
                  key={`se${(v as TData).metadata.id}`}
                  className={styles.long_input}
                  isReadOnly={isReadOnly}
                  label=""
                  defaultValue={(v as TData).entity.dq_rule_id}
                  valueSubmitted={(val) => updateDQRuleField(index, (v as TData).metadata.id, 'dq_rule_id', val)}
                  getDisplayValue={getDQRuleDisplayValue}
                  getObjects={getDQRuleAutocompleteObjects}
                  artifactType="dq_rule"
                />
                <FieldEditor
                  key={`fe${(v as TData).metadata.id}`}
                  isReadOnly={isReadOnly}
                  labelPrefix={`${i18n('Настройки')}: `}
                  defaultValue={(v as TData).entity.settings}
                  className={styles.long_input}
                  valueSubmitted={(val) => {
                    updateDQRuleField(index, (v as TData).metadata.id, 'settings', (val as string));
                  }}
                  isRequired
                  isMultiline
                  onBlur={(val) => {
                    updateDQRuleField(index, (v as TData).metadata.id, 'settings', (val as string));
                  }}
                  showValidation={showValidation}
                />
                <FieldCheckboxEditor
                  key={`ce1${(v as TData).metadata.id}`}
                  isReadOnly={isReadOnly}
                  labelPrefix={i18n('Выключена')}
                  defaultValue={Boolean((v as TData).entity.disabled)}
                  className=""
                  layout="separated"
                  valueSubmitted={(val) => {
                    updateDQRuleField(index, (v as TData).metadata.id, 'disabled', String(val));
                  }}
                  isRequired
                  showValidation={showValidation}
                />
                <FieldCheckboxEditor
                  key={`ce2${(v as TData).metadata.id}`}
                  isReadOnly={isReadOnly}
                  labelPrefix={i18n('Рассылать уведомления об ошибках')}
                  defaultValue={Boolean((v as TData).entity.send_mail)}
                  className=""
                  layout="separated"
                  valueSubmitted={(val) => {
                    updateDQRuleField(index, (v as TData).metadata.id, 'send_mail', String(val));
                  }}
                  isRequired
                  showValidation={showValidation}
                />
                <div key={`d${(v as TData).metadata.id}`} className={styles.dqrule_close}>
                  <CloseIcon key={`fec${(v as TData).metadata.id}`} onClick={() => delDQRule(index, (v as TData).metadata.id)} />
                </div>
              </div>
            ))}

          </div>
        )}

        {!isCreateMode && (
          <div className={styles.custom_attributes_data}>
            {customAttrDefinitions.map((attr: any) => {
              const assetAttr:[]|undefined = data.entity.custom_attributes.find(
                (item: any) => item.custom_attribute_definition_id === attr.id,
              );
              const vals = (assetAttr == null || typeof assetAttr == 'undefined')
                ? []
                : (assetAttr as any).values
                  .filter((x: any) => x.value)
                  .map((x: any) => {
                    if (x.value) {
                      if (x.value.id) return x.value.id;
                      return x.value;
                    }
                    return x;
                  });
              return (
                <CustomAttributeEditor
                  key={attr.id}
                  isReadOnly={isReadOnly}
                  label={attr.name}
                  defaultValue={vals}
                  custom_attr_definition={attr}
                  onChanged={(v: any[]) => {
                    customAttributeValueChanged(attr, v);
                  }}
                />
              );
            })}
          </div>
        )}

        {!isCreateMode && <Tabs tabs={tabs} tabNumber={state.t} onTabChange={(tab: number) => { setState(() => ({ t: tab })); }} />}
      </div>
      <div className={styles.rightBar}>
        {!isCreateMode && data.metadata.state == 'PUBLISHED' && (
          <Versions
            rating={ratingData.rating}
            ownRating={ownRating}
            version_id={assetVersionId || data.metadata.version_id}
            versions={versions}
            version_url_pattern={`/data_assets/${encodeURIComponent(assetId)}/version/{version_id}`}
            root_object_url={`/data_assets/edit/${encodeURIComponent(assetId)}`}
            onRateClick={r => rateClickedHandler(r, assetId, 'data_asset', setOwnRating, setRatingData)}
          />
        )}
      </div>
    </div>
  );
}
