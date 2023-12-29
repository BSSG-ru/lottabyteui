/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import useUrlState from '@ahooksjs/use-url-state';
import classNames from 'classnames';
import { RawDraftContentState } from 'draft-js';
import { v4 } from 'uuid';
import styles from './Indicators.module.scss';
import { doNavigate, getArtifactUrl, getDQRuleAutocompleteObjects, getDQRuleDisplayValue, getDQRuleSettings, getDomainAutocompleteObjects, getDomainDisplayValue, handleHttpError, i18n, setDataModified, updateArtifactsCount, getTablePageSize, uuid, getDataTypeDisplayValue, getDataTypeAutocompleteObjects, getBusinessEntityDisplayValue, loadEditPageData, tagAddedHandler, tagDeletedHandler, rateClickedHandler, updateEditPageReadOnly, setBreadcrumbEntityName } from '../../utils';
import { Versions, VersionData } from '../../components/Versions';
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg';
import { ReactComponent as PlusInCircle } from '../../assets/icons/plus-in-circle.svg';
import { FieldEditor } from '../../components/FieldEditor';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import {
  createIndicator,
  deleteIndicator,
  getIndicator,
  getIndicatorVersions,
  getIndicatorVersion,
  updateIndicator,
  getIndicatorTypes,
  getIndicatorType,
} from '../../services/pages/indicators';

import { setRecentView } from '../../services/pages/recentviews';
import { WFItemControl } from '../../components/WFItemControl/WFItemControl';
import { FieldArrayEditor } from '../../components/FieldArrayEditor/FieldArrayEditor';
import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { getAsset, searchAssets } from '../../services/pages/dataAssets';
import { TagProp, Tags } from '../../components/Tags';
import { IndicatorData, TData, TDQRule } from '../../types/data';
import { FieldCheckboxEditor } from '../../components/FieldCheckboxEditor/FieldCheckboxEditor';
import { Table } from '../../components/Table';
import { ReactComponent as Close } from '../../assets/icons/close.svg';
import { entitiesTableColumns, productsTableColumns } from '../../mocks/systems';
import { getBusinessEntities } from '../../services/pages/businessEntities';
import { userInfoRequest } from '../../services/auth';

export function Indicator() {
  const navigate = useNavigate();

  const [state, setState] = useUrlState({
    t: '1', p1: '1', p2: '1', p3: '1', p4: '1',
  }, { navigateMode: 'replace' });
  const [, setLoading] = useState(true);

  const [data, setData] = useState<IndicatorData>({
    metadata: { id: '', artifact_type: 'indicator', version_id: '', tags: [], state: 'PUBLISHED', published_id: '' },
    entity: {
      name: '', description: '', calc_code: '', dq_checks: [], formula: '', domain_id: null, indicator_type_id: 'de96bd1f-27d1-4f5b-b45e-47fcb16dc7b7', data_asset_ids: [], dq_rules: [],
      examples: '', link: '', datatype_id: null, limits: '', limits_internal: '', roles: '', term_link_ids: []
    },
  });
  const [ratingData, setRatingData] = useState({ rating: 0, total_rates: 0 });
  const [ownRating, setOwnRating] = useState(0);
  const [versions, setVersions] = useState<VersionData[]>([]);

  const [selectedDataAssetNames, setSelectedDataAssetNames] = useState<any[]>([]);

  const [isCreateMode, setCreateMode] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const [isReadOnly, setReadOnly] = useState(true);
  const [isLoaded, setLoaded] = useState(false);

  const { id, version_id } = useParams();

  const [indicatorId, setIndicatorId] = useState<string>(id ?? '');
  const [indicatorVersionId, setIndicatorVersionId] = useState<string>(version_id ?? '');
  const [tags, setTags] = useState<TagProp[]>([]);

  const [showAddEntityDlg, setShowAddIndicatorDlg] = useState(false);
  const [newEntityData, setNewIndicatorData] = useState<any>({
    name: '',
    description: '',
    system_ids: [],
  });

  const [showDelIndicatorDlg, setShowDelIndicatorDlg] = useState(false);
  const [delIndicatorData, setDelIndicatorData] = useState<any>({ id: '', name: '' });

  const tabs = [
    {
      key: 'tab-prods',
      title: i18n('ПРОДУКТЫ'),
      content: (
        <Table
          key={id + (version_id ?? '')}
          className={styles.table}
          columns={productsTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={
            (data.entity.name) ? '/v1/product/search' : ''
          }
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: getTablePageSize(),
            offset: (state.p3 - 1) * getTablePageSize(),
            filters: [],
            filters_preset: [],
            filters_for_join: [
              {
                table: 'reference',
                column: 'target_id',
                value: `'${id}'`,
                on_column: 'id',
                equal_column: 'source_id',
                operator: 'EQUAL',
              },
            ],
          }}
          onRowClick={(row: any) => {
            navigate(`/products/edit/${encodeURIComponent(row.id)}`);
          }}
          showCreateBtn={false}
          onPageChange={(page: number) => {
            setState(() => ({ p3: page }));
          }}
        />
      ),
    },
    {
      key: 'tab-entities',
      title: i18n('ЛОГИЧЕСКИЕ ОБЪЕКТЫ'),
      content: (
        <Table
          key={`entityTable${data.metadata.id}${version_id ?? ''}`}
          className={styles.table}
          columns={entitiesTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={(data.metadata.id) ? `/v1/entities/search_by_indicator/${encodeURIComponent(data.metadata.id)}` : ''}
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p4 - 1) * 5,
            filters: [],
            filters_preset: [],
            filters_for_join: [],
          }}
          onRowClick={(row: any) => {
            navigate(`/logic-objects/edit/${encodeURIComponent(row.id)}`);
          }}
          showCreateBtn={false}
          onPageChange={(page: number) => {
            setState(() => ({ p4: page }));
          }}
        />
      ),
    },
  ];

  const handleAddEntityDlgClose = () => {
    setShowAddIndicatorDlg(false);
    return false;
  };
  const handleDelEntityDlgClose = () => {
    setShowDelIndicatorDlg(false);
    return false;
  };

  const getDataAssetOptions = async (search: string) => searchAssets({ filters: [], filters_for_join: [], global_query: search, limit: 15, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

  const addIndicatorDlgSubmit = () => {
    setShowAddIndicatorDlg(false);
    setLoading(true);
    createIndicator(newEntityData)
      .then(() => {
        setLoading(false);
        updateArtifactsCount();
      })
      .catch(handleHttpError);
    setNewIndicatorData({ name: '', description: '' });
  };

  const delEntityDlgSubmit = (identity: string) => {
    setShowDelIndicatorDlg(false);
    setLoading(true);
    deleteIndicator(identity)
      .then(() => {
        setLoading(false);
      })
      .catch(handleHttpError);
    setDelIndicatorData({ id: '', name: '' });
  };

  useEffect(() => {
    if (id) setIndicatorId(id);
    setIndicatorVersionId(version_id ?? '');
    setDataModified(false);
  }, [id, version_id]);

  const loadIndicatorData = () => {
    loadEditPageData(indicatorId, indicatorVersionId, setData, setTags, setLoading, setLoaded, getIndicatorVersion, 
      getIndicator, setRatingData, setOwnRating, getIndicatorVersions, setVersions, setReadOnly);
    
  };

  useEffect(() => {
    setCreateMode(indicatorId === '');
    if (indicatorId) {
      if (!indicatorVersionId) { setRecentView('indicator', indicatorId); }

      loadIndicatorData();
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
  }, [indicatorId, indicatorVersionId]);

  useEffect(() => {
    if (isCreateMode) {
      if (data.entity.name && data.entity.indicator_type_id && data.entity.description && data.entity.domain_id) {
        createIndicator({
          name: data.entity.name,
          description: data.entity.description,
          domain_id: data.entity.domain_id,
          indicator_type_id: data.entity.indicator_type_id,
        })
          .then((json) => {
            setDataModified(false);
            if (json.metadata.id) {
              updateArtifactsCount();
              setIndicatorId(json.metadata.id);
              window.history.pushState(
                {},
                '',
                `/indicators/edit/${encodeURIComponent(json.metadata.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

  useEffect(() => {
    getIndicatorTypes().then((json) => {
      const map = new Map();
      for (let i = 0; i < json.length; i += 1) {
        map.set(json[i].id, json[i].name);
      }
    }).catch(handleHttpError);
  }, []);

  useEffect(() => {
    const a = [];
    for (let i = 0; i < data.entity.data_asset_ids.length; i++) { a.push(''); }
    setSelectedDataAssetNames(a);

    data.entity.data_asset_ids.forEach((id, index) => {
      getAsset(id).then((json) => {
        setSelectedDataAssetNames((prev) => ([...prev.slice(0, index), `<a href="${getArtifactUrl(json.metadata.id, 'data_asset')}">${json.entity.name}</a>`, ...prev.slice(index + 1)]));
      }).catch(handleHttpError);
    });
  }, [data.entity.data_asset_ids]);

  const getIndicatorTypeObj = async (search: string) => getIndicatorTypes().then((json) => {
    const res = [];
    const map = new Map();
    for (let i = 0; i < json.length; i += 1) {
      res.push({ id: json[i].id, name: json[i].name });
      map.set(json[i].id, json[i].name);
    }
    return res.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
  });

  const getIndicatorTypeDisplayValue = async (i: string) => {
    if (!i) return '';

    return getIndicatorType(i).then((json: any) => {
      if (json && json.name) return json.name;
      return '';
    }).catch(handleHttpError);
  };

  const updateIndicatorField = (field: string, value: string | string[] | RawDraftContentState | [] | TDQRule[]) => {
    if (indicatorId) {
      const d: any = {};
      if (typeof value !== 'string' && !Array.isArray(value)) { d[field] = JSON.stringify(value); } else { d[field] = value; }
      updateIndicator(indicatorId, d)
        .then((json) => {
          setDataModified(false);
          if (json.metadata.id && json.metadata.id !== indicatorId) {
            navigate(`/indicators/edit/${encodeURIComponent(json.metadata.id)}`);
          } else { setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } })); }
        })
        .catch((err) => { handleHttpError(err); loadIndicatorData(); });
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
      setDataModified(false);
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
            indicator_id: indicatorId,
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
      updateIndicatorField('dq_rules', arr);
    }
  };

  const updateDQRuleField = async (index: number, rowId: string, field: string, value: string) => {
    if (rowId !== '') {
      (data.entity.dq_rules[index] as TData).entity[field as keyof TDQRule] = value;
      updateIndicatorField('dq_rules', data.entity.dq_rules);

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
      updateIndicatorField('dq_rules', data.entity.dq_rules);
    }
    setDataModified(false);
  };

  const addTermLink = () => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, term_link_ids: [...prev.entity.term_link_ids, ''] } }));
  };

  const delTermLink = (k: number) => {
    const arr: string[] = [...data.entity.term_link_ids];
    arr.splice(k, 1);

    updateIndicatorField('term_link_ids', arr.filter((x) => x));
  };

  const updateTermLink = (k: number, id: string) => {
    const arr: string[] = [...data.entity.term_link_ids];
    if (arr.length > k) { arr[k] = id; } else { arr.push(id); }

    updateIndicatorField('term_link_ids', arr.filter((x) => x));
  };

  const getTermLinkObjects = async (search: string) => getBusinessEntities({
    sort: 'name+',
    global_query: search,
    limit: 10,
    offset: 0,
    filters: [...data.entity.term_link_ids, data.metadata.id, data.metadata.published_id ?? ''].filter((id) => id).map((id) => ({ column: 'id', value: id, operator: 'NOT_EQUAL' })),
    filters_for_join: [],
    state: 'PUBLISHED',
  }).then((json) => json.items);

  return (
    <div className={classNames(styles.page, styles.indicatorPage, { [styles.loaded]: isLoaded })}>
      <div className={styles.mainContent}>
        {!indicatorVersionId && (
          <WFItemControl
            key={`wfc-${uuid()}`}
            itemMetadata={data.metadata}
            itemIsReadOnly={isReadOnly}
            onEditClicked={() => { setReadOnly(false); }}
            onObjectIdChanged={(localIndicatorId) => {
              if (localIndicatorId) {
                setIndicatorId(localIndicatorId);
                window.history.pushState(
                  {},
                  '',
                  `/indicators/edit/${encodeURIComponent(localIndicatorId)}`,
                );
              } else navigate('/indicators/');
            }}
            onObjectDataChanged={(data) => {
              setData(data);
              setDataModified(false);
              setBreadcrumbEntityName(indicatorId, data.entity.name);
              setTags(data.metadata.tags ? data.metadata.tags.map((x: any) => ({ value: x.name })) : []);
              
              updateEditPageReadOnly(data, setReadOnly, () => {  setLoading(false); setLoaded(true); });
            }}
          />
        )}

        <div className={styles.title}>
          <FieldEditor
            isReadOnly={isReadOnly}
            labelPrefix={`${i18n('ПОКАЗАТЕЛЬ')}: `}
            defaultValue={data.entity.name}
            className={styles.title}
            valueSubmitted={(val) => {
              updateIndicatorField('name', val.toString());
            }}
            isRequired
            onBlur={(val) => {
              updateIndicatorField('name', val);
            }}
            showValidation={showValidation}
          />
        </div>

        {!isCreateMode && (
          <button className={styles.btn_scheme} onClick={() => { doNavigate(`/indicators-model/${encodeURIComponent(indicatorId)}`, navigate); }}>{i18n('Схема')}</button>

        )}

        {!isCreateMode && (
          <Tags
            tags={tags}
            isReadOnly={isReadOnly}
            onTagAdded={(tagName: string) => tagAddedHandler(tagName, indicatorId, 'indicator', data.metadata.state ?? '', tags, setLoading, setTags, '/indicators/edit/')}
            onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, indicatorId, 'indicator', data.metadata.state ?? '', setLoading, setTags, '/indicators/edit/')}
          />
        )}

        <FieldAutocompleteEditor
          className={styles.long_input}
          label={i18n('Тип: ')}
          isReadOnly={isReadOnly}
          defaultValue={data.entity.indicator_type_id}
          valueSubmitted={(identity) => updateIndicatorField('indicator_type_id', identity)}
          getDisplayValue={getIndicatorTypeDisplayValue}
          getObjects={getIndicatorTypeObj}
          isRequired
          showValidation={showValidation}
        />

        {!isCreateMode && (
          <div className={styles.data_row}>
            <FieldEditor
              isReadOnly={isReadOnly}
              layout="separated"
              labelPrefix={`${i18n('Код')} `}
              defaultValue={data.entity.calc_code}
              className={styles.editor}
              valueSubmitted={(val) => {
                updateIndicatorField('calc_code', val.toString());
              }}
            />
          </div>
        )}
        
          <div className={styles.data_row}>
            <FieldTextareaEditor
              isReadOnly={isReadOnly}
              labelPrefix={`${i18n('Описание')}`}
              isMultiline
              isRequired
              showValidation={showValidation}
              defaultValue={data.entity.description}
              className={styles.editor}
              valueSubmitted={(val) => {
                updateIndicatorField('description', val);
              }}

            />
          </div>
        

          <div className={styles.domain}>
            <FieldAutocompleteEditor
              className={styles.long_input}
              label={`${i18n('Домен')}: `}
              allowClear
              defaultValue={data.entity.domain_id}
              valueSubmitted={(i) => updateIndicatorField('domain_id', i)}
              getDisplayValue={getDomainDisplayValue}
              getObjects={getDomainAutocompleteObjects}
              isRequired
              showValidation={showValidation}
              artifactType="domain"
              isReadOnly={isReadOnly}
            />
          </div>

        {!isCreateMode && (
          <div className={styles.data_row}>
            <FieldEditor
              isReadOnly={isReadOnly}
              layout="separated"
              labelPrefix={`${i18n('Примеры значений')} `}
              defaultValue={data.entity.examples}
              className={styles.editor}
              valueSubmitted={(val) => {
                updateIndicatorField('examples', val.toString());
              }}
            />
          </div>
        )}
        {!isCreateMode && (
          <div className={styles.data_row}>
            <FieldEditor
              isReadOnly={isReadOnly}
              layout="separated"
              labelPrefix={`${i18n('Ссылка на справочник')} `}
              defaultValue={data.entity.link}
              className={styles.editor}
              valueSubmitted={(val) => {
                updateIndicatorField('link', val.toString());
              }}
            />
          </div>
        )}
        {!isCreateMode && (
          <div className={styles.data_row}>
            <FieldAutocompleteEditor
              className={styles.editor}
              label={i18n('Тип данных')}
              defaultValue={data.entity.datatype_id}
              valueSubmitted={(i) => updateIndicatorField('datatype_id', i)}
              getDisplayValue={getDataTypeDisplayValue}
              getObjects={getDataTypeAutocompleteObjects}
              showValidation={showValidation}
              artifactType="datatype"
              isReadOnly={isReadOnly}
              allowClear
            />
          </div>
          )}
          {!isCreateMode && (
            <div className={styles.data_row}>
              <FieldEditor
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${i18n('Законодательные ограничения')} `}
                defaultValue={data.entity.limits}
                className={styles.editor}
                valueSubmitted={(val) => {
                  updateIndicatorField('limits', val.toString());
                }}
              />
            </div>
          )}
          {!isCreateMode && (
            <div className={styles.data_row}>
              <FieldEditor
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${i18n('Внутренние ограничения')} `}
                defaultValue={data.entity.limits_internal}
                className={styles.editor}
                valueSubmitted={(val) => {
                  updateIndicatorField('limits_internal', val.toString());
                }}
              />
            </div>
          )}
          {!isCreateMode && (
            <div className={styles.data_row}>
              <FieldEditor
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${i18n('Ключевые роли процесса')} `}
                defaultValue={data.entity.roles}
                className={styles.editor}
                valueSubmitted={(val) => {
                  updateIndicatorField('roles', val.toString());
                }}
              />
            </div>
          )}
          {!isCreateMode && (
            <div className={classNames(styles.data_row, styles.synonyms_row)}>
              <div className={styles.synonyms_head}>
                <label>{`${i18n('Ссылки на другие Термины')}:`}</label>
                {!isReadOnly && (<PlusInCircle onClick={addTermLink} />)}
              </div>
              {(data.entity.term_link_ids ?? []).map((sId, k) => (
                <div key={`si22${k}-${sId}`} className={styles.synonym_item}>
                  <FieldAutocompleteEditor
                    key={`se22${k}`}
                    className={styles.long_input}
                    isReadOnly={isReadOnly}
                    label=""
                    defaultValue={sId}
                    valueSubmitted={(identity) => updateTermLink(k, identity)}
                    getDisplayValue={getBusinessEntityDisplayValue}
                    getObjects={getTermLinkObjects}
                  />
                  {!isReadOnly && (<Close key={`ds22${k}`} onClick={() => delTermLink(k)} />)}
                </div>
              ))}
            </div>

        )}

        {!isCreateMode && (
          <div className={styles.data_row}>
            <FieldArrayEditor
              isReadOnly={isReadOnly}
              layout="separated"
              labelPrefix={`${i18n('Проверка')}`}
              defaultValue={data.entity.dq_checks}
              className={styles.editor}
              valueSubmitted={(val) => {
                updateIndicatorField('dq_checks', val);
              }}
              isRequired
              showValidation={showValidation}
              addBtnText={i18n('Добавить проверку')}
              inputPlaceholder={i18n('Введите проверку')}
            />
          </div>
        )}
        {!isCreateMode && (
          <div className={styles.data_row}>
            <FieldArrayEditor
              key={`ed-dass-${indicatorId}`}
              getOptions={getDataAssetOptions}
              isReadOnly={isReadOnly}
              layout="separated"
              labelPrefix={`${i18n('Активы')}: `}
              className={styles.long_input}
              defaultValue={selectedDataAssetNames}
              inputPlaceholder={i18n('Выберите актив')}
              addBtnText={i18n('Добавить')}
              valueSubmitted={() => { updateIndicatorField('data_asset_ids', data.entity.data_asset_ids); }}
              onValueIdAdded={(id: string) => {
                setData((prev) => ({ ...prev, entity: { ...prev.entity, data_asset_ids: [...prev.entity.data_asset_ids, id] } }));
              }}
              onValueIdRemoved={(id: string) => {
                const arr = [...data.entity.data_asset_ids];
                arr.splice(parseInt(id), 1);
                setData((prev) => ({ ...prev, entity: { ...prev.entity, data_asset_ids: arr } }));
              }}
            />
          </div>
        )}
        {!isCreateMode && (
          <div className={styles.date_row}>
            <FieldEditor key={`feFormula${data.metadata.id ?? ''}`} isReadOnly={isReadOnly} layout="separated" labelPrefix="Формула" isDraftJS mentionParameter={indicatorId} className="" defaultValue={data.entity.formula} valueSubmitted={(v) => { updateIndicatorField('formula', v); }} />
          </div>
        )}

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
      </div>
      {!isCreateMode && (
        <div className={styles.rightBar}>
          {data.metadata.state === 'PUBLISHED' && (
            <Versions
              rating={ratingData.rating}
              ownRating={ownRating}
              version_id={indicatorVersionId || data.metadata.version_id}
              versions={versions}
              version_url_pattern={`/indicators/${encodeURIComponent(indicatorId)}/version/{version_id}`}
              root_object_url={`/indicators/edit/${encodeURIComponent(indicatorId)}`}
              onRateClick={r => rateClickedHandler(r, indicatorId, 'indicator', setOwnRating, setRatingData)}
            />
          )}
        </div>
      )}

      <Modal
        show={showAddEntityDlg}
        backdrop={false}
        onHide={handleAddEntityDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Создание нового индикатора</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Input
            label={i18n('Название')}
            value={newEntityData.name}
            onChange={(e) => {
              setNewIndicatorData((prev: any) => ({ ...prev, name: e.target.value }));
            }}
          />
          <Textarea
            label={i18n('Описание')}
            value={newEntityData.description}
            onChange={(e) => {
              setNewIndicatorData((prev: any) => ({ ...prev, description: e.target.value }));
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={addIndicatorDlgSubmit}
          >
            Создать
          </Button>
          <Button
            variant="secondary"
            onClick={handleAddEntityDlgClose}
          >
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDelIndicatorDlg}
        backdrop={false}
        onHide={handleDelEntityDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Вы действительно хотите удалить
            {' '}
            {delIndicatorData.name}
            ?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body />
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => delEntityDlgSubmit(delIndicatorData.id)}
          >
            Удалить
          </Button>
          <Button
            variant="secondary"
            onClick={handleDelEntityDlgClose}
          >
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}
