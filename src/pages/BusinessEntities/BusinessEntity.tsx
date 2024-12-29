/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import styles from './BusinessEntity.module.scss';
import { getArtifactUrl, getBusinessEntityDisplayValue, getDataTypeAutocompleteObjects, getDataTypeDisplayValue, getDomainAutocompleteObjects, getDomainDisplayValue, handleHttpError, i18n, loadEditPageData, rateClickedHandler, setCookie, setDataModified, tagAddedHandler, tagDeletedHandler, updateArtifactsCount, updateEditPageReadOnly, uuid } from '../../utils';

import {
  deleteBusinessEntity,
  getBusinessEntityVersion,
  getBusinessEntity,
  getBusinessEntityVersions,
  updateBusinessEntity,
  getBusinessEntities,
  restoreBusinessEntityVersion,
  archiveBusinessEntity,
  restoreBusinessEntity,
} from '../../services/pages/businessEntities';

import { FieldArrayEditor } from '../../components/FieldArrayEditor/FieldArrayEditor';
import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';
import { TagProp, Tags } from '../../components/Tags';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { RelatedObjectsControl } from '../../components/RelatedObjectsControl';
import { FieldVisualEditor } from '../../components/FieldVisualEditor';
import { EditPage } from '../../components/EditPage';
import { FieldTextEditor } from '../../components/FieldTextEditor';

export function BusinessEntity() {
  const navigate = useNavigate();

  const [, setLoading] = useState(true);

  const [data, setData] = useState({
    metadata: { id: '', artifact_type: 'business_entity', version_id: '', tags: [], state: 'PUBLISHED', published_id: '', ancestor_draft_id: '', workflow_task_id: '', created_by: '' },
    entity: {
      name: '', description: '', tech_name: '', definition: '', regulation: '', alt_names: [], synonym_ids: [], be_link_ids: [], domain_id: null, parent_id: null,
      formula: '', examples: '', link: '', datatype_id: null, limits: '', roles: '', short_description: ''
    },
  });
  const [tags, setTags] = useState<TagProp[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const [isReadOnly, setReadOnly] = useState(true);
  const [isLoaded, setLoaded] = useState(false);

  const { id, version_id } = useParams();

  const [businessEntityId, setBusinessEntityId] = useState<string>(id ?? '');
  const [businessEntityVersionId, setBusinessEntityVersionId] = useState<string>(version_id ?? '');

  const [selectedSynonymNames, setSelectedSynonymNames] = useState<string[]>([]);
  const [selectedBELinkNames, setSelectedBELinkNames] = useState<string[]>([]);

  useEffect(() => {
    if (id) setBusinessEntityId(id);
    setBusinessEntityVersionId(version_id ?? '');
    setDataModified(false);
  }, [id, version_id]);

  const updateBEField = (field: string, value: string | string[] | undefined) => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    setDataModified(true);
  };

  const addSynonym = () => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, synonym_ids: [...prev.entity.synonym_ids, ''] } }));
  };

  const delSynonym = (k: number) => {
    const arr: string[] = [...data.entity.synonym_ids];
    arr.splice(k, 1);

    updateBEField('synonym_ids', arr.filter((x) => x));
  };

  useEffect(() => {
    const a = [];
    for (let i = 0; i < data.entity.synonym_ids.length; i++) { a.push(''); }
    setSelectedSynonymNames(a);

    data.entity.synonym_ids.forEach((id, index) => {
      getBusinessEntity(id).then((json) => {
        setSelectedSynonymNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'business_entity')}">${json.entity.name}</a></div>`, ...prev.slice(index + 1)]));
      }).catch(handleHttpError);
    });
  }, [data.entity.synonym_ids]);

  useEffect(() => {
    const a = [];
    for (let i = 0; i < data.entity.be_link_ids.length; i++) { a.push(''); }
    setSelectedBELinkNames(a);

    data.entity.be_link_ids.forEach((id, index) => {
      getBusinessEntity(id).then((json) => {
        setSelectedBELinkNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'business_entity')}">${json.entity.name}</a></div>`, ...prev.slice(index + 1)]));
      }).catch(handleHttpError);
    });
  }, [data.entity.be_link_ids]);

  const getBEObjects = async (search: string) => getBusinessEntities({
    sort: 'name+',
    global_query: search,
    limit: 1000,
    offset: 0,
    filters: [...data.entity.synonym_ids, data.metadata.id, data.metadata.published_id ?? ''].filter((id) => id).map((id) => ({ column: 'id', value: id, operator: 'NOT_EQUAL' })),
    filters_for_join: [],
    state: 'PUBLISHED',
  }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

  const getBELinkObjects = async (search: string) => getBusinessEntities({
    sort: 'name+',
    global_query: search,
    limit: 1000,
    offset: 0,
    filters: [...data.entity.be_link_ids, data.metadata.id, data.metadata.published_id ?? ''].filter((id) => id).map((id) => ({ column: 'id', value: id, operator: 'NOT_EQUAL' })),
    filters_for_join: [],
    state: 'PUBLISHED',
  }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

  const getParentBEAutocompleteObjects = async (search: string) => getBusinessEntities({
    sort: 'name+',
    global_query: search,
    limit: 1000,
    offset: 0,
    filters: [{ column: 'id', value: businessEntityId, operator: 'NOT_EQUAL' }, { column: 'id', value: data.metadata.published_id, operator: 'NOT_EQUAL' }],
    filters_for_join: [],
  }).then((json) => json.items);

  

  return (
    <>
      <EditPage objectId={businessEntityId} objectVersionId={businessEntityVersionId} data={data} restoreVersion={restoreBusinessEntityVersion} urlSlug='business-entities' setData={setData} isReadOnly={isReadOnly} setReadOnly={setReadOnly}
        archiveObject={archiveBusinessEntity} artifactType='business_entity' setTags={setTags} getObjectVersion={getBusinessEntityVersion} getObjectVersions={getBusinessEntityVersions} getObject={getBusinessEntity} deleteObject={deleteBusinessEntity}
        restoreObject={restoreBusinessEntity} updateObject={updateBusinessEntity} tabs={[
        {
          key: 'tab-gen',
          title: i18n('Сведения'),
          unscrollable: true,
          content: <div className={styles.tab_2col}>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Общая информация</h2>

              <FieldTextEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Название')}
                  defaultValue={data.entity.name}
                  className=''
                  valueSubmitted={(val) => {
                    updateBEField('name', val);
                  }}
                />

              <FieldAutocompleteEditor
                label={i18n('Домен')}
                defaultValue={data.entity.domain_id}
                valueSubmitted={(i) => updateBEField('domain_id', i)}
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
                    updateBEField('short_description', val ?? '');
                  }}
                />

              <div data-uitest="be_tag" className={styles.tags_block}>
                <div className={styles.label}>{i18n('Теги')}</div>
                <Tags
                  key={'tags-' + businessEntityId + '-' + businessEntityVersionId + '-' + uuid()}
                  isReadOnly={isReadOnly}
                  tags={tags}
                  tagPrefix='#'
                  onTagAdded={(tagName: string) => tagAddedHandler(tagName, businessEntityId, 'business_entity', data.metadata.state ?? '', tags, setLoading, setTags, '/business-entities/edit/', navigate)}
                  onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, businessEntityId, 'business_entity', data.metadata.state ?? '', setLoading, setTags, '/business-entities/edit/', navigate)}
                />
              </div>
            </div>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Дополнительные параметры</h2>

              <FieldTextEditor
                isReadOnly={isReadOnly}
                label={i18n('Техническое название')}
                defaultValue={data.entity.tech_name}
                valueSubmitted={(val) => {
                  updateBEField('tech_name', val);
                }}
              />

              <FieldTextEditor
                isReadOnly={isReadOnly}
                label={i18n('Формула расчета (Бизнес-алгоритм)')}
                defaultValue={data.entity.formula}
                valueSubmitted={(val) => {
                  updateBEField('formula', val);
                }}
              />

              <FieldTextEditor
                isReadOnly={isReadOnly}
                label={i18n('Примеры значений')}
                defaultValue={data.entity.examples}
                valueSubmitted={(val) => {
                  updateBEField('examples', val);
                }}
              />

              <FieldTextEditor
                isReadOnly={isReadOnly}
                label={i18n('Ссылка на справочник')}
                defaultValue={data.entity.link}
                valueSubmitted={(val) => {
                  updateBEField('link', val);
                }}
              />

              <FieldTextEditor
                isReadOnly={isReadOnly}
                label={i18n('Законодательные ограничения')}
                defaultValue={data.entity.limits}
                valueSubmitted={(val) => {
                  updateBEField('limits', val);
                }}
              />

              <FieldTextEditor
                isReadOnly={isReadOnly}
                label={i18n('Ключевые роли процесса')}
                defaultValue={data.entity.roles}
                valueSubmitted={(val) => {
                  updateBEField('roles', val);
                }}
              />

              <FieldAutocompleteEditor
                label={i18n('Родитель')}
                defaultValue={data.entity.parent_id}
                valueSubmitted={(i) => updateBEField('parent_id', i)}
                getDisplayValue={getBusinessEntityDisplayValue}
                getObjects={getParentBEAutocompleteObjects}
                showValidation={showValidation}
                artifactType="business_entity"
                isReadOnly={isReadOnly}
                allowClear
              />

              <FieldAutocompleteEditor
                label={i18n('Тип данных')}
                defaultValue={data.entity.datatype_id}
                valueSubmitted={(i) => updateBEField('datatype_id', i)}
                getDisplayValue={getDataTypeDisplayValue}
                getObjects={getDataTypeAutocompleteObjects}
                showValidation={showValidation}
                artifactType="datatype"
                isReadOnly={isReadOnly}
                allowClear
              />

              <FieldTextareaEditor
                isReadOnly={isReadOnly}
                label={`${i18n('Нормативные документы')}`}
                defaultValue={data.entity.regulation}
                valueSubmitted={(val) => {
                  updateBEField('regulation', val ?? '');
                }}
              />

              <FieldArrayEditor
                isReadOnly={isReadOnly}
                label={`${i18n('Альтернативные наименования')}`}
                defaultValue={data.entity.alt_names}
                valueSubmitted={(val) => {
                  updateBEField('alt_names', val);
                }}
                showValidation={showValidation}
                inputPlaceholder={i18n('Введите наименование')}
                addBtnText={i18n('Добавить наименование')}
                displayValueSeparator='; '
              />

              <FieldArrayEditor
                key={`ed-syn-${businessEntityId}`}
                getOptions={getBEObjects}
                isReadOnly={isReadOnly}
                label={i18n('Синонимы')}
                defaultValue={selectedSynonymNames}
                inputPlaceholder={i18n('Выберите')}
                addBtnText={i18n('Добавить')}
                valueSubmitted={() => { updateBEField('synonym_ids', data.entity.synonym_ids); }}
                onValueIdAdded={(id: string) => {
                  setData((prev:any) => ({ ...prev, entity: { ...prev.entity, synonym_ids: [...prev.entity.synonym_ids, id] } }));
                }}
                onValueIdRemoved={(id: string) => {
                  const arr = [...data.entity.synonym_ids];
                  arr.splice(parseInt(id), 1);
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, synonym_ids: arr } }));
                }}
              />

              <FieldArrayEditor
                key={`ed-belnk-${businessEntityId}`}
                getOptions={getBELinkObjects}
                isReadOnly={isReadOnly}
                label={i18n('Ссылки на другие Термины')}
                defaultValue={selectedBELinkNames}
                inputPlaceholder={i18n('Выберите')}
                addBtnText={i18n('Добавить')}
                valueSubmitted={() => { updateBEField('be_link_ids', data.entity.be_link_ids); }}
                onValueIdAdded={(id: string) => {
                  setData((prev:any) => ({ ...prev, entity: { ...prev.entity, be_link_ids: [...prev.entity.be_link_ids, id] } }));
                }}
                onValueIdRemoved={(id: string) => {
                  const arr = [...data.entity.be_link_ids];
                  arr.splice(parseInt(id), 1);
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, be_link_ids: arr } }));
                }}
              />
              
            </div>
          </div>
        },
        {
          key: 'tab-related',
          title: i18n('Связи'),
          content: <div className={styles.tab_white}>
            <RelatedObjectsControl artifactId={businessEntityId} artifactType='business_entity'></RelatedObjectsControl>
          </div>
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
                  updateBEField('description', val);
                }}
              />  
          
          </div>
        }, 
        {
          key: 'tab-def',
          title: i18n('Определение'),
          content: <div className={styles.tab_transparent}>
            <FieldVisualEditor
                  isReadOnly={isReadOnly}
                  defaultValue={data.entity.definition}
                  valueSubmitted={(val) => {
                    updateBEField('definition', val);
                  }}
                />
          </div>
        }
      ]} />
    </>
  );
}
