/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './SettingsConnections.module.scss';
import { getSystemAutocompleteObjects, getSystemDisplayValue, handleHttpError, i18n, setDataModified } from '../../utils';
import {
  createSystemConnection,
  getSystemConnection,
  updateSystemConnection,
} from '../../services/pages/systemConnections';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { TaskParamsControl } from '../../components/TaskParamsControl/TaskParamsControl';
import { getConnector } from '../../services/pages/connectors';
import useUrlState from '@ahooksjs/use-url-state';
import classNames from 'classnames';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { EditPage } from '../../components/EditPage';

export function SettingsConnection() {
  const navigate = useNavigate();

  const [, setLoading] = useState(true);
  const [isLoaded, setLoaded] = useState(false);
  const [state, setState] = useUrlState({ sc: 1 }, { navigateMode: 'replace' });
  const [data, setData] = useState({
    entity: {
      name: '',
      system_id: null,
      connector_id: null,
    },
    metadata: { id: null },
  });
  
  const [showValidation, setShowValidation] = useState(false);
  const [connectionId, setConnectionId] = useState<string>('');
  const [newConnectionData, setNewConnectionData] = useState({});

  const { id } = useParams();

  useEffect(() => {
    if (!connectionId && id) setConnectionId(id);
  }, [id]);

  const loadData = () => {
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
          setLoaded(true);
        })
        .catch(handleHttpError);
    }
  }

  useEffect(() => {
    loadData();
  }, [connectionId]);

  const updateConnectionField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    setDataModified(true);
  };

  const saveData = () => {
    
    /*updateSystemConnection(connectionId, data).then(json => {
      if (json && json.metadata.id && json.metadata.id !== connectionId) {
        navigate(`/settings/connections/edit/${encodeURIComponent(json.metadata.id)}`);
      }
    }).catch(handleHttpError);*/

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
            navigate(`/settings/connections/edit/${encodeURIComponent(json.metadata.id)}`);
          }
        })
        .catch(handleHttpError);
    }
  }

  return (
    <>
      <EditPage noRecentViews noRating data={data} objectId={connectionId} objectVersionId='' urlSlug='settings/connections' setData={setData} isReadOnly={false} setReadOnly={() => {}} artifactType='system_connection' 
        updateObject={updateSystemConnection}
        getObject={getSystemConnection} tabs={[
        {
          key: 'tab-gen',
          title: i18n('Сведения'),
          content: <div className={styles.tab_white}>
            
              <h2>Общая информация</h2>

              <FieldTextEditor
                label={i18n('Название')}
                isReadOnly={false}
                defaultValue={data.entity.name}
                valueSubmitted={(value) => updateConnectionField('name', value)}
                isRequired
                showValidation={showValidation}
              />

              <FieldAutocompleteEditor
                label={i18n('Система')}
                defaultValue={data.entity.system_id}
                valueSubmitted={(identity) => updateConnectionField('system_id', identity)}
                getDisplayValue={getSystemDisplayValue}
                getObjects={getSystemAutocompleteObjects}
                isRequired
                showValidation={showValidation}
              />
            
              <TaskParamsControl
                onChangedConnection={(connData) => {
                  setNewConnectionData(connData);
                }}
                defaultConnectionData={data.entity}
                useScheduler={false}
              />

              
          </div>
        }
      ]} />
      
    </>
  );
}
