/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import styles from './Systems.module.scss';
import { handleHttpError, i18n, setDataModified, doNavigate, tagAddedHandler, tagDeletedHandler, uuid, getArtifactUrl } from '../../utils';
import {
  getSystem,
  getSystemVersions,
  updateSystem,
  getSystemTypes,
  getSystemVersion,
  restoreSystemVersion,
  archiveSystem,
  restoreSystem,
} from '../../services/pages/systems';
import { Tags, TagProp } from '../../components/Tags';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { RelatedObjectsControl } from '../../components/RelatedObjectsControl';
import { deleteSystem, getDomain, getDomains } from '../../services/pages/domains';
import { FieldVisualEditor } from '../../components/FieldVisualEditor';
import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';
import { EditPage } from '../../components/EditPage';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldArrayEditor } from '../../components/FieldArrayEditor/FieldArrayEditor';

export function System() {
  const navigate = useNavigate();

  const [, setLoading] = useState(true);

  const [data, setData] = useState({
    entity: { name: '', description: '', short_description: '', system_type: '', domain_ids: [] },
    metadata: { id: '', artifact_type: 'system', version_id: '', tags: [], state: 'PUBLISHED', ancestor_draft_id: '', workflow_task_id: '', created_by: '' },
  });
  
  const [tags, setTags] = useState<TagProp[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  const [isReadOnly, setReadOnly] = useState(true);
  
  const { id, version_id } = useParams();
  const [systemId, setSystemId] = useState<string>(id ?? '');
  const [systemVersionId, setSystemVersionId] = useState<string>(version_id ?? '');

  const [systemTypes, setSystemTypes] = useState();
  const [selectedDomainNames, setSelectedDomainNames] = useState<any[]>([]);

  const getSystemTypeDisplayValue = async (i: string) => {
    if (!i) return '';
    // @ts-ignore
    return systemTypes ? systemTypes.get(i) : '??';
  };

  const getSystemType = async (search: string) => getSystemTypes().then((json) => {
    const res:any[] = [];
    const map = new Map();
    for (let i = 0; i < json.length; i += 1) {
      res.push({ id: json[i].id, name: json[i].description });
      map.set(json[i].id, json[i].description);
    }
    // @ts-ignore
    setSystemTypes(map);
    return res.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
  });

  useEffect(() => {
    getSystemTypes().then((json) => {
      
      const map = new Map();
      for (let i = 0; i < json.length; i += 1) {
        
        map.set(json[i].id, json[i].description);
      }
      // @ts-ignore
      setSystemTypes(map);
    }).catch(handleHttpError);
  }, []);

  useEffect(() => {
    if (id) setSystemId(id);
    setSystemVersionId(version_id ?? '');
    setDataModified(false);
  }, [id, version_id]);

  useEffect(() => {
    const a = [];
    for (let i = 0; i < data.entity.domain_ids.length; i++) { a.push(''); }
    setSelectedDomainNames(a);

    data.entity.domain_ids.forEach((id, index) => {
      getDomain(id).then((json) => {
        setSelectedDomainNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'domain')}">${json.entity.name}</a></div>`, ...prev.slice(index + 1)]));
      }).catch(handleHttpError);
    });
  }, [data.entity.domain_ids]);

  const updateSystemField = (field: string, value: string | string[] | undefined) => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    setDataModified(true);
  };

  const getDomainOptions = async (search: string) => getDomains({ filters: [], filters_for_join: [], global_query: search, limit: 1000, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

  return (

    <EditPage objectId={systemId} objectVersionId={systemVersionId} data={data} restoreVersion={restoreSystemVersion} urlSlug='systems' setData={setData} isReadOnly={isReadOnly} setReadOnly={setReadOnly}
      archiveObject={archiveSystem} artifactType='system' setTags={setTags} getObjectVersion={getSystemVersion} getObjectVersions={getSystemVersions} getObject={getSystem} deleteObject={deleteSystem}
      restoreObject={restoreSystem} updateObject={updateSystem} tabs={[
        {
          key: 'tab-gen',
          title: i18n('Сведения'),
          unscrollable: true,
          content: <div className={styles.tab_2col}>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Общая информация</h2>
              {data.metadata.state != 'ARCHIVED' && (
                <div>
                <button className={styles.btn_scheme} onClick={() => { doNavigate(`/systems-model/${encodeURIComponent(systemId)}`, navigate); }}>{i18n('Смотреть схему')}</button>
                </div>
              )}

              <FieldTextEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Название')}
                  defaultValue={data.entity.name}
                  className=''
                  valueSubmitted={(val) => {
                    updateSystemField('name', val);
                  }}
                />

              <FieldAutocompleteEditor
                  className=''
                  label={i18n('Тип')}
                  isReadOnly={isReadOnly}
                  defaultValue={data.entity.system_type}
                  valueSubmitted={(identity) => updateSystemField('system_type', identity)}
                  getDisplayValue={getSystemTypeDisplayValue}
                  getObjects={getSystemType}
                  isRequired
                  showValidation={showValidation}
                />

              <FieldTextareaEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Описание')}
                  defaultValue={data.entity.short_description}
                  className=''
                  valueSubmitted={(val) => {
                    updateSystemField('short_description', val);
                  }}
                />

              <div data-uitest="system_tag" className={styles.tags_block}>
                <div className={styles.label}>{i18n('Теги')}</div>
                <Tags
                  key={'tags-' + systemId + '-' + systemVersionId + '-' + uuid()}
                  isReadOnly={isReadOnly}
                  tags={tags}
                  tagPrefix='#'
                  onTagAdded={(tagName: string) => tagAddedHandler(tagName, systemId, 'system', data.metadata.state ?? '', tags, setLoading, setTags, '/systems/edit/', navigate)}
                  onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, systemId, 'system', data.metadata.state ?? '', setLoading, setTags, '/systems/edit/', navigate)}
                />
              </div>
            </div>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Дополнительные параметры</h2>

              <FieldArrayEditor
                key={`ed-dom-${systemId}`}
                getOptions={getDomainOptions}
                isReadOnly={isReadOnly}
                label={i18n('Домены')}
                defaultValue={selectedDomainNames}
                inputPlaceholder={i18n('Выберите домен')}
                addBtnText={i18n('Добавить')}
                valueSubmitted={() => { updateSystemField('domain_ids', data.entity.domain_ids); }}
                onValueIdAdded={(id: string) => {
                  setData((prev:any) => ({ ...prev, entity: { ...prev.entity, domain_ids: [...prev.entity.domain_ids, id] } }));
                }}
                onValueIdRemoved={(id: string) => {
                  const arr = [...data.entity.domain_ids];
                  arr.splice(parseInt(id), 1);
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, domain_ids: arr } }));
                }}
              />
              
            </div>
          </div>
        },
        {
          key: 'tab-related',
          title: i18n('Связи'),
          content: <div className={styles.tab_white}>
            <RelatedObjectsControl artifactId={systemId} artifactType='system'></RelatedObjectsControl>
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
                  updateSystemField('description', val.toString());
                }}
              />  
          
          </div>
        }
      ]} />
  );
}
