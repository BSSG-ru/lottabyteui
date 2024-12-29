import React, { useCallback, useEffect, useState } from 'react';
import * as go from 'gojs';
import styles from './EntitiesModel.module.scss';
import { ReactDiagram } from 'gojs-react';
import { exportDiagram, initEntitiesDiagram, SaveRequestData } from '../../gojs-utils';
import '../../gojs-controls';
import { getEntitiesModel, getEntityAttributes, searchEntities } from '../../services/pages/dataEntities';
import { getCookie, handleHttpError, i18n, uuid } from '../../utils';
import { fetchWithRefresh } from '../../services/auth';
import { optionsPatch } from '../../services/requst_templates';
import { URL } from '../../services/requst_templates';
import PlusIcon from '../../assets/icons/plus.png';
import MinusIcon from '../../assets/icons/minus.png';
import FitIcon from '../../assets/icons/fit.png';
import PointerToolIcon from '../../assets/icons/pointer-white.svg';
import AreaSelectToolIcon from '../../assets/icons/area-select-white.svg';
import CommentsToolIcon from '../../assets/icons/comments-btn.svg';
import ExportToolIcon from '../../assets/icons/export.svg';
import CreateToolIcon from '../../assets/icons/create-obj-white.svg';
import { Button } from '../../components/Button';
import classNames from 'classnames';
import Modal from 'react-bootstrap/Modal';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import { createComment, getComments } from '../../services/pages/comments';
import { Tags } from '../../components/Tags';


export type EntitiesModelProps = {
    artifactType: string;
}

export function EntitiesModel({ artifactType } : EntitiesModelProps) {
    const [modelData, setModelData] = useState({});
    const [nodeDataArray, setNodeDataArray] = useState([]);
    const [linkDataArray, setLinkDataArray] = useState([]);
    const [diagram, setDiagram] = useState<go.Diagram | null>(null);
    const [diagramIsLoading, setDiagramIsLoading] = useState<boolean>(true);
    const [tagNames, setTagNames] = useState<string[]>([]);
    const [filterTagNames, setFilterTagNames] = useState<string[]>([]);
    const [entitiesSearch, setEntitiesSearch] = useState<string>('');
    const [entitiesList, setEntitiesList] = useState<any[]>([]);
    const [toolBarMode, setToolBarMode] = useState<string>('pointer');
    const [showComments, setShowComments] = useState<boolean>(false);
    const [comments, setComments] = useState<any[]>([]);
    const [newCommentText, setNewCommentText] = useState<string>('');
    const [showRightSidebar, setShowRightSidebar] = useState<boolean>(true);
    const [showLinkDlg, setShowLinkDlg] = useState<boolean>(false);
    const [linkDlgData, setLinkDlgData] = useState<any>({});
    const [linkTags, setLinkTags] = useState<string[]>([]);
    const [filterLinkTags, setFilterLinkTags] = useState<any>({});
    const [nodeSearch, setNodeSearch] = useState<string>('');

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


    const loadComments = () => {
        getComments('00000000-0000-0000-0000-000000000000').then(json => {
            
            setComments(json);
        })
    };

    useEffect(() => { loadComments(); }, []);

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
        window.addEventListener('linkDblClick', function (e) {

            setShowLinkDlg(true);

            setLinkDlgData({ id: (e as any).link.data.id, tags: (e as any).link.data.tags });
        })
    }, []);

    useEffect(() => {
        
        diagram?.startTransaction('search nodes');
        setNodeDataArray((prev:any) => (prev.map((n:any) => ({...n, isHighlighted: nodeSearch && (n.name.toLowerCase().indexOf(nodeSearch.toLowerCase()) != -1 || prev.some((n2:any) => n2.group == n.id && n2.name.toLowerCase().indexOf(nodeSearch.toLowerCase()) != -1)), highlightText: nodeSearch}))));
        diagram?.commitTransaction();
        
    }, [ nodeSearch ]);

    useEffect(() => {
        getEntitiesModel().then((json:any) => {
            setNodeDataArray(json.nodes.map((n:any) => ({...n, hidden: true})));
            setLinkDataArray(json.links.map((d:any) =>({...d, points: d.points ? JSON.parse(d.points) : ''})));

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

                if (alreadyDroppedElement != null) {
                    diagram?.select(alreadyDroppedElement);
                    diagram?.scrollToRect(alreadyDroppedElement.actualBounds);
                } else {

                    let repoNodeId = nodeData.id;

                    nodeData = getNewNodeDataFromRepo(nodeData, point);


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
                                        
                }
             });

             setDiagramIsLoading(false);

        

        }).catch(handleHttpError);
    }, [ diagram ]);

    useEffect(() => {
        let obj:any = {'': true};
        linkTags.forEach((tn:string) => {
            obj[tn] = true;
        });
        setFilterLinkTags(obj);
    }, [ linkTags ]);

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

    const clickTagFilter = (name: string) => {
        if (filterTagNames.indexOf(name) == -1)
            setFilterTagNames((prev) => ([...prev, name]));
        else
            setFilterTagNames((prev) => (prev.filter(x => x != name)));
    };

    const filterNodes = () => {
        diagram?.startTransaction('filter');
        var it = diagram?.nodes;
        while (it?.next()) {
            if (it.value.data.artifactType == 'entity') {
                let isVisible = true;
                if (!it.value.data.tagNames || it.value.data.tagNames.filter((x:string) => filterTagNames.indexOf(x) !== -1).length == 0)
                    isVisible = false;
                it.value.visible = isVisible;
            }
        }
        diagram?.commitTransaction();
    };

    useEffect(() => {
        filterNodes();
    }, [ filterTagNames ]);

    useEffect(() => {
        setFilterTagNames(tagNames);
    }, [ tagNames ]);

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

    const performUndo = () => {
        if (diagram) {
            diagram.clearSelection();
            diagram.undoManager.undo();
        }
    };

    const performRedo = () => {
        if (diagram) {
            diagram.clearSelection();
            diagram.undoManager.redo();
        }
    };

    const addComment = () => {
        createComment({ artifact_id: '00000000-0000-0000-0000-000000000000', artifact_type: 'entity', comment_text: newCommentText }).then(json => {
            setNewCommentText('');
            loadComments();
        });
    };

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

    return (
        <div className={styles.dg_outer_wrap}>
            {showComments && (<div className={styles.comments_panel}>
                <div className={styles.comment_add}>
                    <Textarea placeholder='Введите комментарий' value={newCommentText} onChange={(e) => setNewCommentText(e.target.value)} />
                    <Button onClick={addComment}>Добавить</Button>
                </div>
                <label>{i18n('Комментарии')}</label>
                {comments.map(c => (<div key={'comment' + c.id} className={styles.comment}>
                    <div className={styles.title}>{c.modifier_name} {new Date(c.modified).toLocaleString()}</div>
                    <div className={styles.text}>{c.comment_text}</div>
                </div>))}
            </div>)}
            <div className={styles.dg_wrap}>
                <div className={styles.topbar}>
                    <div className={styles.nodes_search}>
                        <label>Поиск</label>
                        <Input value={nodeSearch} placeholder={i18n('Искать...')} findBtn onChange={(e) => { setNodeSearch((e.target as any).value); }} enterKeyBlursInput onBlur={(e) => { setNodeSearch((e.target as any).value); }} />
                    </div>
                    <div className={styles.filter_tags}>
                        <label>Теги моделей</label>
                        <div className={styles.tags_list}>
                            {tagNames.map((tn, index) => (<Button key={'btn-tag-' + index} className={classNames(styles.btn_filter_tag, { [styles.active]: filterTagNames.indexOf(tn) !== -1 })} onClick={() => clickTagFilter(tn)}>{tn}</Button>))}
                        </div>
                    </div>
                    {linkTags.length > 0 && (
                        <div className={styles.lnk_tags_filter}>
                            <label>Теги связей</label>
                            <div className={styles.tags_list}>
                                <Button key={'lnk-tag-filter-empty'} className={classNames(styles.btn_filter, styles.shown, { [styles.active]: filterLinkTags[''] })} onClick={() => { setFilterLinkTags((prev:any) => ({...prev, '': !filterLinkTags[''] })) }}>(без тега)</Button>
                                {linkTags.map((tn, index) => <Button key={'lnk-tag-filter-' + index} className={classNames(styles.btn_filter, styles.shown, { [styles.active]: filterLinkTags[tn] })} onClick={() => { setFilterLinkTags((prev:any) => ({...prev, [tn]: !filterLinkTags[tn] })) }}>{tn}</Button>)}
                            </div>
                        </div>
                    )}
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
                    <a className={classNames(styles.btn, { [styles.active]: showComments})} onClick={() => setShowComments(!showComments)}><img src={CommentsToolIcon} /></a>
                    <a className={classNames(styles.btn, { [styles.active]: showRightSidebar})} onClick={() => setShowRightSidebar(!showRightSidebar)}><img src={CreateToolIcon} /></a>
                </div>
            </div>
            {showRightSidebar && (<div className={styles.right_sidebar}>
                <div className={styles.search}>
                    <Input placeholder={i18n('Поиск')} findBtn className={styles.input_global} defaultValue={entitiesSearch} onBlur={(e) => { setEntitiesSearch(e.target.value); }} />
                </div>

                <div className={styles.entities_list}>
                    {entitiesList.map(item => (<a href='#' onClick={() => { return false; }} key={'ei-' + item.id} className={classNames('entity-item', styles.entity_item)} data-id={item.id} data-name={item.name}>{item.name}</a>))}
                </div>
            </div>)}

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