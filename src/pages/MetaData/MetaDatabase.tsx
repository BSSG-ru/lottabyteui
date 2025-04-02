import useUrlState from '@ahooksjs/use-url-state';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EditPage } from '../../components/EditPage';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { renderDate, Table } from '../../components/Table';
import { TagProp, Tags } from '../../components/Tags';
import { userInfoRequest } from '../../services/auth';
import { getMetaDatabase, getMetaDatabaseVersion, getMetaDatabaseVersions, updateMetaDatabase } from '../../services/pages/metadata';
import { getArtifactUrl, getSystemAutocompleteObjects, getSystemDisplayValue, getTablePageSize, handleHttpError, i18n, setCookie, tagAddedHandler, tagDeletedHandler, uuid } from '../../utils';
import styles from './MetaData.module.scss';

export function MetaDatabase() {
    const [isLoaded, setLoaded] = useState(false);
    const [loading, setLoading] = useState<boolean>(false);

    const { id, version_id } = useParams();
    const [databaseId, setDatabaseId] = useState<string>('');
    const [databaseVersionId, setDatabaseVersionId] = useState<string>('');
    const [data, setData] = useState<any>({ entity: { name: '' }, metadata: { id: '', state: 'PUBLISHED', version_id: '' } });
    const [state, setState] = useUrlState({ t: '1', p1: '1', q1: '', p2: '1', q2: '', p3: '1', q3: '', p4: '1', q4: '' }, { navigateMode: 'replace' });
    const [tabs, setTabs] = useState<any[]>([]);
    const [tags, setTags] = useState<TagProp[]>([]);
    const [isReadOnly, setReadOnly] = useState(true);
    

    const navigate = useNavigate();

    const schemaColumns = [
        { property: 'id', header: 'ID', isHidden: true },
        { property: 'name', header: i18n('Название')},
        {
            property: 'modified',
            header: i18n('Дата изменения'),
            render: (row: any) => renderDate(row, 'modified'),
          }
    ];

    const tableColumns = [
        { property: 'id', header: 'ID', isHidden: true },
        { property: 'parent_name', header: i18n('Схема')},
        { property: 'name', header: i18n('Название')},
        {
            property: 'modified',
            header: i18n('Дата изменения'),
            render: (row: any) => renderDate(row, 'modified'),
          }
    ];

    const columnColumns = [
        { property: 'id', header: 'ID', isHidden: true },
        { property: 'schema_name', header: i18n('Схема') },
        { property: 'meta_object_name', header: i18n('Таблица/представление') },
        { property: 'name', header: i18n('Название') },
        { property: 'column_type', header: i18n('Тип данных') },
        { property: 'is_key', header: i18n('Ключ'), filterDisabled: true, render: (row: any) => (row.is_key ? i18n('Да') : i18n('Нет')) },
        {
            property: 'modified',
            header: i18n('Дата изменения'),
            render: (row: any) => renderDate(row, 'modified'),
        },
        {
            property: 'entity_id',
            filter_property: 'entity_attribute_name',
            header: i18n('Модель'),
            filterDisabled: true, sortDisabled: true,
            render: (row: any) => { return (row.entity_id ? <a href={getArtifactUrl(row.entity_id, 'entity')}>{row.entity_attribute_name}</a> : ''); }
        }
    ];

    useEffect(() => {
        if (id)
            setDatabaseId(id);
        if (version_id)
            setDatabaseVersionId(version_id);
        else
            setDatabaseVersionId('');
    }, [ id, version_id ]);

    useEffect(() => {
        userInfoRequest().then(resp => {
            resp.json().then(data => {
                setCookie('userp', data.permissions.join(','), { path: '/' });
                setReadOnly(data.permissions.indexOf('metadata_u') == -1);
            });
        });
    }, []);

    const loadData = () => {
        if (databaseId) {
            
            /*getMetaDatabaseVersions(databaseId).then(json => {
                setVersions(
                    json.map((x: any) => ({
                      name: x.name,
                      description: x.description,
                      version_id: x.version_id,
                      created_at: new Date(x.modified).toLocaleString(),
                      modifier_display_name: x.modifier_display_name,
                      modifier_email: x.modifier_email,
                      modifier_description: x.modifier_description,
                    }))
                );
            });*/

            (databaseVersionId ? getMetaDatabaseVersion(databaseId, databaseVersionId) : getMetaDatabase(databaseId)).then(json => {
                setData({ entity: json, metadata: { id: json.id, state: json.state, version_id: json.version_id }});

                setTags(json.tags);

                /*getRatingData(databaseId)
                    .then((json) => {
                        setRatingData(json);
                    }).catch(handleHttpError);

                getOwnRatingData(databaseId).then((rating) => {
                        setOwnRating(rating);
                    }).catch(handleHttpError);*/

                setTabs([
                    {
                        key: 'tab-1-' + databaseId + '-' + databaseVersionId,
                        id: 'tab-1',
                        title: i18n('Схемы'),
                        content: <div className={styles.tab_white}>
                            <Table key={'tbl-1-' + databaseId + '-' + databaseVersionId} cookieKey='md-schemas' className={styles.table} columns={schemaColumns} paginate columnSearch globalSearch dataUrl='/v1/metadata/object/search' limitSteward={false}
                                initialFetchRequest={{
                                    sort: 'name+',
                                    global_query: state.q1 !== undefined ? state.q1 : '',
                                    limit: getTablePageSize(),
                                    offset: (state.p1 - 1) * getTablePageSize(),
                                    filters: [],
                                    filters_preset: [ { column: 'meta_object_type', value: 'SCHEMA', operator: 'EQUAL' }, { column: 'meta_database_id', value: databaseId, operator: 'EQUAL' }, { column: 'version_id', value: json.version_id, operator: 'EQUAL' } ],
                                    filters_for_join: [],
                                }}
                                onRowClick={(row: any) => {}}
                                onPageChange={(page: number) => (
                                    setState(() => ({ p1: page }))
                                )}
                                onQueryChange={(query: string) => (
                                    setState(() => ({ p1: undefined, q1: query }))
                                )}
                                  />
                        </div>
                    },
                    {
                        key: 'tab-2-' + databaseId + '-' + databaseVersionId,
                        id: 'tab-2',
                        title: i18n('Таблицы'),
                        content: <div className={styles.tab_white}>
                            <Table key={'tbl-2-' + databaseId + '-' + databaseVersionId} cookieKey='md-tables' className={styles.table} columns={tableColumns} paginate columnSearch globalSearch dataUrl='/v1/metadata/object/search' limitSteward={false}
                                initialFetchRequest={{
                                    sort: 'name+',
                                    global_query: state.q2 !== undefined ? state.q2 : '',
                                    limit: getTablePageSize(),
                                    offset: (state.p2 - 1) * getTablePageSize(),
                                    filters: [],
                                    filters_preset: [ { column: 'meta_object_type', value: 'TABLE', operator: 'EQUAL' }, { column: 'meta_database_id', value: databaseId, operator: 'EQUAL' }, { column: 'version_id', value: json.version_id, operator: 'EQUAL' } ],
                                    filters_for_join: [],
                                }}
                                onRowClick={(row: any) => {}}
                                onPageChange={(page: number) => (
                                    setState(() => ({ p2: page }))
                                )}
                                onQueryChange={(query: string) => (
                                    setState(() => ({ p2: undefined, q2: query }))
                                )}
                                  />
                        </div>
                    },
                    {
                        key: 'tab-3-' + databaseId + '-' + databaseVersionId,
                        id: 'tab-3',
                        title: i18n('Представления'),
                        content: <div className={styles.tab_white}>
                            <Table key={'tbl-3-' + databaseId + '-' + databaseVersionId} cookieKey='md-views' className={styles.table} columns={tableColumns} paginate columnSearch globalSearch dataUrl='/v1/metadata/object/search' limitSteward={false}
                                initialFetchRequest={{
                                    sort: 'name+',
                                    global_query: state.q3 !== undefined ? state.q3 : '',
                                    limit: getTablePageSize(),
                                    offset: (state.p3 - 1) * getTablePageSize(),
                                    filters: [],
                                    filters_preset: [ { column: 'meta_object_type', value: 'VIEW', operator: 'EQUAL' }, { column: 'meta_database_id', value: databaseId, operator: 'EQUAL' }, { column: 'version_id', value: json.version_id, operator: 'EQUAL' } ],
                                    filters_for_join: [],
                                }}
                                onRowClick={(row: any) => {}}
                                onPageChange={(page: number) => (
                                    setState(() => ({ p3: page }))
                                )}
                                onQueryChange={(query: string) => (
                                    setState(() => ({ p3: undefined, q3: query }))
                                )}
                                  />
                        </div>
                    },
                    {
                        key: 'tab-4-' + databaseId + '-' + databaseVersionId,
                        id: 'tab-4',
                        title: i18n('Колонки'),
                        content: <div className={styles.tab_white}>
                            <Table key={'tbl-4-' + databaseId + '-' + databaseVersionId} cookieKey='md-cols' className={styles.table} columns={columnColumns} paginate columnSearch globalSearch dataUrl='/v1/metadata/column/search' limitSteward={false}
                                initialFetchRequest={{
                                    sort: 'name+',
                                    global_query: state.q4 !== undefined ? state.q4 : '',
                                    limit: getTablePageSize(),
                                    offset: (state.p4 - 1) * getTablePageSize(),
                                    filters: [],
                                    filters_preset: [ { column: 'meta_database_id', value: databaseId, operator: 'EQUAL' }, { column: 'version_id', value: json.version_id, operator: 'EQUAL' } ],
                                    filters_for_join: [],
                                }}
                                onRowClick={(row: any) => {}}
                                onPageChange={(page: number) => (
                                    setState(() => ({ p4: page }))
                                )}
                                onQueryChange={(query: string) => (
                                    setState(() => ({ p4: undefined, q4: query }))
                                )}
                            />
                        </div>
                    }
                ]);

                setLoaded(true);
            }).catch(handleHttpError);

            
        }
    }

    useEffect(() => {
        loadData();
    }, [ databaseId, databaseVersionId ]);

    const updateDatabaseField = (field: string, value: string | string[] | undefined) => {
        setData((prev: any) => ({ ...prev, entity: {...prev.entity, [field]: value} }));
    };

    return (

        <EditPage objectId={databaseId} objectVersionId={'' + databaseVersionId} data={data} urlSlug='metadata' setData={setData} isReadOnly={isReadOnly} setReadOnly={setReadOnly}
                artifactType='meta_database' setTags={setTags} getObjectVersion={async (id, versionId) => { return await getMetaDatabaseVersion(id, versionId).then(json => { return { entity: json, metadata: { id: json.id, state: json.state } }; }) }} getObjectVersions={async (id) => { return await getMetaDatabaseVersions(id).then(json => { return json.map((item:any) => ({ entity: item, metadata: { id: item.id, version_id: item.version_id, state: item.state, modified_at: item.modified } })) }) }} 
                getObject={async (id) => { return await getMetaDatabase(id).then(json => { return { entity: json, metadata: {id: json.id, state: 'PUBLISHED'} }; }); }} 
                updateObject={async (id, data) => { return await updateMetaDatabase(id, data).then(json => { return { entity: json, metadata: {id: json.id, state: json.state} } }) }} tabs={[
                    {
                        key: 'tab-gen',
                        title: i18n('Сведения'),
                        content: <div className={styles.tab_white}>
                            <FieldTextEditor
                                isReadOnly={isReadOnly}
                                label={i18n('Название')}
                                defaultValue={data.entity.name}
                                valueSubmitted={(val) => {
                                    updateDatabaseField('name', val);
                                }}
                                isRequired
                                showValidation={false}
                            />

                            <div className={styles.tags_block}>
                                <div className={styles.label}>{i18n('Теги')}</div>
                                <Tags
                                    key={'tags-' + databaseId + '-' + databaseVersionId + '-' + uuid()}
                                    isReadOnly={isReadOnly}
                                    tags={tags}
                                    tagPrefix='#'
                                    onTagAdded={(tagName: string) => tagAddedHandler(tagName, databaseId, 'meta_database', data.state ?? '', tags, setLoading, setTags, '/metadata/', navigate)}
                                    onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, databaseId, 'meta_database', data.state ?? '', setLoading, setTags, '/metadata/', navigate)}
                                />
                            </div>

                            <FieldAutocompleteEditor
                                label={i18n('Система')}
                                defaultValue={data.entity.system_id}
                                valueSubmitted={(identity) => {
                                    updateDatabaseField('system_id', identity);
                                }}
                                getDisplayValue={getSystemDisplayValue}
                                getObjects={getSystemAutocompleteObjects}
                                isRequired
                                isReadOnly={isReadOnly}
                                showValidation={false}
                                artifactType='system'
                            />

                            <FieldTextEditor
                                isReadOnly
                                label={i18n('Сервер')}
                                defaultValue={data.entity.jdbc_url}
                                className={styles.long_input}
                                valueSubmitted={(val) => { }}
                            />

                            <FieldTextEditor 
                                isReadOnly
                                label={i18n('Задача')}
                                defaultValue={data.entity.tasks ? data.entity.tasks.map((d:any) => (`<a href="/tasks/edit/${d.id}">${d.name}</a>`)).join(', ') : ''}
                                valueSubmitted={(val) => { }}
                            />
                        </div>
                    },
                    ...tabs
                ]} />

    );
}