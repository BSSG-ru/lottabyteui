/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './SettingsConnections.module.scss';
import { handleHttpError, i18n } from '../../utils';
import { FieldEditor } from '../../components/FieldEditor';

import {
  createSystemConnection,
  getSystemConnection,
  updateSystemConnection,
} from '../../services/pages/systemConnections';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { getSystems, getSystem } from '../../services/pages/systems';
import { Button } from '../../components/Button';
import { TaskParamsControl } from '../../components/TaskParamsControl/TaskParamsControl';
import { getConnector } from '../../services/pages/connectors';

export function SettingsConnection() {
  const navigate = useNavigate();

  const [, setLoading] = useState(true);
  const [data, setData] = useState({
    entity: {
      name: '',
      system_id: null,
      connector_id: null,
    },
    metadata: { id: null },
  });
  const [isCreateMode, setCreateMode] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [connectionId, setConnectionId] = useState<string>('');
  const [newConnectionData, setNewConnectionData] = useState({});

  const { id } = useParams();

  useEffect(() => {
    if (!connectionId && id) setConnectionId(id);
  }, [id]);

  useEffect(() => {
    setCreateMode(connectionId === '');
    if (connectionId) {
      getSystemConnection(connectionId)
        .then((json: any) => {
          getConnector(json.entity.connector_id)
            .then((json2) => {
              setData({
                ...json,
                entity: { ...json.entity, connector_name: json2.entity.name, id: json.metadata.id },
              });
            })
            .catch(handleHttpError);

          const el = document.getElementById(`crumb_${connectionId}`);
          if (el) el.innerText = json.entity.name;
          setLoading(false);
        })
        .catch(handleHttpError);
    }
  }, [connectionId]);

  useEffect(() => {
    if (isCreateMode) {
      if (data.entity.name && data.entity.system_id && data.entity.connector_id) {
        createSystemConnection({ ...data.entity, enabled: true })
          .then((json) => {
            if (json && json.metadata && json.metadata.id) {
              setConnectionId(json.metadata.id);
              window.history.pushState(
                {},
                '',
                `/settings/connections/edit/${encodeURIComponent(json.metadata.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

  const updateConnectionField = (field: string, value: any) => {
    if (connectionId) {
      const d: any = {};
      d[field] = value;
      updateSystemConnection(connectionId, d)
        .then(() => {})
        .catch(handleHttpError);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    }
  };

  const getSystemObjects = async (search: string) => getSystems({
    sort: 'name+',
    global_query: search,
    limit: 10,
    offset: 0,
    filters: [],
    filters_for_join: [],
  }).then((json) => json.items);

  const getSystemDisplayValue = async (identity: string) => {
    if (!identity) return '';
    return getSystem(identity)
      .then((json) => {
        if (json && json.entity) return json.entity.name;
        return undefined;
      })
      .catch((e) => {
        handleHttpError(e);
        return '';
      });
  };

  return (
    <div className={`${styles.page} ${styles.connectionPage}`}>
      <div className={styles.mainContent}>
        <div className={styles.general_data}>
          <div className={styles.data_row}>
            <FieldEditor
              className=""
              layout="separated"
              labelPrefix={i18n('Название')}
              isMultiline={false}
              isReadOnly={false}
              defaultValue={data.entity.name}
              valueSubmitted={(value) => updateConnectionField('name', value)}
              isRequired
              showValidation={showValidation}
            />
          </div>
          <div className={styles.data_row}>
            <FieldAutocompleteEditor
              className=""
              label={i18n('Система')}
              defaultValue={data.entity.system_id}
              valueSubmitted={(identity) => updateConnectionField('system_id', identity)}
              getDisplayValue={getSystemDisplayValue}
              getObjects={getSystemObjects}
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
                  defaultConnectionData={data.entity}
                  useScheduler={false}
                />
              </tbody>
            </table>

            <div className={styles.buttons}>
              <Button
                className={styles.btn}
                background="orange"
                onClick={() => {
                  if (connectionId) {
                    updateSystemConnection(connectionId, {
                      ...data.entity,
                      ...newConnectionData,
                    }).catch(handleHttpError);
                  } else {
                    createSystemConnection({
                      ...data.entity,
                      ...newConnectionData,
                      enabled: true,
                    })
                      .then((json) => {
                        if (json && json.metadata && json.metadata.id) {
                          setConnectionId(json.metadata.id);
                          window.history.pushState(
                            {},
                            '',
                            `/settings/connections/edit/${encodeURIComponent(json.metadata.id)}`,
                          );
                        }
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
                  navigate('/settings/connections');
                }}
              >
                {i18n('Отмена')}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
