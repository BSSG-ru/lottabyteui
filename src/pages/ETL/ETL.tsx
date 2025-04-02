import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './ETL.module.scss';
import { FieldArrayEditor } from '../../components/FieldArrayEditor/FieldArrayEditor';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { getAsset } from '../../services/pages/dataAssets';
import { TagProp, Tags } from '../../components/Tags';
import { ArtifactData, ETLData, TDQRule } from '../../types/data';
import { RelatedObjectsControl } from '../../components/RelatedObjectsControl';
import { FieldVisualEditor } from '../../components/FieldVisualEditor';
import { EditPage } from '../../components/EditPage';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';
import { doNavigate, getArtifactTypeDisplayName, getArtifactUrl, getETLTypeAutocompleteObjects, getETLTypeDisplayValue, getSystemAutocompleteObjects, getSystemDisplayValue, handleHttpError, i18n, setDataModified, tagAddedHandler, tagDeletedHandler, uuid } from '../../utils';
import { getEntity, searchEntities } from '../../services/pages/dataEntities';
import { getProduct } from '../../services/pages/products';
import { archiveETL, deleteETL, getETL, getETLVersion, getETLVersions, restoreETL, restoreETLVersion, updateETL } from '../../services/pages/etls';
import classNames from 'classnames';
import { FieldArrayEditorExt } from '../../components/FieldArrayEditorExt';
import { searchArtifacts } from '../../services/pages/artifacts';
import { getBusinessEntities, getBusinessEntity } from '../../services/pages/businessEntities';

export function ETL() {
    const navigate = useNavigate();
    const [, setLoading] = useState(true);
  
    const [data, setData] = useState<ETLData>({
      metadata: { id: '', artifact_type: 'etl', version_id: '', tags: [], state: 'PUBLISHED', published_id: '', created_by: '' },
      entity: {
        name: '', description: '', short_description: '', code: '', algorithm: '', system_id: null, etl_type_id: '', business_entity_ids: [], source_ids: [], target_ids: []
      },
    });
  
    const [selectedBENames, setSelectedBENames] = useState<any[]>([]);
    const [selectedSourceNames, setSelectedSourceNames] = useState<any[]>([]);
    const [selectedTargetNames, setSelectedTargetNames] = useState<any[]>([]);
    const [showValidation, setShowValidation] = useState(false);
  
    const [isReadOnly, setReadOnly] = useState(true);
    const [isLoaded, setLoaded] = useState(false);
  
    const { id, version_id } = useParams();
  
    const [etlId, setETLId] = useState<string>(id ?? '');
    const [etlVersionId, setETLVersionId] = useState<string>(version_id ?? '');
    const [tags, setTags] = useState<TagProp[]>([]);
  
    const getBEOptions = async (search: string) => getBusinessEntities({ filters: [], filters_for_join: [], global_query: search, limit: 1000, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

    const getSrcTgtOptions = async (search: string) => searchArtifacts({ filters: [{ column: 'artifact_type', operator: 'IN', value: "'product','data_asset'" }], filters_for_join: [], global_query: search, limit: 1000, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, label: getArtifactTypeDisplayName(item.artifact_type, false) + ' ' + item.name, name: getArtifactTypeDisplayName(item.artifact_type, false) + ' ' + item.name, artifact_type: item.artifact_type })));
  
    useEffect(() => {
      if (id) setETLId(id);
      setETLVersionId(version_id ?? '');
      setDataModified(false);
    }, [id, version_id]);
  
    
    useEffect(() => {
      const a = [];
      for (let i = 0; i < data.entity.business_entity_ids.length; i++) { a.push(''); }
      setSelectedBENames(a);
  
      data.entity.business_entity_ids.forEach((id, index) => {
        getBusinessEntity(id).then((json) => {
          setSelectedBENames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'business_entity')}">${json.entity.name}</a></div>`, ...prev.slice(index + 1)]));
          
        }).catch(handleHttpError);
      });
    }, [data.entity.business_entity_ids]);

    useEffect(() => {
        const a = [];
        for (let i = 0; i < data.entity.source_ids.length; i++) { a.push(''); }
        setSelectedSourceNames(a);
    
        data.entity.source_ids.forEach((a, index) => {
            if (a.artifact_type == 'data_asset') {
                getAsset(a.id).then((json) => {
                    setSelectedSourceNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'data_asset')}">Актив ${json.entity.name}</a></div>`, ...prev.slice(index + 1)]));
                    
                }).catch(handleHttpError);
            }
            if (a.artifact_type == 'product') {
                getProduct(a.id).then((json) => {
                    setSelectedSourceNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'product')}">Продукт ${json.entity.name}</a></div>`, ...prev.slice(index + 1)]));
                    
                }).catch(handleHttpError);
            }
        });
    }, [data.entity.source_ids]);

    useEffect(() => {
        const a = [];
        for (let i = 0; i < data.entity.target_ids.length; i++) { a.push(''); }
        setSelectedTargetNames(a);
    
        data.entity.target_ids.forEach((a, index) => {
            if (a.artifact_type == 'data_asset') {
                getAsset(a.id).then((json) => {
                    setSelectedTargetNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'data_asset')}">Актив ${json.entity.name}</a></div>`, ...prev.slice(index + 1)]));
                    
                }).catch(handleHttpError);
            }
            if (a.artifact_type == 'product') {
                getProduct(a.id).then((json) => {
                    setSelectedTargetNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'product')}">Продукт ${json.entity.name}</a></div>`, ...prev.slice(index + 1)]));
                    
                }).catch(handleHttpError);
            }
        });
      }, [data.entity.target_ids]);
  
    const updateETLField = (field: string, value: string | string[] | [] | TDQRule[] | ArtifactData[] | undefined) => {
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
      setDataModified(true);
    };
    
    return (
      <>
        <EditPage objectId={etlId} objectVersionId={etlVersionId} data={data} restoreVersion={restoreETLVersion} urlSlug='etl' setData={setData} isReadOnly={isReadOnly} setReadOnly={setReadOnly}
                archiveObject={archiveETL} artifactType='etl' setTags={setTags} getObjectVersion={getETLVersion} getObjectVersions={getETLVersions} getObject={getETL} deleteObject={deleteETL}
                restoreObject={restoreETL} updateObject={updateETL} tabs={[
                {
                  key: 'tab-gen',
                  title: i18n('Сведения'),
                  unscrollable: true,
                  content: <div className={styles.tab_2col}>
                    <div className={classNames(styles.col, styles.scrollable)}>
                      <h2>Общая информация</h2>
                      {data.metadata.state != 'ARCHIVED' && (
                        <div>
                          <button className={styles.btn_scheme} onClick={() => { doNavigate(`/etl-model/${encodeURIComponent(etlId)}`, navigate); }}>{i18n('Смотреть схему')}</button>
                        </div>
                      )}
  
                      <FieldTextEditor
                          isReadOnly={isReadOnly}
                          label={i18n('Название')}
                          defaultValue={data.entity.name}
                          className=''
                          valueSubmitted={(val) => {
                            updateETLField('name', val);
                          }}
                        />
  
                      <FieldAutocompleteEditor
                          label={i18n('Тип')}
                          isReadOnly={isReadOnly}
                          defaultValue={data.entity.etl_type_id}
                          valueSubmitted={(identity) => updateETLField('etl_type_id', identity)}
                          getDisplayValue={getETLTypeDisplayValue}
                          getObjects={getETLTypeAutocompleteObjects}
                          isRequired
                          showValidation={showValidation}
                        />
  
                      <FieldAutocompleteEditor
                        label={i18n('Система')}
                        defaultValue={data.entity.system_id}
                        valueSubmitted={(i) => updateETLField('system_id', i)}
                        getDisplayValue={getSystemDisplayValue}
                        getObjects={getSystemAutocompleteObjects}
                        showValidation={showValidation}
                        artifactType="system"
                        isReadOnly={isReadOnly}
                        allowClear
                      />
  
                      <FieldTextareaEditor
                          isReadOnly={isReadOnly}
                          label={i18n('Описание')}
                          defaultValue={data.entity.short_description}
                          valueSubmitted={(val) => {
                            updateETLField('short_description', val ?? '');
                          }}
                        />
  
                      <div data-uitest="etl_tag" className={styles.tags_block}>
                        <div className={styles.label}>{i18n('Теги')}</div>
                        <Tags
                          key={'tags-' + etlId + '-' + etlVersionId + '-' + uuid()}
                          isReadOnly={isReadOnly}
                          tags={tags}
                          tagPrefix='#'
                          onTagAdded={(tagName: string) => tagAddedHandler(tagName, etlId, 'etl', data.metadata.state ?? '', tags, setLoading, setTags, '/etl/edit/', navigate)}
                          onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, etlId, 'etl', data.metadata.state ?? '', setLoading, setTags, '/etl/edit/', navigate)}
                        />
                      </div>
                    </div>
                    <div className={classNames(styles.col, styles.scrollable)}>
                      <h2>Дополнительные параметры</h2>
  
                      <FieldTextEditor
                        isReadOnly={isReadOnly}
                        label={i18n('Код')}
                        defaultValue={data.entity.code}
                        valueSubmitted={(val) => {
                          updateETLField('code', val);
                        }}
                      />

                        <FieldTextEditor
                            isReadOnly={isReadOnly}
                            label={i18n('Алгоритм')}
                            defaultValue={data.entity.algorithm}
                            valueSubmitted={(val) => {
                                updateETLField('algorithm', val);
                            }}
                        />
  
                      <FieldArrayEditor
                          key={`ed-ent-${etlId}`}
                          artifactType='business_entity'
                          useExtSearch
                          getOptions={getBEOptions}
                          isReadOnly={isReadOnly}
                          label={i18n('Термины глоссария')}
                          defaultValue={selectedBENames}
                          inputPlaceholder={i18n('Выберите')}
                          addBtnText={i18n('Добавить')}
                          valueSubmitted={() => { updateETLField('business_entity_ids', data.entity.business_entity_ids); }}
                          onValueIdAdded={(id: string, name: string) => {
                            let d = {...data};
                            d.entity.business_entity_ids.push(id);
                            setData(d);
                          }}
                          onValueIdRemoved={(id: string) => {
                            const arr = [...data.entity.business_entity_ids];
                            arr.splice(parseInt(id), 1);
                            setData((prev) => ({ ...prev, entity: { ...prev.entity, business_entity_ids: arr } }));
                          }}
                        />

                        <FieldArrayEditorExt
                          key={`ed-src-${etlId}`}
                          artifactTypes={['product', 'data_asset']}
                          useExtSearch
                          getOptions={getSrcTgtOptions}
                          isReadOnly={isReadOnly}
                          label={i18n('Источник')}
                          defaultValue={selectedSourceNames}
                          inputPlaceholder={i18n('Выберите')}
                          addBtnText={i18n('Добавить')}
                          valueSubmitted={() => { updateETLField('source_ids', data.entity.source_ids); }}
                          onValueAdded={(obj: any) => {
                            let d = {...data};
                            d.entity.source_ids.push({id: obj.value, artifact_type: obj.artifact_type});
                            setData(d);
                          }}
                          onValueRemoved={(obj:any) => {
                            const arr = [...data.entity.source_ids];
                            arr.splice(parseInt(obj.id), 1);
                            setData((prev) => ({ ...prev, entity: { ...prev.entity, source_ids: arr } }));
                          }}
                          
                        />
                        <FieldArrayEditorExt
                          key={`ed-tgt-${etlId}`}
                          artifactTypes={['product', 'data_asset']}
                          useExtSearch
                          getOptions={getSrcTgtOptions}
                          isReadOnly={isReadOnly}
                          label={i18n('Цель')}
                          defaultValue={selectedTargetNames}
                          inputPlaceholder={i18n('Выберите')}
                          addBtnText={i18n('Добавить')}
                          valueSubmitted={() => { updateETLField('target_ids', data.entity.target_ids); }}
                          onValueAdded={(obj: any) => {
                            let d = {...data};
                            d.entity.target_ids.push({id: obj.value, artifact_type: obj.artifact_type});
                            setData(d);
                          }}
                          onValueRemoved={(obj:any) => {
                            const arr = [...data.entity.target_ids];
                            arr.splice(parseInt(obj.id), 1);
                            setData((prev) => ({ ...prev, entity: { ...prev.entity, target_ids: arr } }));
                          }}
                          
                        />
  
                    </div>
                  </div>
                },
                {
                  key: 'tab-related',
                  title: i18n('Связи'),
                  content: <div className={styles.tab_white}>
                    <RelatedObjectsControl artifactId={etlId} artifactType='etl'></RelatedObjectsControl>
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
                          updateETLField('description', val);
                        }}
                      />  
                  
                  </div>
                }
              ]} />
      </>
    );
  }
  