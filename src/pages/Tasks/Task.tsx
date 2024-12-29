/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Tasks.module.scss';
import { getQueryAutocompleteObjects, getQueryDisplayValue, getSystemConnectionAutocompleteObjects, getSystemConnectionDisplayValue, handleHttpError, i18n, setDataModified } from '../../utils';
import { getTask, updateTask, runTask, deleteTask, runTaskSchedule } from '../../services/pages/tasks';
import { Button } from '../../components/Button';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';

import { Loader } from '../../components/Loader';
import { Textarea } from '../../components/Textarea';
import { FieldCheckboxEditor } from '../../components/FieldCheckboxEditor';
import { EditPage } from '../../components/EditPage';
import classNames from 'classnames';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { ReactComponent as Plus } from '../../assets/icons/plus-blue.svg';
import { TaskData } from '../../types/data';
import { FieldDateEditor } from '../../components/FieldDateEditor/FieldDateEditor';
import { Autocomplete2 } from '../../components/Autocomplete2';
import { v4 } from 'uuid';
import { FieldVisualEditor } from '../../components/FieldVisualEditor';

export function Task() {
  const navigate = useNavigate();

  const [, setLoading] = useState(true);
  const [data, setData] = useState<TaskData>({
    entity: {
      name: '',
      description: '',
      short_description: '',
      query_id: null,
      system_connection_id: null,
      is_metadata_task: false,
      metadatabases: [],
      schedules: []
    },
    metadata: { version_id: '0', tags: [], created_by: '', id: '', artifact_type: 'task' }
  });

  const [showValidation, setShowValidation] = useState(false);
  const [taskId, setTaskId] = useState<string>('');
  const [newTaskData, setNewTaskData] = useState<any>({ schedule_params: '' });
  const [isRunResultLoading, setRunResultLoading] = useState(false);
  const [runResult, setRunResult] = useState('');
  const [allowTaskRun, setAllowTaskRun] = useState<boolean>(true);

  const { id } = useParams();

  useEffect(() => {
    if (!taskId && id) setTaskId(id);
    setDataModified(false);
  }, [id]);

  const updateTaskField = (field: string, value: string | boolean | string[] | undefined) => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    setDataModified(true);
  };

  const scheduleTypes = [
    { id: 'ONCE', name: i18n('Однократно') },
    { id: 'DAILY', name: i18n('Ежедневно') },
    { id: 'WEEKLY', name: i18n('Еженедельно') },
    { id: 'MONTHLY', name: i18n('Ежемесячно') },
    { id: 'CRON', name: i18n('CRON') },
  ];

  const getScheduleTypeObjects = async (search: string) => scheduleTypes.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);

  return (
    <EditPage objectId={taskId} objectVersionId={''} data={data} urlSlug='tasks' setData={setData} isReadOnly={false} setReadOnly={() => {}}
      artifactType='task' getObject={getTask} deleteObject={deleteTask}
      updateObject={updateTask} tabs={[
        {
          key: 'tab-gen',
          title: i18n('Сведения'),
          unscrollable: true,
          content: <div className={styles.tab_2col}>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Общая информация</h2>
              

              <FieldTextEditor
                  isReadOnly={false}
                  label={i18n('Название')}
                  defaultValue={data.entity.name}
                  className=''
                  valueSubmitted={(val) => {
                    updateTaskField('name', val);
                  }}
                />

              <FieldAutocompleteEditor
                className=""
                label={i18n('Запрос')}
                defaultValue={data.entity.query_id}
                valueSubmitted={(i) => updateTaskField('query_id', i)}
                getDisplayValue={getQueryDisplayValue}
                getObjects={getQueryAutocompleteObjects}
                isRequired={!data.entity.is_metadata_task}
                showValidation={showValidation}
                artifactType='entity_query'
              />

              <FieldAutocompleteEditor
                className=""
                label={i18n('Подключение')}
                defaultValue={data.entity.system_connection_id}
                valueSubmitted={(i) => updateTaskField('system_connection_id', i)}
                getDisplayValue={getSystemConnectionDisplayValue}
                getObjects={getSystemConnectionAutocompleteObjects}
                isRequired
                showValidation={showValidation}
                artifactType='system_connection'
              />

              <FieldCheckboxEditor isReadOnly={false} label={i18n('Загрузка метаданных')} defaultValue={data.entity.is_metadata_task} className=""
                valueSubmitted={(val) => {
                  updateTaskField('is_metadata_task', val);
                }}
                isRequired={!data.entity.query_id}
                showValidation={showValidation} />

              <FieldTextEditor 
                isReadOnly
                label={i18n('Метаданные')}
                defaultValue={data.entity.metadatabases ? data.entity.metadatabases.map((d:any) => (`<a href="/metadata/db/${d.id}">${d.name}</a>`)).join(', ') : ''}
                valueSubmitted={(val) => { }}
                />

              
            </div>
            <div className={classNames(styles.col, styles.scrollable)}>
              <div className={styles.flex_space_between}>
                <h2>Выполнение</h2>
                {!data.entity.is_metadata_task && (
                  <Button className={styles.btn_check} background='none-blue' onClick={() => {
                    setRunResultLoading(true);
                    runTask(taskId).then(res => {
                      setRunResultLoading(false);
                      setRunResult(res);
                    }).catch(err => { setRunResultLoading(false); handleHttpError(err); })
                  }}>{i18n('Проверить')}</Button>
                )}
              </div>

              <div className={styles.schedules}>
                  {data.entity.schedules.map(sch => <div key={'sch-' + sch.metadata.id} className={styles.schedule_item}>
                    <table>
                      <tbody>
                        <tr>
                          <th>{i18n('Запуск')}<span className={styles.req}>*</span></th>
                          <td>
                            <FieldDateEditor defaultValue={(sch && sch.entity) ? new Date(JSON.parse(sch.entity.schedule_params).datetime) : null}
                              valueSubmitted={(v) => {
                                setData((prev) => ({...prev, entity: {...prev.entity, 
                                  schedules: [...prev.entity.schedules.map( s => s.metadata.id == sch.metadata.id ? { metadata: {...s.metadata}, entity: {...s.entity, schedule_params: JSON.stringify({ datetime: v ? v.toISOString().replace('T', ' ').substring(0, 16) : '' }) } } : {...s} )]}}))
                                setDataModified(true);
                              }} />
                          </td>
                        </tr>
                        <tr>
                          <th>{i18n('Повтор')}</th>
                          <td>
                            
                            <Autocomplete2
                              defaultOptions
                              getOptions={getScheduleTypeObjects}
                              defaultValue={sch.entity.schedule_type}
                              
                              defaultInputValue={scheduleTypes.find(x => x.id == sch.entity.schedule_type)?.name ?? ''}
                              onChanged={(data: any) => {
                                setData((prev) => ({...prev, entity: {...prev.entity, 
                                  schedules: [...prev.entity.schedules.map( s => s.metadata.id == sch.metadata.id ? { metadata: {...s.metadata}, entity: {...s.entity, schedule_type: data.id } } : {...s} )]}}))
                                setDataModified(true);
                              }}
                            />
                            
                          </td>
                        </tr>
                        <tr>
                          <td colSpan={2}>
                            <FieldCheckboxEditor label={i18n('Включено')} defaultValue={sch.entity.enabled} valueSubmitted={(v) => {
                              setData((prev) => ({...prev, entity: {...prev.entity, 
                                schedules: [...prev.entity.schedules.map( s => s.metadata.id == sch.metadata.id ? { metadata: {...s.metadata}, entity: {...s.entity, enabled: v } } : {...s} )]}}))
                              setDataModified(true);
                            }} />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                    <div className={styles.btns}>
                      {allowTaskRun && (
                        <Button background='none-blue' className={styles.btn_run} onClick={() => { setAllowTaskRun(false); runTaskSchedule(sch.metadata.id); }}>Выполнить задачу</Button>
                      )}
                      <Button background='none-blue' onClick={() => {
                        setData((prev) => ({...prev, entity: {...prev.entity, schedules: [...prev.entity.schedules.filter(s => s.metadata.id != sch.metadata.id)]}}));
                        setDataModified(true);
                      }}>Удалить</Button>
                    </div>
                  </div>)}
              </div>
              
              <Button className={styles.btn_add_schedule} background='none-blue' onClick={() => { 
                setData((prev:any) => ({...prev, entity: {...prev.entity, schedules: [...prev.entity.schedules, { metadata: {id: v4()}, entity: {task_id: taskId, schedule_type: 'ONCE', schedule_params: JSON.stringify({ datetime: new Date().toISOString().replace('T', ' ').substring(0, 16) }), enabled: true}} ]}})) 
                setDataModified(true);
              }}><Plus/> Добавить</Button>

              <div className={styles.run_result}>
                {isRunResultLoading ? (<Loader className={styles.loader} />) : (runResult && (<Textarea value={runResult} />))}
              </div>
            </div>
          </div>
        },
        {
          key: 'tab-desc',
          title: i18n('Расширенное описание'),
          content: <div className={styles.tab_transparent}>
            {data.entity.description && (
            <FieldVisualEditor
                defaultValue={data.entity.description}
                className=''
                valueSubmitted={(val) => {
                  updateTaskField('description', val.toString());
                }}
              />  
            )}
          
          </div>
        }
      ]} />
  );
}
