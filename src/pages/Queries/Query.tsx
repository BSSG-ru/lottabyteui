/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import { Button, Modal } from 'react-bootstrap';
import styles from './Queries.module.scss';
import { doNavigate, getEntityAutocompleteObjects, getEntityDisplayValue, getSystemAutocompleteObjects, getSystemDisplayValue, handleHttpError, i18n, loadEditPageData, rateClickedHandler, setBreadcrumbEntityName, setDataModified, tagAddedHandler, tagDeletedHandler, updateArtifactsCount, updateEditPageReadOnly, uuid } from '../../utils';
import {
  archiveEntityQuery,
  createEntityQuery,
  deleteEntityQuery,
  getEntityQuery,
  getEntityQueryVersion,
  getEntityQueryVersions,
  restoreEntityQuery,
  restoreEntityQueryVersion,
  updateEntityQuery,
} from '../../services/pages/entityQueries';
import { Tags, TagProp } from '../../components/Tags';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { TasksControl } from '../../components/TasksControl';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import { RelatedObjectsControl } from '../../components/RelatedObjectsControl';
import { EditPage } from '../../components/EditPage';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';
import { FieldVisualEditor } from '../../components/FieldVisualEditor';

export function Query() {
  const navigate = useNavigate();
  const [, setLoading] = useState(true);
  const [data, setData] = useState<any>({
    entity: {
      name: null,
      query_text: null,
      system_id: null,
      entity_id: null,
      custom_attributes: [],
    },
    metadata: { id: '', artifact_type: 'entity_query', version_id: '', tags: [], state: 'PUBLISHED', created_by: '' },
  });
  const [tags, setTags] = useState<TagProp[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  
  const [isReadOnly, setReadOnly] = useState(true);
  const [isLoaded, setLoaded] = useState(false);

  const { id, version_id } = useParams();

  const [queryId, setQueryId] = useState<string>(id ?? '');
  const [queryVersionId, setQueryVersionId] = useState<string>(version_id ?? '');

  const [showAddQueryDlg, setShowAddQueryDlg] = useState(false);
  const [newQueryData, setNewQueryData] = useState<any>({
    name: '',
    description: '',
  });

  const handleAddEntityDlgClose = () => {
    setShowAddQueryDlg(false);
    return false;
  };

  const addQueryDlgSubmit = () => {
    setShowAddQueryDlg(false);
    setLoading(true);
    createEntityQuery(newQueryData)
      .then((json) => {
        setLoading(false);
        updateArtifactsCount();
        setQueryId(json.metadata.id);
        window.history.pushState(
          {},
          '',
          `/queries/edit/${encodeURIComponent(json.metadata.id)}`,
        );
      })
      .catch(handleHttpError);
    setNewQueryData({ name: '', description: '' });
  };

  useEffect(() => {
    if (id) setQueryId(id);
    setQueryVersionId(version_id ?? '');
    setDataModified(false);
  }, [id, version_id]);

  const updateQueryField = (field: string, value: string | string[] | undefined) => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    setDataModified(true);
  };

  return (
    <>
      <EditPage objectId={queryId} objectVersionId={queryVersionId} data={data} restoreVersion={restoreEntityQueryVersion} urlSlug='queries' setData={setData} isReadOnly={isReadOnly} setReadOnly={setReadOnly}
        archiveObject={archiveEntityQuery} artifactType='entity_query' setTags={setTags} getObjectVersion={getEntityQueryVersion} getObjectVersions={getEntityQueryVersions} getObject={getEntityQuery} deleteObject={deleteEntityQuery}
        restoreObject={restoreEntityQuery} updateObject={updateEntityQuery} tabs={[
        {
          key: 'tab-gen',
          title: i18n('Сведения'),
          unscrollable: true,
          content: <div className={styles.tab_2col}>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Общая информация</h2>
              {data.metadata.state != 'ARCHIVED' && (
                <div>
                <button className={styles.btn_scheme} onClick={() => { doNavigate(`/queries-model/${encodeURIComponent(queryId)}`, navigate); }}>{i18n('Смотреть схему')}</button>
                </div>
              )}

              <FieldTextEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Название')}
                  defaultValue={data.entity.name}
                  className=''
                  valueSubmitted={(val) => {
                    updateQueryField('name', val);
                  }}
                />

              <div data-uitest="query_tag" className={styles.tags_block}>
                <div className={styles.label}>{i18n('Теги')}</div>
                <Tags
                  key={'tags-' + queryId + '-' + queryVersionId + '-' + uuid()}
                  isReadOnly={isReadOnly}
                  tags={tags}
                  tagPrefix='#'
                  onTagAdded={(tagName: string) => tagAddedHandler(tagName, queryId, 'entity_query', data.metadata.state ?? '', tags, setLoading, setTags, '/queries/edit/', navigate)}
                  onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, queryId, 'entity_query', data.metadata.state ?? '', setLoading, setTags, '/queries/edit/', navigate)}
                />
              </div>
            </div>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Дополнительные параметры</h2>

              <FieldAutocompleteEditor
                label={i18n('Система')}
                defaultValue={data.entity.system_id}
                valueSubmitted={(identity) => updateQueryField('system_id', identity)}
                getDisplayValue={getSystemDisplayValue}
                getObjects={getSystemAutocompleteObjects}
                isRequired
                isReadOnly={isReadOnly}
                showValidation={showValidation}
                artifactType='system'
              />

              <FieldAutocompleteEditor
                label={i18n('Модель')}
                defaultValue={data.entity.entity_id}
                valueSubmitted={(identity) => updateQueryField('entity_id', identity)}
                getDisplayValue={getEntityDisplayValue}
                getObjects={getEntityAutocompleteObjects}
                isRequired
                isReadOnly={isReadOnly}
                showValidation={showValidation}
                artifactType='entity'
              />

              <FieldTextareaEditor
                label={i18n('Текст запроса')}
                isReadOnly={isReadOnly}
                defaultValue={data.entity.query_text}
                valueSubmitted={(value) => updateQueryField('query_text', value)}
                isRequired
                showValidation={showValidation}
              />

              {data.metadata.state == 'PUBLISHED' && (
                <>
                  <label className={styles.lbl_tasks}>{i18n('Выполнение запроса')}</label>
                  <TasksControl queryId={queryId} isReadOnly={false} />
                </>
              )}
            </div>
          </div>
        },
        {
          key: 'tab-related',
          title: i18n('Связи'),
          content: <div className={styles.tab_white}>
            <RelatedObjectsControl artifactId={queryId} artifactType='entity_query'></RelatedObjectsControl>
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
                  updateQueryField('description', val);
                }}
              />  
          
          </div>
        }
      ]} />

      <Modal
        show={showAddQueryDlg}
        backdrop={false}
        onHide={handleAddEntityDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Создание нового запроса</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Input
            label={i18n('Название')}
            value={newQueryData.name}
            onChange={(e) => {
              setNewQueryData((prev: any) => ({ ...prev, name: e.target.value }));
            }}
          />
          <Textarea
            label={i18n('Описание')}
            value={newQueryData.description}
            onChange={(e) => {
              setNewQueryData((prev: any) => ({ ...prev, description: e.target.value }));
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={addQueryDlgSubmit}
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
