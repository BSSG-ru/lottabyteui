/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './SettingsGroups.module.scss';
import { getArtifactUrl, handleHttpError, i18n, setDataModified } from '../../utils';
import {
  searchRoles, searchPermissions
} from '../../services/pages/users';
import { FieldArrayEditor } from '../../components/FieldArrayEditor/FieldArrayEditor';
import { getPermission, getRole } from '../../services/pages/roles';
import { GroupData } from '../../types/data';
import useUrlState from '@ahooksjs/use-url-state';
import classNames from 'classnames';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { getGroup, updateGroup } from '../../services/pages/groups';
import { EditPage } from '../../components/EditPage';

export function SettingsGroup() {
  const navigate = useNavigate();

  const [, setLoading] = useState(true);
  const [isLoaded, setLoaded] = useState(false);
  const [state, setState] = useUrlState({ sc: 1 }, { navigateMode: 'replace' });
  const [data, setData] = useState<GroupData>({
    metadata: { id: '', artifact_type: 'external_groups', version_id: '' },
    entity: {
      name: '',
      description: '',
      user_roles: [],
      permissions: []
    }
  });

  const [showValidation, setShowValidation] = useState(true);
  const [groupId, setGroupId] = useState<string>('');
  const [selectedRoleNames, setSelectedRoleNames] = useState<any[]>([]);
  const [selectedPermissionNames, setSelectedPermissionNames] = useState<any[]>([]);

  const { id } = useParams();

  useEffect(() => {
    if (!groupId && id) setGroupId(id);
  }, [id]);

  const loadData = () => {
    if (groupId) {
      getGroup(groupId)
        .then((json: any) => {
          setData(json);
          const el = document.getElementById(`crumb_${groupId}`);
          if (el) el.innerText = json.entity.name;
          setLoading(false);
          setLoaded(true);
        })
        .catch(handleHttpError);
    }
  }

  useEffect(() => {
    //loadData();
  }, [groupId]);

  useEffect(() => {
    setSelectedRoleNames([]);
    data.entity.user_roles.forEach(id => {
      getRole(id).then(json => {
        setSelectedRoleNames(prev => ([...prev, '<a href="' + getArtifactUrl(json.id, 'role') + '">' + json.name + '</a>' ]));
      }).catch(handleHttpError);
    });
  }, [ data.entity.user_roles ]);

  useEffect(() => {
    setSelectedPermissionNames([]);
    data.entity.permissions.forEach(id => {
      getPermission(id).then(json => {
        setSelectedPermissionNames(prev => ([...prev, '<a href="' + getArtifactUrl(json.id, 'permission') + '">' + json.name + '</a>' ]));
      }).catch(handleHttpError);
    });
  }, [ data.entity.permissions ]);

  const updateGroupField = (field: string, value: any) => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    setDataModified(true);
  };

  const getRoleOptions = async (search: string) => 
  searchRoles({ filters: [], filters_for_join: [], global_query: search, limit: 1000, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then(json => {
    return json.items.map((item:any) => { return { value: item.id, label: item.name, name: item.name, id: item.id } });
  });

  const getPermissionOptions = async (search: string) => 
  searchPermissions({ filters: [], filters_for_join: [], global_query: search, limit: 1000, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then(json => {
    return json.items.map((item:any) => { return { value: item.id, label: item.name, name: item.name, id: item.id } });
  });

  const saveData = () => {
    updateGroup(groupId, data.entity).then(json => {
      if (json.metadata && json.metadata.id != groupId)
        navigate(`/settings/groups/edit/${json.metadata.id}`);
    }).catch(handleHttpError);
  }

  return (
    <>

      <EditPage noRecentViews noRating data={data} objectId={groupId} objectVersionId='' urlSlug='settings/groups' setData={setData} isReadOnly={false} setReadOnly={() => {}} artifactType='group' 
        updateObject={updateGroup}
        getObject={getGroup} tabs={[
        {
          key: 'tab-gen',
          title: i18n('Сведения'),
          content: <div className={styles.tab_white}>
            
              <h2>Общая информация</h2>

              <FieldTextEditor
              label={i18n('Название')}
              isReadOnly={false}
              defaultValue={data.entity.name}
              valueSubmitted={(value) => updateGroupField('name', value)}
              isRequired
              showValidation={showValidation}
            />

            <FieldTextEditor
              label={i18n('Описание')}
              defaultValue={data.entity.description}
              valueSubmitted={(val) => {
                updateGroupField('description', val);
              }}
            />

            <FieldArrayEditor 
                key={'ed-ind-' + groupId}
                getOptions={getRoleOptions}
                isReadOnly={false} 
                label={i18n('Роли')} 
                defaultValue={selectedRoleNames} 
                inputPlaceholder={i18n('Выберите роль')} 
                addBtnText={i18n('Добавить')}
                valueSubmitted={()=>{ updateGroupField('user_roles', data.entity.user_roles) }}
                onValueIdAdded={(id:string, name: string) => { 
                  setData((prev) => ({...prev, entity: {...prev.entity, user_roles: [...prev.entity.user_roles, id ]}}));
                }}
                onValueIdRemoved={(id:string) => {
                  let arr = [...data.entity.user_roles];
                  arr.splice(parseInt(id), 1);
                  setData(prev => ({...prev, entity: {...prev.entity, user_roles: arr}}));
                }}
            />

            <FieldArrayEditor 
                key={'ed-isnd-' + groupId}
                getOptions={getPermissionOptions}
                isReadOnly={false} 
                label={i18n('Разрешения')} 
                defaultValue={selectedPermissionNames} 
                inputPlaceholder={i18n('Выберите разрешение')} 
                addBtnText={i18n('Добавить')}
                valueSubmitted={()=>{ updateGroupField('permissions', data.entity.permissions) }}
                onValueIdAdded={(id:string, name: string) => { 
                  setData((prev) => ({...prev, entity: {...prev.entity, permissions: [...prev.entity.permissions, id ]}}));
                }}
                onValueIdRemoved={(id:string) => {
                  let arr = [...data.entity.permissions];
                  arr.splice(parseInt(id), 1);
                  setData(prev => ({...prev, entity: {...prev.entity, permissions: arr}}));
                }}
            />

              
          </div>
        }
      ]} />

    </>
  );
}
