import React, { useCallback, useEffect, useState } from 'react';
import * as go from 'gojs';
import styles from './EntitiesModel.module.scss';
import { ReactDiagram } from 'gojs-react';
import { exportDiagram, initEntitiesDiagram, SaveRequestData } from '../../gojs-utils';
import '../../gojs-controls';
import { getEntities, getEntitiesModel, getEntityAttributes, searchEntities } from '../../services/pages/dataEntities';
import { getCookie, handleHttpError, i18n, uuid } from '../../utils';
import { fetchWithRefresh } from '../../services/auth';
import { optionsPatch } from '../../services/requst_templates';
import { URL } from '../../services/requst_templates';
import { getArtifactsModel } from '../../services/pages/artifacts';
import PlusIcon from '../../assets/icons/plus.png';
import MinusIcon from '../../assets/icons/minus.png';
import FitIcon from '../../assets/icons/fit.png';
import PointerToolIcon from '../../assets/icons/pointer-white.svg';
import AreaSelectToolIcon from '../../assets/icons/area-select-white.svg';
import ExportToolIcon from '../../assets/icons/export.svg';
import { Button } from '../../components/Button';
import classNames from 'classnames';
import { Table } from '../../components/Table';
import { Input } from '../../components/Input';


export type EntitiesModelProps = {
    artifactType: string;
}

export function EntitiesModel({ artifactType } : EntitiesModelProps) {
    const [modelData, setModelData] = useState({});
    const [nodeDataArray, setNodeDataArray] = useState([]);
    const [linkDataArray, setLinkDataArray] = useState([]);
    const [diagram, setDiagram] = useState<go.Diagram | null>(null);
    const [diagramIsLoading, setDiagramIsLoading] = useState<boolean>(true);
    const [domainNames, setDomainNames] = useState<string[]>([]);
    const [tagNames, setTagNames] = useState<string[]>([]);
    const [filterDomainNames, setFilterDomainNames] = useState<string[]>([]);
    const [filterTagNames, setFilterTagNames] = useState<string[]>([]);
    const [entitiesSearch, setEntitiesSearch] = useState<string>('');
    const [entitiesList, setEntitiesList] = useState<any[]>([]);
    const [toolBarMode, setToolBarMode] = useState<string>('pointer');

    const diagramRef = useCallback((ref: ReactDiagram | null) => {
        if (ref != null) {
            
            setDiagram(ref.getDiagram());
            
        }
    }, [diagram]);

    useEffect(() => {
        searchEntities({
            sort: 'name+',
            global_query: '',
            limit: 1000,
            offset: 0,
            filters: entitiesSearch ? [{ column: 'name', value: entitiesSearch, operator: 'LIKE' }] : [],
            filters_preset: [],
            filters_for_join: [],
          }).then(json => {
            setEntitiesList(json.items);
          }).catch(handleHttpError);
    }, [ entitiesSearch ]);

    const getNewNodeDataFromRepo = (nodeData: any, point: any) => {
        nodeData.type = 'defaultNodeType';
        nodeData.text = nodeData.name;
        nodeData.zOrder = 1;
        nodeData.isGroup = true;
        nodeData.group = '';
        nodeData.parentId = '';
        nodeData.artifactType = 'entity';

        if (point)
            nodeData.loc = point.x + ' ' + point.y;

        return nodeData;
    };

    useEffect(() => {
        getEntitiesModel().then((json:any) => {
            setNodeDataArray(json.nodes);
            setLinkDataArray(json.links.map((d:any) =>({...d, points: d.points ? JSON.parse(d.points) : ''})));

            let tags_arr:string[] = [];
            let domains_arr:string[] = [];
            json.nodes.forEach((node:any) => {
                if (node.tagNames) {
                    node.tagNames.forEach((tn:string) => {
                        if (tags_arr.indexOf(tn) == -1)
                            tags_arr.push(tn);
                    })
                }
                if (node.domainNames) {
                    node.domainNames.forEach((dn:string) => {
                        if (domains_arr.indexOf(dn) == -1)
                            domains_arr.push(dn);
                    })
                }
            });

            setDomainNames(domains_arr);
            setTagNames(tags_arr);

            document.querySelector('.diagram-div')?.addEventListener('drop', function(e) { 
                e.preventDefault();

                let can = e.target;
                let pixelratio = diagram?.computePixelRatio();
                
                if (!pixelratio)
                    return;

                // if the target is not the canvas, we may have trouble, so just quit:
                if (!(can instanceof HTMLCanvasElement)) return;

                var bbox = can.getBoundingClientRect();
                var bbw = bbox.width;
                if (bbw === 0) bbw = 0.001;
                var bbh = bbox.height;
                if (bbh === 0) bbh = 0.001;
                var mx = (e as any).clientX - bbox.left * ((can.width / pixelratio) / bbw) - draggedElem.offsetX;
                var my = (e as any).clientY - bbox.top * ((can.height / pixelratio) / bbh) - draggedElem.offsetY;
                var point = diagram?.transformViewToDoc(new go.Point(mx, my));
                let nodeData = JSON.parse((e as any).dataTransfer.getData('data'));

                let alreadyDroppedElement = null;
                let nodes = diagram?.findNodesByExample({ id: nodeData.id });
                if (nodes && nodes.count > 0)
                    alreadyDroppedElement = nodes.iterator.first();
                else {
                    if (typeof nodeData.properties !== 'undefined' && typeof nodeData.properties.originalElementId !== 'undefined') {
                        nodes = diagram?.findNodesByExample({ id: nodeData.properties.originalElementId });
                        if (nodes && nodes.count > 0)
                            alreadyDroppedElement = nodes.iterator.first();
                    }
                }

                console.log('alreadyDroppedElement', alreadyDroppedElement);
                if (alreadyDroppedElement != null) {
                    diagram?.select(alreadyDroppedElement);
                    diagram?.scrollToRect(alreadyDroppedElement.actualBounds);
                } else {

                    let repoNodeId = nodeData.id;

                    nodeData = getNewNodeDataFromRepo(nodeData, point);

                    console.log('new node data', nodeData);

                    getEntityAttributes(nodeData.id).then(json => {

                        diagram?.startTransaction('new node');
                        diagram?.model.addNodeData(nodeData);

                        json.resources.forEach((data:any, index:number) => {
                            diagram?.model.addNodeData({
                                id: data.metadata.id,
                                text: data.entity.name,
                                type: 'defaultNodeType',
                                zOrder: 1,
                                name: data.entity.name,
                                parentId: data.entity.entity_id,
                                group: data.entity.entity_id,
                                isGroup: false,
                                order: index,
                                datatype: data.entity.attribute_type,
                                artifactType: 'entity_attribute',
                                isPk: data.entity.is_pk,
                                isFk: false
                            });

                        });

                        diagram?.commitTransaction('new node');
                    });

                    

                    let addLinksData = [];
                    let addedLinkIds = [];
                    /*for (let i = 0; i < repository.length; i++) {
                        if (repository[i].type === 'RepoLinkType') {
                            if (repository[i].properties.from === repoNodeId || repository[i].properties.to === repoNodeId) {

                                for (let j = 0; j < dg.model.nodeDataArray.length; j++) {
                                    let rid = getRepoIdForPartData(dg.model.nodeDataArray[j]);
                                    if ((rid === repository[i].properties.from && repoNodeId === repository[i].properties.to)
                                        || (rid === repository[i].properties.to && repoNodeId === repository[i].properties.from)) {

                                        let linkData = getNewLinkDataFromRepo(dg, repository[i]);

                                        let added = false;
                                        for (let k = 0; k < addedLinkIds.length; k++) {
                                            if (addedLinkIds[k] === repository[i].id)
                                                added = true;
                                        }

                                        if (!added) {
                                            addLinksData.push(linkData);
                                            addedLinkIds.push(repository[i].id);
                                        }
                                    }
                                }
                            }
                        }
                    }

                    for (let i = 0; i < addLinksData.length; i++) {
                        diagram?.model.addLinkData(addLinksData[i]);
                    }*/

                    
                }
             });

             setDiagramIsLoading(false);

        }).catch(handleHttpError);
    }, [ diagram ]);

    const onModelChange = (e:go.IncrementalData) => {

        if (diagramIsLoading) {
            setDiagramIsLoading(false);
            return;
        }

        var userp = getCookie('userp');
        if (!userp || userp.split(',').indexOf('lo_mdl_u') == -1) {
            return;
        }

        let saveRequestData = new SaveRequestData();
        if (e.modifiedNodeData) {
            for (let i = 0; i < e.modifiedNodeData.length; i++) {
                saveRequestData.addNode(e.modifiedNodeData[i]);
            }
        }

        if (e.insertedNodeKeys) {
            for (let i = 0; i < e.insertedNodeKeys.length; i++) {
                let node = diagram?.findNodeForKey(e.insertedNodeKeys[i]);
                if (node)
                    saveRequestData.addNode(node);
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

        if (e.removedNodeKeys) {
            for (let i = 0; i < e.removedNodeKeys.length; i++) {
                saveRequestData.deleteNode('' + e.removedNodeKeys[i]);
            }
        }
        
        if (saveRequestData.isEmpty())
            return;

        if (artifactType == 'entity')
            fetchWithRefresh(`${URL}/v1/entities/model`, optionsPatch(saveRequestData));
        else {
            fetchWithRefresh(`${URL}/v1/artifacts/model`, optionsPatch(saveRequestData));
        }
        
    };


    const clickDomainFilter = (name: string) => {
        if (filterDomainNames.indexOf(name) == -1)
            setFilterDomainNames((prev) => ([...prev, name]));
        else
            setFilterDomainNames((prev) => (prev.filter(x => x != name)));
    };

    const clickTagFilter = (name: string) => {
        if (filterTagNames.indexOf(name) == -1)
            setFilterTagNames((prev) => ([...prev, name]));
        else
            setFilterTagNames((prev) => (prev.filter(x => x != name)));
    };

    useEffect(() => {
        var it = diagram?.nodes;
        while (it?.next()) {
            if (it.value.data.artifactType == 'entity') {
                let isVisible = true;
                if (filterTagNames.length > 0) {
                    if (!it.value.data.tagNames || it.value.data.tagNames.filter((x:string) => filterTagNames.indexOf(x) !== -1).length == 0)
                        isVisible = false;
                }
                if (filterDomainNames.length > 0) {
                    if (!it.value.data.domainNames || it.value.data.domainNames.filter((x:string) => filterDomainNames.indexOf(x) !== -1).length == 0)
                        isVisible = false;
                }
                it.value.visible = isVisible;
            }
        }

        /*filterTagNames.forEach(at => {
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
        });*/
        
    }, [ filterDomainNames, filterTagNames ]);

    useEffect(() => {
        if (diagram) {
            //diagram.allowDragSelect = true;
            var userp = getCookie('userp');
            var hasPerm = userp ? userp.split(',').indexOf('lo_mdl_u') !== -1 : false;
            diagram.toolManager.panningTool.isEnabled = (toolBarMode == 'pointer');
            diagram.toolManager.draggingTool.isEnabled = hasPerm;
            diagram.toolManager.linkReshapingTool.isEnabled = hasPerm;
            diagram.toolManager.linkingTool.isEnabled = hasPerm;
        }
    }, [ toolBarMode, diagram ]);

    var draggedElem:any = null;

    document.addEventListener('dragstart', function (e) {
        var elem = e.target as any;
        if (elem.classList.contains('entity-item')) {
            e.dataTransfer?.setData('data', JSON.stringify({ id: elem.getAttribute('data-id'), name: elem.getAttribute('data-name') }));
            draggedElem = elem;

            draggedElem.offsetX = e.offsetX - draggedElem.clientWidth / 2;
            draggedElem.offsetY = e.offsetY - draggedElem.clientHeight / 2;
        }
        
    });

    document.addEventListener('dragenter', function (e) { e.preventDefault(); });
    document.addEventListener('dragover', function (e) { e.preventDefault(); });
    document.addEventListener('dragend', function (e) {  });

    return (
        <div className={styles.dg_outer_wrap}>
            
            <div className={styles.dg_wrap}>
                <div className={styles.filter_domains}>
                    <label>Домены</label>
                    <div className={styles.domains_list}>
                        {domainNames.map((dn, index) => (<Button key={'btn-domain-' + index} className={classNames(styles.btn_filter_domain, { [styles.active]: filterDomainNames.indexOf(dn) !== -1 })} onClick={() => clickDomainFilter(dn)}>{dn}</Button>))}
                    </div>
                </div>
                <div className={styles.filter_tags}>
                    <label>Теги</label>
                    <div className={styles.tags_list}>
                        {tagNames.map((tn, index) => (<Button key={'btn-tag-' + index} className={classNames(styles.btn_filter_tag, { [styles.active]: filterTagNames.indexOf(tn) !== -1 })} onClick={() => clickTagFilter(tn)}>{tn}</Button>))}
                    </div>
                </div>
                <ReactDiagram ref={diagramRef} initDiagram={initEntitiesDiagram} divClassName={classNames('diagram-div', styles.diagram_div)} nodeDataArray={nodeDataArray} linkDataArray={linkDataArray} modelData={modelData} onModelChange={onModelChange} />
                <div className={styles.rightToolBar}>
                    <a onClick={() => { diagram?.commandHandler.increaseZoom(); }}><img src={PlusIcon} /></a>
                    <a onClick={() => { diagram?.commandHandler.decreaseZoom(); }}><img src={MinusIcon} /></a>
                    <a onClick={() => { diagram?.commandHandler.zoomToFit(); }}><img src={FitIcon} /></a>
                    
                </div>
                <div className={styles.leftToolBar}>
                    <a className={classNames(styles.btn, { [styles.active]: toolBarMode == 'pointer'})} onClick={() => { setToolBarMode('pointer'); }}><img src={PointerToolIcon} /></a>
                    <a className={classNames(styles.btn, { [styles.active]: toolBarMode == 'select-area'})} onClick={() => { setToolBarMode('select-area'); }}><img src={AreaSelectToolIcon} /></a>
                    <div className={styles.sep}></div>
                    <a className={styles.btn} onClick={() => { if (diagram) exportDiagram(diagram, 'image/png', 'entity-model', '1'); }}><img src={ExportToolIcon} /></a>
                </div>
            </div>
            <div className={styles.right_sidebar}>
                <div className={styles.search}>
                    <Input placeholder={i18n('Поиск')} findBtn className={styles.input_global} defaultValue={entitiesSearch} onBlur={(e) => { setEntitiesSearch(e.target.value); }} />
                </div>

                <div className={styles.entities_list}>
                    {entitiesList.map(item => (<a href='#' onClick={() => { return false; }} key={'ei-' + item.id} className={classNames('entity-item', styles.entity_item)} data-id={item.id} data-name={item.name}>{item.name}</a>))}
                </div>
            </div>
        </div>
    );
        
    
}