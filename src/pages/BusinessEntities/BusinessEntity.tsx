/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import useUrlState from '@ahooksjs/use-url-state';
import classNames from 'classnames';
import styles from './BusinessEntity.module.scss';
import { getBusinessEntityDisplayValue, getDataTypeAutocompleteObjects, getDataTypeDisplayValue, getDomainAutocompleteObjects, getDomainDisplayValue, handleHttpError, i18n, loadEditPageData, rateClickedHandler, setDataModified, tagAddedHandler, tagDeletedHandler, updateArtifactsCount, updateEditPageReadOnly, uuid } from '../../utils';
import { Versions, VersionData } from '../../components/Versions';

import { FieldEditor } from '../../components/FieldEditor';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import {
  createBusinessEntity,
  deleteBusinessEntity,
  getBusinessEntityVersion,
  getBusinessEntity,
  getBusinessEntityVersions,
  updateBusinessEntity,
  getBusinessEntities,
} from '../../services/pages/businessEntities';

import { setRecentView } from '../../services/pages/recentviews';
import { WFItemControl } from '../../components/WFItemControl/WFItemControl';
import { FieldArrayEditor } from '../../components/FieldArrayEditor/FieldArrayEditor';
import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';
import { TagProp, Tags } from '../../components/Tags';
import { ReactComponent as PlusInCircle } from '../../assets/icons/plus-in-circle.svg';
import { ReactComponent as Close } from '../../assets/icons/close.svg';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { Table } from '../../components/Table';
import { assetsTableColumns, entityTableColumns } from '../../mocks/logic_objects';
import { Tabs } from '../../components/Tabs';
import { userInfoRequest } from '../../services/auth';

export function BusinessEntity() {
  const navigate = useNavigate();

  const [state, setState] = useUrlState({
    t: '1', p1: '1', p2: '1', p3: '1', p4: '1',
  }, { navigateMode: 'replace' });
  const [, setLoading] = useState(true);

  const [data, setData] = useState({
    metadata: { id: '', artifact_type: 'business_entity', version_id: '', tags: [], state: 'PUBLISHED', published_id: '', ancestor_draft_id: '' },
    entity: {
      name: '', description: '', tech_name: '', definition: '', regulation: '', alt_names: [], synonym_ids: [], be_link_ids: [], domain_id: null, parent_id: null,
      formula: '', examples: '', link: '', datatype_id: null, limits: '', roles: ''
    },
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

  const [businessEntityId, setBusinessEntityId] = useState<string>(id ?? '');
  const [businessEntityVersionId, setBusinessEntityVersionId] = useState<string>(version_id ?? '');

  const [showAddEntityDlg, setShowAddEntityDlg] = useState(false);
  const [newEntityData, setNewEntityData] = useState<any>({
    name: '',
    description: '',
    system_ids: [],
  });

  const [showDelEntityDlg, setShowDelEntityDlg] = useState(false);
  const [delEntityData, setDelEntityData] = useState<any>({ id: '', name: '' });

  const tabs = [
    {
      key: 'tab-ent',
      title: i18n('ЛОГ. ОБЪЕКТЫ'),
      content: (
        <Table
          key={`tbl-ent-${businessEntityId}${businessEntityVersionId ?? ''}`}
          className={styles.table}
          columns={entityTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={
            businessEntityId === ''
              ? ''
              : `/v1/entities/search_by_be/${encodeURIComponent(businessEntityVersionId ? data.metadata.ancestor_draft_id : (businessEntityId ?? ''))}`
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
            navigate(`/logic-objects/edit/${encodeURIComponent(row.id)}`);
          }}
          showCreateBtn={false}
          onPageChange={(page: number) => {
            setState(() => ({ p3: page }));
          }}
        />
      ),
    },
    {
      key: 'tab-assets',
      title: i18n('АКТИВЫ'),
      content: (
        <Table
          key={`tbl-assets-${businessEntityId}${businessEntityVersionId ?? ''}`}
          className={styles.table}
          columns={assetsTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={
            businessEntityId === ''
              ? ''
              : `/v1/data_assets/search_by_be/${encodeURIComponent(businessEntityVersionId ? data.metadata.ancestor_draft_id : (businessEntityId ?? ''))}`
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

  const handleAddEntityDlgClose = () => {
    setShowAddEntityDlg(false);
    return false;
  };
  const handleDelEntityDlgClose = () => {
    setShowDelEntityDlg(false);
    return false;
  };

  const addEntityDlgSubmit = () => {
    setShowAddEntityDlg(false);
    setLoading(true);
    createBusinessEntity(newEntityData)
      .then(() => {
        setLoading(false);
        updateArtifactsCount();
      })
      .catch(handleHttpError);
    setNewEntityData({ name: '', description: '' });
  };

  const delEntityDlgSubmit = (identity: string) => {
    setShowDelEntityDlg(false);
    setLoading(true);
    deleteBusinessEntity(identity)
      .then(() => {
        setLoading(false);
      })
      .catch(handleHttpError);
    setDelEntityData({ id: '', name: '' });
  };

  useEffect(() => {
    if (id) setBusinessEntityId(id);
    setBusinessEntityVersionId(version_id ?? '');
    setDataModified(false);
  }, [id, version_id]);

  useEffect(() => {
    setCreateMode(businessEntityId === '');
    if (businessEntityId) {
      if (!businessEntityVersionId) { setRecentView('business_entity', businessEntityId); }

      loadEditPageData(businessEntityId, businessEntityVersionId, setData, setTags, setLoading, setLoaded, getBusinessEntityVersion,
        getBusinessEntity, setRatingData, setOwnRating, getBusinessEntityVersions, setVersions, setReadOnly);
      
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
  }, [businessEntityId, businessEntityVersionId]);

  useEffect(() => {
    if (isCreateMode) {
      if (data.entity.name && data.entity.definition) {
        createBusinessEntity({
          name: data.entity.name,
          definition: data.entity.definition,
          domain_id: data.entity.domain_id
        })
          .then((json) => {
            setDataModified(false);
            if (json.metadata.id) {
              updateArtifactsCount();
              setBusinessEntityId(json.metadata.id);
              window.history.pushState(
                {},
                '',
                `/business-entities/edit/${encodeURIComponent(json.metadata.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);
  
  const updateBEField = (field: string, value: string | string[]) => {
    if (businessEntityId) {
      const d: any = {};
      d[field] = value;
      updateBusinessEntity(businessEntityId, d)
        .then((json) => {
          setDataModified(false);
          if (json.metadata.id && json.metadata.id !== businessEntityId) {
            navigate(`/business-entities/edit/${encodeURIComponent(json.metadata.id)}`);
          } else { setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } })); }
        })
        .catch(handleHttpError);
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
      setDataModified(false);
    }
  };

  const addSynonym = () => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, synonym_ids: [...prev.entity.synonym_ids, ''] } }));
  };

  const delSynonym = (k: number) => {
    const arr: string[] = [...data.entity.synonym_ids];
    arr.splice(k, 1);

    updateBEField('synonym_ids', arr.filter((x) => x));
  };

  const addBELink = () => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, be_link_ids: [...prev.entity.be_link_ids, ''] } }));
  };

  const delBELink = (k: number) => {
    const arr: string[] = [...data.entity.be_link_ids];
    arr.splice(k, 1);

    updateBEField('be_link_ids', arr.filter((x) => x));
  };

  const updateBESynonymId = (k: number, id: string) => {
    const arr: string[] = [...data.entity.synonym_ids];
    if (arr.length > k) { arr[k] = id; } else { arr.push(id); }

    updateBEField('synonym_ids', arr.filter((x) => x));
  };

  const updateBELink = (k: number, id: string) => {
    const arr: string[] = [...data.entity.be_link_ids];
    if (arr.length > k) { arr[k] = id; } else { arr.push(id); }

    updateBEField('be_link_ids', arr.filter((x) => x));
  };

  const getBEObjects = async (search: string) => getBusinessEntities({
    sort: 'name+',
    global_query: search,
    limit: 10,
    offset: 0,
    filters: [...data.entity.synonym_ids, data.metadata.id, data.metadata.published_id ?? ''].filter((id) => id).map((id) => ({ column: 'id', value: id, operator: 'NOT_EQUAL' })),
    filters_for_join: [],
    state: 'PUBLISHED',
  }).then((json) => json.items);

  const getBELinkObjects = async (search: string) => getBusinessEntities({
    sort: 'name+',
    global_query: search,
    limit: 10,
    offset: 0,
    filters: [...data.entity.be_link_ids, data.metadata.id, data.metadata.published_id ?? ''].filter((id) => id).map((id) => ({ column: 'id', value: id, operator: 'NOT_EQUAL' })),
    filters_for_join: [],
    state: 'PUBLISHED',
  }).then((json) => json.items);

  const getParentBEAutocompleteObjects = async (search: string) => getBusinessEntities({
    sort: 'name+',
    global_query: search,
    limit: 10,
    offset: 0,
    filters: [{ column: 'id', value: businessEntityId, operator: 'NOT_EQUAL' }, { column: 'id', value: data.metadata.published_id, operator: 'NOT_EQUAL' }],
    filters_for_join: [],
  }).then((json) => json.items);

  return (
    <div className={classNames(styles.page, styles.bePage, { [styles.loaded]: isLoaded })}>
      <div className={styles.mainContent}>
        {!businessEntityVersionId && (
          <WFItemControl
            key={`wfc-${uuid()}`}
            itemMetadata={data.metadata}
            itemIsReadOnly={isReadOnly}
            onEditClicked={() => { setReadOnly(false); }}
            onObjectIdChanged={(id) => {
              if (id) {
                setBusinessEntityId(id);
                window.history.pushState(
                  {},
                  '',
                  `/business-entities/edit/${encodeURIComponent(id)}`,
                );
              } else navigate('/business-entities/');
            }}
            onObjectDataChanged={(d) => {
              setData(d);
              setDataModified(false);
              if (document.getElementById(`crumb_${businessEntityId}`) !== null) {
                document.getElementById(`crumb_${businessEntityId}`)!.innerText = d.entity.name;
              }
              setTags(d.metadata.tags ? d.metadata.tags.map((x: any) => ({ value: x.name })) : []);
              updateEditPageReadOnly(d, setReadOnly, () => {  setLoading(false); setLoaded(true); });
            }}
          />
        )}
        <div className={styles.title}>
          <FieldEditor
            isReadOnly={isReadOnly}
            labelPrefix={`${i18n('БИЗНЕС-СУЩНОСТЬ')}: `}
            defaultValue={data.entity.name}
            className={styles.title}
            valueSubmitted={(val) => {
              updateBEField('name', val.toString());
            }}
            isRequired
            onBlur={(val) => {
              updateBEField('name', val);
            }}
            showValidation={showValidation}
          />
        </div>
        {!isCreateMode && (
          
            <Tags
              tags={tags}
              isReadOnly={isReadOnly}
              onTagAdded={(tagName: string) => tagAddedHandler(tagName, businessEntityId, 'business_entity', data.metadata.state ?? '', tags, setLoading, setTags, '/business-entities/edit/')}
              onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, businessEntityId, 'business_entity', data.metadata.state ?? '', setLoading, setTags, '/business-entities/edit/')}
            />
        )}
        {!isCreateMode && (
            <div className={styles.data_row}>
              <FieldEditor
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${i18n('Техническое название')} `}
                defaultValue={data.entity.tech_name}
                className={styles.editor}
                valueSubmitted={(val) => {
                  updateBEField('tech_name', val.toString());
                }}
              />
            </div>
        )}
        {!isCreateMode && (
            <div className={styles.data_row}>
              <FieldEditor
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${i18n('Формула расчета (Бизнес-алгоритм)')} `}
                defaultValue={data.entity.formula}
                className={styles.editor}
                valueSubmitted={(val) => {
                  updateBEField('formula', val.toString());
                }}
              />
            </div>
        )}
        {!isCreateMode && (
            <div className={styles.data_row}>
              <FieldEditor
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${i18n('Примеры значений')} `}
                defaultValue={data.entity.examples}
                className={styles.editor}
                valueSubmitted={(val) => {
                  updateBEField('examples', val.toString());
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
                  updateBEField('link', val.toString());
                }}
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
                  updateBEField('limits', val.toString());
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
                  updateBEField('roles', val.toString());
                }}
              />
            </div>
        )}

            <div className={styles.data_row}>
              <FieldTextareaEditor
                isReadOnly={isReadOnly}
                labelPrefix={`${i18n('Определение')}`}
                isMultiline
                isRequired
                showValidation={showValidation}
                defaultValue={data.entity.definition}
                className={styles.editor}
                valueSubmitted={(val) => {
                  updateBEField('definition', val);
                }}
              />
            </div>
          {!isCreateMode && (
            <div className={styles.data_row}>
              <FieldAutocompleteEditor
                className={styles.editor}
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
            </div>
            )}
        
            <div className={styles.data_row}>
              <FieldAutocompleteEditor
                className={styles.editor}
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
            </div>
          {!isCreateMode && (
          <div className={styles.data_row}>
            <FieldAutocompleteEditor
              className={styles.editor}
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
          </div>
          )}
        {!isCreateMode && (
            <div className={styles.data_row}>
              <FieldTextareaEditor
                isReadOnly={isReadOnly}
                labelPrefix={`${i18n('Нормативные документы')}`}
                isMultiline
                defaultValue={data.entity.regulation}
                className={styles.editor}
                valueSubmitted={(val) => {
                  updateBEField('regulation', val);
                }}
              />
            </div>
            )}
        {!isCreateMode && (
            <div className={styles.data_row}>
              <FieldArrayEditor
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${i18n('Альтернативные наименования')}`}
                defaultValue={data.entity.alt_names}
                className={styles.editor}
                valueSubmitted={(val) => {
                  updateBEField('alt_names', val);
                }}
                isRequired
                showValidation={showValidation}
                inputPlaceholder={i18n('Введите наименование')}
                addBtnText={i18n('Добавить наименование')}
              />
            </div>
            )}
        {!isCreateMode && (
            <div className={classNames(styles.data_row, styles.synonyms_row)}>
              <div className={styles.synonyms_head}>
                <label>{`${i18n('Синонимы')}:`}</label>
                {!isReadOnly && (<PlusInCircle onClick={addSynonym} />)}
              </div>
              {data.entity.synonym_ids.map((sId, k) => (
                <div key={`si${k}-${sId}`} className={styles.synonym_item}>
                  <FieldAutocompleteEditor
                    key={`se${k}`}
                    className={styles.long_input}
                    isReadOnly={isReadOnly}
                    label=""
                    defaultValue={sId}
                    valueSubmitted={(identity) => updateBESynonymId(k, identity)}
                    getDisplayValue={getBusinessEntityDisplayValue}
                    getObjects={getBEObjects}
                  />
                  {!isReadOnly && (<Close key={`ds${k}`} onClick={() => delSynonym(k)} />)}
                </div>
              ))}
            </div>

        )}
        {!isCreateMode && (
            <div className={classNames(styles.data_row, styles.synonyms_row)}>
              <div className={styles.synonyms_head}>
                <label>{`${i18n('Ссылки на другие Термины')}:`}</label>
                {!isReadOnly && (<PlusInCircle onClick={addBELink} />)}
              </div>
              {data.entity.be_link_ids.map((sId, k) => (
                <div key={`si22${k}-${sId}`} className={styles.synonym_item}>
                  <FieldAutocompleteEditor
                    key={`se22${k}`}
                    className={styles.long_input}
                    isReadOnly={isReadOnly}
                    label=""
                    defaultValue={sId}
                    valueSubmitted={(identity) => updateBELink(k, identity)}
                    getDisplayValue={getBusinessEntityDisplayValue}
                    getObjects={getBELinkObjects}
                  />
                  {!isReadOnly && (<Close key={`ds22${k}`} onClick={() => delBELink(k)} />)}
                </div>
              ))}
            </div>

        )}

        {!isCreateMode && <Tabs tabs={tabs} tabNumber={state.t} onTabChange={(tab: number) => { setState(() => ({ t: tab })); }} />}
      </div>
      {!isCreateMode && (
        <div className={styles.rightBar}>
          {data.metadata.state === 'PUBLISHED' && (
            <Versions
              rating={ratingData.rating}
              ownRating={ownRating}
              version_id={businessEntityVersionId || data.metadata.version_id}
              versions={versions}
              version_url_pattern={`/business-entities/${encodeURIComponent(businessEntityId)}/version/{version_id}`}
              root_object_url={`/business-entities/edit/${encodeURIComponent(businessEntityId)}`}
              onRateClick={r => rateClickedHandler(r, businessEntityId, 'business_entity', setOwnRating, setRatingData)}
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
          <Modal.Title>Создание новой бизнес-сущности</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Input
            label={i18n('Название')}
            value={newEntityData.name}
            onChange={(e) => {
              setNewEntityData((prev: any) => ({ ...prev, name: e.target.value }));
            }}
          />
          <Textarea
            label={i18n('Описание')}
            value={newEntityData.description}
            onChange={(e) => {
              setNewEntityData((prev: any) => ({ ...prev, description: e.target.value }));
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={addEntityDlgSubmit}
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
        show={showDelEntityDlg}
        backdrop={false}
        onHide={handleDelEntityDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Вы действительно хотите удалить
            {' '}
            {delEntityData.name}
            ?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body />
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => delEntityDlgSubmit(delEntityData.id)}
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
