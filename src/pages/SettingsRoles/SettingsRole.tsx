/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './SettingsRoles.module.scss';
import { handleHttpError, i18n, setDataModified } from '../../utils';
import { getPermissions, getRole, updateRole } from '../../services/pages/roles';
import { Checkbox } from '../../components/Checkbox';
import useUrlState from '@ahooksjs/use-url-state';
import classNames from 'classnames';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { EditPage } from '../../components/EditPage';
import { userInfoRequest } from '../../services/auth';

export const SettingsRole = () => {
  const navigate = useNavigate();

  const [, setLoading] = useState(true);
  const [isLoaded, setLoaded] = useState(false);
  const [state, setState] = useUrlState({ sc: 1 }, { navigateMode: 'replace' });
  const [data, setData] = useState({ 
    entity: { name: '', description: '', permissions: [] as string[]},
    metadata: { id: '', state: '' }
  });
  const [perms, setPerms] = useState<PermissionData[]>([]);
  const [showValidation, setShowValidation] = useState(true);
  const [roleId, setRoleId] = useState<string>('');

  const { id } = useParams();

  type PermissionData = {
    name: string;
    description: string;
    id: string;
  };

  const permissionsContain = (s: string) => data.entity.permissions.some((value) => value === s);

  useEffect(() => {
    if (!roleId && id) setRoleId(id);
  }, [id]);

  useEffect(() => {
    userInfoRequest().then(resp => {
      resp.json().then(data => {
        if (data.permissions.filter((x:String) => x == 'settings_r').length > 0)
          setLoaded(true);
      });
    }).catch(handleHttpError);
  }, []);

  useEffect(() => {
    getPermissions().then((json) => {
      setPerms(
        json.map((x: any) => ({
          name: x.name,
          description: x.description,
          id: x.id,
        })),
      );
    });
  }, []);

  

  const updateRoleField = (field: string, value: string | undefined) => {
    setData((prev: any) => ({ ...prev, entity: {...prev.entity, [field]: value } }));
    setDataModified(true);
  };

  const roleChanged = (v: string, checked: boolean) => {
    const p = data.entity.permissions;
    if (checked) {
      p.push(v);
    } else {
      const index = p.indexOf(v);
      if (index !== -1) {
        p.splice(index, 1);
      }
    }
    setData((prev: any) => ({ ...prev, permissions: p }));
    setDataModified(true);
    /*const dataPerm: any = {};
    dataPerm.permissions = p;
    updateRole(roleId, dataPerm)
      .then(() => { })
      .catch(handleHttpError);*/
  };

  const saveData = () => {
    updateRole(roleId, data).then(json => {
      if (json.metadata && json.metadata.id != roleId)
        navigate(`/settings/roles/edit/${json.metadata.id}`);
    }).catch(handleHttpError);
  }

  return (
    <>
      {isLoaded && (<EditPage noRecentViews noRating data={data} objectId={roleId} objectVersionId='' urlSlug='settings/roles' setData={setData} isReadOnly={false} setReadOnly={() => {}} artifactType='role' 
        updateObject={async (id, data) => { return await updateRole(id, {...data}).then(json => ({ entity: {...json}, metadata: { id: json.id, state: 'PUBLISHED' }})) }}
        getObject={async (id) => { return await getRole(id).then(json => ({ entity: {...json}, metadata: { id: json.id, state: 'PUBLISHED' }})) }} tabs={[
        {
          key: 'tab-gen',
          title: i18n('Сведения'),
          unscrollable: true,
          content: <div className={styles.tab_2col}>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Общая информация</h2>

              <FieldTextEditor
                isReadOnly={false}
                label={i18n('Роль')}
                defaultValue={data.entity.name}
                valueSubmitted={(val) => {
                  updateRoleField('name', val);
                }}
                isRequired
                showValidation={showValidation}
              />

              <FieldTextEditor
                isReadOnly={false}
                label={i18n('Описание')}
                defaultValue={data.entity.description}
                valueSubmitted={(val) => {
                  updateRoleField('description', val);
                }}
                isRequired
              />
              
            </div>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Дополнительные параметры</h2>

              {(perms) && (
                <div className={styles.checkboxes}>
                  {perms.map((permission: PermissionData) => (
                    <div className={styles.row}>
                      <Checkbox
                        key={permission.name}
                        id={permission.name}
                        name={permission.name}
                        label={permission.name}
                        className={styles.checkbox}
                        checked={permissionsContain(permission.name)}
                        value={permission.name}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          roleChanged(e.target.value, e.target.checked);
                        }}
                      />
                      <div className={styles.description}>{permission.description}</div>
                    </div>
                  ))}
                </div>
              )}
              
            </div>
          </div>
        }
      ]} />)}

    </>
  );
};
