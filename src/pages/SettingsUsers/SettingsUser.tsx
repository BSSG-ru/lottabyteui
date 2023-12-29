/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './SettingsUsers.module.scss';
import { handleHttpError, i18n, uuid } from '../../utils';
import { FieldEditor } from '../../components/FieldEditor';
import {
  getUser, createUser, updateUser, getRoles,
} from '../../services/pages/users';
import { FieldCheckboxListEditor } from '../../components/FieldCheckboxListEditor';
import { FieldArrayEditor } from '../../components/FieldArrayEditor/FieldArrayEditor';
import { getDomains } from '../../services/pages/domains';

export function SettingsUser() {
  const [, setLoading] = useState(true);
  const [data, setData] = useState({
    username: '',
    display_name: '',
    password: '',
    user_roles: [],
    user_domains: [],
    email: ''
  });

  const [isCreateMode, setCreateMode] = useState(false);
  const [showValidation, setShowValidation] = useState(true);
  const [userId, setUserId] = useState<string>('');

  const { id } = useParams();

  useEffect(() => {
    if (!userId && id) setUserId(id);
  }, [id]);

  useEffect(() => {
    setCreateMode(userId === '');
    if (userId) {
      getUser(userId)
        .then((json: any) => {
          setData(json);
          const el = document.getElementById(`crumb_${userId}`);
          if (el) el.innerText = json.username;
          setLoading(false);
        })
        .catch(handleHttpError);
    }
  }, [userId]);

  useEffect(() => {
    if (isCreateMode) {
      if (data.username && data.display_name && data.password) {
        createUser(data)
          .then((json) => {
            if (json && json.uid) {
              setUserId(json.uid);
              window.history.pushState(
                {},
                '',
                `/settings/users/edit/${encodeURIComponent(json.uid)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

  const updateUserField = (field: string, value: any) => {
    if (userId) {
      const d: any = {};
      d[field] = value;
      if (field === 'password' && value === '') { return; }
      if (field === 'user_roles') d.user_roles_ids = value;
      updateUser(userId, d)
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
      } else setData((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  

  return (
    <div className={`${styles.page} ${styles.userPage}`}>
      <div className={styles.mainContent}>
        <div className={styles.general_data}>
          <div className={styles.data_row}>
            <FieldEditor
              className=""
              layout="separated"
              labelPrefix={i18n('Логин')}
              isMultiline={false}
              isReadOnly={false}
              defaultValue={data.username}
              valueSubmitted={(value) => updateUserField('username', value)}
              isRequired
              showValidation={showValidation}
            />
          </div>
          <div className={styles.data_row}>
            <FieldEditor
              className=""
              layout="separated"
              labelPrefix={i18n('E-mail')}
              isMultiline={false}
              isReadOnly={false}
              defaultValue={data.email}
              valueSubmitted={(value) => updateUserField('email', value)}
              isRequired
              showValidation={showValidation}
            />
          </div>
          <div className={styles.data_row}>
            <FieldEditor
              className=""
              layout="separated"
              labelPrefix={i18n('Имя')}
              isMultiline={false}
              isReadOnly={false}
              defaultValue={data.display_name}
              valueSubmitted={(value) => updateUserField('display_name', value)}
              isRequired
              showValidation={showValidation}
            />
          </div>
          <div className={styles.data_row}>
            <FieldEditor
              className=""
              layout="separated"
              labelPrefix={i18n('Пароль')}
              isMultiline={false}
              isReadOnly={false}
              defaultValue={isCreateMode ? '' : '******'}
              isRequired
              showValidation={showValidation}
              valueSubmitted={(value) => updateUserField('password', value)}
              type="password"
              isCreateMode={isCreateMode}
            />
          </div>
          <div className={styles.data_row}>
            <FieldCheckboxListEditor
              className=""
              label={i18n('Роли')}
              isReadOnly={false}
              defaultValue={data.user_roles}
              valueSubmitted={(value) => updateUserField('user_roles', value)}
              isRequired={false}
              showValidation={showValidation}
              getObjects={() => getRoles().then((json) => {
                return json;
              })}
            />
          </div>
          <div className={styles.data_row}>
            <FieldCheckboxListEditor
            
              className=""
              label={i18n('Домены')}
              isReadOnly={false}
              defaultValue={data.user_domains}
              valueSubmitted={(value) => updateUserField('user_domains', value)}
              isRequired={false}
              showValidation={showValidation}
              getObjects={() => getDomains({ filters: [], filters_for_join: [], global_query: '', limit: 1000, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => {
                return json.items;
              })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
