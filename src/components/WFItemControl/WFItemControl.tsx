import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { getArtifactUrl, handleHttpError, handleHttpResponse, i18n, uuid } from '../../utils';
import styles from './WFItemControl.module.scss';
import { ArtifactMetaData } from '../../types/artifact';
import { Button } from '../Button';
import { useNavigate } from 'react-router';
import { ReactComponent as InfoIcon } from '../../assets/icons/info.svg';
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg';
import { WorkflowAction, WorkflowActionParamResult, WorkflowTask } from '../../types/workflow';
import { getWorkflowTask } from '../../services/pages/workflow';
import { fetchWithRefresh } from '../../services/auth';
import { URL, optionsPost } from '../../services/requst_templates';
import { Modal } from 'react-bootstrap';
import { Input } from '../Input';


export type WFItemControlProps = {
    itemMetadata: ArtifactMetaData;
    itemIsReadOnly: boolean;
    onEditClicked: () => void;
    onObjectIdChanged: (id:string) => void;
    onObjectDataChanged?: (data:any) => void;
};

export const WFItemControl: FC<WFItemControlProps> =({ itemMetadata, itemIsReadOnly, onEditClicked, onObjectIdChanged, onObjectDataChanged }) => {

    const navigate = useNavigate();

    const [actions, setActions] = useState<WorkflowAction[]>([]);
    const [showNotice, setShowNotice] = useState(true);
    const [currAction, setCurrAction] = useState<WorkflowAction | null>(null);
    const [currActionResult, setCurrActionResult] = useState<WorkflowActionParamResult[]>([]);
    const [showActionDlg, setShowActionDlg] = useState(false);
    const [actionError, setActionError] = useState('');

    const handleActionDlgClose = () => {
        setShowActionDlg(false);
        return false;
    }

    useEffect(() => {
        if (itemMetadata.workflow_task_id) {
            getWorkflowTask(itemMetadata.workflow_task_id).then((text:string) => {
                if (text)
                    setActions(JSON.parse(text).entity.actions);
            }).catch(handleHttpError);
        } else {
            setActions([]);
        }
    }, [ itemMetadata.workflow_task_id ])

    return <div className={styles.wf_item_control}>
        {itemMetadata.state == 'DRAFT' && itemMetadata.published_id && showNotice && (
            <div className={styles.wf_notice}><div className={styles.msg}><InfoIcon style={{fill:'#6F9E6E'}} />{i18n('У этого черновика есть опубликованная версия')}</div><Button background='none' className={styles.btn_open_item} onClick={() => navigate(getArtifactUrl(itemMetadata.published_id ?? '', itemMetadata.artifact_type))}>{i18n('Открыть')}</Button><CloseIcon className={styles.btn_hide} onClick={() => setShowNotice(false)} /></div>
        )}
        {itemMetadata.state == 'DRAFT' && (
            <>
                <div className={styles.draft_notice}>{i18n('Черновик')}</div>
                <div className={styles.btns}>
                    {actions.map(action => {
                        return <Button key={'wf-action-' + action.id} className={styles.btn_wf_action} onClick={() => {
                            setCurrAction(action);
                            setCurrActionResult(action.params.map(p => { return {id: p.id, param_name: p.name, param_type: p.type, param_value: ''} }));
                            setShowActionDlg(true);
                        }}>{action.display_name}</Button>
                    })}
                </div>
            </>
        )}
        {itemMetadata.state == 'PUBLISHED' && itemMetadata.draft_id && showNotice && (
            <div className={styles.wf_notice}><div className={styles.msg}><InfoIcon style={{fill:'#6F9E6E'}} />{i18n('Для этой карточки создан черновик')}</div><Button background='none' className={styles.btn_open_item} onClick={() => navigate(getArtifactUrl(itemMetadata.draft_id ?? '', itemMetadata.artifact_type))}>{i18n('Открыть')}</Button><CloseIcon className={styles.btn_hide} onClick={() => setShowNotice(false)} /></div>
        )}
        {itemMetadata.state == 'PUBLISHED' && !itemMetadata.draft_id && itemIsReadOnly && (
            <div className={styles.btns}><Button onClick={onEditClicked}>{i18n('Изменить')}</Button></div>
        )}
        {showActionDlg && (
            <Modal show={showActionDlg} backdrop={false} onHide={handleActionDlgClose}>
                <Modal.Header closeButton><Modal.Title>{currAction?.display_name}</Modal.Title></Modal.Header>
                <Modal.Body>
                    <div className={styles.modal_error}>{actionError}</div>
                    {currAction?.params.map(param => {
                        return <div key={'m-a-p-' + param.id} className={classNames(styles.action_param, {[param.type]: true})}>
                            {param.type == 'STRING' && (
                                <Input type="text" placeholder={param.display_name + (param.required ? '*' : '')} value={currActionResult.find(el => el.id == param.id)?.param_value} onChange={(e) => {
                                    setCurrActionResult(prev => prev.map(x => { if (x.id == param.id) return { ...x, param_value: e.target.value}; else return x; }));
                                }} />
                            )}
                        </div>;
                    })}
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => {
                        setActionError('');
                        let isError = false;
                        currAction?.params.filter(p => { return p.required; }).forEach(rp => {
                            if (!currActionResult.find(el => { return el.id == rp.id; })?.param_value) {
                                setActionError(i18n('Заполните обязательные поля'));
                                isError = true;
                            }
                        });

                        if (!isError) {
                            fetchWithRefresh(`${URL}` + currAction?.post_url, optionsPost(currActionResult)).then(handleHttpResponse).then(json => {
                                if (json.success) {
                                    if (json.item && onObjectDataChanged)
                                        onObjectDataChanged(json.item);
                                    if (json.item && json.item.metadata.id)
                                        onObjectIdChanged(json.item.metadata.id);
                                    else
                                        onObjectIdChanged('');
                                } else {
                                    (window as any).notices.addNotice('error', i18n('Ошибка при выполнении') + ' "' + currAction?.display_name + '"');
                                }
                            }).catch(handleHttpError);
                            setShowActionDlg(false);
                        }
                    }}>{currAction?.display_name}</Button>
                    <Button background="outlined-orange" onClick={handleActionDlgClose}>{i18n('Отмена')}</Button>
                </Modal.Footer>
            </Modal>
        )}
    </div>;
};