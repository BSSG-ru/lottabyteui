/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { Router, useNavigate, useParams, useRoutes } from 'react-router-dom';
import useUrlState from '@ahooksjs/use-url-state';
import classNames from 'classnames';
import styles from './SettingsWorkflow.module.scss';
import { getArtifactActionAutocompleteObjects, getArtifactActionDisplayValue, getArtifactTypeAutocompleteObjects, getArtifactTypeDisplayValue, getPDAutocompleteObjects, getPDDisplayValue, handleHttpError, i18n, setDataModified, updateArtifactsCount, uuid } from '../../utils';
import { getWorkflowSettings, updateWorkflowSettings } from '../../services/pages/workflow';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { EditPage } from '../../components/EditPage';
import { userInfoRequest } from '../../services/auth';

export function SettingsWorkflowEdit() {
  const navigate = useNavigate();

  const [, setLoading] = useState(true);
  const [isLoaded, setLoaded] = useState(false);
  const [state, setState] = useUrlState({ sc: 1 }, { navigateMode: 'replace' });

  const [data, setData] = useState({
    entity: { artifact_type: '', artifact_action: '', process_definition_key: '', description: '' },
    metadata: { id: '', state: '' }
  });

  const [showValidation, setShowValidation] = useState(false);
  //const [isReadOnly, setReadOnly] = useState(false);

  const { id } = useParams();
  const [settingsId, setSettingsId] = useState<string>(id ?? '');

  useEffect(() => {
    if (id) { setSettingsId(id); }
    setDataModified(true);
  }, [id]);

  useEffect(() => {
    userInfoRequest().then(resp => {
      resp.json().then(data => {
        if (data.permissions.filter((x:String) => x == 'settings_r').length > 0)
          setLoaded(true);
      });
    }).catch(handleHttpError);
  }, []);

  const updateSettingsField = (field: string, value: string | string[] | undefined) => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    setDataModified(true);
  };

  return (
    <>

      {isLoaded && (<EditPage noRecentViews noRating data={data} objectId={settingsId} objectVersionId='' urlSlug='settings/workflows' setData={setData} isReadOnly={false} setReadOnly={() => {}} artifactType='workflow_settings' 
        updateObject={async (id, data) => { return await updateWorkflowSettings(id, {...data}).then(json => ({ entity: {...json}, metadata: { id: json.id, state: 'PUBLISHED' }})) }}
        getObject={async (id) => { return await getWorkflowSettings(id).then(json => ({ entity: {...json, name: json.artifact_type + ' ' + json.artifact_action}, metadata: { id: json.id, state: 'PUBLISHED' }})) }} tabs={[
        {
          key: 'tab-gen',
          title: i18n('Сведения'),
          content: <div className={styles.tab_white}>
            
              <h2>Общая информация</h2>

              <FieldAutocompleteEditor
                label={i18n('Тип объекта')}
                defaultValue={data.entity.artifact_type}
                valueSubmitted={(identity) => updateSettingsField('artifact_type', identity)}
                getDisplayValue={getArtifactTypeDisplayValue}
                getObjects={getArtifactTypeAutocompleteObjects}
                isRequired
                showValidation={showValidation}
              />

              <FieldAutocompleteEditor
                label={i18n('Событие')}
                defaultValue={data.entity.artifact_action}
                valueSubmitted={(identity) => updateSettingsField('artifact_action', identity)}
                getDisplayValue={getArtifactActionDisplayValue}
                getObjects={getArtifactActionAutocompleteObjects}
                isRequired
                showValidation={showValidation}
              />

              <FieldAutocompleteEditor
                label={i18n('Process Definition')}
                defaultValue={data.entity.process_definition_key}
                valueSubmitted={(identity) => updateSettingsField('process_definition_key', identity)}
                getDisplayValue={getPDDisplayValue}
                getObjects={getPDAutocompleteObjects}
                showValidation={showValidation}
              />

              <FieldTextEditor
                label={i18n('Описание события')}
                defaultValue={data.entity.description}
                valueSubmitted={(val) => {
                    updateSettingsField('description', val);
                }}
                isRequired
              />

              
          </div>
        }
      ]} />)}


    </>
  );
}
