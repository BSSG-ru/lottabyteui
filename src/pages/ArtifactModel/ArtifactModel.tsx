import React, { useCallback, useEffect, useState } from 'react';
import * as go from 'gojs';
import styles from './ArtifactModel.module.scss';
import { ReactDiagram } from 'gojs-react';
import { initArtifactDiagram, initEntitiesDiagram, SaveRequestData } from '../../gojs-utils';
import '../../gojs-controls';
import { getEntities, getEntitiesModel } from '../../services/pages/dataEntities';
import { handleHttpError, i18n, uuid, getArtifactTypeDisplayName } from '../../utils';
import { fetchWithRefresh } from '../../services/auth';
import { optionsPatch } from '../../services/requst_templates';
import { URL } from '../../services/requst_templates';
import { getArtifactModel, getArtifactsModel } from '../../services/pages/artifacts';
import PlusIcon from '../../assets/icons/plus.png';
import MinusIcon from '../../assets/icons/minus.png';
import FitIcon from '../../assets/icons/fit.png';
import { useParams } from 'react-router';
import { Button } from '../../components/Button';
import classNames from 'classnames';
import { v4 as uuidv4 } from 'uuid';

export type ArtifactModelProps = {
    artifactType: string;
}

export function ArtifactModel({ artifactType } : ArtifactModelProps) {
    const [modelData, setModelData] = useState({});
    const [nodeDataArray, setNodeDataArray] = useState<any[]>([]);
    const [linkDataArray, setLinkDataArray] = useState([]);
    const [diagram, setDiagram] = useState<go.Diagram | null>(null);
    const [diagramIsLoading, setDiagramIsLoading] = useState<boolean>(true);
    const [isLinkingMode, setLinkingMode] = useState<boolean>(false);

    const [filterLineageDirs, setFilterLineageDirs] = useState<any>({ left: true, right: false });


    const lineageStruct:any = {
        domain: { left: [ 'product', 'indicator', 'data_asset', 'entity_sample', 'entity', 'entity_query', 'system' ], right: []},
        product: { left: [ 'indicator', 'data_asset', 'entity_sample', 'entity', 'entity_query', 'system' ], right: [ 'domain' ] },
        indicator: { left: [ 'data_asset', 'entity_sample', 'entity', 'entity_query', 'system' ], right: [ 'domain', 'product' ] },
        data_asset: { left: [ 'entity_sample', 'entity', 'entity_query', 'system' ], right: [ 'domain', 'product', 'indicator' ] },
        entity_sample: { left: [ 'entity_query', 'system' ], right: [ 'domain', 'product', 'indicator', 'data_asset' ] },
        entity: { left: [], right: [ 'data_asset', 'domain', 'product', 'indicator' ] },
        entity_query: { left: [ 'system' ], right: [ 'domain', 'product', 'indicator', 'entity_sample', 'entity', 'entity_query', 'data_asset' ] },
        system: { left: [], right: [ 'product', 'indicator', 'data_asset', 'entity_sample', 'entity', 'entity_query', 'system' ] }
    };

    const [filterArtifactTypes, setFilterArtifactTypes] = useState<any>({
        system: true,
        entity_query: true,
        entity: true,
        entity_sample: true,
        data_asset: true,
        indicator: true,
        product: true,
        domain: true,
      });

    const { id } = useParams();

    const diagramRef = useCallback((ref: ReactDiagram | null) => {
        if (ref != null) {
            
            setDiagram(ref.getDiagram());
            
        }
    }, [diagram]);

    useEffect(() => {
        if (artifactType == 'entity') {
            getEntitiesModel().then((json:any) => {
                setNodeDataArray(json.nodes);
                setLinkDataArray(json.links.map((d:any) =>({...d, points: d.points ? JSON.parse(d.points) : ''})));
            }).catch(handleHttpError);
        } else 
        {
            if (id)
                getArtifactModel(id, artifactType).then((json:any) => {
                    let nodes = json.nodes.map((n:any) => ({...n, hidden: (lineageStruct[artifactType].left.some((x:string) => x == n.artifactType) && !filterLineageDirs.left) || (lineageStruct[artifactType].right.some((x:string) => x == n.artifactType) && !filterLineageDirs.right) }));
                    let nodes2 = [...nodes];
                    nodes.forEach((n:any) => {
                        switch (n.artifactType) {
                            case 'indicator': nodes2.push({ id: uuidv4(), name: 'Качество данных', type: 'urlNodeType', category: 'urlNodeType', artifactType: 'dqLink', isGroup: false, parentId: n.id, group: n.id, text: "Качество данных", zorder: 1, url: '/quality-schedule-tasks'}); break;
                            case 'product': nodes2.push({ id: uuidv4(), name: 'Качество данных', type: 'urlNodeType', category: 'urlNodeType', artifactType: 'dqLink', isGroup: false, parentId: n.id, group: n.id, text: "Качество данных", zorder: 1, url: '/quality-schedule-tasks'}); break;
                            case 'entity_sample': nodes2.push({ id: uuidv4(), name: 'Качество данных', type: 'urlNodeType', category: 'urlNodeType', artifactType: 'dqLink', isGroup: false, parentId: n.id, group: n.id, text: "Качество данных", zorder: 1, url: '/quality-schedule-tasks'}); break;
                        }
                    });
                    setNodeDataArray(nodes2);
                    setLinkDataArray(json.links.map((d:any) =>({...d, points: d.points ? JSON.parse(d.points) : ''})));
                }).catch(handleHttpError);
        }
    }, [id]);

    const onModelChange = (e:go.IncrementalData) => {

        if (diagramIsLoading) {
            setDiagramIsLoading(false);
            return;
        }

        let saveRequestData = new SaveRequestData();
        if (e.modifiedNodeData) {
            for (let i = 0; i < e.modifiedNodeData.length; i++) {
                saveRequestData.addNode(e.modifiedNodeData[i]);
            }
        }

        if (e.modifiedLinkData) {
            for (let i = 0; i < e.modifiedLinkData?.length; i++) {
                saveRequestData.addLink(e.modifiedLinkData[i]);
            }
        }

        if (e.insertedLinkKeys) {
         
            for (let i = 0; i < e.insertedLinkKeys.length; i++) {
                let link = diagram?.findLinkForKey(e.insertedLinkKeys[i]);
                if (link) {
                    
                    saveRequestData.addLink(link);
                }
            }
        }

        if (e.removedLinkKeys) {
            for (let i = 0; i < e.removedLinkKeys.length; i++) {
                saveRequestData.deleteLink('' + e.removedLinkKeys[i]);
            }
        }
        
        if (saveRequestData.isEmpty())
            return;

        if (artifactType == 'entity')
            fetchWithRefresh(`${URL}/v1/entities/model`, optionsPatch(saveRequestData));
        else {
            fetchWithRefresh(`${URL}/v1/artifacts/model/${artifactType}/${id}`, optionsPatch(saveRequestData));
        }
        
    };

    

    useEffect(() => {
        Object.keys(filterArtifactTypes).forEach(at => {
            if (filterArtifactTypes[at]) {
                var it = diagram?.findNodesByExample({artifactType: at});
                while (it?.next()) {
                    it.value.visible = true;
                }
            } else {
                var it = diagram?.findNodesByExample({artifactType: at});
                while (it?.next()) {
                    it.value.visible = false;
                }
            }
        });
        
    }, [ filterArtifactTypes ])

    useEffect(() => {
        if (filterLineageDirs.left) {
            lineageStruct[artifactType].left.forEach((at:string) => {
                setFilterArtifactTypes((prev:any) => ({...prev, [at]: true}));
            })
        } else {
            lineageStruct[artifactType].left.forEach((at:string) => {
                setFilterArtifactTypes((prev:any) => ({...prev, [at]: false}));
            })
        }
        if (filterLineageDirs.right) {
            lineageStruct[artifactType].right.forEach((at:string) => {
                setFilterArtifactTypes((prev:any) => ({...prev, [at]: true}));
            })
        } else {
            lineageStruct[artifactType].right.forEach((at:string) => {
                setFilterArtifactTypes((prev:any) => ({...prev, [at]: false}));
            })
        }
    }, [ filterLineageDirs ]);

    
    useEffect(() => {
        if (diagram) {
            diagram.toolManager.linkingTool.isEnabled = isLinkingMode;
            diagram.toolManager.draggingTool.isEnabled = !isLinkingMode;
        }
    }, [ isLinkingMode ]);

    return (
        <div className={styles.artifact_model}>
            <div className={styles.dg_filter}>
                <Button className={classNames(styles.btn_filter_dir, { [styles.active]: filterLineageDirs.left })} onClick={() => { setFilterLineageDirs((prev:any) => ({...prev, left: !filterLineageDirs.left})) }}>{i18n('Влево')}</Button>
                <Button className={classNames(styles.btn_filter_dir, { [styles.active]: filterLineageDirs.right })} onClick={() => { setFilterLineageDirs((prev:any) => ({...prev, right: !filterLineageDirs.right})) }}>{i18n('Вправо')}</Button>
                {Object.keys(filterArtifactTypes).map((at:string) => <Button key={uuid()} className={classNames(styles.btn_filter, { [styles.active]: filterArtifactTypes[at], [styles.shown]: (at == artifactType || (filterLineageDirs.right && lineageStruct[artifactType]['right'].some((e:string) => e == at)) || (filterLineageDirs.left && lineageStruct[artifactType]['left'].some((e:string) => e == at))) })} onClick={() => { setFilterArtifactTypes((prev:any) => ({...prev, [at]: !filterArtifactTypes[at]})) }}>{getArtifactTypeDisplayName(at)}</Button>)}
            </div>
            <div className={styles.dg_wrap}>
                <ReactDiagram ref={diagramRef} initDiagram={initArtifactDiagram} divClassName={styles.diagram_div} nodeDataArray={nodeDataArray} linkDataArray={linkDataArray} modelData={modelData} onModelChange={onModelChange} />
                <div className={styles.rightToolBar}>
                    <a onClick={() => { diagram?.commandHandler.increaseZoom(); }}><img src={PlusIcon} /></a>
                    <a onClick={() => { diagram?.commandHandler.decreaseZoom(); }}><img src={MinusIcon} /></a>
                    <a onClick={() => { diagram?.commandHandler.zoomToFit(); }}><img src={FitIcon} /></a>
                    
                </div>
                <div className={styles.leftToolBar}>
                    <a className={classNames({ [styles.active]: isLinkingMode })} onClick={() => { setLinkingMode(!isLinkingMode); }}>Связи</a>
                </div>
            </div>
        </div>
    );
        
    
}