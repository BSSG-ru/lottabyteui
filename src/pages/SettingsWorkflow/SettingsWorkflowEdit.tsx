/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { Router, useNavigate, useParams, useRoutes } from 'react-router-dom';
import useUrlState from '@ahooksjs/use-url-state';
import classNames from 'classnames';
import styles from './SettingsWorkflow.module.scss';
import { doNavigate, handleHttpError, i18n, setDataModified, updateArtifactsCount, uuid } from '../../utils';
import { FieldEditor } from '../../components/FieldEditor';
import { createWorkflowSettings, getProcessDefinitions, getWorkflowSettings, getWorkflowTask, updateWorkflowSettings } from '../../services/pages/workflow';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { getArtifactActions, getArtifactType, getArtifactTypes, getWorkflowableArtifactTypes } from '../../services/pages/artifacts';

export function SettingsWorkflowEdit() {
  const [state, setState] = useUrlState({
    t: '1', p1: '1' 
  }, { navigateMode: 'replace' });
  const [, setLoading] = useState(true);

  const navigate = useNavigate();

  const [data, setData] = useState({
    artifact_type: '', artifact_action: '', process_definition_key: '', description: ''
  });
  const [isCreateMode, setCreateMode] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const [isReadOnly, setReadOnly] = useState(false);
  const [isLoaded, setLoaded] = useState(false);

  const { id } = useParams();
  const [settingsId, setSettingsId] = useState<string>(id ?? '');

  useEffect(() => {
    if (id) { setSettingsId(id); }
    setDataModified(true);
  }, [id]);

  useEffect(() => {
    setCreateMode(settingsId === '');
    if (settingsId) {

      const handleData = (json: any) => {
        setData(json);
        setDataModified(false);
        if (document.getElementById(`crumb_${settingsId}`) !== null) {
          document.getElementById(`crumb_${settingsId}`)!.innerText = json.artifact_type;
        }
        setLoading(false); setLoaded(true);
      };

      
        getWorkflowSettings(settingsId)
          .then(handleData)
          .catch(handleHttpError);
      

    } else {
      setReadOnly(false);
      setLoaded(true);
    }
  }, [settingsId]);

  useEffect(() => {
    if (isCreateMode) {
      if (data.artifact_type && data.artifact_action) {
        createWorkflowSettings({
          artifact_type: data.artifact_type,
          artifact_action: data.artifact_action,
          process_definition_key: data.process_definition_key,
          description: data.description,
        })
          .then((json) => {
            setDataModified(false);
            if (json.id) {
              setSettingsId(json.id);
              window.history.pushState(
                {},
                '',
                `/settings/workflows/edit/${encodeURIComponent(json.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

  const updateSettingsField = (field: string, value: string | string[]) => {
    if (settingsId) {
      const d: any = {};
      d[field] = value;
      updateWorkflowSettings(settingsId, d)
        .then((json) => {
          if (json.id && json.id != settingsId) {
            navigate(`/settings/workflows/edit/${encodeURIComponent(json.id)}`);
          }
          setDataModified(false);
        })
        .catch(handleHttpError);
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, [field]: value }));
      setDataModified(true);
    }
  };

  const getArtifactTypeObj = async (search: string) => getWorkflowableArtifactTypes().then((json) => {
    const res = [];
    for (var k in json) {
      res.push({ id: k, name: json[k] });
    }
    
    return res.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
  });

  const getArtifactActionObj = async (search: string) => getArtifactActions().then((json) => {
    const res = [];
    
    for (let i = 0; i < json.length; i += 1) {
      res.push({ id: json[i], name: json[i] });
    }
    
    return res.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
  });

  const getPDObj = async (search: string) => getProcessDefinitions().then((json) => {
    const res = [];
    for (var k in json)
      res.push({ id: k, name: json[k] });
    return res.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
  });

  const getPDDisplayValue = async (i: string) => {
    if (!i)
      return '';

    return getProcessDefinitions().then((json) => {
      if (json[i])
        return json[i];
      return '';
    }).catch(handleHttpError);
  };

  const getArtifactActionDisplayValue = async (i: string) => {
    return i;
  };

  const getArtifactTypeDisplayValue = async (i: string) => {
    if (!i) return '';

    return getArtifactType(i).then((name: string) => {
      if (name) return name;
      return '';
    }).catch(handleHttpError);
  };

  return (
    <div className={classNames(styles.page, styles.wfsPage, { [styles.loaded]: isLoaded })}>
      <div className={styles.mainContent}>
        <div>
          <FieldAutocompleteEditor
            className={styles.long_input}
            label={i18n('Тип объекта:')}
            isReadOnly={isReadOnly}
            defaultValue={data.artifact_type}
            valueSubmitted={(identity) => updateSettingsField('artifact_type', identity)}
            getDisplayValue={getArtifactTypeDisplayValue}
            getObjects={getArtifactTypeObj}
            isRequired
            showValidation={showValidation}
          />
        </div>
        <div>
          <FieldAutocompleteEditor
              className={styles.long_input}
              label={i18n('Событие:')}
              isReadOnly={isReadOnly}
              defaultValue={data.artifact_action}
              valueSubmitted={(identity) => updateSettingsField('artifact_action', identity)}
              getDisplayValue={getArtifactActionDisplayValue}
              getObjects={getArtifactActionObj}
              isRequired
              showValidation={showValidation}
            />
        </div>
        <div>
          <FieldAutocompleteEditor
              className={styles.long_input}
              label={i18n('Process Definition:')}
              isReadOnly={isReadOnly}
              defaultValue={data.process_definition_key}
              valueSubmitted={(identity) => updateSettingsField('process_definition_key', identity)}
              getDisplayValue={getPDDisplayValue}
              getObjects={getPDObj}
              showValidation={showValidation}
            />
            
        </div>
        <div className={styles.description}>
            <FieldEditor
                isReadOnly={isReadOnly}
                labelPrefix={`${i18n('Описание события: ')} `}
                defaultValue={data.description}
                className={styles.long_input}
                layout='separated'
                valueSubmitted={(val) => {
                    updateSettingsField('description', val.toString());
                }}
                isRequired
                onBlur={(val) => {
                    updateSettingsField('description', val);
                }}
            />
        </div>
      </div>

    </div>
  );
}
