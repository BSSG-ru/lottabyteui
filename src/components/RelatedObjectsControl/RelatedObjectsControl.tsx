import React, {
    FC, useState, useEffect, ReactNode,
  } from 'react';
import styles from './RelatedObjectsControl.module.scss';
import { getRelatedObjectArtifactTypes } from '../../services/pages/artifacts';
import { Tabs } from '../Tabs';
import useUrlState from '@ahooksjs/use-url-state';
import { renderDate, Table } from '../Table';
import { getArtifactUrl, getTablePageSize, i18n } from '../../utils';
import { useNavigate } from 'react-router';
import { assetsTableColumns, beTableColumns, entitiesTableColumns, indicatorsTableColumns, prodTableColumns, queriesTableColumns, samplesTableColumns, systemsTableColumns } from '../../mocks/systems';
import { attributesTableColumns } from '../../mocks/logic_objects';

type RelatedObjectsControlProps = {
    artifactId: string;
    artifactType: string;
    createEAttrClick?: () => void;
    renderEAttrActionsPopup?: (row: any) => ReactNode;
};
  
export const RelatedObjectsControl: FC<RelatedObjectsControlProps> = ({ artifactId, artifactType, createEAttrClick = undefined, renderEAttrActionsPopup = undefined }) => {

    const navigate = useNavigate();

    const commonCols = [
        { property: 'id', header: 'ID', isHidden: true },
        {
            property: 'num',
            header: i18n('Koд'),
            sortDisabled: true,
            filterDisabled: true,
        },
        {
            property: 'name',
            header: i18n('Название'),
        }
    ];

    const columns = {
        domain: [
            ...commonCols,
            {
                property: 'modified',
                header: i18n('Дата создания'),
                render: (row: any) => renderDate(row, 'modified'),
            }
        ],
        system: systemsTableColumns,
        entity_attribute: attributesTableColumns,
        entity: entitiesTableColumns,
        task: [
            ...commonCols,
            {
                property: 'modified',
                header: i18n('Дата создания'),
                render: (row: any) => renderDate(row, 'modified'),
            }
        ],
        entity_query: queriesTableColumns,
        entity_sample: samplesTableColumns,
        data_asset: assetsTableColumns,
        indicator: indicatorsTableColumns,
        business_entity: beTableColumns,
        product: prodTableColumns,
        entity_sample_property: [ ...commonCols ]
    };

    const [state, setState] = useUrlState({ t: '1' }, { navigateMode: 'replace' });
    const [relatedArtifactTypes, setRelatedArtifactTypes] = useState<string[]>([]);
    const allowedArtifactTypes = { 'entity_attribute': i18n('Атрибуты'), 'domain': i18n('Домены'), 'system': i18n('Системы'), 'entity': i18n('Лог. объекты'), 'task': i18n('Задачи'), 'entity_query': i18n('Запросы'), 
    'entity_sample': i18n('Сэмплы'), 'data_asset': i18n('Активы'), 'indicator': i18n('Показатели'), 'business_entity': i18n('Бизнес-сущности'), 'product': i18n('Продукты'), 
    'entity_sample_property': i18n('Атрибуты сэмпла') };
    const [tabs, setTabs] = useState<any[]>([]);

    useEffect(() => {
        if (artifactId) {
            getRelatedObjectArtifactTypes(artifactType).then((json:any) => {
                let order = { 'entity_attribute': 1, 'domain': 2, 'system' : 3, 'entity': 4, 'task': 5, 'entity_query': 6, 'entity_sample': 7, 'data_asset': 8, 'indicator': 9,
                    'business_entity': 10, 'product': 11, 'entity_sample_property': 12 };
                setRelatedArtifactTypes(json.sort((a:any, b:any) => { 
                    var v1 = order[a as keyof typeof order];
                    var v2 = order[b as keyof typeof order];
                    if (!v1)
                        v1 = 20;
                    if (!v2)
                        v2 = 20;
                    if (v1 < v2)
                        return -1;
                    if (v1 > v2)
                        return 1;
                    return 0; 
                }));
            });
        }
    }, [ artifactId, artifactType ]);

    useEffect(() => {
        setTabs(relatedArtifactTypes.filter(at => at != artifactType && Object.keys(allowedArtifactTypes).indexOf(at) !== -1).map(rat => ({
            key: 'tab-' + rat,
            id: 'tab-' + rat,
            title: allowedArtifactTypes[rat as keyof typeof allowedArtifactTypes],
            content: (<Table
                cookieKey={'tab-tbl-' + artifactType + '-' + rat}
                key={`tab-tbl-${artifactId}-${rat}`}
                className={styles.table}
                columns={columns[rat as keyof typeof columns]}
                paginate
                columnSearch
                globalSearch
                dataUrl={`/v1/artifacts/search_related_artifacts/${artifactType}/${artifactId}/${rat}`}
                initialFetchRequest={{
                  sort: 'name+',
                  global_query: '',
                  limit: getTablePageSize('related-' + rat),
                  offset: 0,//(state.p6 - 1) * 5,
                  filters: [],
                  filters_preset: [],
                  filters_for_join: [],
                  state: 'PUBLISHED'
                }}
                showCreateBtn={artifactType == 'entity' && rat == 'entity_attribute'}
                onCreateBtnClick={(artifactType == 'entity' && rat == 'entity_attribute') ? createEAttrClick : undefined}
                renderActionsPopup={(artifactType == 'entity' && rat == 'entity_attribute') ? renderEAttrActionsPopup : undefined}
                onRowClick={(row: any) => {
                    if (rat == 'entity_attribute')
                        navigate(getArtifactUrl(row.entity_id, 'entity'));
                    else if (rat == 'entity_sample_property')
                        navigate(getArtifactUrl(row.entity_sample_id, 'entity_sample') + '?t=2');
                    else
                        navigate(getArtifactUrl(row.id, rat));
                }}
                onPageChange={(page: number) => {
                  //setState(() => ({ p6: page }));
                }}
                pageSizeCookieSuffix={'related-' + rat}
              />)
        })));
    }, [ relatedArtifactTypes ]);

    useEffect(() => {
        setTimeout( () => {
            //console.log(';aaaaaaaaaaa');
        setState(() => ({ t: 1 }));
        }, 200);
    }, [ tabs ]);

    return (
    <div className={styles.related_objects_wrap}>
        <Tabs tabs={tabs} tabNumber={1} onTabChange={(tab: number) => { setState(() => ({ t: tab })); }} />
    </div>
    );
};