/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import classNames from 'classnames';
import { v4 } from 'uuid';
import styles from './Indicators.module.scss';
import { doNavigate, getArtifactUrl, getDQRuleAutocompleteObjects, getDQRuleDisplayValue, getDQRuleSettings, getDomainAutocompleteObjects, getDomainDisplayValue, handleHttpError, i18n, setDataModified, updateArtifactsCount, getTablePageSize, uuid, getDataTypeDisplayValue, getDataTypeAutocompleteObjects, getBusinessEntityDisplayValue, loadEditPageData, tagAddedHandler, tagDeletedHandler, rateClickedHandler, updateEditPageReadOnly, setBreadcrumbEntityName, setCookie, getIndicatorTypeDisplayValue, getIndicatorTypeAutocompleteObjects } from '../../utils';
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg';
import { ReactComponent as PlusInCircle } from '../../assets/icons/plus-blue.svg';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import {
  createIndicator,
  deleteIndicator,
  getIndicator,
  getIndicatorVersions,
  getIndicatorVersion,
  updateIndicator,
  restoreIndicatorVersion,
  archiveIndicator,
  restoreIndicator,
} from '../../services/pages/indicators';

import { FieldArrayEditor } from '../../components/FieldArrayEditor/FieldArrayEditor';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { getAsset, searchAssets } from '../../services/pages/dataAssets';
import { TagProp, Tags } from '../../components/Tags';
import { IndicatorData, TData, TDQRule } from '../../types/data';
import { FieldCheckboxEditor } from '../../components/FieldCheckboxEditor/FieldCheckboxEditor';
import { getBusinessEntities, getBusinessEntity } from '../../services/pages/businessEntities';
import { RelatedObjectsControl } from '../../components/RelatedObjectsControl';
import { FieldVisualEditor } from '../../components/FieldVisualEditor';
import { EditPage } from '../../components/EditPage';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';

export function Indicator() {
  const navigate = useNavigate();
  const [, setLoading] = useState(true);

  const [data, setData] = useState<IndicatorData>({
    metadata: { id: '', artifact_type: 'indicator', version_id: '', tags: [], state: 'PUBLISHED', published_id: '', created_by: '' },
    entity: {
      name: '', description: '', short_description: '', calc_code: '', dq_checks: [], formula: '', domain_id: null, indicator_type_id: 'de96bd1f-27d1-4f5b-b45e-47fcb16dc7b7', data_asset_ids: [], dq_rules: [],
      examples: '', link: '', datatype_id: null, limits: '', limits_internal: '', roles: '', term_link_ids: []
    },
  });
  const [newFormula, setNewFormula] = useState<string|undefined>(undefined);

  const [selectedDataAssetNames, setSelectedDataAssetNames] = useState<any[]>([]);
  const [selectedTermLinkNames, setSelectedTermLinksNames] = useState<any[]>([]);
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


  const handleAddEntityDlgClose = () => {
    setShowAddIndicatorDlg(false);
    return false;
  };

  const getDataAssetOptions = async (search: string) => searchAssets({ filters: [], filters_for_join: [], global_query: search, limit: 1000, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

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

  useEffect(() => {
    if (id) setIndicatorId(id);
    setIndicatorVersionId(version_id ?? '');
    setDataModified(false);
  }, [id, version_id]);

  
  useEffect(() => {
    const a = [];
    for (let i = 0; i < data.entity.data_asset_ids.length; i++) { a.push(''); }
    setSelectedDataAssetNames(a);

    data.entity.data_asset_ids.forEach((id, index) => {
      getAsset(id).then((json) => {
        setSelectedDataAssetNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'data_asset')}">${json.entity.name}</a></div>`, ...prev.slice(index + 1)]));
        
      }).catch(handleHttpError);
    });
  }, [data.entity.data_asset_ids]);

  useEffect(() => {
    const a = [];
    if (data.entity.term_link_ids)
      for (let i = 0; i < data.entity.term_link_ids.length; i++) { a.push(<></>); }
    setSelectedTermLinksNames(a);

    if (data.entity.term_link_ids) {
      data.entity.term_link_ids.forEach((id, index) => {
        getBusinessEntity(id).then((json) => {
          setSelectedTermLinksNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'business_entity')}">${json.entity.name}</a></div>`, ...prev.slice(index + 1)]));
        }).catch(handleHttpError);
      });
    }
  }, [data.entity.term_link_ids]);

  const updateIndicatorField = (field: string, value: string | string[] | [] | TDQRule[] | undefined) => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    setDataModified(true);
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
    setDataModified(true);
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

  const getTermLinkOptions = async (search: string) => getBusinessEntities({
    sort: 'name+',
    global_query: search,
    limit: 1000,
    offset: 0,
    filters: [...data.entity.term_link_ids, data.metadata.id, data.metadata.published_id ?? ''].filter((id) => id).map((id) => ({ column: 'id', value: id, operator: 'NOT_EQUAL' })),
    filters_for_join: [],
    state: 'PUBLISHED',
  }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

  return (
    <>
      <EditPage objectId={indicatorId} objectVersionId={indicatorVersionId} data={data} restoreVersion={restoreIndicatorVersion} urlSlug='indicators' setData={setData} isReadOnly={isReadOnly} setReadOnly={setReadOnly}
              archiveObject={archiveIndicator} artifactType='indicator' setTags={setTags} getObjectVersion={getIndicatorVersion} getObjectVersions={getIndicatorVersions} getObject={getIndicator} deleteObject={deleteIndicator}
              restoreObject={restoreIndicator} updateObject={(id, data) => { return updateIndicator(id, {...data, formula: typeof newFormula === 'undefined' ? data.formula : newFormula }) }} tabs={[
              {
                key: 'tab-gen',
                title: i18n('Сведения'),
                unscrollable: true,
                content: <div className={styles.tab_2col}>
                  <div className={classNames(styles.col, styles.scrollable)}>
                    <h2>Общая информация</h2>
                    {data.metadata.state != 'ARCHIVED' && (
                      <div>
                        <button className={styles.btn_scheme} onClick={() => { doNavigate(`/indicators-model/${encodeURIComponent(indicatorId)}`, navigate); }}>{i18n('Смотреть схему')}</button>
                      </div>
                    )}

                    <FieldTextEditor
                        isReadOnly={isReadOnly}
                        label={i18n('Название')}
                        defaultValue={data.entity.name}
                        className=''
                        valueSubmitted={(val) => {
                          updateIndicatorField('name', val);
                        }}
                      />

                    <FieldAutocompleteEditor
                        label={i18n('Тип')}
                        isReadOnly={isReadOnly}
                        defaultValue={data.entity.indicator_type_id}
                        valueSubmitted={(identity) => updateIndicatorField('indicator_type_id', identity)}
                        getDisplayValue={getIndicatorTypeDisplayValue}
                        getObjects={getIndicatorTypeAutocompleteObjects}
                        isRequired
                        showValidation={showValidation}
                      />

                    <FieldAutocompleteEditor
                      label={i18n('Домен')}
                      defaultValue={data.entity.domain_id}
                      valueSubmitted={(i) => updateIndicatorField('domain_id', i)}
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
                          updateIndicatorField('short_description', val ?? '');
                        }}
                      />

                    <div data-uitest="indicator_tag" className={styles.tags_block}>
                      <div className={styles.label}>{i18n('Теги')}</div>
                      <Tags
                        key={'tags-' + indicatorId + '-' + indicatorVersionId + '-' + uuid()}
                        isReadOnly={isReadOnly}
                        tags={tags}
                        tagPrefix='#'
                        onTagAdded={(tagName: string) => tagAddedHandler(tagName, indicatorId, 'indicator', data.metadata.state ?? '', tags, setLoading, setTags, '/indicators/edit/', navigate)}
                        onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, indicatorId, 'indicator', data.metadata.state ?? '', setLoading, setTags, '/indicators/edit/', navigate)}
                      />
                    </div>
                  </div>
                  <div className={classNames(styles.col, styles.scrollable)}>
                    <h2>Дополнительные параметры</h2>

                    <FieldTextEditor
                      isReadOnly={isReadOnly}
                      label={i18n('Код')}
                      defaultValue={data.entity.calc_code}
                      valueSubmitted={(val) => {
                        updateIndicatorField('calc_code', val);
                      }}
                    />

                    <FieldTextEditor
                      isReadOnly={isReadOnly}
                      label={i18n('Примеры значений')}
                      defaultValue={data.entity.examples}
                      valueSubmitted={(val) => {
                        updateIndicatorField('examples', val);
                      }}
                    />

                    <FieldTextEditor
                      isReadOnly={isReadOnly}
                      label={i18n('Ссылка на справочник')}
                      defaultValue={data.entity.link}
                      className={styles.editor}
                      valueSubmitted={(val) => {
                        updateIndicatorField('link', val);
                      }}
                    />

                    <FieldAutocompleteEditor
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

                    <FieldTextEditor
                      isReadOnly={isReadOnly}
                      label={i18n('Законодательные ограничения')}
                      defaultValue={data.entity.limits}
                      className={styles.editor}
                      valueSubmitted={(val) => {
                        updateIndicatorField('limits', val);
                      }}
                    />

                    <FieldTextEditor
                      isReadOnly={isReadOnly}
                      label={i18n('Внутренние ограничения')}
                      defaultValue={data.entity.limits_internal}
                      valueSubmitted={(val) => {
                        updateIndicatorField('limits_internal', val);
                      }}
                    />

                    <FieldTextEditor
                      isReadOnly={isReadOnly}
                      label={i18n('Ключевые роли процесса')}
                      defaultValue={data.entity.roles}
                      valueSubmitted={(val) => {
                        updateIndicatorField('roles', val);
                      }}
                    />

                    <FieldArrayEditor
                        key={`ed-terms-${indicatorId}`}
                        artifactType='business_entity'
                        useExtSearch
                        getOptions={getTermLinkOptions}
                        isReadOnly={isReadOnly}
                        label={i18n('Ссылки на другие Термины')}
                        defaultValue={selectedTermLinkNames}
                        inputPlaceholder={i18n('Выберите глоссарий')}
                        addBtnText={i18n('Добавить')}
                        valueSubmitted={() => { updateIndicatorField('term_link_ids', data.entity.term_link_ids); }}
                        onValueIdAdded={(id: string, name: string) => {
                          let d = {...data};
                          d.entity.term_link_ids.push(id);
                          setData(d);
                        }}
                        onValueIdRemoved={(id: string) => {
                          const arr = [...data.entity.term_link_ids];
                          arr.splice(parseInt(id), 1);
                          setData((prev) => ({ ...prev, entity: { ...prev.entity, term_link_ids: arr } }));
                        }}
                      />

                    <FieldArrayEditor
                      key='i-sel-dq'
                      artifactType='dq_rule'
                      useExtSearch
                      isReadOnly={isReadOnly}
                      label={i18n('Проверка')}
                      defaultValue={data.entity.dq_checks}
                      valueSubmitted={(val) => {
                        updateIndicatorField('dq_checks', val);
                      }}
                      isRequired
                      showValidation={showValidation}
                      addBtnText={i18n('Добавить проверку')}
                      inputPlaceholder={i18n('Введите проверку')}
                    />

                    <FieldArrayEditor
                      key={`ed-dass-${indicatorId}`}
                      artifactType='data_asset'
                      useExtSearch
                      getOptions={getDataAssetOptions}
                      isReadOnly={isReadOnly}
                      label={i18n('Активы')}
                      defaultValue={selectedDataAssetNames}
                      inputPlaceholder={i18n('Выберите актив')}
                      addBtnText={i18n('Добавить')}
                      valueSubmitted={() => { updateIndicatorField('data_asset_ids', data.entity.data_asset_ids); }}
                      onValueIdAdded={(id: string, name: string) => {
                        let d = {...data};
                        d.entity.data_asset_ids.push(id);
                        setData(d);
                      }}
                      onValueIdRemoved={(id: string) => {
                        const arr = [...data.entity.data_asset_ids];
                        arr.splice(parseInt(id), 1);
                        setData((prev) => ({ ...prev, entity: { ...prev.entity, data_asset_ids: arr } }));
                      }}
                    />

                    <FieldTextEditor key={`feFormula${data.metadata.id ?? ''}`} isReadOnly={isReadOnly} 
                      label={i18n("Формула")} isDraftJS mentionParameter={indicatorId} 
                      defaultValue={data.entity.formula} valueSubmitted={(v) => { setNewFormula(v); setDataModified(true); }} 
                    />

                    
                  </div>
                </div>
              },
              {
                key: 'tab-related',
                title: i18n('Связи'),
                content: <div className={styles.tab_white}>
                  

                  <RelatedObjectsControl artifactId={indicatorId} artifactType='indicator'></RelatedObjectsControl>
                </div>
              },
              {
                key: 'tab-dq',
                title: i18n('Настройки качества'),
                content: (
                  <div className={classNames(styles.dqrule_wrap, styles.tab_white)}>
                      <div className={styles.dqrule_head}>
                        <label>{`${i18n('Правила проверки качества')}`}</label>
                        {!isReadOnly && (<PlusInCircle onClick={addDQRule} />)}
                      </div>
                      {data.entity.dq_rules && data.entity.dq_rules.map((v, index) => (
                        <div key={`d${(v as TData).metadata.id ? (v as TData).metadata.id : uuid()}`} className={styles.dqrule_item}>
                          <FieldAutocompleteEditor
                            key={`se${(v as TData).metadata.id}`}
                            isReadOnly={isReadOnly}
                            label={i18n('Правило')}
                            className={styles.col1}
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
                            className={styles.col2}
                            defaultValue={(v as TData).entity.settings}
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
                )
              },
              {
                key: 'tab-desc',
                title: i18n('Расширенное описание'),
                content: <div className={styles.tab_transparent}>

                  <FieldVisualEditor
                      isReadOnly={isReadOnly}
                      defaultValue={data.entity.description}
                      className=''
                      valueSubmitted={(val) => {
                        updateIndicatorField('description', val);
                      }}
                    />  
                
                </div>
              }
            ]} />
      

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
    </>
  );
}
