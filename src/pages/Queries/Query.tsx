/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import { Button, Modal } from 'react-bootstrap';
import styles from './Queries.module.scss';
import { doNavigate, handleHttpError, i18n, loadEditPageData, rateClickedHandler, setBreadcrumbEntityName, setDataModified, tagAddedHandler, tagDeletedHandler, updateArtifactsCount, updateEditPageReadOnly } from '../../utils';
import {
  createEntityQuery,
  deleteEntityQuery,
  getEntityQuery,
  getEntityQueryVersion,
  getEntityQueryVersions,
  updateEntityQuery,
} from '../../services/pages/entityQueries';
import { Tags, TagProp } from '../../components/Tags';
import { Versions, VersionData } from '../../components/Versions';
import { FieldEditor } from '../../components/FieldEditor';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { getSystem, getSystems } from '../../services/pages/systems';
import { getEntities, getEntity } from '../../services/pages/dataEntities';
import { TasksControl } from '../../components/TasksControl';
import { setRecentView } from '../../services/pages/recentviews';
import { WFItemControl } from '../../components/WFItemControl/WFItemControl';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';

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
    metadata: { id: '', artifact_type: 'entity_query', version_id: '', tags: [], state: 'PUBLISHED' },
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

  const [queryId, setQueryId] = useState<string>(id ?? '');
  const [queryVersionId, setQueryVersionId] = useState<string>(version_id ?? '');

  const [showAddQueryDlg, setShowAddQueryDlg] = useState(false);
  const [newQueryData, setNewQueryData] = useState<any>({
    name: '',
    description: '',
  });

  const [showDelQueryDlg, setShowDelQueryDlg] = useState(false);
  const [delQueryData, setDelQueryData] = useState<any>({ id: '', name: '' });

  const handleAddEntityDlgClose = () => {
    setShowAddQueryDlg(false);
    return false;
  };
  const handleDelEntityDlgClose = () => {
    setShowDelQueryDlg(false);
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

  const delEntityDlgSubmit = (identity: string) => {
    setShowDelQueryDlg(false);
    setLoading(true);
    deleteEntityQuery(identity)
      .then(() => {
        setLoading(false);
      })
      .catch(handleHttpError);
    setDelQueryData({ id: '', name: '' });
  };

  useEffect(() => {
    if (id) setQueryId(id);
    setQueryVersionId(version_id ?? '');
    setDataModified(false);
  }, [id, version_id]);

  useEffect(() => {
    setCreateMode(queryId === '');
    if (queryId) {
      if (!queryVersionId) { setRecentView('entity_query', queryId); }

      loadEditPageData(queryId, queryVersionId, setData, setTags, setLoading, setLoaded, getEntityQueryVersion, getEntityQuery,
        setRatingData, setOwnRating, getEntityQueryVersions, setVersions, setReadOnly);

    } else {
      setData((prev: any) => ({ ...prev, metadata: { ...prev.metadata, state: 'DRAFT' } }));
      setDataModified(false);
      setReadOnly(false);
      setLoaded(true);
    }
  }, [queryId, queryVersionId]);

  useEffect(() => {
    if (isCreateMode) {
      if (
        data.entity.name
        && data.entity.entity_id
        && data.entity.system_id
        && data.entity.query_text
      ) {
        createEntityQuery(data.entity)
          .then((json) => {
            setDataModified(false);
            updateArtifactsCount();
            if (json.metadata.id) {
              setQueryId(json.metadata.id);
              window.history.pushState(
                {},
                '',
                `/queries/edit/${encodeURIComponent(json.metadata.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

  const updateEntityQueryField = (field: string, value: string) => {
    if (queryId) {
      const d: any = {};
      d[field] = value;
      updateEntityQuery(queryId, d)
        .then((json) => {
          setDataModified(false);
          if (json.metadata.id && json.metadata.id !== queryId) {
            navigate(`/queries/edit/${encodeURIComponent(json.metadata.id)}`);
          } else { setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } })); }
        })
        .catch(handleHttpError);
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
      setDataModified(false);
    }
  };

  const getSystemDisplayValue = async (identity: string) => {
    if (!identity) return '';
    return getSystem(identity)
      .then((json) => {
        if (json && json.entity) return json.entity.name;
        return undefined;
      })
      .catch((e) => {
        handleHttpError(e);
        return '';
      });
  };

  const getEntityDisplayValue = async (identity: string) => {
    if (!identity) return '';
    return getEntity(identity)
      .then((json) => {
        if (json && json.entity) return json.entity.name;
        return undefined;
      })
      .catch((e) => {
        handleHttpError(e);
        return '';
      });
  };

  const getSystemObjects = async (search: string) => getSystems({
    sort: 'name+',
    global_query: search,
    limit: 10,
    offset: 0,
    filters: [],
    filters_for_join: [],
  }).then((json) => json.items);

  const getEntityObjects = async (search: string) => getEntities({
    sort: 'name+',
    global_query: search,
    limit: 10,
    offset: 0,
    filters: [],
    filters_for_join: [],
  }).then((json) => json.items);

  return (
    <div className={classNames(styles.page, styles.queryPage, { [styles.loaded]: isLoaded })}>
      <div className={styles.mainContent}>
        {!queryVersionId && (
          <WFItemControl
            itemMetadata={data.metadata}
            itemIsReadOnly={isReadOnly}
            onEditClicked={() => { setReadOnly(false); }}
            onObjectIdChanged={(localQueryId) => {
              if (localQueryId) {
                setQueryId(localQueryId);
                window.history.pushState(
                  {},
                  '',
                  `/queries/edit/${encodeURIComponent(localQueryId)}`,
                );
              } else navigate('/queries/');
            }}
            onObjectDataChanged={(data) => {
              setData(data);
              setDataModified(false);
              setBreadcrumbEntityName(queryId, data.entity.name);
              setTags(data.metadata.tags ? data.metadata.tags.map((x: any) => ({ value: x.name })) : []);
              
              updateEditPageReadOnly(data, setReadOnly, () => {  setLoading(false); setLoaded(true); });
            }}
          />
        )}
        <div className={styles.title}>
          <FieldEditor
            isReadOnly={isReadOnly}
            labelPrefix={`${i18n('ЗАПРОС')}: `}
            defaultValue={data.entity.name}
            className={styles.title}
            valueSubmitted={(val) => {
              updateEntityQueryField('name', val.toString());
            }}
            isRequired
            onBlur={(val) => {
              updateEntityQueryField('name', val);
            }}
            showValidation={showValidation}
          />
        </div>
        {!isCreateMode && (
          <button className={styles.btn_scheme} onClick={() => { doNavigate('/queries-model/' + encodeURIComponent(queryId), navigate); }}>{i18n('Схема')}</button>
        )}
        {!isCreateMode && (
          <Tags
            tags={tags}
            isReadOnly={isReadOnly}
            
            onTagAdded={(tagName: string) => tagAddedHandler(tagName, queryId, 'entity_query', data.metadata.state ?? '', tags, setLoading, setTags, '/queries/edit/', navigate)}
            onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, queryId, 'entity_query', data.metadata.state ?? '', setLoading, setTags, '/queries/edit/', navigate)}
          />
        )}

        <div className={styles.general_data}>
          <div className={styles.data_row}>
            <FieldAutocompleteEditor
              className=""
              label={i18n('Система')}
              defaultValue={data.entity.system_id}
              valueSubmitted={(identity) => updateEntityQueryField('system_id', identity)}
              getDisplayValue={getSystemDisplayValue}
              getObjects={getSystemObjects}
              isRequired
              isReadOnly={isReadOnly}
              showValidation={showValidation}
              artifactType='system'
            />
          </div>
          <div className={styles.data_row}>
            <FieldAutocompleteEditor
              className=""
              label={i18n('Логический объект')}
              defaultValue={data.entity.entity_id}
              valueSubmitted={(identity) => updateEntityQueryField('entity_id', identity)}
              getDisplayValue={getEntityDisplayValue}
              getObjects={getEntityObjects}
              isRequired
              isReadOnly={isReadOnly}
              showValidation={showValidation}
              artifactType='entity'
            />
          </div>
          <div className={styles.data_row}>
            <FieldEditor
              className=""
              layout="separated"
              labelPrefix={i18n('Текст запроса')}
              isMultiline
              isReadOnly={isReadOnly}
              defaultValue={data.entity.query_text}
              valueSubmitted={(value) => updateEntityQueryField('query_text', value.toString())}
              isRequired
              showValidation={showValidation}
            />
          </div>
        </div>

        {!isCreateMode && data.metadata.state == 'PUBLISHED' && (
          <>
            <label className={styles.lbl_tasks}>{i18n('Выполнение запроса')}</label>
            <TasksControl queryId={queryId} isReadOnly={false} />
          </>
        )}
      </div>
      {!isCreateMode && (
        <div className={styles.rightBar}>
          {data.metadata.state == 'PUBLISHED' && (
          <Versions
            rating={ratingData.rating}
            ownRating={ownRating}
            version_id={queryVersionId || data.metadata.version_id}            
            versions={versions}
            version_url_pattern={`/queries/${encodeURIComponent(queryId)}/version/{version_id}`}
            root_object_url={`/queries/edit/${encodeURIComponent(queryId)}`}
            onRateClick={r => rateClickedHandler(r, queryId, 'entity_query', setOwnRating, setRatingData)}
          />
          )}
        </div>
      )}

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

      <Modal
        show={showDelQueryDlg}
        backdrop={false}
        onHide={handleDelEntityDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Вы действительно хотите удалить
            {' '}
            {delQueryData.name}
            ?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body />
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => delEntityDlgSubmit(delQueryData.id)}
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
