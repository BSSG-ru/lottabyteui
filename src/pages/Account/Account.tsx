/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import useUrlState from '@ahooksjs/use-url-state';
import styles from './Account.module.scss';
import { getArtifactUrl, getCookie, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { Loader } from '../../components/Loader';
import { getDomain } from '../../services/pages/domains';
import { useNavigate } from "react-router-dom";
import { getUserByLogin, updateUserPassword } from '../../services/pages/users';
import { Button } from '../../components/Button';
import classNames from 'classnames';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { StaticNoticesArea } from '../../components/StaticNoticesArea';
import { Tabs } from '../../components/Tabs';
import { FieldArrayEditor } from '../../components/FieldArrayEditor/FieldArrayEditor';
import { getRole } from '../../services/pages/roles';
import { FavsList } from '../../components/FavsList';

export function Account() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({ login: '', email: '', user_roles: [], user_domains: [], steward_domains: [], steward_id: undefined });
  const [newPasswordData, setNewPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });

  const [selectedRoleNames, setSelectedRoleNames] = useState<any[]>([]);
  const [selectedUserDomainNames, setSelectedUserDomainNames] = useState<any[]>([]);
  const [selectedStewardDomainNames, setSelectedStewardDomainNames] = useState<any[]>([]);
  const [isSteward, setIsSteward] = useState(false);
  
  useEffect(() => {
    getUserByLogin(getCookie('login') || '').then(json => {
        setData(json);
    });
  }, []);

  useEffect(() => {
    const a = [];
    for (let i = 0; i < data.user_roles.length; i++) { a.push(''); }
    setSelectedRoleNames(a);

    data.user_roles.forEach((id:string, index:number) => {
      getRole(id).then((json) => {
        setSelectedRoleNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.id, 'role')}">${json.name}</a></div>`, ...prev.slice(index + 1)]));
        
      }).catch(handleHttpError);
    });
  }, [data.user_roles]);

  useEffect(() => {
    setIsSteward(typeof data.steward_id !== 'undefined' && data.steward_id != '');
  }, [ data.steward_id ]);

  useEffect(() => {
    const a = [];
    for (let i = 0; i < data.user_domains.length; i++) { a.push(''); }
    setSelectedUserDomainNames(a);

    data.user_domains.forEach((id:string, index:number) => {
      getDomain(id).then((json) => {
        setSelectedUserDomainNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'domain')}">${json.metadata.name}</a></div>`, ...prev.slice(index + 1)]));
        
      }).catch(handleHttpError);
    });
  }, [data.user_domains]);

  useEffect(() => {
    const a = [];
    for (let i = 0; i < data.steward_domains.length; i++) { a.push(''); }
    setSelectedStewardDomainNames(a);

    data.steward_domains.forEach((id:string, index:number) => {
      getDomain(id).then((json) => {
        setSelectedStewardDomainNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'domain')}">${json.metadata.name}</a></div>`, ...prev.slice(index + 1)]));
        
      }).catch(handleHttpError);
    });
  }, [data.steward_domains]);

  const updatePassword = () => {
    updateUserPassword(newPasswordData).then(json => {
    });
  };

  return (
    <div className={classNames(styles.page, styles.transparent, styles.loaded)}>
      {loading ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title_row}>
            <h1 className={styles.title}>{i18n('Профиль')}</h1>
            <div className={styles.buttons}>
              <Button onClick={updatePassword}>{i18n('Сохранить')}</Button>
            </div>
          </div>
          <StaticNoticesArea />
          <Tabs tabs={[
            {
              key: 'tab-gen',
              title: i18n('Сведения'),
              unscrollable: true,
              content: <div className={styles.tab_2col}>
                <div className={classNames(styles.col, styles.scrollable)}>
                  <h2>Общая информация</h2>
                    <FieldTextEditor label={i18n('Логин')} defaultValue={getCookie('login')} isReadOnly valueSubmitted={()=>{}} />
                    <FieldTextEditor label={i18n('E-mail')} defaultValue={data.email} isReadOnly valueSubmitted={()=>{}} />
                    
                    <div className={styles.title2}>{`${i18n('Смена пароля')}`}</div>
                    
                    <FieldTextEditor isPassword id='inp-old-psw' label={i18n('Старый пароль')} defaultValue={newPasswordData.old_password} valueSubmitted={(v) => { setNewPasswordData(prev => ({...prev, old_password: v ?? '' })) }} />
                    <FieldTextEditor isPassword id='inp-new-psw' label={i18n('Новый пароль')} defaultValue={newPasswordData.new_password} valueSubmitted={(v) => { setNewPasswordData(prev => ({...prev, new_password: v ?? '' })) }} />
                    <FieldTextEditor isPassword id='inp-conf-psw' label={i18n('Повторите пароль')} defaultValue={newPasswordData.confirm_password} valueSubmitted={(v) => { setNewPasswordData(prev => ({...prev, confirm_password: v ?? '' })) }} />
                </div>
                <div className={classNames(styles.col, styles.scrollable)}>
                  <h2>Дополнительные параметры</h2>

                  <FieldArrayEditor
                    key={`usr-roles`}
                    
                    isReadOnly
                    label={i18n('Роли')}
                    defaultValue={selectedRoleNames}
                    inputPlaceholder={i18n('Выберите роль')}
                    valueSubmitted={() => {  }}
                    onValueIdAdded={(id: string, name: string) => {}}
                    onValueIdRemoved={(id: string) => {}}
                  />

                  <FieldArrayEditor
                    key={`usr-doms`}
                    isReadOnly
                    label={i18n('Домены')}
                    defaultValue={selectedUserDomainNames}
                    inputPlaceholder={i18n('Выберите домен')}
                    valueSubmitted={() => { }}
                    onValueIdAdded={(id: string, name: string) => {}}
                    onValueIdRemoved={(id: string) => {}}
                  />

                  {isSteward && (
                    <>
                      <FieldArrayEditor
                        key={`usr-stw-doms`}
                        isReadOnly
                        label={i18n('Домены стюарда')}
                        defaultValue={selectedStewardDomainNames}
                        inputPlaceholder={i18n('Выберите домен')}
                        valueSubmitted={() => { }}
                        onValueIdAdded={(id: string, name: string) => {}}
                        onValueIdRemoved={(id: string) => {}}
                      />
                    </>
                  )}
                </div>
              </div>
            },
            {
              key: 'tab-fav',
              title: i18n('Избранное'),
              content: <div className={styles.tab_white}>
                <FavsList />
              </div>
            }
          ]} />
          
          
        </>
      )}
    </div>
  );
}
