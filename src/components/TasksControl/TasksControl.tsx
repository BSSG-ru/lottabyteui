/* eslint-disable react/no-unused-prop-types */
/* eslint-disable react/require-default-props */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable react/function-component-definition */
import React, {
  FC, useEffect, useRef, useState,
} from 'react';
import { useNavigate } from 'react-router';
import { i18n, uuid, handleHttpError } from '../../utils';
import styles from './TasksControl.module.scss';
import { ReactComponent as OrangePencilIcon } from '../../assets/icons/pencil_org.svg';
import { ReactComponent as PlusInCircle } from '../../assets/icons/plus-blue.svg';
import { Button } from '../Button';
import { Tag } from '../Tag';
import {
  createTask, deleteTask, getTasks, getTasksByQueryId,
} from '../../services/pages/tasks';
import { Autocomplete } from '../Autocomplete';
import { getSystems } from '../../services/pages/systems';
import {
  createSystemConnection,
  getSystemConnections,
} from '../../services/pages/systemConnections';
import { getEntityQuery } from '../../services/pages/entityQueries';
import { TaskScheduleEditor } from '../TaskScheduleEditor/TaskScheduleEditor';
import { TaskParamsControl } from '../TaskParamsControl/TaskParamsControl';
import { FieldTextEditor } from '../FieldTextEditor';

export type TasksControlProps = {
  className?: string;
  isReadOnly?: boolean;
  queryId?: string;
};

export const TasksControl: FC<TasksControlProps> = ({ className, isReadOnly, queryId }) => {
  const initialNewTaskData = {
    system_connection_id: null,
    schedule_type: '',
    schedule_params: '',
  };

  const navigate = useNavigate();

  const tasksWrapperRef = useRef<HTMLDivElement>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [hideMode, setHideMode] = useState(true);
  const [hidden, setHidden] = useState(0);
  const [showAddTaskDlg, setShowAddTaskDlg] = useState(false);
  const [showCreateTaskDlg, setShowCreateTaskDlg] = useState(false);
  const [newTaskData, setNewTaskData] = useState<any>(initialNewTaskData);
  const [newConnectionData, setNewConnectionData] = useState<any>({ name: '' });
  const [defaultConnectionObjects, setDefaultConnectionObjects] = useState<any[]>([]);

  const [query, setQuery] = useState<any>(null);

  const loadTasks = () => {
    if (queryId) {
      getTasksByQueryId(queryId)
        .then((json) => {
          setTasks(json.resources);
        })
        .catch(handleHttpError);
    } else {
      getTasks()
        .then((json) => {
          setTasks(json.resources);
        })
        .catch(handleHttpError);
    }
  };

  useEffect(() => {
    if (queryId) {
      getEntityQuery(queryId)
        .then((json) => {
          setQuery(json);
        })
        .catch(handleHttpError);
    }

    loadTasks();
  }, [queryId]);

  useEffect(() => {
    if (query != null) {
      setNewConnectionData((prev: any) => ({ ...prev, system_id: query.entity.system_id }));
    }
  }, [query]);

  useEffect(() => {
    setTimeout(() => {
      let hiddenItem = 0;
      if (tasksWrapperRef && tasksWrapperRef.current) {
        Array.from(tasksWrapperRef.current.children).forEach((child: Element) => {
          if ((child as HTMLElement).style.display === 'none') {
            hiddenItem += 1;
          }
        });
      }
      if (hiddenItem) {
        setHidden(hiddenItem);
      }
    }, 300);
  }, [tasks]);



  const onTaskDeleted = (taskId: string) => {
    
      deleteTask(taskId).then(() => { loadTasks(); }).catch(handleHttpError);
    
    
  };

  const getSystemObjects = async (search: string) => getSystems({
    sort: 'name+',
    global_query: search,
    limit: 1000,
    offset: 0,
    filters: [],
    filters_for_join: [],
  }).then((json) => json.items);

  useEffect(() => {
    const filters = query != null
      ? [{ column: 'system_id', value: query.entity.system_id, operator: 'EQUAL' }]
      : [];

    getSystemConnections({
      sort: 'name+',
      global_query: '',
      limit: 30,
      offset: 0,
      filters,
      filters_for_join: [],
    }).then((json) => {
      setDefaultConnectionObjects(json.items);
    });
  }, [query]);

  const getConnectionObjects = async (search: string) => {
    const filters = query != null
      ? [{ column: 'system_id', value: query.entity.system_id, operator: 'EQUAL' }]
      : [];

    return getSystemConnections({
      sort: 'name+',
      global_query: search,
      limit: 30,
      offset: 0,
      filters,
      filters_for_join: [],
    }).then((json) => json.items);
  };

  const createTaskForQueryId = (qId?: string) => {
    createSystemConnection({
      name: newConnectionData.name,
      system_id: newConnectionData.system_id,
      connector_id: newConnectionData.connector_id,
      enabled: true,
      connector_param: newConnectionData.connector_param,
    })
      .then((json) => {
        if (!json || !json.metadata) return;
        createTask({
          system_connection_id: json.metadata.id,
          query_id: qId,
          name: `${query == null ? '-' : query.entity.name} ${json.entity.name} ${newTaskData.schedule_params}`,
          schedules: [{ entity: { enabled: true, schedule_type: newTaskData.schedule_type, schedule_params: newTaskData.schedule_params } }]
        })
          .then((jsonInner) => {
            if (jsonInner) {
              loadTasks();
              setShowCreateTaskDlg(false);

              if (qId && qId != queryId)
                navigate('/queries/edit/' + encodeURIComponent(qId));
            }
          })
          .catch(handleHttpError);
      })
      .catch(handleHttpError);
  };

  const createTaskForQuery = () => {
    
      createTaskForQueryId(queryId);
    
  };

  const addTaskForQueryId = (qId?: string) => {
    createTask({
      system_connection_id: newTaskData.system_connection_id,
      query_id: qId,
      name: `${query == null ? '-' : query.entity.name} ${newTaskData.system_connection_name} ${newTaskData.schedule_params}`,
      schedules: [{ entity: { enabled: true, schedule_type: newTaskData.schedule_type, schedule_params: newTaskData.schedule_params } }]
    })
      .then((json) => {
        if (json) {
          loadTasks();
          setShowAddTaskDlg(false);

          if (qId && qId != queryId)
            navigate('/queries/edit/' + encodeURIComponent(qId));
        }
      })
      .catch(handleHttpError);
  };

  const addTaskForQuery = () => {
    
      addTaskForQueryId(queryId);
  };

  return (
    <div
      className={`${styles.tasks_control} ${className || ''}${showAddTaskDlg ? ` ${styles.show_add_task}` : ''
        }${showCreateTaskDlg ? ` ${styles.show_create_task}` : ''}`}
    >
      {!isReadOnly && (
        <div className={styles.buttons}>
          <Button
            className={styles.btn}
            background="outlined-blue"
            onClick={() => {
              setShowAddTaskDlg(!showAddTaskDlg);
              setShowCreateTaskDlg(false);
            }}
          >
            <PlusInCircle />
            {i18n('Добавить')}
          </Button>
          <Button
            className={styles.btn}
            background="outlined-blue"
            onClick={() => {
              setShowCreateTaskDlg(!showCreateTaskDlg);
              setShowAddTaskDlg(false);
            }}
          >
            <OrangePencilIcon />
            {i18n('Создать')}
          </Button>
        </div>
      )}
      <div
        className={styles.tasks_wrapper}
        ref={tasksWrapperRef}
      >
        {tasks.map((task: any) => (
          <Tag
            key={uuid()}
            wrapperRef={tasksWrapperRef}
            value={task.entity.name}
            valueId={task.metadata.id}
            hideMode={hideMode}
            onDeleteId={onTaskDeleted}
            onClick={() => { navigate(`/tasks/edit/${encodeURIComponent(task.metadata.id)}`); }}
          />
        ))}
        {hideMode && hidden ? (
          <Tag
            moreTag
            value={`+${hidden}`}
            onClick={() => setHideMode(false)}
            disableDelete
          />
        ) : (
          ''
        )}
      </div>

      <div className={styles.add_task_dlg}>
        <div className={styles.fields}>
            <div>
              <div className={styles.label}>{i18n('Подключение')}</div>
              <Autocomplete
                defaultOptions={defaultConnectionObjects}
                defaultValue={newTaskData.system_connection_name}
                getOptions={getConnectionObjects}
                onChanged={(data: any) => {
                  setNewTaskData((prev: any) => ({
                    ...prev,
                    system_connection_id: data.id,
                    system_connection_name: data.name ?? data.description,
                  }));
                }}
              />
            </div>
            <TaskScheduleEditor
              onChanged={(value) => {
                setNewTaskData((prev: any) => ({
                  ...prev,
                  schedule_type: value.schedule_type,
                  schedule_params: value.schedule_params,
                }));
              }}
            />
        </div>
        <div className={styles.buttons}>
          <Button
            className={styles.btn}
            background="blue"
            onClick={() => {
              addTaskForQuery();
            }}
          >
            {i18n('Сохранить')}
          </Button>
          <Button
            className={styles.btn}
            background="outlined-blue"
            onClick={() => {
              setShowAddTaskDlg(false);
            }}
          >
            {i18n('Отмена')}
          </Button>
        </div>
      </div>
      <div className={styles.create_task_dlg}>
          <div className={styles.fields}>
            <div>
              <FieldTextEditor label={i18n('Название')} defaultValue={newConnectionData.name} valueSubmitted={(v) => { setNewConnectionData((prev: any) => ({ ...prev, name: v })); }} />
            </div>
            {query == null ? (
              <div>
                <div className={styles.label}>{i18n('Система')}</div>
                <Autocomplete
                  defaultOptions
                  getOptions={getSystemObjects}
                  onChanged={(data: any) => {
                    setNewConnectionData((prev: any) => ({
                      ...prev,
                      system_id: data.id,
                      system_name: data.name,
                      connector_id: data.connector_id,
                    }));
                  }}
                />
              </div>
            ) : (
              ''
            )}
            <TaskParamsControl
              onChangedConnection={(connData) => {
                setNewConnectionData((prev: any) => ({
                  ...prev,
                  connector_id: connData.connector_id,
                  connector_name: connData.connector_name,
                  connector_param: connData.connector_param,
                }));
              }}
              onChangedTask={(taskData) => {
                setNewTaskData((prev: any) => ({
                  ...prev,
                  schedule_type: taskData.schedule_type,
                  schedule_params: taskData.schedule_params,
                }));
              }}
              useScheduler
            />
          </div>
          
        <div className={styles.separator} />

        <div className={styles.buttons}>
          <Button
            className={styles.btn}
            background="blue"
            onClick={() => {
              createTaskForQuery();
            }}
          >
            {i18n('Сохранить')}
          </Button>
          <Button
            className={styles.btn}
            background="outlined-blue"
            onClick={() => {
              setShowCreateTaskDlg(false);
            }}
          >
            {i18n('Отмена')}
          </Button>
        </div>
      </div>
    </div>
  );
};
