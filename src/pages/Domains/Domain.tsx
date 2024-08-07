/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import useUrlState from '@ahooksjs/use-url-state';
import classNames from 'classnames';
import styles from './Domains.module.scss';
import { doNavigate, handleHttpError, i18n, loadEditPageData, rateClickedHandler, setBreadcrumbEntityName, setDataModified, tagAddedHandler, tagDeletedHandler, updateArtifactsCount, updateEditPageReadOnly, uuid } from '../../utils';
import {
  createDomain,
  getDomain,
  getDomainVersions,
  updateDomain,
  deleteSystem,
  getDomainVersion,
  deleteDomain,
  restoreDomainVersion,
  archiveDomain,
  restoreDomain,
} from '../../services/pages/domains';
import { Tags, TagProp } from '../../components/Tags';
import { Versions, VersionData } from '../../components/Versions';
import { FieldEditor } from '../../components/FieldEditor';
import { setRecentView } from '../../services/pages/recentviews';
import { WFItemControl } from '../../components/WFItemControl/WFItemControl';
import { Checkbox } from '../../components/Checkbox';
import { RelatedObjectsControl } from '../../components/RelatedObjectsControl';
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import { Responsibles } from '../../components/Responsibles';
import { FieldVisualEditor } from '../../components/FieldVisualEditor';

export function Domain() {
  const [state, setState] = useUrlState({
    t: '1', p1: '1', p2: '1', p3: '1', p4: '1', p5: '1', p6: '1', p7: '1', p8: '1',
  }, { navigateMode: 'replace' });
  const [, setLoading] = useState(true);

  const navigate = useNavigate();

  const [data, setData] = useState({
    entity: { name: null, description: '', system_ids: [] },
    metadata: { id: '', artifact_type: 'domain', version_id: '', tags: [], state: 'PUBLISHED', ancestor_draft_id: '', workflow_task_id: '' },
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
  const [domainId, setDomainId] = useState<string>(id ?? '');
  const [domainVersionId, setDomainVersionId] = useState<string>(version_id ?? '');

  const [showAddSystemDlg, setShowAddSystemDlg] = useState(false);
  const [unlinkedSystemsList, setUnlinkedSystemsList] = useState([]);
  const [addSystemIds, setAddSystemIds] = useState<string[]>([]);

  const [showDelSystemDlg, setShowDelSystemDlg] = useState(false);
  const [delSystemData, setDelSystemData] = useState<any>({ id: '', name: '' });

  const [delObjectData, setDelObjectData] = useState<any>({ id: '', name: '' });
  const [showDelDlg, setShowDelDlg] = useState(false);


  useEffect(() => {
    if (id) { setDomainId(id); }
    setDomainVersionId(version_id ?? '');
    setDataModified(true);
  }, [id, version_id]);

  const handleAddSystemDlgClose = () => {
    setShowAddSystemDlg(false);
    return false;
  };
  const handleDelSystemDlgClose = () => {
    setShowDelSystemDlg(false);
    return false;
  };

  const addSystemDlgSubmit = () => {
    setShowAddSystemDlg(false);
    setLoading(true);

    updateDomainField('system_ids', [...data.entity.system_ids, ...addSystemIds]);
  };

  const delSystemDlgSubmit = (identity: string) => {
    setShowDelSystemDlg(false);
    setLoading(true);
    deleteSystem(identity)
      .then(() => {
        setLoading(false);
      })
      .catch(handleHttpError);
    setDelSystemData({ id: '', name: '' });
  };

  useEffect(() => {
    setCreateMode(domainId === '');
    if (domainId) {
      if (!domainVersionId) { setRecentView('domain', domainId); }

      loadEditPageData(domainId, domainVersionId, setData, setTags, setLoading, setLoaded, getDomainVersion, getDomain,
        setRatingData, setOwnRating, getDomainVersions, setVersions, setReadOnly);
      
    } else {
      setData((prev) => ({ ...prev, metadata: { ...prev.metadata, state: 'DRAFT' } }));
      setReadOnly(false);
      setLoaded(true);
    }
  }, [domainId, domainVersionId]);

  useEffect(() => {
    if (isCreateMode) {
      if (data.entity.name) {
        createDomain({
          name: data.entity.name,
          description: data.entity.description,
        })
          .then((json) => {
            setDataModified(false);
            updateArtifactsCount();
            if (json.metadata.id) {
              setDomainId(json.metadata.id);
              window.history.pushState(
                {},
                '',
                `/domains/edit/${encodeURIComponent(json.metadata.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

  const updateDomainField = (field: string, value: string | string[]) => {
    if (domainId) {
      const d: any = {};
      d[field] = value;
      updateDomain(domainId, d)
        .then((json) => {
          if (json.metadata.id && json.metadata.id != domainId) {
            navigate(`/domains/edit/${encodeURIComponent(json.metadata.id)}`);
          }
          setDataModified(false);
        })
        .catch(handleHttpError);
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
      setDataModified(true);
    }
  };

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    setLoading(true);
    deleteDomain(delObjectData.id)
      .then(json => {
        updateArtifactsCount();
        setLoading(false);

        if (json.metadata && json.metadata.id)
          navigate('/domains/edit/' + encodeURIComponent(json.metadata.id));
      })
      .catch(handleHttpError);
    setDelObjectData({ id: '', name: '' });
  };

  const archiveBtnClicked = () => { archiveDomain(data.metadata.id).then(json => {
    if (json.metadata.id && json.metadata.id != domainId) {
      navigate(`/domains/edit/${encodeURIComponent(json.metadata.id)}`);
    }
    setDataModified(false);
  }).catch(handleHttpError); };

  const restoreBtnClicked = () => { restoreDomain(data.metadata.id).then(json => {
    if (json.metadata.id && json.metadata.id != domainId) {
      navigate(`/domains/edit/${encodeURIComponent(json.metadata.id)}`);
    }
    setDataModified(false);
  }).catch(handleHttpError); };

  return (
    <div className={classNames(styles.page, styles.domainPage, { [styles.loaded]: isLoaded })}>
      <div className={styles.mainContent}>
      {domainVersionId && (
          <Button onClick={() => {
            restoreDomainVersion(domainId, domainVersionId).then(json => {
              setDataModified(false);
              if (json.metadata.id && json.metadata.id !== domainId) {
                navigate(`/domains/edit/${encodeURIComponent(json.metadata.id)}`);
              } else { setData(json); }
            }).catch(handleHttpError);
          }}>{i18n('Восстановить')}</Button>
        )}
        {!domainVersionId && (
          <WFItemControl
            key={`wfc-domain-` + data?.metadata?.workflow_task_id + '-' + uuid()}
            itemMetadata={data.metadata}
            itemIsReadOnly={isReadOnly}
            onEditClicked={() => { setReadOnly(false); }}
            onArchiveClicked={archiveBtnClicked}
            onRestoreClicked={restoreBtnClicked}
            onDeleteClicked={() => { setDelObjectData({ id: data.metadata.id, name: data.entity.name }); setShowDelDlg(true); }}
            onObjectIdChanged={(id) => {
              if (id) {
                setDomainId(id);
                window.history.pushState(
                  {},
                  '',
                  `/domains/edit/${encodeURIComponent(id)}`,
                );
              } else navigate('/domains/');
            }}
            onObjectDataChanged={(data) => {
              setData(data);
              setDataModified(false);
              setBreadcrumbEntityName(domainId, data.entity.name);
              setTags(data.metadata.tags ? data.metadata.tags.map((x: any) => ({ value: x.name })) : []);
              
              updateEditPageReadOnly(data, setReadOnly, () => {  setLoading(false); setLoaded(true); });
            }}
          />
        )}
        <div className={styles.title}>
          <FieldEditor
            isReadOnly={isReadOnly}
            labelPrefix={`${i18n('ДОМЕН')}: `}
            defaultValue={data.entity.name}
            className={styles.title}
            valueSubmitted={(val) => {
              updateDomainField('name', val.toString());
            }}
            isRequired
            onBlur={(val) => {
              updateDomainField('name', val);
            }}
            showValidation={showValidation}
          />
        </div>
        {!isCreateMode && data.metadata.state != 'ARCHIVED' && (
          <button className={styles.btn_scheme} onClick={() => { doNavigate(`/domains-model/${encodeURIComponent(domainId)}`, navigate); }}>{i18n('Схема')}</button>
        )}
        {!isCreateMode && (
          <div className={styles.description}>
            <FieldVisualEditor
              isReadOnly={isReadOnly}
              labelPrefix={`${i18n('Описание')}:`}
              defaultValue={data.entity.description}
              className={styles.long_input}
              valueSubmitted={(val) => {
                updateDomainField('description', val.toString());
              }}
              layout=''
              isRequired
              onBlur={(val) => {
                updateDomainField('description', val);
              }}
            />
          </div>
        )}
        {!isCreateMode && (
          <Tags
            key={'tags-' + domainId + '-' + domainVersionId + '-' + uuid()}
            isReadOnly={isReadOnly}
            tags={tags}
            onTagAdded={(tagName: string) => tagAddedHandler(tagName, domainId, 'domain', data.metadata.state ?? '', tags, setLoading, setTags, '/domains/edit/', navigate)}
            onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, domainId, 'domain', data.metadata.state ?? '', setLoading, setTags, '/domains/edit/', navigate)}
          />
        )}
        
        <RelatedObjectsControl artifactId={domainId} artifactType='domain'></RelatedObjectsControl>
        
      </div>
      {!isCreateMode && (
        <div className={styles.rightBar}>
          {(data.metadata.state == 'PUBLISHED' || data.metadata.state == 'ARCHIVED') && (
            <Versions
              rating={ratingData.rating}
              ownRating={ownRating}
              version_id={domainVersionId || data.metadata.version_id}
              versions={versions}
              version_url_pattern={`/domains/${encodeURIComponent(domainId)}/version/{version_id}`}
              root_object_url={`/domains/edit/${encodeURIComponent(domainId)}`}
              onRateClick={r => rateClickedHandler(r, domainId, 'domain', setOwnRating, setRatingData)}
            />
          )}
          {data.metadata.state === 'PUBLISHED' && (
            <Responsibles domain_id={(data && data.metadata && data.metadata.id) ? data.metadata.id : null}></Responsibles>
          )}
        </div>
      )}

      <Modal
        show={showAddSystemDlg}
        backdrop={false}
        onHide={handleAddSystemDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Добавить системы</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.add_systems_list}>
            {unlinkedSystemsList.map((system: any) => (
              <div key={`sdiv-${system.metadata.id}`} className={styles.new_system_item}>
                <Checkbox
                  value={system.metadata.id}
                  label={system.entity.name}
                  className={styles.cb_add_system}
                  id={`cb-ns-${system.metadata.id}`}
                  checked={addSystemIds.filter((x) => x == system.id).length > 0}
                  onChange={(e) => { if (e.target.checked) setAddSystemIds((prev) => ([...prev, system.metadata.id])); else setAddSystemIds((prev) => prev.filter((x) => x != system.metadata.id)); }}
                />
              </div>
            ))}
          </div>

        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={addSystemDlgSubmit}
          >
            Добавить
          </Button>
          <Button
            variant="secondary"
            onClick={handleAddSystemDlgClose}
          >
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDelSystemDlg}
        backdrop={false}
        onHide={handleDelSystemDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Вы действительно хотите удалить
            {delSystemData.name}
            ?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body />
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => delSystemDlgSubmit(delSystemData.id)}
          >
            Удалить
          </Button>
          <Button
            variant="secondary"
            onClick={handleDelSystemDlgClose}
          >
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>

      <DeleteObjectModal show={showDelDlg} objectTitle={delObjectData.name} onClose={() => { setShowDelDlg(false); return false; }} onSubmit={delDlgSubmit} />
    </div>
  );
}
