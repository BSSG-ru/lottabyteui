/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { ChangeEvent, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styles from './SettingsRoles.module.scss';
import { handleHttpError, i18n } from '../../utils';
import { FieldEditor } from '../../components/FieldEditor';
import { createRole, getPermissions, getRole, updateRole } from '../../services/pages/roles';
import { Checkbox } from '../../components/Checkbox';

export const SettingsRole = () => {
  const [, setLoading] = useState(true);
  const [data, setData] = useState({ name: '', description: '', permissions: [] as string[] });
  const [perms, setPerms] = useState<PermissionData[]>([]);
  const [showValidation, setShowValidation] = useState(true);
  const [isCreateMode, setCreateMode] = useState(false);
  const [roleId, setRoleId] = useState<string>('');

  const { id } = useParams();

  type PermissionData = {
    name: string;
    description: string;
    id: string;
  };

  const permissionsContain = (s: string) => data.permissions.some((value) => value === s);

  useEffect(() => {
    if (!roleId && id) setRoleId(id);
  }, [id]);

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

  useEffect(() => {
    setCreateMode(roleId === '');
    if (roleId) {
      getRole(roleId)
        .then((json: any) => {
          setData(json);
          if (document.getElementById(`crumb_${roleId}`) !== null) {
            document.getElementById(`crumb_${roleId}`)!.innerText = json.name;
          }
          setLoading(false);
        })
        .catch(handleHttpError);
    }
  }, [roleId]);

  useEffect(() => {
    if (isCreateMode) {
      if (data.name) {
        createRole({
          name: data.name,
        })
          .then((json) => {
            if (json && json.id) {
              setRoleId(json.id);
              window.history.pushState(
                {},
                '',
                `/settings/roles/edit/${encodeURIComponent(json.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

  const updateRoleField = (field: string, value: string) => {
    if (roleId) {
      const d: any = {};
      d[field] = value;
      updateRole(roleId, d)
        .then(() => { })
        .catch(handleHttpError);
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, [field]: value }));
    }
  };

  const roleChanged = (v: string, checked: boolean) => {
    const p = data.permissions;
    if (checked) {
      p.push(v);
    } else {
      const index = p.indexOf(v);
      if (index !== -1) {
        p.splice(index, 1);
      }
    }
    setData((prev: any) => ({ ...prev, permissions: p }));
    const dataPerm: any = {};
    dataPerm.permissions = p;
    updateRole(roleId, dataPerm)
      .then(() => { })
      .catch(handleHttpError);
  };

  return (
    <div className={`${styles.page} ${styles.domainPage}`}>
      <div className={styles.mainContent}>
        <div className={styles.title}>
          <FieldEditor
            isReadOnly={false}
            labelPrefix={`${i18n('Роль')} `}
            defaultValue={data.name}
            className={styles.title}
            valueSubmitted={(val) => {
              updateRoleField('name', val.toString());
            }}
            isRequired
            onBlur={(val) => {
              updateRoleField('name', val);
            }}
            showValidation={showValidation}
          />
        </div>
        {!isCreateMode && (
          <div className={styles.description}>
            <FieldEditor
              isReadOnly={false}
              labelPrefix={`${i18n('Описание: ')} `}
              defaultValue={data.description}
              className={styles.long_input}
              valueSubmitted={(val) => {
                updateRoleField('description', val.toString());
              }}
              isRequired
              onBlur={(val) => {
                updateRoleField('description', val);
              }}
            />
          </div>
        )}
        {(perms && !isCreateMode) ? (
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
        ) : (
          <> </>
        )}
      </div>
    </div>
  );
};
