import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { getArtifactUrl, getDataModified, handleHttpError, handleHttpResponse, i18n, uuid } from '../../utils';
import styles from './WFItemControl.module.scss';
import { ArtifactMetaData } from '../../types/artifact';
import { Button } from '../Button';
import { useNavigate } from 'react-router';
import { ReactComponent as DelIcon } from '../../assets/icons/del.svg';
import { WorkflowAction, WorkflowActionParamResult } from '../../types/workflow';
import { getWorkflowTask } from '../../services/pages/workflow';
import { fetchWithRefresh } from '../../services/auth';
import { URL, optionsPost } from '../../services/requst_templates';
import { Modal } from 'react-bootstrap';
import { Input } from '../Input';
import { clearStaticNotices, raiseStaticNotice } from '../StaticNoticesArea/StaticNoticesArea';
import { Loader } from '../Loader';


export type WFItemControlProps = {
    itemMetadata: ArtifactMetaData;
    itemIsReadOnly: boolean;
    isLoading?: boolean;
    saveItem?: () => any;
    onEditClicked: () => void;
    onSaveClicked?: () => void;
    onCancelEditClicked?: () => void;
    onArchiveClicked?: () => void;
    onRestoreClicked?: () => void;
    onDeleteClicked?: () => void;
    onObjectIdChanged: (id:string) => void;
    onObjectDataChanged?: (data:any) => void;
};

export const WFItemControl: FC<WFItemControlProps> =({ itemMetadata, itemIsReadOnly, onEditClicked, onArchiveClicked, onRestoreClicked, onDeleteClicked, onObjectIdChanged, onObjectDataChanged, onSaveClicked, onCancelEditClicked, isLoading = false, saveItem }) => {

    const navigate = useNavigate();

    const [actions, setActions] = useState<WorkflowAction[]>([]);
    const [showNotice, setShowNotice] = useState(true);
    const [currAction, setCurrAction] = useState<WorkflowAction | null>(null);
    const [currActionResult, setCurrActionResult] = useState<WorkflowActionParamResult[]>([]);
    const [showActionDlg, setShowActionDlg] = useState(false);
    const [actionError, setActionError] = useState('');
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        setShowLoader(isLoading);
    }, [ isLoading ]);

    const handleActionDlgClose = () => {
        setShowActionDlg(false);
        return false;
    }

    const [workflowTaskId, setWorkflowTaskId] = useState('');

    useEffect(() => {
        if (itemMetadata.workflow_task_id) {
            if (workflowTaskId != itemMetadata.workflow_task_id) {
                setWorkflowTaskId(itemMetadata.workflow_task_id);
                getWorkflowTask(itemMetadata.workflow_task_id).then((text:string) => {
                    if (text)
                        setActions(JSON.parse(text).entity.actions);
                }).catch(handleHttpError);
            }
        } else {
            setActions([]);
        }
    }, [ itemMetadata.workflow_task_id ]);

    useEffect(() => {
        clearStaticNotices();
        if (itemMetadata.state == 'DRAFT' && itemMetadata.published_id)
            raiseStaticNotice('warning', i18n('У этого черновика есть опубликованная версия') + '<button onclick="window.location.href=\'' + getArtifactUrl(itemMetadata.published_id ?? '', itemMetadata.artifact_type) + '\'">' + i18n('Открыть') + '</button')

        if (itemMetadata.state == 'PUBLISHED' && itemMetadata.draft_id)
            raiseStaticNotice('warning', i18n('Для этой карточки создан черновик') + '<button onclick="window.location.href=\'' + getArtifactUrl(itemMetadata.draft_id ?? '', itemMetadata.artifact_type) + '\'">' + i18n('Открыть') + '</button')
    }, [ itemMetadata.state, itemMetadata.published_id, itemMetadata.draft_id ])

    return <div className={styles.wf_item_control}>

        {showLoader ? (<Loader size={30} />) : (
        <div className={styles.btns}>
        {((itemMetadata.state == 'PUBLISHED' && !itemMetadata.draft_id) || itemMetadata.artifact_type == 'entity_sample' ) && itemIsReadOnly && (
            <>
                <Button background='blue' onClick={onEditClicked}>{i18n('Редактировать')}</Button>
                {onArchiveClicked && (
                    <Button onClick={onArchiveClicked}>{i18n('Архивировать')}</Button>
                )}
                {onDeleteClicked && (
                    <Button onClick={onDeleteClicked}><DelIcon /></Button>
                )}
            </>
        )}
        {!itemIsReadOnly && getDataModified() && (
            <>
                <Button onClick={onSaveClicked}>{i18n('Сохранить')}</Button>
                <Button onClick={onCancelEditClicked}>{i18n('Отменить изменения')}</Button>
            </>
        )}
        {itemMetadata.state == 'ARCHIVED' && itemIsReadOnly && onRestoreClicked && (
            <Button background='blue' onClick={onRestoreClicked}>{i18n('Восстановить из архива')}</Button>
        )}
        {itemMetadata.state == 'DRAFT' && (
            <>
                    {actions.map(action => {
                        return <Button key={'wf-action-' + action.id} background={action.display_name == 'Опубликовать' ? 'blue' : 'outlined-blue'} className={styles.btn_wf_action} onClick={() => {
                            setCurrAction(action);
                            setCurrActionResult(action.params.map(p => { return {id: p.id, param_name: p.name, param_type: p.type, param_value: ''} }));
                            setShowActionDlg(true);
                        }}>{action.display_name}</Button>
                    })}
            </>
        )}
        </div>
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
                    <Button background='blue' onClick={() => {
                        setActionError('');
                        let isError = false;
                        currAction?.params.filter(p => { return p.required; }).forEach(rp => {
                            if (!currActionResult.find(el => { return el.id == rp.id; })?.param_value) {
                                setActionError(i18n('Заполните обязательные поля'));
                                isError = true;
                            }
                        });

                        if (!isError) {
                            setShowLoader(true);
                            var func = async () => { return { metadata: { id: 'some' } }; }
                            if (getDataModified() && saveItem) {
                                func = async () => {
                                    return await saveItem().then((json:any) => {
                                        return json;
                                    })
                                }
                            }

                            func().then(json2 => {
                                if (json2 && json2.metadata.id) {
                                    fetchWithRefresh(`${URL}` + currAction?.post_url, optionsPost(currActionResult)).then(handleHttpResponse).then(json => {
                                        setShowLoader(false);
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
                                }
                            })

                            
                            setShowActionDlg(false);
                        }
                    }}>{currAction?.display_name}</Button>
                    <Button background="outlined-blue" onClick={handleActionDlgClose}>{i18n('Отмена')}</Button>
                </Modal.Footer>
            </Modal>
        )}
    </div>;
};