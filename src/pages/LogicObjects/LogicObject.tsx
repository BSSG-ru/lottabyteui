/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import classNames from 'classnames';
import styles from './LogicObjects.module.scss';
import { doNavigate, getArtifactUrl, getBusinessEntityAutocompleteObjects, getBusinessEntityDisplayValue, getSystemAutocompleteObjects, getSystemDisplayValue, getTablePageSize, handleHttpError, i18n, loadEditPageData, rateClickedHandler, setBreadcrumbEntityName, setDataModified, tagAddedHandler, tagDeletedHandler, updateArtifactsCount, updateEditPageReadOnly, uuid } from '../../utils';
import { Tags, TagProp } from '../../components/Tags';
import { attributesTableColumns, renderAttribute } from '../../mocks/logic_objects';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import {
  archiveEntity,
  createAttr,
  createEntity,
  deleteEntity,
  deleteEntityAttr,
  getAttrTypes,
  getEntity,
  getEntityAttributes,
  getEntityVersion,
  getEntityVersions,
  restoreEntity,
  restoreEntityVersion,
  updateAttr,
  updateEntity,
} from '../../services/pages/dataEntities';
import { Autocomplete } from '../../components/Autocomplete';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { createDraft } from '../../services/pages/tags';
import { Checkbox } from '../../components/Checkbox';
import { RelatedObjectsControl } from '../../components/RelatedObjectsControl';
import { FieldVisualEditor } from '../../components/FieldVisualEditor';
import { EditPage } from '../../components/EditPage';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';
import { Button } from '../../components/Button';
import { Table } from '../../components/Table';
import { FieldArrayEditor } from '../../components/FieldArrayEditor/FieldArrayEditor';
import { getSystem, getSystems } from '../../services/pages/systems';

export function LogicObject() {
  const navigate = useNavigate();

  const [, setLoading] = useState(true);
  const [data, setData] = useState({
    entity: { name: '', description: '', system_ids: [], business_entity_id: '', roles: '', tech_name: '', short_description: '' },
    metadata: { id: '', artifact_type: 'entity', version_id: '', tags: [], state: 'PUBLISHED', ancestor_draft_id: '', workflow_task_id: '', created_by: '' },
  });
  const [tags, setTags] = useState<TagProp[]>([]);

  const [showValidation, setShowValidation] = useState(false);

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
  const [selectedSystemNames, setSelectedSystemNames] = useState<any[]>([]);

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
    attribute_id: '',
    is_pk: false
  });

  useEffect(() => {
    const a = [];
    for (let i = 0; i < data.entity.system_ids.length; i++) { a.push(''); }
    setSelectedSystemNames(a);

    data.entity.system_ids.forEach((id, index) => {
      getSystem(id).then((json) => {
        setSelectedSystemNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'system')}">${json.entity.name}</a></div>`, ...prev.slice(index + 1)]));
      }).catch(handleHttpError);
    });
  }, [data.entity.system_ids]);

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
              navigate(`/logic-objects/edit/${encodeURIComponent(json.metadata.id)}?sc=2`);
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

  useEffect(() => {
    if (id) setLogicObjectId(id);
    setLogicObjectVersionId(version_id ?? '');
    setDataModified(false);
  }, [id, version_id]);

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

  const updateLogicObjectField = (field: string, value: string | string[] | undefined) => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    setDataModified(true);
  };

  const getSystemOptions = async (search: string) => getSystems({ filters: [], filters_for_join: [], global_query: search, limit: 1000, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

  return (
    <>
      <EditPage objectId={logicObjectId} objectVersionId={logicObjectVersionId} data={data} restoreVersion={restoreEntityVersion} urlSlug='logic-objects' setData={setData} isReadOnly={isReadOnly} setReadOnly={setReadOnly}
      archiveObject={archiveEntity} artifactType='entity' setTags={setTags} getObjectVersion={getEntityVersion} getObjectVersions={getEntityVersions} getObject={getEntity} deleteObject={deleteEntity}
      restoreObject={restoreEntity} updateObject={updateEntity} tabs={[
        {
          key: 'tab-gen',
          title: i18n('Сведения'),
          unscrollable: true,
          content: <div className={styles.tab_2col}>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Общая информация</h2>
              {data.metadata.state != 'ARCHIVED' && (
                <div>
                <button className={styles.btn_scheme} onClick={() => { doNavigate(`/model`, navigate); }}>{i18n('Смотреть схему')}</button>
                </div>
              )}

              <FieldTextEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Название')}
                  defaultValue={data.entity.name}
                  className=''
                  valueSubmitted={(val) => {
                    updateLogicObjectField('name', val);
                  }}
                />

              <FieldTextareaEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Описание')}
                  defaultValue={data.entity.short_description}
                  className=''
                  valueSubmitted={(val) => {
                    updateLogicObjectField('short_description', val);
                  }}
                />

              <div data-uitest="entity_tag" className={styles.tags_block}>
                <div className={styles.label}>{i18n('Теги')}</div>
                <Tags
                  key={'tags-' + logicObjectId + '-' + logicObjectVersionId + '-' + uuid()}
                  isReadOnly={isReadOnly}
                  tags={tags}
                  tagPrefix='#'
                  onTagAdded={(tagName: string) => tagAddedHandler(tagName, logicObjectId, 'entity', data.metadata.state ?? '', tags, setLoading, setTags, '/logic-objects/edit/', navigate)}
                  onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, logicObjectId, 'entity', data.metadata.state ?? '', setLoading, setTags, '/logic-objects/edit/', navigate)}
                />
              </div>
            </div>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Дополнительные параметры</h2>

              <FieldTextEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Техническое название')}
                  defaultValue={data.entity.tech_name}
                  className=''
                  valueSubmitted={(val) => {
                    updateLogicObjectField('tech_name', val);
                  }}
                />

              <FieldArrayEditor
                key={`ed-sys-${logicObjectId}`}
                getOptions={getSystemOptions}
                isReadOnly={isReadOnly}
                label={i18n('Системы')}
                defaultValue={selectedSystemNames}
                inputPlaceholder={i18n('Выберите систему')}
                addBtnText={i18n('Добавить')}
                valueSubmitted={() => { updateLogicObjectField('system_ids', data.entity.system_ids); }}
                onValueIdAdded={(id: string) => {
                  setData((prev:any) => ({ ...prev, entity: { ...prev.entity, system_ids: [...prev.entity.system_ids, id] } }));
                }}
                onValueIdRemoved={(id: string) => {
                  const arr = [...data.entity.system_ids];
                  arr.splice(parseInt(id), 1);
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, system_ids: arr } }));
                }}
              />

              <FieldAutocompleteEditor
                className=''
                isReadOnly={isReadOnly}
                label={i18n('Глоссарий')}
                defaultValue={data.entity.business_entity_id}
                valueSubmitted={(identity) => { updateLogicObjectField('business_entity_id', identity); }}
                getDisplayValue={getBusinessEntityDisplayValue}
                getObjects={getBusinessEntityAutocompleteObjects}
                isRequired={false}
                showValidation={showValidation}
                allowClear
                artifactType="business_entity"
              />

              <FieldTextEditor
                isReadOnly={isReadOnly}
                label={i18n('Ключевые роли процесса')}
                defaultValue={data.entity.roles}
                className=''
                valueSubmitted={(val) => {
                  updateLogicObjectField('roles', val);
                }}
              />
            </div>
          </div>
        },
        {
          key: 'tab-attrs',
          title: i18n('Атрибуты'),
          content: <div className={classNames(styles.tab_white, styles.tab_attrs)}>
            {!isReadOnly && (<Button background='blue' className={styles.btn_add_attr} onClick={() => setShowAddAttrDlg(true)}>{i18n('Создать атрибут')}</Button>)}
            <Table
              cookieKey={'tab-tbl-eattrs'}
              key={`tab-tbl-attrs-` + logicObjectId + tblAttrsKey}
              className={styles.table}
              columns={attributesTableColumns}
              paginate
              columnSearch
              globalSearch
              dataUrl={`/v1/artifacts/search_related_artifacts/entity/${logicObjectId}/entity_attribute`}
              initialFetchRequest={{
                sort: 'name+',
                global_query: '',
                limit: getTablePageSize('related-entity_attribute'),
                offset: 0,//(state.p6 - 1) * 5,
                filters: [],
                filters_preset: [],
                filters_for_join: [],
                state: 'PUBLISHED'
              }}
              onDeleteClicked={(row: any) => {
                setDelEntityAttrData({ id: row.id, name: row.name, attribute_id: row.attribute_id });
                setShowDelEntityAttrDlg(true);
              }}
              onRowClick={(row: any) => {}}
              onPageChange={(page: number) => {
                //setState(() => ({ p6: page }));
              }}
              pageSizeCookieSuffix={'related-entity_attribute'}
            />
          </div>
        },
        {
          key: 'tab-related',
          title: i18n('Связи'),
          content: <div className={styles.tab_white}>
            <RelatedObjectsControl key={'roc-' + logicObjectId + tblAttrsKey + (logicObjectVersionId ?? '')} artifactId={logicObjectId} artifactType='entity' 
              
            ></RelatedObjectsControl>
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
                  updateLogicObjectField('description', val.toString());
                }}
              />  
          
          </div>
        }
      ]} />

      <Modal
          show={showAddAttrDlg}
          backdrop={false}
          onHide={handleAddAttrDlgClose}
          dialogClassName={styles.dlg_add_attr}
        >
          <Modal.Header closeButton>
            <Modal.Title>Создание нового атрибута</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className={styles.fields}>
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
            <Checkbox id='create_attr_pk' label='Первичный ключ' checked={false} value='1' onChange={(e) => { setNewAttrData((prev:any) => ({ ...prev, is_pk: e.target.checked })) }} />
            {errorTypeText ? <div className={styles.error}>{errorTypeText}</div> : ''}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              background='blue'
              onClick={addAttrDlgSubmit}
            >
              Создать
            </Button>
            <Button
              background='outlined-blue'
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
            <Tags key={`attr-tags-${updateAttrData.id}`} tagPrefix='#' isReadOnly={false} tags={updateAttrData.tags.map((x: string) => ({ value: x }))} onTagAdded={attrTagAdded} onTagDeleted={attrTagDeleted} />
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
            <Checkbox id='edit_attr_pk' label='Первичный ключ' checked={updateAttrData.is_pk} value='1' onChange={(e) => { setUpdateAttrData((prev:any) => ({ ...prev, is_pk: e.target.checked })) }} />
          </Modal.Body>
          <Modal.Footer>
            <Button
              background='blue'
              onClick={updateAttrDlgSubmit}
            >
              Изменить
            </Button>
            <Button
              background='outlined-blue'
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
            <Modal.Title>Создание новой модели</Modal.Title>
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
              background='blue'
              onClick={addEntityDlgSubmit}
            >
              Создать
            </Button>
            <Button
              background='outlined-blue'
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
              background='blue'
              onClick={() => delEntityDlgSubmit(delEntityData.id)}
            >
              Удалить
            </Button>
            <Button
              background='outlined-blue'
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
              background='blue'
              onClick={() => delEntityAttrDlgSubmit(delEntityAttrData.id, delEntityAttrData.name, delEntityAttrData.attribute_id)}
            >
              Удалить
            </Button>
            <Button
              background='outlined-blue'
              onClick={handleDelEntityAttrDlgClose}
            >
              Отмена
            </Button>
          </Modal.Footer>
        </Modal>
      </>
  );
}
