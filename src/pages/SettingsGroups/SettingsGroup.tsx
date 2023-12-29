/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './SettingsGroups.module.scss';
import { getArtifactUrl, handleHttpError, i18n } from '../../utils';
import { FieldEditor } from '../../components/FieldEditor';
import {
  getUser, createUser, updateUser, getRoles, searchRoles, getPermissions, searchPermissions,
} from '../../services/pages/users';
import { FieldCheckboxListEditor } from '../../components/FieldCheckboxListEditor';
import { createGroup, getGroup, updateGroup } from '../../services/pages/groups';
import { FieldArrayEditor } from '../../components/FieldArrayEditor/FieldArrayEditor';
import { getPermission, getRole } from '../../services/pages/roles';
import { GroupData } from '../../types/data';

export function SettingsGroup() {
  const [, setLoading] = useState(true);
  const [data, setData] = useState<GroupData>({
    metadata: { id: '', artifact_type: 'external_groups', version_id: '' },
    entity: {
      name: '',
      description: '',
      user_roles: [],
      permissions: []
    }
  });

  const [isCreateMode, setCreateMode] = useState(false);
  const [showValidation, setShowValidation] = useState(true);
  const [groupId, setGroupId] = useState<string>('');
  const [selectedRoleNames, setSelectedRoleNames] = useState<any[]>([]);
  const [selectedPermissionNames, setSelectedPermissionNames] = useState<any[]>([]);

  const { id } = useParams();

  useEffect(() => {
    if (!groupId && id) setGroupId(id);
  }, [id]);

  useEffect(() => {
    setCreateMode(groupId === '');
    if (groupId) {
      getGroup(groupId)
        .then((json: any) => {
          setData(json);
          const el = document.getElementById(`crumb_${groupId}`);
          if (el) el.innerText = json.entity.name;
          setLoading(false);
        })
        .catch(handleHttpError);
    }
  }, [groupId]);

  useEffect(() => {
    
    if (isCreateMode) {
      if (data.entity.name) {
        createGroup(data.entity)
          .then((json) => {
            if (json && json.metadata.id) {
              setGroupId(json.metadata.id);
              window.history.pushState(
                {},
                '',
                `/settings/groups/edit/${encodeURIComponent(json.metadata.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

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
    if (groupId) {
      const d: any = {};
      d[field] = value;
      
      updateGroup(groupId, d)
        .then(() => {})
        .catch(handleHttpError);
    } else {
      setShowValidation(true);
      if (field === 'user_roles') {
        setData((prev: any) => ({
          ...prev,
          user_roles: value,
          user_roles_ids: value,
        }));
      } else setData((prev: any) => ({ ...prev, entity: {...prev.entity, [field]: value } }));
    }
  };

  const getRoleOptions = async (search: string) => 
  searchRoles({ filters: [], filters_for_join: [], global_query: search, limit: 15, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then(json => {
    return json.items.map((item:any) => { return { value: item.id, label: item.name, name: item.name, id: item.id } });
  });

  const getPermissionOptions = async (search: string) => 
  searchPermissions({ filters: [], filters_for_join: [], global_query: search, limit: 15, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then(json => {
    return json.items.map((item:any) => { return { value: item.id, label: item.name, name: item.name, id: item.id } });
  });

  return (
    <div className={`${styles.page} ${styles.groupPage}`}>
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
              valueSubmitted={(value) => updateGroupField('name', value)}
              isRequired
              showValidation={showValidation}
            />
          </div>
          <div className={styles.data_row}>
          <FieldEditor
              isReadOnly={false}
              layout="separated"
              labelPrefix={`${i18n('Описание')}`}
              defaultValue={data.entity.description}
              className=""
              valueSubmitted={(val) => {
                updateGroupField('description', val.toString());
              }}
            />
          </div>

          <div className={styles.data_row}>
          
          <FieldArrayEditor 
                    key={'ed-ind-' + groupId}
                    getOptions={getRoleOptions}
                    isReadOnly={false} 
                    labelPrefix={i18n('Роли')} 
                    className={styles.long_input}
                    defaultValue={selectedRoleNames} 
                    inputPlaceholder={i18n('Выберите роль')} 
                    addBtnText={i18n('Добавить')}
                    valueSubmitted={()=>{ updateGroupField('user_roles', data.entity.user_roles) }}
                    onValueIdAdded={(id:string) => { 
                      setData((prev) => ({...prev, entity: {...prev.entity, user_roles: [...prev.entity.user_roles, id ]}}));
                    }}
                    onValueIdRemoved={(id:string) => {
                      let arr = [...data.entity.user_roles];
                      arr.splice(parseInt(id), 1);
                      setData(prev => ({...prev, entity: {...prev.entity, user_roles: arr}}));
                    }}
                />
          </div>
          <div className={styles.data_row}>
          
          <FieldArrayEditor 
                    key={'ed-isnd-' + groupId}
                    getOptions={getPermissionOptions}
                    isReadOnly={false} 
                    labelPrefix={i18n('Разрешения')} 
                    className={styles.long_input}
                    defaultValue={selectedPermissionNames} 
                    inputPlaceholder={i18n('Выберите разрешение')} 
                    addBtnText={i18n('Добавить')}
                    valueSubmitted={()=>{ updateGroupField('permissions', data.entity.permissions) }}
                    onValueIdAdded={(id:string) => { 
                      setData((prev) => ({...prev, entity: {...prev.entity, permissions: [...prev.entity.permissions, id ]}}));
                    }}
                    onValueIdRemoved={(id:string) => {
                      let arr = [...data.entity.permissions];
                      arr.splice(parseInt(id), 1);
                      setData(prev => ({...prev, entity: {...prev.entity, permissions: arr}}));
                    }}
                />
          </div>
        </div>
      </div>
    </div>
  );
}
