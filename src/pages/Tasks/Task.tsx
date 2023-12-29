/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Tasks.module.scss';
import { doNavigate, getQueryAutocompleteObjects, getQueryDisplayValue, handleHttpError, i18n, setBreadcrumbEntityName, setDataModified } from '../../utils';
import { getTask, updateTask, createTask, runTask } from '../../services/pages/tasks';
import { FieldEditor } from '../../components/FieldEditor';
import { Button } from '../../components/Button';
import { getConnector } from '../../services/pages/connectors';
import {
  createSystemConnection,
  getSystemConnection,
  updateSystemConnection,
} from '../../services/pages/systemConnections';
import { getEntityQuery } from '../../services/pages/entityQueries';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { setRecentView } from '../../services/pages/recentviews';

import { TaskParamsControl } from '../../components/TaskParamsControl/TaskParamsControl';
import { Loader } from '../../components/Loader';
import { Textarea } from '../../components/Textarea';
import { FieldCheckboxEditor } from '../../components/FieldCheckboxEditor';

export function Task() {
  const navigate = useNavigate();

  const [, setLoading] = useState(true);
  const [data, setData] = useState({
    entity: {
      name: null,
      description: '',
      query_id: null,
      system_connection_id: null,
      enabled: false
    },
    metadata: { version_id: 0, tags: [] },
  });

  const [showValidation, setShowValidation] = useState(false);
  const [taskId, setTaskId] = useState<string>('');
  const [newTaskData, setNewTaskData] = useState<any>({ schedule_params: '' });
  const [connectionData, setConnectionData] = useState<any>({ name: '' });
  const [newConnectionData, setNewConnectionData] = useState<any>({ name: '' });
  const [isRunResultLoading, setRunResultLoading] = useState(false);
  const [runResult, setRunResult] = useState('');

  const { id } = useParams();

  useEffect(() => {
    if (!taskId && id) setTaskId(id);
    setDataModified(false);
  }, [id]);

  useEffect(() => {
    if (taskId) {
      setRecentView('task', taskId);
      getTask(taskId)
        .then((json) => {
          setData(json);
          setDataModified(false);
          getSystemConnection(json.entity.system_connection_id).then((json1) => {
            setConnectionData((prev: any) => ({
              ...prev,
              connector_id: json1.entity.connector_id,
              system_id: json1.entity.system_id,
              name: json1.entity.name
            }));
            getConnector(json1.entity.connector_id)
              .then((json2) => {
                setConnectionData((prev: any) => ({ ...prev, connector_name: json2.entity.name }));
              })
              .catch(handleHttpError);
          });
          
          setBreadcrumbEntityName(taskId, json.entity.name);

          setLoading(false);
        })
        .catch(handleHttpError);
    }
  }, [taskId]);

  const updateTaskField = (field: string, value: string | boolean) => {
    if (taskId) {
      const d: any = {};
      d[field] = value;
      updateTask(taskId, d)
        .then(() => { setDataModified(false); })
        .catch(handleHttpError);
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
      setDataModified(false);
    }
  };

  return (
    <div className={`${styles.page} ${styles.taskPage}`}>
      <div className={styles.mainContent}>
        <div className={styles.title}>{`${i18n('ЗАДАЧА')}`}</div>
        <button className={styles.btn_scheme} onClick={() => { doNavigate('/tasks-model', navigate); }}>{i18n('Схема')}</button>
        <div className={styles.general_data}>
          <div className={styles.data_row}>
            <FieldEditor
              isReadOnly={false}
              labelPrefix={i18n('Название')}
              defaultValue={data.entity.name}
              className=""
              layout="separated"
              valueSubmitted={(val) => {
                updateTaskField('name', val.toString());
              }}
              isRequired
              showValidation={showValidation}
            />
          </div>
          <div className={styles.data_row}>
            <FieldAutocompleteEditor
              className=""
              label={i18n('Запрос')}
              defaultValue={data.entity.query_id}
              valueSubmitted={(i) => updateTaskField('query_id', i)}
              getDisplayValue={getQueryDisplayValue}
              getObjects={getQueryAutocompleteObjects}
              isRequired
              showValidation={showValidation}
              artifactType='entity_query'
            />
          </div>
          
          <div className={styles.data_row}>
            <FieldCheckboxEditor
              isReadOnly={false}
              labelPrefix={i18n('Включена')}
              defaultValue={data.entity.enabled}
              className=""
              layout="separated"
              valueSubmitted={(val) => {
                updateTaskField('enabled', val);
              }}
              isRequired
              showValidation={showValidation}
            />
          </div>
        </div>

        <div className={styles.general_data}>
          <div className={styles.data_row}>
            <table className={styles.task_params}>
              <tbody>
                <TaskParamsControl
                  onChangedConnection={(connData) => {
                    setNewConnectionData(connData);
                  }}
                  onChangedTask={(taskData) => {
                    
                    setNewTaskData((prev: any) => ({ ...prev, ...taskData }));
                    
                  }}
                  defaultConnectionData={connectionData}
                  defaultTaskData={data.entity}
                  useScheduler
                />
              </tbody>
            </table>

            <div className={styles.buttons}>
              <Button
                className={styles.btn}
                background="orange"
                onClick={() => {
                  if (taskId) {
                    if (data.entity.system_connection_id) {
                      updateSystemConnection(data.entity.system_connection_id, newConnectionData);
                      
                      updateTask(taskId, newTaskData).then(() => { setDataModified(false); }).catch(handleHttpError);
                    } else {
                      getEntityQuery(newTaskData.query_id)
                        .then((qjson) => {
                          const scData = {
                            ...newConnectionData,
                            system_id: qjson.entity.system_id,
                          };
                          createSystemConnection(scData)
                            .then((sjson) => {
                              const tData = {
                                ...newTaskData,
                                system_connection_id: sjson.metadata.id,
                              };
                              updateTask(taskId, tData).then(() => { setDataModified(false); }).catch(handleHttpError);
                            })
                            .catch(handleHttpError);
                        })
                        .catch(handleHttpError);
                    }
                  } else {
                    getEntityQuery(newTaskData.query_id)
                      .then((qjson) => {
                        const scData = {
                          ...newConnectionData,
                          system_id: qjson.entity.system_id,
                        };
                        createSystemConnection({ ...scData, enabled: true })
                          .then((sjson) => {
                            if (sjson.metadata && sjson.metadata.id) {
                              const tData = {
                                ...data.entity,
                                ...newTaskData,
                                system_connection_id: sjson.metadata.id,
                                enabled: true,
                              };
                              createTask(tData)
                                .then((json) => {
                                  setDataModified(false);
                                  if (json.metadata && json.metadata.id) {
                                    navigate(`/tasks/edit/${encodeURIComponent(json.metadata.id)}`);
                                  }
                                })
                                .catch(handleHttpError);
                            }
                          })
                          .catch(handleHttpError);
                      })
                      .catch(handleHttpError);
                  }
                }}
              >
                {i18n('Сохранить')}
              </Button>
              <Button
                className={styles.btn}
                background="outlined-orange"
                onClick={() => {
                  navigate('/tasks');
                }}
              >
                {i18n('Отмена')}
              </Button>
              <div className={styles.spacer}></div>
              <Button className={styles.btn_check} background='none' onClick={() => {
                setRunResultLoading(true);
                runTask(taskId).then(res => {
                  setRunResultLoading(false);
                  setRunResult(res);
                }).catch(err => { setRunResultLoading(false); handleHttpError(err); })
              }}>{i18n('Проверка выполнения')}</Button>
            </div>
            <div className={styles.run_result}>
              {isRunResultLoading ? (<Loader className={styles.loader} />) : (runResult && (<Textarea value={runResult} />))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
