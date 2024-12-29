import React, { useCallback, useEffect, useState } from 'react';
import * as go from 'gojs';
import styles from './ArtifactModel.module.scss';
import { ReactDiagram } from 'gojs-react';
import { initArtifactDiagram, initEntitiesDiagram, SaveRequestData } from '../../gojs-utils';
import '../../gojs-controls';
import { getEntitiesModel } from '../../services/pages/dataEntities';
import { handleHttpError, i18n, uuid, getArtifactTypeDisplayName, getCookie, setCookie } from '../../utils';
import { fetchWithRefresh } from '../../services/auth';
import { optionsPatch } from '../../services/requst_templates';
import { URL } from '../../services/requst_templates';
import { getArtifactModel } from '../../services/pages/artifacts';
import PlusIcon from '../../assets/icons/plus.png';
import MinusIcon from '../../assets/icons/minus.png';
import FitIcon from '../../assets/icons/fit.png';
import { useParams } from 'react-router';
import { Button } from '../../components/Button';
import classNames from 'classnames';
import { v4 as uuidv4 } from 'uuid';
import Modal from 'react-bootstrap/Modal';
import { Tags } from '../../components/Tags';

export type ArtifactModelProps = {
    artifactType: string;
}

export function ArtifactModel({ artifactType } : ArtifactModelProps) {
    const [modelData, setModelData] = useState({});
    const [nodeDataArray, setNodeDataArray] = useState<any[]>([]);
    const [linkDataArray, setLinkDataArray] = useState<any[]>([]);
    const [diagram, setDiagram] = useState<go.Diagram | null>(null);
    const [diagramIsLoading, setDiagramIsLoading] = useState<boolean>(true);
    const [isLinkingMode, setLinkingMode] = useState<boolean>(false);
    const [filterLineageDirs, setFilterLineageDirs] = useState<any>({ left: true, right: false });
    const [showLinkDlg, setShowLinkDlg] = useState<boolean>(false);
    const [linkDlgData, setLinkDlgData] = useState<any>({});
    const [linkTags, setLinkTags] = useState<string[]>([]);
    const [filterLinkTags, setFilterLinkTags] = useState<any>({});
    const [tagNames, setTagNames] = useState<string[]>([]);
    const [filterTagNames, setFilterTagNames] = useState<string[]>([]);

    const lineageStruct:any = {
        domain: { left: [ 'product', 'indicator', 'data_asset', 'system' ], right: []},
        product: { left: [ 'indicator', 'data_asset', 'system' ], right: [ ] },
        indicator: { left: [ 'data_asset', 'system' ], right: [ 'product' ] },
        data_asset: { left: [ 'system' ], right: [ 'product', 'indicator' ] },
        entity_sample: { left: [ 'system', 'meta_object' ], right: [ 'product', 'indicator', 'data_asset' ] },
        entity: { left: [], right: [ 'data_asset', 'product', 'indicator' ] },
        entity_query: { left: [ 'system' ], right: [ 'domain', 'product', 'indicator', 'data_asset' ] },
        system: { left: [], right: [ 'product', 'indicator', 'data_asset' ] }
    };

    const [filterArtifactTypes, setFilterArtifactTypes] = useState<any>({
        system: true,
        entity_query: true,
        entity: true,
        entity_sample: true,
        data_asset: true,
        indicator: true,
        product: true,
        business_entity: true,
        domain: true,
        meta_object: true
      });

    const { id } = useParams();

    const diagramRef = useCallback((ref: ReactDiagram | null) => {
        if (ref != null) {
            
            setDiagram(ref.getDiagram());
            
        }
    }, [diagram]);

    const updateDummyLinks = () => {
        var hiddenNodeIds:string[] = [];

        diagram?.nodes.each((node) => {
            if (!node.isVisible()) {
                hiddenNodeIds.push(node.data.id);
            }
        });

        var hiddenLinks:go.Link[] = [];

        diagram?.links.each(link => {
            if (!link.isVisible() && !link.data.isDummy) {
                hiddenLinks.push(link);
            }
        });

        var dummyLinks:any[] = hiddenLinks.map(link => ({...link.data}));
        
        for (var i = 0; i < hiddenNodeIds.length; i++) {
            
            var dummyLinksNew:any[] = [];
            var nodeId = hiddenNodeIds[i];

            for (var j = 0; j < dummyLinks.length; j++) {
                if (dummyLinks[j].from != nodeId && dummyLinks[j].to != nodeId) {
                    if (!dummyLinksNew.some(lnk => (lnk.from == dummyLinks[j].from && lnk.to == dummyLinks[j].to)))
                        dummyLinksNew.push(dummyLinks[j]);
                } else {
                    if (dummyLinks[j].from == nodeId) {
                        for (var k = 0; k < dummyLinks.length; k++) {
                            if (j != k && dummyLinks[k].to == nodeId) {
                                
                                if (!dummyLinksNew.some(lnk => (lnk.from == dummyLinks[k].from && lnk.to == dummyLinks[j].to)))
                                    dummyLinksNew.push({...dummyLinks[j], id: 'dummy-' + uuid(), from: dummyLinks[k].from, points: '', isDummy: true});
                            }
                        }
                    }
                }
            }


            dummyLinks = [...dummyLinksNew];
        }

        setLinkDataArray((prev) => (prev.filter(n => !n.isDummy).concat(dummyLinks)));
    };

    useEffect(() => {
        if (artifactType == 'entity') {
            getEntitiesModel().then((json:any) => {
                setNodeDataArray(json.nodes);
                setLinkDataArray(json.links.map((d:any) =>({...d, points: d.points ? JSON.parse(d.points) : ''})));
                setLinkTags([]);
            }).catch(handleHttpError);
        } else 
        {
            if (id)
                getArtifactModel(id, artifactType).then((json:any) => {
                    let nodes = json.nodes.map((n:any) => ({
                        ...n, 
                        hidden: !nodeIsVisible(n)// (lineageStruct[artifactType].left.some((x:string) => x == n.artifactType) && !filterLineageDirs.left && n.lineageDir == 'left') || (lineageStruct[artifactType].right.some((x:string) => x == n.artifactType) && !filterLineageDirs.right && n.lineageDir == 'right') 
                    }));
                    let nodes2 = [...nodes];
                    /*nodes.forEach((n:any) => {
                        switch (n.artifactType) {
                            case 'indicator': nodes2.push({ id: uuidv4(), name: 'Качество данных', type: 'urlNodeType', category: 'urlNodeType', artifactType: 'dqLink', isGroup: false, parentId: n.id, group: n.id, text: "Качество данных", zorder: 1, url: '/quality-schedule-tasks'}); break;
                            case 'product': nodes2.push({ id: uuidv4(), name: 'Качество данных', type: 'urlNodeType', category: 'urlNodeType', artifactType: 'dqLink', isGroup: false, parentId: n.id, group: n.id, text: "Качество данных", zorder: 1, url: '/quality-schedule-tasks'}); break;
                            case 'entity_sample': nodes2.push({ id: uuidv4(), name: 'Качество данных', type: 'urlNodeType', category: 'urlNodeType', artifactType: 'dqLink', isGroup: false, parentId: n.id, group: n.id, text: "Качество данных", zorder: 1, url: '/quality-schedule-tasks'}); break;
                        }
                    });*/
                    setNodeDataArray(nodes2);
                    setLinkDataArray(json.links.map((d:any) =>({...d, points: d.points ? JSON.parse(d.points) : '', isDummy: false})));

                    let tags_arr:string[] = [];
            
                    json.nodes.forEach((node:any) => {
                        if (node.tagNames) {
                            node.tagNames.forEach((tn:string) => {
                                if (tags_arr.indexOf(tn) == -1)
                                    tags_arr.push(tn);
                            })
                        }
                    });

                    setTagNames(tags_arr);
                    const ck = getCookie('model-tags-hidden');
                    const ck_arr = ck ? ck.split('|') : [];
                    setFilterTagNames([...tags_arr, ''].filter(x => ck_arr.indexOf(x) == -1));
                    
                    let lnkTags:string[] = [];
                    json.links.forEach((lnk:any) => {
                        if (lnk && lnk.tags) {
                            lnk.tags.forEach((t:any) => {
                                if (!lnkTags.includes(t.name))
                                    lnkTags.push(t.name);
                            })
                        }
                    });
                    setLinkTags(lnkTags);

                    updateDummyLinks();

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
                if (!e.modifiedLinkData[i].isDummy)
                    saveRequestData.addLink(e.modifiedLinkData[i]);
            }
        }

        if (e.insertedLinkKeys) {
         
            for (let i = 0; i < e.insertedLinkKeys.length; i++) {
                let link = diagram?.findLinkForKey(e.insertedLinkKeys[i]);
                if (link) {
                    if (!link.data.isDummy)
                        saveRequestData.addLink(link);
                }
            }
        }

        if (e.removedLinkKeys) {
            for (let i = 0; i < e.removedLinkKeys.length; i++) {
                if (e.removedLinkKeys[i]?.toString().indexOf('dummy') == -1)
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

    const nodeIsVisible = (nodeData: any) => {
        let at = nodeData.type == 'urlNodeType' ? nodeDataArray.find(n => n.id == nodeData.parentId).artifactType : nodeData.artifactType;
        let dir = nodeData.type == 'urlNodeType' ? nodeDataArray.find(n => n.id == nodeData.parentId).lineageDir : nodeData.lineageDir;
        let visible = false;

        if (filterArtifactTypes[at]) {
            visible = !dir || dir == '' || (dir && filterLineageDirs[dir]);
        }
        if (visible) {
            if (!nodeData.tagNames)
                visible = filterTagNames.indexOf('') !== -1;
            else {
                if (nodeData.tagNames.filter((x:string) => filterTagNames.indexOf(x) !== -1).length == 0)
                    visible = false;
            }
        }
        return visible;
    };

    useEffect(() => {

        var it = diagram?.nodes;
        while (it?.next()) {
            it.value.visible = nodeIsVisible(it.value.data);
        }

        updateDummyLinks();
        
    }, [ filterArtifactTypes, filterLineageDirs, filterTagNames ]);

    useEffect(() => {
        var it = diagram?.links;
            while (it?.next()) {
                if (!it.value.data.isDummy)
                    it.value.visible = false;
            }

        Object.keys(filterLinkTags).forEach(tn => {
            if (filterLinkTags[tn]) {
                it = diagram?.links;
                while (it?.next()) {
                    if (!it.value.data.isDummy) {
                        let tags = it.value.data.tags;
                        if (tn == '') {
                            if (!tags || tags.length == 0)
                                it.value.visible = true;
                        } else {
                            if (tags.some((t:any) => t.name == tn))
                                it.value.visible = true;
                        }
                    }
                }
            }
        })
    }, [ filterLinkTags ]);

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

    useEffect(() => {
        window.addEventListener('linkDblClick', function (e) {

            setShowLinkDlg(true);

            setLinkDlgData({ id: (e as any).link.data.id, tags: (e as any).link.data.tags });
        })
    }, []);

    useEffect(() => {
        let obj:any = {'': true};
        linkTags.forEach((tn:string) => {
            obj[tn] = true;
        });
        setFilterLinkTags(obj);
    }, [ linkTags ]);

    const handleLinkDlgClose = () => {
        setShowLinkDlg(false);
        return false;
    };

    const onSaveLinkDlg = () => {
        setShowLinkDlg(false);

        diagram?.startTransaction('update link');

        var data = (diagram?.model as go.GraphLinksModel).findLinkDataForKey(linkDlgData.id);
        if (data)
            diagram?.model.setDataProperty(data ,'tags', linkDlgData.tags);

        diagram?.commitTransaction();

        return false;
    }

    const linkTagIdAdded = (tagId: string, tagName: string) => {
        setLinkDlgData((prev:any) => ({...prev, tags: [...prev.tags, { id: tagId, name: tagName } ]}));
    };

    const linkTagIdDeleted = (tagId: string) => {
        setLinkDlgData((prev:any) => ({...prev, tags: prev.tags.filter((x:any) => x.id != tagId)}));
    };

    const clickTagFilter = (name: string) => {
        if (filterTagNames.indexOf(name) == -1) {
            setFilterTagNames((prev) => ([...prev, name]));

            const ck = getCookie('model-tags-hidden');
            if (ck) {
                let ck_arr = ck.split('|');
                if (ck_arr.indexOf(name) != -1) {
                    setCookie('model-tags-hidden', ck_arr.filter(x => x != name).join('|'), { path: '/' });
                }
            }
        } else {
            setFilterTagNames((prev) => (prev.filter(x => x != name)));

            const ck = getCookie('model-tags-hidden');
            let ck_arr = ck ? ck.split('|') : [];
            if (ck_arr.indexOf(name) == -1) {
                ck_arr.push(name);
                setCookie('model-tags-hidden', ck_arr.join('|'), { path: '/' });
            }
        }
    };

    return (
        <div className={styles.artifact_model}>
            <div className={styles.topbar}>
                <div className={styles.dg_filter}>
                    <Button className={classNames(styles.btn_filter_dir, { [styles.active]: filterLineageDirs.left })} onClick={() => { setFilterLineageDirs((prev:any) => ({...prev, left: !filterLineageDirs.left})) }}>{i18n('Влево')}</Button>
                    <Button className={classNames(styles.btn_filter_dir, { [styles.active]: filterLineageDirs.right })} onClick={() => { setFilterLineageDirs((prev:any) => ({...prev, right: !filterLineageDirs.right})) }}>{i18n('Вправо')}</Button>
                    {Object.keys(filterArtifactTypes).map((at:string) => 
                        <Button 
                            key={uuid()} 
                            className={classNames(styles.btn_filter, { 
                                [styles.active]: filterArtifactTypes[at], 
                                [styles.shown]: ([ artifactType, 'domain', 'entity', 'entity_query', 'business_entity', 'entity_sample', 'meta_object' ].some(x => (x == at)) || (filterLineageDirs.right && lineageStruct[artifactType]['right'].some((e:string) => e == at)) || (filterLineageDirs.left && lineageStruct[artifactType]['left'].some((e:string) => e == at))) 
                            })} 
                            onClick={() => { setFilterArtifactTypes((prev:any) => ({...prev, [at]: !filterArtifactTypes[at]})) }}
                            >{getArtifactTypeDisplayName(at)}</Button>
                        )
                    }
                </div>
                <div className={styles.filter_tags}>
                    <label>Теги</label>
                    <div className={styles.tags_list}>
                        <Button key={'btn-tag-empty'} className={classNames(styles.btn_filter_tag, { [styles.active]: filterTagNames.indexOf('') !== -1 })} onClick={() => clickTagFilter('')}>(без тега)</Button>
                        {tagNames.map((tn, index) => (<Button key={'btn-tag-' + index} className={classNames(styles.btn_filter_tag, { [styles.active]: filterTagNames.indexOf(tn) !== -1 })} onClick={() => clickTagFilter(tn)}>{tn}</Button>))}
                    </div>
                </div>
                {linkTags.length > 0 && (
                    <div className={styles.lnk_tags_filter}>
                        <Button key={'lnk-tag-filter-empty'} className={classNames(styles.btn_filter, styles.shown, { [styles.active]: filterLinkTags[''] })} onClick={() => { setFilterLinkTags((prev:any) => ({...prev, '': !filterLinkTags[''] })) }}>(без тега)</Button>
                        {linkTags.map((tn, index) => <Button key={'lnk-tag-filter-' + index} className={classNames(styles.btn_filter, styles.shown, { [styles.active]: filterLinkTags[tn] })} onClick={() => { setFilterLinkTags((prev:any) => ({...prev, [tn]: !filterLinkTags[tn] })) }}>{tn}</Button>)}
                    </div>
                )}
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
            <Modal show={showLinkDlg} backdrop={false} onHide={handleLinkDlgClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Связь</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Tags tagPrefix='#' tags={(linkDlgData.tags ?? []).map((t:any) => ({ id: t.id, value: t.name }))} onTagIdAdded={linkTagIdAdded} onTagIdDeleted={linkTagIdDeleted} />
                </Modal.Body>
                <Modal.Footer>
                    <Button background='blue' onClick={onSaveLinkDlg}>OK</Button>
                    <Button background='outlined-blue' onClick={handleLinkDlgClose}>Отмена</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );   
}