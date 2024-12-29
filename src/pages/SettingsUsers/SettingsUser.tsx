/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './SettingsUsers.module.scss';
import { getArtifactUrl, handleHttpError, i18n, setDataModified, uuid } from '../../utils';
import {
  getUser, updateUser, getRoles,
} from '../../services/pages/users';
import { getDomain, getDomains } from '../../services/pages/domains';
import classNames from 'classnames';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { EditPage } from '../../components/EditPage';
import { FieldArrayEditor } from '../../components/FieldArrayEditor/FieldArrayEditor';
import { getRole } from '../../services/pages/roles';

export function SettingsUser() {
  const [, setLoading] = useState(true);
  const [isLoaded, setLoaded] = useState(false);
  const [data, setData] = useState<any>({
    entity: {
      username: '',
      display_name: '',
      password: '',
      user_roles: [],
      user_domains: [],
      steward_domains: [],
      email: '',
      name: ''
    },
    metadata: {
      id: '',
      state: ''
    }
  });

  const navigate = useNavigate();

  const [showValidation, setShowValidation] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [selectedRoleNames, setSelectedRoleNames] = useState<any[]>([]);
  const [selectedUserDomainNames, setSelectedUserDomainNames] = useState<any[]>([]);
  const [selectedStewardDomainNames, setSelectedStewardDomainNames] = useState<any[]>([]);
  const [isSteward, setIsSteward] = useState(false);

  const { id } = useParams();

  useEffect(() => {
    if (!userId && id) setUserId(id);
  }, [id]);

  useEffect(() => {
    const a = [];
    for (let i = 0; i < data.entity.user_roles.length; i++) { a.push(''); }
    setSelectedRoleNames(a);

    data.entity.user_roles.forEach((id:string, index:number) => {
      getRole(id).then((json) => {
        setSelectedRoleNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.id, 'role')}">${json.name}</a></div>`, ...prev.slice(index + 1)]));
        
      }).catch(handleHttpError);
    });
  }, [data.entity.user_roles]);

  useEffect(() => {
    setIsSteward(typeof data.entity.steward_id !== 'undefined' && data.entity.steward_id != '');
  }, [ data.entity.steward_id ]);

  useEffect(() => {
    const a = [];
    for (let i = 0; i < data.entity.user_domains.length; i++) { a.push(''); }
    setSelectedUserDomainNames(a);

    data.entity.user_domains.forEach((id:string, index:number) => {
      getDomain(id).then((json) => {
        setSelectedUserDomainNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'domain')}">${json.metadata.name}</a></div>`, ...prev.slice(index + 1)]));
        
      }).catch(handleHttpError);
    });
  }, [data.entity.user_domains]);

  useEffect(() => {
    const a = [];
    for (let i = 0; i < data.entity.steward_domains.length; i++) { a.push(''); }
    setSelectedStewardDomainNames(a);

    data.entity.steward_domains.forEach((id:string, index:number) => {
      getDomain(id).then((json) => {
        setSelectedStewardDomainNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'domain')}">${json.metadata.name}</a></div>`, ...prev.slice(index + 1)]));
        
      }).catch(handleHttpError);
    });
  }, [data.entity.steward_domains]);

  const updateUserField = (field: string, value: any) => {
    if (field == 'password' && !value)
      value = undefined;
    setData((prev: any) => ({ ...prev, entity: {...prev.entity, [field]: value} } ));
    setDataModified(true);
  };

  return (
    <>
      <EditPage noRecentViews noRating data={data} objectId={userId} objectVersionId='' urlSlug='settings/users' setData={setData} isReadOnly={false} setReadOnly={() => {}} artifactType='user' 
        updateObject={async (id, data) => { return await updateUser(id, {...data, user_roles_ids: data.user_roles, is_steward: isSteward}).then(json => ({ entity: {...json, name: json.username}, metadata: { id: json.uid, state: 'PUBLISHED' }})) }}
        getObject={async (id) => { return await getUser(id).then(json => ({ entity: {...json, name: json.username}, metadata: { id: json.uid, state: 'PUBLISHED' }})) }} tabs={[
        {
          key: 'tab-gen',
          title: i18n('Сведения'),
          unscrollable: true,
          content: <div className={styles.tab_2col}>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Общая информация</h2>

              <FieldTextEditor
                label={i18n('Логин')}
                defaultValue={data.entity.username}
                valueSubmitted={(value) => updateUserField('username', value)}
                isRequired
                showValidation={showValidation}
              />

              <FieldTextEditor
                label={i18n('E-mail')}
                defaultValue={data.entity.email}
                valueSubmitted={(value) => updateUserField('email', value)}
                isRequired
                showValidation={showValidation}
              />

              <FieldTextEditor
                label={i18n('Имя')}
                isReadOnly={false}
                defaultValue={data.entity.display_name}
                valueSubmitted={(value) => updateUserField('display_name', value)}
                isRequired
                showValidation={showValidation}
              />

              <FieldTextEditor
                label={i18n('Пароль')}
                defaultValue={undefined /*isCreateMode ? '' : '******'*/}
                isPassword
                showValidation={showValidation}
                valueSubmitted={(value) => updateUserField('password', value)}
              />
            </div>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Дополнительные параметры</h2>

              <FieldArrayEditor
                key={`usr-roles-${userId}`}
                getOptions={async () => { return await getRoles().then(json => json.map((x:any) => ({ value: x.id, label: x.name, name: x.name })))}}
                isReadOnly={false}
                label={i18n('Роли')}
                defaultValue={selectedRoleNames}
                inputPlaceholder={i18n('Выберите роль')}
                valueSubmitted={() => { updateUserField('user_roles', data.entity.user_roles); }}
                onValueIdAdded={(id: string, name: string) => {
                  setData((prev:any) => ({ ...prev, entity: { ...prev.entity, user_roles: [...prev.entity.user_roles, id] } }));
                }}
                onValueIdRemoved={(id: string) => {
                  const arr = [...data.entity.user_roles];
                  arr.splice(parseInt(id), 1);
                  setData((prev:any) => ({ ...prev, entity: { ...prev.entity, user_roles: arr } }));
                }}
              />

              <FieldArrayEditor
                key={`usr-doms-${userId}`}
                getOptions={async (s: string) => { return await getDomains({ sort: 'name+', global_query: s, limit: 1000, offset: 0, filters: [], filters_for_join: [], state: 'PUBLISHED'}).then(json => json.items.map((x:any) => ({ value: x.id, label: x.name, name: x.name })))}}
                isReadOnly={false}
                label={i18n('Домены')}
                defaultValue={selectedUserDomainNames}
                inputPlaceholder={i18n('Выберите домен')}
                valueSubmitted={() => { updateUserField('user_domains', data.entity.user_domains); }}
                onValueIdAdded={(id: string, name: string) => {
                  setData((prev:any) => ({ ...prev, entity: { ...prev.entity, user_domains: [...prev.entity.user_domains, id] } }));
                }}
                onValueIdRemoved={(id: string) => {
                  const arr = [...data.entity.user_domains];
                  arr.splice(parseInt(id), 1);
                  setData((prev:any) => ({ ...prev, entity: { ...prev.entity, user_domains: arr } }));
                }}
              />

              <div className={styles.steward_switch + (isSteward ? ' ' + styles.checked : '')}>
                <div id="steward-switch-bg" className={styles.switch_bg} onClick={() => { setIsSteward(!isSteward); }}>
                  <div id="steward-switch-handler" className={styles.switch_handler}></div>
                </div>
                <label>{i18n('Стюард домена')}</label>
              </div>

              {isSteward && (
                <>
                  <FieldArrayEditor
                    key={`usr-stw-doms-${userId}`}
                    getOptions={async (s: string) => { return await getDomains({ sort: 'name+', global_query: s, limit: 1000, offset: 0, filters: [], filters_for_join: [], state: 'PUBLISHED'}).then(json => json.items.map((x:any) => ({ value: x.id, label: x.name, name: x.name })))}}
                    isReadOnly={false}
                    label={i18n('Домены стюарда')}
                    defaultValue={selectedStewardDomainNames}
                    inputPlaceholder={i18n('Выберите домен')}
                    valueSubmitted={() => { updateUserField('steward_domains', data.entity.steward_domains); }}
                    onValueIdAdded={(id: string, name: string) => {
                      setData((prev:any) => ({ ...prev, entity: { ...prev.entity, steward_domains: [...prev.entity.steward_domains, id] } }));
                    }}
                    onValueIdRemoved={(id: string) => {
                      const arr = [...data.entity.steward_domains];
                      arr.splice(parseInt(id), 1);
                      setData((prev:any) => ({ ...prev, entity: { ...prev.entity, steward_domains: arr } }));
                    }}
                  />
                </>
              )}
              
            </div>
          </div>
        }
      ]} />

      
      
      
    </>
  );
}
