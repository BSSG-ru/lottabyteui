import React, { useCallback, useEffect, useState } from 'react';
import * as go from 'gojs';
import styles from './EntitiesModel.module.scss';
import { ReactDiagram } from 'gojs-react';
import { initEntitiesDiagram, SaveRequestData } from '../../gojs-utils';
import '../../gojs-controls';
import { getEntities, getEntitiesModel } from '../../services/pages/dataEntities';
import { handleHttpError, uuid } from '../../utils';
import { fetchWithRefresh } from '../../services/auth';
import { optionsPatch } from '../../services/requst_templates';
import { URL } from '../../services/requst_templates';
import { getArtifactsModel } from '../../services/pages/artifacts';
import PlusIcon from '../../assets/icons/plus.png';
import MinusIcon from '../../assets/icons/minus.png';
import FitIcon from '../../assets/icons/fit.png';


export type EntitiesModelProps = {
    artifactType: string;
}

export function EntitiesModel({ artifactType } : EntitiesModelProps) {
    const [modelData, setModelData] = useState({});
    const [nodeDataArray, setNodeDataArray] = useState([]);
    const [linkDataArray, setLinkDataArray] = useState([]);
    const [diagram, setDiagram] = useState<go.Diagram | null>(null);
    const [diagramIsLoading, setDiagramIsLoading] = useState<boolean>(true);

    const diagramRef = useCallback((ref: ReactDiagram | null) => {
        if (ref != null) {
            
            setDiagram(ref.getDiagram());
            
        }
    }, [diagram]);

    useEffect(() => {
        getEntitiesModel().then((json:any) => {
            setNodeDataArray(json.nodes);
            setLinkDataArray(json.links.map((d:any) =>({...d, points: d.points ? JSON.parse(d.points) : ''})));
        }).catch(handleHttpError);
    }, []);

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
            fetchWithRefresh(`${URL}/v1/artifacts/model`, optionsPatch(saveRequestData));
        }
        
    };

    return (<div className={styles.dg_wrap}>
        <ReactDiagram ref={diagramRef} initDiagram={initEntitiesDiagram} divClassName={styles.diagram_div} nodeDataArray={nodeDataArray} linkDataArray={linkDataArray} modelData={modelData} onModelChange={onModelChange} />
        <div className={styles.rightToolBar}>
            <a onClick={() => { diagram?.commandHandler.increaseZoom(); }}><img src={PlusIcon} /></a>
            <a onClick={() => { diagram?.commandHandler.decreaseZoom(); }}><img src={MinusIcon} /></a>
            <a onClick={() => { diagram?.commandHandler.zoomToFit(); }}><img src={FitIcon} /></a>
            
        </div>
    </div>);
        
    
}