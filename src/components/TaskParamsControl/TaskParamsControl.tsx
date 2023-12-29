/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable react/function-component-definition */
/* eslint-disable react/require-default-props */
import React, { FC, useEffect, useState } from 'react';
import { getConnectorConnectionParams, getConnectors } from '../../services/pages/connectors';
import { getSystemConnectionParams } from '../../services/pages/systemConnections';
import { i18n, handleHttpError, setDataModified } from '../../utils';
import { Autocomplete } from '../Autocomplete';
import { Checkbox } from '../Checkbox';
import { Input } from '../Input';
import { TaskScheduleEditor } from '../TaskScheduleEditor';
import styles from './TaskParamsControl.module.scss';

export type TaskParamsControlProps = {
  className?: string;
  defaultConnectionData?: any;
  defaultTaskData?: any;
  onChangedConnection: (data: any) => void;
  onChangedTask?: (data: any) => void;
  useScheduler: boolean;
};

export const TaskParamsControl: FC<TaskParamsControlProps> = ({
  className,
  defaultConnectionData,
  defaultTaskData,
  onChangedConnection,
  onChangedTask,
  useScheduler,
}) => {
  const [connectionParams, setConnectionParams] = useState<any[]>([]);
  const [connectionParamValues, setConnectionParamValues] = useState<any>({});
  const [connectionData, setConnectionData] = useState<any>({});
  const [storedTaskData, setStoredTaskData] = useState<any>({});
  const [taskData, setTaskData] = useState<any>({});

  useEffect(() => {
    if (defaultConnectionData) setConnectionData(defaultConnectionData);
  }, [defaultConnectionData]);

  useEffect(() => {
    if (defaultTaskData) {
      setStoredTaskData(defaultTaskData);
      setTaskData(defaultTaskData);
    }
  }, [defaultTaskData]);

  const getConnectorObjects = async (search: string) => getConnectors().then((json) => json.resources.map((item: any) => ({
    id: item.metadata.id,
    name: item.entity.name,
  })));

  useEffect(() => {
    onChangedConnection(connectionData);
  }, [connectionData]);

  useEffect(() => {
    if (useScheduler && onChangedTask) onChangedTask(taskData);
  }, [taskData]);

  useEffect(() => {
    if (connectionData.connector_id) {
      getConnectorConnectionParams(connectionData.connector_id)
        .then((json) => {
          setConnectionParams(json.resources);
        })
        .catch(handleHttpError);
    } else {
      setConnectionParams([]);
    }
  }, [connectionData.connector_id]);

  const getConnectionId = () => {
    let connectionId = null;
    if (taskData && taskData.system_connection_id) connectionId = taskData.system_connection_id;
    else if (connectionData && connectionData.id) connectionId = connectionData.id;
    return connectionId;
  };

  useEffect(() => {
    const params: any = {};
    connectionParams.forEach((p: any) => {
      params[p.metadata.id] = null;
    });

    const connectionId = getConnectionId();

    if (connectionId) {
      getSystemConnectionParams(connectionId).then((json) => {
        json.resources.forEach((x: any) => {
          params[x.entity.connector_param_id] = x.entity.param_value ?? null;
        });
        setConnectionParamValues(params);
      });
    } else setConnectionParamValues(params);
  }, [connectionParams]);

  useEffect(() => {
    setConnectionData((prev: any) => ({
      ...prev,
      connector_param: Object.keys(connectionParamValues).map((k: any) => ({
        connector_param_id: k,
        system_connection_id: getConnectionId(),
        param_value: connectionParamValues[k],
      })),
    }));
  }, [connectionParamValues]);

  const getConnParamValue = (param_id: string) => {
    if (connectionParamValues[param_id]) return connectionParamValues[param_id];
    return '';
  };

  const setConnParamValue = (param_id: string, value: any) => {
    setConnectionParamValues((prev: any) => ({ ...prev, [param_id]: value }));
  };

  useEffect(() => {}, [connectionData.connector_id]);

  return (
    <>
      <tr>
        <th>{i18n('Тип подключения')}</th>
        <td>
          <Autocomplete
            defaultOptions
            getOptions={getConnectorObjects}
            inputValue={connectionData.connector_name}
            onChanged={(data: any) => {
              setDataModified(true);
              setConnectionData((prev: any) => ({
                ...prev,
                connector_id: data.id,
                connector_name: data.name,
              }));
            }}
          />
        </td>
      </tr>
      {useScheduler && (
        <TaskScheduleEditor
          onChanged={(value) => {
            
            setTaskData((prev: any) => ({
              ...prev,
              schedule_type: value.schedule_type,
              schedule_params: value.schedule_params,
            }));
          }}
          defaultScheduleType={storedTaskData ? storedTaskData.schedule_type : ''}
          defaultScheduleParams={storedTaskData ? storedTaskData.schedule_params : ''}
        />
      )}
      <tr className={styles.tr_conn_params}>
        <td colSpan={2}>
          <table className={styles.params}>
            <tbody>
              {connectionParams.map((param: any) => (
                <tr key={`tr_cp_${param.metadata.id}`}>
                  <th>{param.entity.display_name}</th>
                  <td>
                    {param.entity.param_type === 'TEXT' && (
                      <Input
                        value={getConnParamValue(param.metadata.id)}
                        onChange={(e) => {
                          setConnParamValue(param.metadata.id, e.target.value);
                          setDataModified(true);
                        }}
                      />
                    )}
                    {param.entity.param_type === 'PASSWORD' && (
                      <Input
                        type="password"
                        value={getConnParamValue(param.metadata.id)}
                        onChange={(e) => {
                          setConnParamValue(param.metadata.id, e.target.value);
                          setDataModified(true);
                        }}
                      />
                    )}
                    {param.entity.param_type === 'INTEGER' && (
                      <Input
                        type="number"
                        value={getConnParamValue(param.metadata.id)}
                        onChange={(e) => {
                          setConnParamValue(param.metadata.id, e.target.value);
                          setDataModified(true);
                        }}
                      />
                    )}
                    {param.entity.param_type === 'BOOLEAN' && (
                      <Checkbox
                        id={`cb_p_${param.metadata.id}`}
                        checked={getConnParamValue(param.metadata.id)}
                        onChange={(e) => {
                          setConnParamValue(param.metadata.id, e.target.checked);
                          setDataModified(true);
                        }}
                      />
                    )}
                    {param.entity.param_type === 'ENUM' && (
                      <Autocomplete
                        defaultOptions={param.entity.enum_values.map((x: any) => ({
                          id: x,
                          name: x,
                        }))}
                        inputValue={getConnParamValue(param.metadata.id)}
                        getOptions={async (s) => param.entity.enum_values
                          .map((x: any) => ({ id: x, name: x }))
                          .filter((d: any) => d.id.toLowerCase().indexOf(s) !== -1)}
                        defaultValue={getConnParamValue(param.metadata.id)}
                        onChanged={(data: any) => {
                          setConnParamValue(param.metadata.id, data.id);
                          setDataModified(true);
                        }}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </td>
      </tr>
    </>
  );
};
