/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import styles from './DataAssets.module.scss';
import { doNavigate, getDomainAutocompleteObjects, getDomainDisplayValue, getDQRuleAutocompleteObjects, getDQRuleDisplayValue, getDQRuleSettings, getEntityDisplayValue, getSystemAutocompleteObjects, getSystemDisplayValue, getTablePageSize, handleHttpError, i18n, loadEditPageData, rateClickedHandler, setBreadcrumbEntityName, setCookie, setDataModified, tagAddedHandler, tagDeletedHandler, updateArtifactsCount, updateEditPageReadOnly, uuid } from '../../utils';
import {
  archiveDataAsset,
  deleteDataAsset,
  getAsset,
  getAssetVersion,
  getAssetVersions,
  restoreAssetVersion,
  restoreDataAsset,
  updateAsset,
} from '../../services/pages/dataAssets';
import { Tags, TagProp } from '../../components/Tags';

import { getEntities } from '../../services/pages/dataEntities';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import {
  CustomAttrDefinition,
  CustomAttributeEditor,
} from '../../components/CustomAttributeEditor';
import { getCustomAttrDefinitions } from '../../services/pages/customAttrs';
import { ReactComponent as PlusInCircle } from '../../assets/icons/plus-blue.svg';
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg';
import { AssetData, TData, TDQRule } from '../../types/data';
import { v4 } from 'uuid';
import { FieldCheckboxEditor } from '../../components/FieldCheckboxEditor';
import { RelatedObjectsControl } from '../../components/RelatedObjectsControl';
import { FieldVisualEditor } from '../../components/FieldVisualEditor';
import { EditPage } from '../../components/EditPage';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';

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
      short_description: '',
      custom_attributes: [],
      dq_rules: [],
      roles: '',
      tech_name: ''
    },
    metadata: { id: '', artifact_type: 'data_asset', version_id: '', tags: [], state: 'PUBLISHED', created_by: '' },
  });
  const [tags, setTags] = useState<TagProp[]>([]);
  const [customAttrDefinitions, setCustomAttrDefinitions] = useState<CustomAttrDefinition[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const [defaultSystemObjects, setDefaultSystemObjects] = useState([]);
  const [defaultEntityObjects, setDefaultEntityObjects] = useState([]);
  const [isReadOnly, setReadOnly] = useState(true);
  const [isLoaded, setLoaded] = useState(false);

  const { id, version_id } = useParams();
  const [assetId, setAssetId] = useState<string>(id ?? '');
  const [assetVersionId, setAssetVersionId] = useState<string>(version_id ?? '');

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
      limit: 1000,
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

  const updateAssetField = (field: string, value: string | string[] | [] | TDQRule[] | undefined) => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    setDataModified(true);
  };

  const updateAssetFields = (d: any) => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, ...d } }));
    setDataModified(true);
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

      /*updateAsset(assetId, newData.entity)
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
        .catch(handleHttpError);*/
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
    setDataModified(true);
  };

  return (
    <>
      <EditPage objectId={assetId} objectVersionId={assetVersionId} data={data} restoreVersion={restoreAssetVersion} urlSlug='data_assets' setData={setData} isReadOnly={isReadOnly} setReadOnly={setReadOnly}
        archiveObject={archiveDataAsset} artifactType='data_asset' setTags={setTags} getObjectVersion={getAssetVersion} getObjectVersions={getAssetVersions} getObject={getAsset} deleteObject={deleteDataAsset}
        restoreObject={restoreDataAsset} updateObject={updateAsset} onLoadDataComplete={() => {
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
        }} tabs={[
        {
          key: 'tab-gen',
          title: i18n('Сведения'),
          unscrollable: true,
          content: <div className={styles.tab_2col}>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Общая информация</h2>
              {data.metadata.state != 'ARCHIVED' && (
                <div>
                  <button className={styles.btn_scheme} onClick={() => { doNavigate(`/assets-model/${encodeURIComponent(assetId)}`, navigate); }}>{i18n('Смотреть схему')}</button>
                </div>
              )}

              <FieldTextEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Название')}
                  defaultValue={data.entity.name}
                  className=''
                  valueSubmitted={(val) => {
                    updateAssetField('name', val);
                  }}
                />

              <FieldAutocompleteEditor
                label={i18n('Домен')}
                defaultValue={data.entity.domain_id}
                valueSubmitted={(i) => updateAssetField('domain_id', i)}
                getDisplayValue={getDomainDisplayValue}
                getObjects={getDomainAutocompleteObjects}
                showValidation={showValidation}
                artifactType="domain"
                isReadOnly={isReadOnly}
                allowClear
              />

              <FieldTextareaEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Описание')}
                  defaultValue={data.entity.short_description}
                  valueSubmitted={(val) => {
                    updateAssetField('short_description', val ?? '');
                  }}
                />

              <div data-uitest="asset_tag" className={styles.tags_block}>
                <div className={styles.label}>{i18n('Теги')}</div>
                <Tags
                  key={'tags-' + assetId + '-' + assetVersionId + '-' + uuid()}
                  isReadOnly={isReadOnly}
                  tags={tags}
                  tagPrefix='#'
                  onTagAdded={(tagName: string) => tagAddedHandler(tagName, assetId, 'data_asset', data.metadata.state ?? '', tags, setLoading, setTags, '/data_assets/edit/', navigate)}
                  onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, assetId, 'data_asset', data.metadata.state ?? '', setLoading, setTags, '/data_assets/edit/', navigate)}
                />
              </div>
            </div>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Дополнительные параметры</h2>

              <FieldTextEditor
                isReadOnly={isReadOnly}
                label={i18n('Техническое название')}
                defaultValue={data.entity.tech_name}
                className={styles.editor}
                valueSubmitted={(val) => {
                  updateAssetField('tech_name', val);
                }}
              />
              
              <FieldAutocompleteEditor
                className="system_test_ui"
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

              <FieldAutocompleteEditor
                className="entity_test_ui"
                isReadOnly={isReadOnly}
                label={i18n('Модель')}
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
          
              <FieldTextEditor
                isReadOnly={isReadOnly}
                label={i18n('Ключевые роли процесса')}
                defaultValue={data.entity.roles}
                className={styles.editor}
                valueSubmitted={(val) => {
                  updateAssetField('roles', val);
                }}
              />

              

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
            </div>
          </div>
        },
        {
          key: 'tab-related',
          title: i18n('Связи'),
          content: <div className={styles.tab_white}>
            <RelatedObjectsControl artifactId={assetId} artifactType='data_asset'></RelatedObjectsControl>
          </div>
        },
        {
          key: 'tab-dq',
          title: i18n('Настройки качества'),
          content: (
            <div className={classNames(styles.dqrule_wrap, styles.tab_white)}>
                <div className={styles.dqrule_head}>
                  <label>{`${i18n('Правила проверки качества')}:`}</label>
                  {!isReadOnly && (<PlusInCircle onClick={addDQRule} />)}
                </div>
                {data.entity.dq_rules && data.entity.dq_rules.map((v, index) => (
                  <div key={`d${(v as TData).metadata.id ? (v as TData).metadata.id : uuid()}`} className={styles.dqrule_item}>
                    <FieldAutocompleteEditor
                      key={`se${(v as TData).metadata.id}`}
                      className={styles.col1}
                      isReadOnly={isReadOnly}
                      label={i18n('Правило')}
                      defaultValue={(v as TData).entity.dq_rule_id}
                      valueSubmitted={(val) => updateDQRuleField(index, (v as TData).metadata.id, 'dq_rule_id', val)}
                      getDisplayValue={getDQRuleDisplayValue}
                      getObjects={getDQRuleAutocompleteObjects}
                      artifactType="dq_rule"
                    />
                    <FieldTextEditor
                      key={`fe${(v as TData).metadata.id}`}
                      isReadOnly={isReadOnly}
                      label={i18n('Настройки')}
                      defaultValue={(v as TData).entity.settings}
                      className={styles.col2}
                      valueSubmitted={(val) => {
                        updateDQRuleField(index, (v as TData).metadata.id, 'settings', (val as string));
                      }}
                      isRequired
                      showValidation={showValidation}
                    />
                    <FieldCheckboxEditor
                      key={`ce1${(v as TData).metadata.id}`}
                      isReadOnly={isReadOnly}
                      label={i18n('Выключена')}
                      defaultValue={Boolean((v as TData).entity.disabled)}
                      className={styles.col3}
                      valueSubmitted={(val) => {
                        updateDQRuleField(index, (v as TData).metadata.id, 'disabled', String(val));
                      }}
                      isRequired
                      showValidation={showValidation}
                    />
                    <FieldCheckboxEditor
                      key={`ce2${(v as TData).metadata.id}`}
                      isReadOnly={isReadOnly}
                      label={i18n('Рассылать уведомления об ошибках')}
                      defaultValue={Boolean((v as TData).entity.send_mail)}
                      className={styles.col4}
                      valueSubmitted={(val) => {
                        updateDQRuleField(index, (v as TData).metadata.id, 'send_mail', String(val));
                      }}
                      isRequired
                      showValidation={showValidation}
                    />
                    {!isReadOnly && (
                      <div key={`d${(v as TData).metadata.id}`} className={styles.dqrule_close}>
                        <CloseIcon key={`fec${(v as TData).metadata.id}`} onClick={() => delDQRule(index, (v as TData).metadata.id)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
          )},
        {
          key: 'tab-desc',
          title: i18n('Расширенное описание'),
          content: <div className={styles.tab_transparent}>

            <FieldVisualEditor
                isReadOnly={isReadOnly}
                defaultValue={data.entity.description}
                className=''
                valueSubmitted={(val) => {
                  updateAssetField('description', val);
                }}
              />  
          
          </div>
        }
      ]} />
      </>
  )
}
