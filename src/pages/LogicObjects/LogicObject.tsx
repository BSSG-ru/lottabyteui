/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import useUrlState from '@ahooksjs/use-url-state';
import classNames from 'classnames';
import styles from './LogicObjects.module.scss';
import { doNavigate, getBusinessEntityAutocompleteObjects, getBusinessEntityDisplayValue, getSystemAutocompleteObjects, getSystemDisplayValue, handleHttpError, i18n, loadEditPageData, rateClickedHandler, setBreadcrumbEntityName, setDataModified, tagAddedHandler, tagDeletedHandler, updateArtifactsCount, updateEditPageReadOnly, uuid } from '../../utils';
import { Tags, TagProp } from '../../components/Tags';
import { Versions, VersionData } from '../../components/Versions';
import { Tabs } from '../../components/Tabs';
import { Table } from '../../components/Table';
import {
  assetsTableColumns,
  attributesTableColumns,
  renderAttribute,
  samplesTableColumns,
} from '../../mocks/logic_objects';
import { FieldEditor } from '../../components/FieldEditor';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import {
  createAttr,
  createEntity,
  deleteEntity,
  deleteEntityAttr,
  getAttrTypes,
  getEntity,
  getEntityAttributes,
  getEntityVersion,
  getEntityVersions,
  updateAttr,
  updateEntity,
} from '../../services/pages/dataEntities';
import { Autocomplete } from '../../components/Autocomplete';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { setRecentView } from '../../services/pages/recentviews';
import { ReactComponent as PlusInCircle } from '../../assets/icons/plus-in-circle.svg';
import { ReactComponent as Close } from '../../assets/icons/close.svg';
import { WFItemControl } from '../../components/WFItemControl/WFItemControl';
import { createDraft } from '../../services/pages/tags';

export function LogicObject() {
  const navigate = useNavigate();

  const [state, setState] = useUrlState({
    t: '1', p1: '1', p2: '1', p3: '1',
  }, { navigateMode: 'replace' });
  const [, setLoading] = useState(true);
  const [data, setData] = useState({
    entity: { name: null, description: '', system_ids: [], business_entity_id: '', roles: '' },
    metadata: { id: '', artifact_type: 'entity', version_id: '', tags: [], state: 'PUBLISHED', ancestor_draft_id: '' },
  });
  const [ratingData, setRatingData] = useState({ rating: 0, total_rates: 0 });
  const [ownRating, setOwnRating] = useState(0);
  const [versions, setVersions] = useState<VersionData[]>([]);
  const [tags, setTags] = useState<TagProp[]>([]);

  const [isCreateMode, setCreateMode] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const [, setAttrTypes] = useState();

  const [isReadOnly, setReadOnly] = useState(true);
  const [isLoaded, setLoaded] = useState(false);

  const { id, version_id } = useParams();

  const [logicObjectId, setLogicObjectId] = useState<string>(id ?? '');
  const [logicObjectVersionId, setLogicObjectVersionId] = useState<string>(version_id ?? '');

  const [showAddEntityDlg, setShowAddEntityDlg] = useState(false);
  const [newEntityData, setNewEntityData] = useState<any>({
    name: '',
    description: '',
    system_ids: [],
  });

  const [showDelEntityDlg, setShowDelEntityDlg] = useState(false);
  const [delEntityData, setDelEntityData] = useState<any>({ id: '', name: '' });

  const [showDelEntityAttrDlg, setShowDelEntityAttrDlg] = useState(false);
  const [delEntityAttrData, setDelEntityAttrData] = useState<any>({ id: '', name: '', attribute_id: '' });

  const [errorNameText, setErrorNameText] = useState('');
  const [errorTypeText, setErrorTypeText] = useState('');

  const [tblAttrsKey, setTblAttrsKey] = useState(uuid());

  const handleAddEntityDlgClose = () => {
    setShowAddEntityDlg(false);
    return false;
  };
  const handleDelEntityDlgClose = () => {
    setShowDelEntityDlg(false);
    return false;
  };
  const handleDelEntityAttrDlgClose = () => {
    setShowDelEntityAttrDlg(false);
    return false;
  };

  const getAttrType = async (search: string) => getAttrTypes().then((json) => {
    const res = [];
    const map = new Map();
    for (let i = 0; i < json.length; i += 1) {
      res.push({ id: json[i].id, name: json[i].name });
      map.set(json[i].id, json[i].description);
    }
    //setAttrTypes(map);
    return res.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
  });

  const [showAddAttrDlg, setShowAddAttrDlg] = useState(false);
  const handleAddAttrDlgClose = () => {
    setShowAddAttrDlg(false);
    return false;
  };

  const [showUpdateAttrDlg, setShowUpdateAttrDlg] = useState(false);
  const handleUpdateAttrDlgClose = () => {
    setShowUpdateAttrDlg(false);
    return false;
  };

  const [newAttrData, setNewAttrData] = useState<any>({
    name: '',
    description: '',
    attribute_type: '',
  });

  const [updateAttrData, setUpdateAttrData] = useState<any>({
    id: '',
    name: '',
    description: '',
    attribute_type: '',
    tags: [],
    attribute_id: ''
  });

  const updateAttrDlgSubmit = () => {
    setShowUpdateAttrDlg(false);
    setLoading(true);
    if (data.metadata.state == 'PUBLISHED') {
      createDraft(logicObjectId, 'entity').then((json) => {
        if (json.metadata.id) {
          getEntityAttributes(json.metadata.id).then((json2) => {
            json2.resources.forEach((r: any) => {
              if (r.entity.attribute_id == updateAttrData.attribute_id) {
                updateAttr(json.metadata.id, r.metadata.id, updateAttrData).then(() => {
                  setLoading(false);
                  setUpdateAttrData({
                    id: '',
                    name: '',
                    description: '',
                    attribute_type: '',
                    tags: [],
                    attribute_id: ''
                  });
                  navigate(`/logic-objects/edit/${encodeURIComponent(json.metadata.id)}`);
                }).catch(handleHttpError);
              }
            });
          }).catch(handleHttpError);
        }
      }).catch(handleHttpError);
    } else {
      updateAttr(logicObjectId, updateAttrData.id, updateAttrData)
        .then(() => {
          setLoading(false);
          setUpdateAttrData({
            id: '',
            name: '',
            description: '',
            attribute_type: '',
            tags: [],
            attribute_id: ''
          });
          setTblAttrsKey(uuid());
        })
        .catch(handleHttpError);
    }
  };

  const addAttrDlgSubmit = () => {
    let hasErrors = false;
    if (newAttrData.name === '') {
      setErrorNameText('Не заполнено название атрибута');
      hasErrors = true;
    } else {
      setErrorNameText('');
    }
    if (newAttrData.attribute_type === '') {
      setErrorTypeText('Не заполнен тип атрибута');
      hasErrors = true;
    } else {
      setErrorTypeText('');
    }
    if (!hasErrors) {
      setShowAddAttrDlg(false);
      setLoading(true);
      if (data.metadata.state == 'PUBLISHED') {
        updateEntity(logicObjectId, { name: data.entity.name }).then((json) => {
          if (json.metadata.id) {
            createAttr(json.metadata.id, newAttrData).then(() => {
              setLoading(false);
              setNewAttrData({ name: '', description: '', attribute_type: '' });
              navigate(`/logic-objects/edit/${encodeURIComponent(json.metadata.id)}`);
            }).catch(handleHttpError);
          }
        }).catch(handleHttpError);
      } else {
        createAttr(logicObjectId || '', newAttrData)
          .then(() => {
            setLoading(false);
            setTblAttrsKey(uuid());
            setNewAttrData({ name: '', description: '', attribute_type: '' });
          })
          .catch(handleHttpError);
      }
    }
  };

  const addEntityDlgSubmit = () => {
    setShowAddEntityDlg(false);
    setLoading(true);
    createEntity(newEntityData)
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
    deleteEntity(identity)
      .then(() => {
        setLoading(false);
      })
      .catch(handleHttpError);
    setDelEntityData({ id: '', name: '' });
  };

  const delEntityAttrDlgSubmit = (identity: string, name: string, attribute_id: string) => {
    setShowDelEntityAttrDlg(false);
    setLoading(true);
    if (data.metadata.state == 'PUBLISHED') {
      updateEntity(logicObjectId, { name: data.entity.name }).then((json) => {
        if (json.metadata.id) {
          getEntityAttributes(json.metadata.id).then((json2) => {
            json2.resources.forEach((r: any) => {
              if (r.entity.attribute_id == attribute_id) {
                deleteEntityAttr(r.metadata.id).then(() => {
                  setLoading(false);
                  setDelEntityAttrData({ id: '', name: '', attribute_id: '' });
                  navigate(`/logic-objects/edit/${encodeURIComponent(json.metadata.id)}`);
                }).catch(handleHttpError);
              }
            });
          }).catch(handleHttpError);
        }
      }).catch(handleHttpError);
    } else {
      deleteEntityAttr(identity)
        .then(() => {
          setLoading(false);
          setTblAttrsKey(uuid());
          setDelEntityAttrData({ id: '', name: '', attribute_id: '' });
        })
        .catch(handleHttpError);
    }
  };

  const tabs = [
    {
      key: 'tab-log',
      title: i18n('АТРИБУТЫ'),
      content: (
        <Table
          key={logicObjectId + tblAttrsKey + (logicObjectVersionId ?? '')}
          className={styles.table}
          columns={attributesTableColumns}
          paginate={false}
          columnSearch
          globalSearch
          tableButtons={[
            { text: i18n('Схема'), onClick: () => { doNavigate('/model', navigate); } },
          ]}
          dataUrl={
            logicObjectId === ''
              ? ''
              : `/v1/entities/search_attributes_by_entity_id/${encodeURIComponent(
                logicObjectVersionId ? data.metadata.ancestor_draft_id : (logicObjectId ?? ''),
              )}`
          }
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 100,
            offset: (state.p1 - 1) * 100,
            filters: [],
            filters_preset: [],
            filters_for_join: [],
          }}
          showCreateBtn
          onCreateBtnClick={() => {
            setShowAddAttrDlg(true);
          }}
          onPageChange={(page: number) => {
            setState(() => ({ p1: page }));
          }}
          renderActionsPopup={(row: any) => (
            <div>
              <a
                href="#"
                onClick={() => {
                  setShowAddAttrDlg(true);
                }}
                className={styles.btn_create}
              />
              <a
                href="#"
                onClick={(e) => {
                  setUpdateAttrData({
                    id: row.id,
                    name: row.name,
                    description: row.description,
                    attribute_type: row.attribute_type,
                    tags: row.tags,
                    attribute_id: row.attribute_id
                  });
                  setShowUpdateAttrDlg(true);
                  e.preventDefault();
                  return false;
                }}
                className={styles.btn_edit}
              />
              <a
                href="#"
                onClick={(e) => {
                  setDelEntityAttrData({ id: row.id, name: row.name, attribute_id: row.attribute_id });
                  setShowDelEntityAttrDlg(true);
                  e.preventDefault();
                  return false;
                }}
                className={styles.btn_del}
              />
            </div>
          )}
        />
      ),
    },
    {
      key: 'tab-samples',
      title: i18n('СЭМПЛЫ'),
      content: (
        <Table
          key={`samplesTable${logicObjectId}${logicObjectVersionId ?? ''}`}
          className={styles.table}
          columns={samplesTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={logicObjectId === '' ? '' : '/v1/samples/search'}
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p2 - 1) * 5,
            filters: [],
            filters_preset: [
              { column: 'entity_id', value: logicObjectVersionId ? data.metadata.ancestor_draft_id : (logicObjectId || ''), operator: 'EQUAL' },
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
    {
      key: 'tab-assets',
      title: i18n('АКТИВЫ'),
      content: (
        <Table
          key={`${logicObjectId + tblAttrsKey + (logicObjectVersionId ?? '')}-assets`}
          className={styles.table}
          columns={assetsTableColumns}
          paginate
          columnSearch
          globalSearch
          dataUrl={
            logicObjectId === ''
              ? ''
              : '/v1/data_assets/search'
          }
          initialFetchRequest={{
            sort: 'name+',
            global_query: '',
            limit: 5,
            offset: (state.p3 - 1) * 5,
            filters: [],
            filters_preset: [
              { column: 'entity_id', value: logicObjectVersionId ? data.metadata.ancestor_draft_id : (logicObjectId || ''), operator: 'EQUAL' },
            ],
            filters_for_join: [],
          }}
          onRowClick={(row: any) => {
            navigate(`/data_assets/edit/${encodeURIComponent(row.id)}`);
          }}
          showCreateBtn={false}
          onPageChange={(page: number) => {
            setState(() => ({ p3: page }));
          }}
        />
      ),
    },
  ];

  useEffect(() => {
    if (id) setLogicObjectId(id);
    setLogicObjectVersionId(version_id ?? '');
    setDataModified(false);
  }, [id, version_id]);

  useEffect(() => {
    setCreateMode(logicObjectId === '');
    if (logicObjectId) {
      if (!logicObjectVersionId) { setRecentView('entity', logicObjectId); }

      loadEditPageData(logicObjectId, logicObjectVersionId, setData, setTags, setLoading, setLoaded, getEntityVersion, getEntity,
        setRatingData, setOwnRating, getEntityVersions, setVersions, setReadOnly);

    } else {
      setData((prev) => ({ ...prev, metadata: { ...prev.metadata, state: 'DRAFT' } }));
      setReadOnly(false);
      setLoaded(true);
    }
  }, [logicObjectId, logicObjectVersionId]);

  useEffect(() => {
    if (isCreateMode) {
      if (data.entity.name) {
        createEntity({
          name: data.entity.name,
          description: data.entity.description,
        })
          .then((json) => {
            setDataModified(false);
            if (json.metadata.id) {
              updateArtifactsCount();
              setLogicObjectId(json.metadata.id);
              window.history.pushState(
                {},
                '',
                `/logic-objects/edit/${encodeURIComponent(json.metadata.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

  const attrTagAdded = (tagName: string) => {
    setUpdateAttrData((prev: any) => ({ ...prev, tags: [...prev.tags, tagName] }));
  };

  const attrTagDeleted = (tagName: string) => {
    const newTags = [...updateAttrData.tags];
    for (let i = newTags.length - 1; i >= 0; i--) {
      if (newTags[i] == tagName) { newTags.splice(i, 1); }
    }
    setUpdateAttrData((prev: any) => ({ ...prev, tags: newTags }));
  };

  const addSystem = () => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, system_ids: [...prev.entity.system_ids, ''] } }));
  };

  const delSystem = (k: number) => {
    const arr: string[] = [...data.entity.system_ids];
    arr.splice(k, 1);

    updateLogicObjectField('system_ids', arr.filter((x) => x));
  };

  const updateLogicObjectSystemId = (k: number, id: string) => {
    const arr: string[] = [...data.entity.system_ids];
    if (arr.length > k) { arr[k] = id; } else { arr.push(id); }

    updateLogicObjectField('system_ids', arr.filter((x) => x));
  };

  const updateLogicObjectField = (field: string, value: string | string[]) => {
    if (logicObjectId) {
      const d: any = {};
      d[field] = value;
      updateEntity(logicObjectId, d)
        .then((json) => {
          setDataModified(false);
          if (json.metadata.id && json.metadata.id !== logicObjectId) {
            navigate(`/logic-objects/edit/${encodeURIComponent(json.metadata.id)}`);
          } else { setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } })); }
        })
        .catch(handleHttpError);
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
      setDataModified(false);
    }
  };

  return (
    <div className={classNames(styles.page, styles.entityPage, { [styles.loaded]: isLoaded })}>
      <div className={styles.mainContent}>
        {!logicObjectVersionId && (
          <WFItemControl
            key={`wfc-${uuid()}`}
            itemMetadata={data.metadata}
            itemIsReadOnly={isReadOnly}
            onEditClicked={() => { setReadOnly(false); }}
            onObjectIdChanged={(id) => {
              if (id) {
                setLogicObjectId(id);
                window.history.pushState(
                  {},
                  '',
                  `/logic-objects/edit/${encodeURIComponent(id)}`,
                );
              } else navigate('/logic-objects/');
            }}
            onObjectDataChanged={(d) => {
              setData(d);
              setDataModified(false);
              setBreadcrumbEntityName(logicObjectId, d.entity.name);
              setTags(d.metadata.tags ? d.metadata.tags.map((x: any) => ({ value: x.name })) : []);
              updateEditPageReadOnly(d, setReadOnly, () => {  setLoading(false); setLoaded(true); });
            }}
          />
        )}
        <div className={styles.title}>
          <FieldEditor
            isReadOnly={isReadOnly}
            labelPrefix={`${i18n('ЛОГИЧЕСКИЙ ОБЪЕКТ')}: `}
            defaultValue={data.entity.name}
            className={styles.title}
            valueSubmitted={(val) => {
              updateLogicObjectField('name', val.toString());
            }}
            isRequired
            onBlur={(val) => {
              updateLogicObjectField('name', val);
            }}
            showValidation={showValidation}
          />
        </div>
        {!isCreateMode && (
          <button className={styles.btn_scheme} onClick={() => { doNavigate('/model', navigate); }}>{i18n('Схема')}</button>
        )}
        {!isCreateMode && (
          <>

            <div className={styles.systems_wrap}>
              <div className={styles.systems_head}>
                <label>{`${i18n('Системы')}:`}</label>
                {!isReadOnly && (<PlusInCircle onClick={addSystem} />)}
              </div>
              {data.entity.system_ids.map((sId, k) => (
                <div key={`ds-${sId}`} className={styles.system_item}>
                  <FieldAutocompleteEditor
                    key={`se${k}`}
                    className={styles.long_input}
                    isReadOnly={isReadOnly}
                    label=""
                    defaultValue={sId}
                    valueSubmitted={(identity) => updateLogicObjectSystemId(k, identity)}
                    getDisplayValue={getSystemDisplayValue}
                    getObjects={getSystemAutocompleteObjects}
                    artifactType="system"
                  />
                  {!isReadOnly && (<Close key={`ds${k}`} onClick={() => delSystem(k)} />)}
                </div>
              ))}

            </div>
            <div className={styles.business_entity_wrap}>
              <FieldAutocompleteEditor
                className={styles.long_input}
                isReadOnly={isReadOnly}
                label={i18n('Бизнес-сущность: ')}
                defaultValue={data.entity.business_entity_id}
                valueSubmitted={(identity) => { updateLogicObjectField('business_entity_id', identity); }}
                getDisplayValue={getBusinessEntityDisplayValue}
                getObjects={getBusinessEntityAutocompleteObjects}
                isRequired={false}
                showValidation={showValidation}
                allowClear
                artifactType="business_entity"
              />
            </div>
            {!isCreateMode && (
              <div className={styles.data_row}>
                <FieldEditor
                  isReadOnly={isReadOnly}
                  layout="separated"
                  labelPrefix={`${i18n('Ключевые роли процесса')} `}
                  defaultValue={data.entity.roles}
                  className={styles.long_input}
                  valueSubmitted={(val) => {
                    updateLogicObjectField('roles', val.toString());
                  }}
                />
              </div>
            )}
          </>
        )}

        {!isCreateMode && (
          <div className={styles.description}>
            <FieldEditor
              isReadOnly={isReadOnly}
              labelPrefix={`${`${i18n('Описание')}:`} `}
              defaultValue={data.entity.description}
              className={styles.long_input}
              valueSubmitted={(val) => {
                updateLogicObjectField('description', val.toString());
              }}
              onBlur={(val) => {
                updateLogicObjectField('description', val);
              }}
            />
          </div>
        )}
        {!isCreateMode && (
          <Tags
            tags={tags}
            isReadOnly={isReadOnly}
            onTagAdded={(tagName: string) => tagAddedHandler(tagName, logicObjectId, 'entity', data.metadata.state ?? '', tags, setLoading, setTags, '/logic-objects/edit/')}
            onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, logicObjectId, 'entity', data.metadata.state ?? '', setLoading, setTags, '/logic-objects/edit/')}
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
              version_id={logicObjectVersionId || data.metadata.version_id}
              versions={versions}
              version_url_pattern={`/logic-objects/${encodeURIComponent(logicObjectId)}/version/{version_id}`}
              root_object_url={`/logic-objects/edit/${encodeURIComponent(logicObjectId)}`}
              onRateClick={r => rateClickedHandler(r, logicObjectId, 'entity', setOwnRating, setRatingData)}
            />
          )}
        </div>
      )}

      <Modal
        show={showAddAttrDlg}
        backdrop={false}
        onHide={handleAddAttrDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Создание нового атрибута</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Input
            label={i18n('Название')}
            value={newAttrData.name}
            onChange={(e) => {
              setNewAttrData((prev: any) => ({ ...prev, name: e.target.value }));
            }}
          />
          {errorNameText ? <div className={styles.error}>{errorNameText}</div> : ''}
          <Textarea
            label={i18n('Описание')}
            value={newAttrData.description}
            onChange={(e) => {
              setNewAttrData((prev: any) => ({ ...prev, description: e.target.value }));
            }}
          />
          <Autocomplete
            label={i18n('Тип')}
            getOptions={getAttrType}
            defaultOptions
            defaultValue={newAttrData.attribute_type}
            onChanged={(d: any) => {
              setNewAttrData((prev: any) => ({
                ...prev,
                attribute_type: d.id,
              }));
            }}
          />
          {errorTypeText ? <div className={styles.error}>{errorTypeText}</div> : ''}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={addAttrDlgSubmit}
          >
            Создать
          </Button>
          <Button
            variant="secondary"
            onClick={handleAddAttrDlgClose}
          >
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showUpdateAttrDlg}
        backdrop={false}
        onHide={handleUpdateAttrDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Изменение атрибута</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Input
            label={i18n('Название')}
            value={updateAttrData.name}
            
            onChange={(e) => {
              setUpdateAttrData((prev: any) => ({ ...prev, name: e.target.value }));
            }}
          />
          <Tags key={`attr-tags-${updateAttrData.id}`} isReadOnly={false} tags={updateAttrData.tags.map((x: string) => ({ value: x }))} onTagAdded={attrTagAdded} onTagDeleted={attrTagDeleted} />
          <Textarea
            label={i18n('Описание')}
            value={updateAttrData.description}
            onChange={(e) => {
              setUpdateAttrData((prev: any) => ({ ...prev, description: e.target.value }));
            }}
          />
          <Autocomplete
            label={i18n('Тип')}
            getOptions={getAttrType}
            defaultOptions
            onChanged={(d: any) => {
              setUpdateAttrData((prev: any) => ({
                ...prev,
                attribute_type: d.id,
              }));
            }}
            placeholder={renderAttribute(updateAttrData.attribute_type)}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={updateAttrDlgSubmit}
          >
            Изменить
          </Button>
          <Button
            variant="secondary"
            onClick={handleUpdateAttrDlgClose}
          >
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showAddEntityDlg}
        backdrop={false}
        onHide={handleAddEntityDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Создание нового логического объекта</Modal.Title>
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

      <Modal
        show={showDelEntityAttrDlg}
        backdrop={false}
        onHide={handleDelEntityAttrDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Вы действительно хотите удалить
            {' '}
            {delEntityAttrData.name}
            ?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body />
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => delEntityAttrDlgSubmit(delEntityAttrData.id, delEntityAttrData.name, delEntityAttrData.attribute_id)}
          >
            Удалить
          </Button>
          <Button
            variant="secondary"
            onClick={handleDelEntityAttrDlgClose}
          >
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
