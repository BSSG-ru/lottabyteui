/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import classNames from 'classnames';
import styles from './Domains.module.scss';
import { doNavigate, getArtifactTypeDisplayName, getArtifactUrl, handleHttpError, i18n, setDataModified, tagAddedHandler, tagDeletedHandler, uuid } from '../../utils';
import {
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
import { Checkbox } from '../../components/Checkbox';
import { RelatedObjectsControl } from '../../components/RelatedObjectsControl';
import { FieldVisualEditor } from '../../components/FieldVisualEditor';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';
import { EditPage } from '../../components/EditPage';
import { FieldArrayEditor } from '../../components/FieldArrayEditor/FieldArrayEditor';
import { getArtifact, searchArtifacts } from '../../services/pages/artifacts';

export function Domain() {
  

  const navigate = useNavigate();

  const [data, setData] = useState<any>({
    entity: { name: '', description: '', short_description: '', system_ids: [], recommended_artifacts: [] },
    metadata: { id: '', artifact_type: 'domain', version_id: '', tags: [], state: 'PUBLISHED', ancestor_draft_id: '', workflow_task_id: '', created_by: '' },
  });

  const [, setLoading] = useState(true);
  
  const [tags, setTags] = useState<TagProp[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const [isReadOnly, setReadOnly] = useState(true);
  
  const { id, version_id } = useParams();
  const [domainId, setDomainId] = useState<string>(id ?? '');
  const [domainVersionId, setDomainVersionId] = useState<string>(version_id ?? '');

  const [showAddSystemDlg, setShowAddSystemDlg] = useState(false);
  const [unlinkedSystemsList, setUnlinkedSystemsList] = useState([]);
  const [addSystemIds, setAddSystemIds] = useState<string[]>([]);
  const [selectedRecArtifactNames, setSelectedRecArtifactNames] = useState<any[]>([]);

  const [showDelSystemDlg, setShowDelSystemDlg] = useState(false);
  const [delSystemData, setDelSystemData] = useState<any>({ id: '', name: '' });

  useEffect(() => {
    if (id) { setDomainId(id); }
    setDomainVersionId(version_id ?? '');
    setDataModified(true);
  }, [id, version_id]);

  useEffect(() => {
    setSelectedRecArtifactNames(data.entity.recommended_artifacts.map((x:any) => ''));
    data.entity.recommended_artifacts.forEach((artifact:any) => {
      getArtifact(artifact.id).then((json:any) => {
        let index = -1;
        for (let i = 0; i < data.entity.recommended_artifacts.length; i++) {
          if (data.entity.recommended_artifacts[i].id == json.id)
            index = i;
        }
        
        setSelectedRecArtifactNames((prev) => (prev.map((el, i) => { if (i == index) return `<div><a href="${getArtifactUrl(json.id, json.artifact_type)}">${json.name} (${getArtifactTypeDisplayName(json.artifact_type, false)})</a></div>`; else return el; })));
      }).catch(handleHttpError);
    });
  }, [data.entity.recommended_artifacts]);

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

    updateDomainField('system_ids', [...data.entity.system_ids, ...addSystemIds]);
  };

  const delSystemDlgSubmit = (identity: string) => {
    setShowDelSystemDlg(false);
    deleteSystem(identity)
      .then(() => {
      })
      .catch(handleHttpError);
    setDelSystemData({ id: '', name: '' });
  };

  const updateDomainField = (field: string, value: string | string[] | undefined) => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    setDataModified(true);
  };

  const getRecArtifactOptions = async (search: string) => searchArtifacts({ filters: [], filters_for_join: [], global_query: search, limit: 1000, offset: 0, sort: null, state: 'PUBLISHED' })
    .then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name + ' (' + getArtifactTypeDisplayName(item.artifact_type, false) + ')', name: item.name + ' (' + getArtifactTypeDisplayName(item.artifact_type, false) + ')' })));

  return (
    <>
    <EditPage objectId={domainId} objectVersionId={domainVersionId} data={data} restoreVersion={restoreDomainVersion} urlSlug='domains' setData={setData} isReadOnly={isReadOnly} setReadOnly={setReadOnly}
      archiveObject={archiveDomain} artifactType='domain' setTags={setTags} getObjectVersion={getDomainVersion} getObjectVersions={getDomainVersions} getObject={getDomain} deleteObject={deleteDomain}
      restoreObject={restoreDomain} updateObject={updateDomain} tabs={[
        {
          key: 'tab-gen',
          title: i18n('Сведения'),
          unscrollable: true,
          content: <div className={styles.tab_2col}>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Общая информация</h2>
              {data.metadata.state != 'ARCHIVED' && (
                <div>
                <button className={styles.btn_scheme} onClick={() => { doNavigate(`/domains-model/${encodeURIComponent(domainId)}`, navigate); }}>{i18n('Смотреть схему')}</button>
                </div>
              )}

              <FieldTextEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Название')}
                  defaultValue={data.entity.name}
                  className=''
                  valueSubmitted={(val) => {
                    updateDomainField('name', val);
                  }}
                />

              <FieldTextareaEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Описание')}
                  defaultValue={data.entity.short_description}
                  className=''
                  valueSubmitted={(val) => {
                    updateDomainField('short_description', val);
                  }}
                />

              <div data-uitest="domain_tag" className={styles.tags_block}>
                <div className={styles.label}>{i18n('Теги')}</div>
                <Tags
                  key={'tags-' + domainId + '-' + domainVersionId + '-' + uuid()}
                  isReadOnly={isReadOnly}
                  tags={tags}
                  tagPrefix='#'
                  onTagAdded={(tagName: string) => tagAddedHandler(tagName, domainId, 'domain', data.metadata.state ?? '', tags, setLoading, setTags, '/domains/edit/', navigate)}
                  onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, domainId, 'domain', data.metadata.state ?? '', setLoading, setTags, '/domains/edit/', navigate)}
                />
              </div>
            </div>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Дополнительные параметры</h2>

              <FieldArrayEditor
                key={`ed-rec-${domainId}`}
                useExtSearch
                getOptions={getRecArtifactOptions}
                isReadOnly={isReadOnly}
                label={i18n('Рекомендуемое')}
                className={styles.long_input}
                defaultValue={selectedRecArtifactNames}
                inputPlaceholder={i18n('Выберите')}
                addBtnText={i18n('Добавить')}
                valueSubmitted={() => { updateDomainField('recommended_artifacts', data.entity.recommended_artifacts); }}
                onValueIdAdded={(id: string, name: string) => {
                  getArtifact(id).then((json:any) => {
                    let d = {...data};
                    d.entity.recommended_artifacts.push({ id: id, artifact_type: json.artifact_type });
                    setData(d);
                  }).catch(handleHttpError);
                  
                }}
                onValueIdRemoved={(id: string) => {
                  const arr = [...data.entity.recommended_artifacts];
                  arr.splice(parseInt(id), 1);
                  setData((prev:any) => ({ ...prev, entity: { ...prev.entity, recommended_artifacts: arr } }));
                }}
              />
            </div>
          </div>
        },
        {
          key: 'tab-related',
          title: i18n('Связи'),
          content: <div className={styles.tab_white}>
            <RelatedObjectsControl artifactId={domainId} artifactType='domain'></RelatedObjectsControl>
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
                  updateDomainField('description', val.toString());
                }}
              />  
          
          </div>
        }
      ]} />

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
    </>
  );
}
