import useUrlState from '@ahooksjs/use-url-state';
import classNames from 'classnames';
import React, { useEffect, useState } from 'react';
import { Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { Loader } from '../../components/Loader';
import { ModalDlg } from '../../components/ModalDlg';
import { renderDate, Table } from '../../components/Table';
import { Tabs } from '../../components/Tabs';
import { TaskParamsControl } from '../../components/TaskParamsControl/TaskParamsControl';
import { getSettingsCount } from '../../services/pages/artifacts';
import { createGroup, deleteGroup } from '../../services/pages/groups';
import { createRole, deleteRole } from '../../services/pages/roles';
import { createSystemConnection, deleteSystemConnection } from '../../services/pages/systemConnections';
import { createUser, deleteUser, getPermissions, getRoles } from '../../services/pages/users';
import { createWorkflowSettings, deleteWorkflowSettings } from '../../services/pages/workflow';
import { getArtifactActionAutocompleteObjects, getArtifactActionDisplayValue, getArtifactTypeAutocompleteObjects, getArtifactTypeDisplayValue, getPDAutocompleteObjects, getPDDisplayValue, getSystemAutocompleteObjects, getSystemDisplayValue, getTablePageSize, handleHttpError, i18n, uuid } from '../../utils';
import styles from './Settings.module.scss';

export function Settings() {
  const [loaded, setLoaded] = useState(true);
  const [state, setState] = useUrlState({ sc: 1 }, { navigateMode: 'replace' });

  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delObjectData, setDelObjectData] = useState<any>({ id: '', name: '', type: '' });

  const [usersKey, setUsersKey] = useState(uuid());
  const [connectionsKey, setConnectionsKey] = useState(uuid());
  const [rolesKey, setRolesKey] = useState(uuid());
  const [groupsKey, setGroupsKey] = useState(uuid());
  const [workflowsKey, setWorkflowsKey] = useState(uuid());

  const [showCreateUserDlg, setShowCreateUserDlg] = useState(false);
  const [showCreateUserValidation, setShowCreateUserValidation] = useState(false);
  const [createUserData, setCreateUserData] = useState({ username: '', email: '', display_name: '', password: '' });

  const [showCreateConnDlg, setShowCreateConnDlg] = useState(false);
  const [showCreateConnValidation, setShowCreateConnValidation] = useState(false);
  const [createConnData, setCreateConnData] = useState({ name: '', system_id: '' });
  const [newConnectionData, setNewConnectionData] = useState({});

  const [showCreateRoleDlg, setShowCreateRoleDlg] = useState(false);
  const [showCreateRoleValidation, setShowCreateRoleValidation] = useState(false);
  const [createRoleData, setCreateRoleData] = useState({ name: '' });

  const [showCreateGroupDlg, setShowCreateGroupDlg] = useState(false);
  const [showCreateGroupValidation, setShowCreateGroupValidation] = useState(false);
  const [createGroupData, setCreateGroupData] = useState({ name: '', system_id: '' });

  const [showCreateWfDlg, setShowCreateWfDlg] = useState(false);
  const [showCreateWfValidation, setShowCreateWfValidation] = useState(false);
  const [createWfData, setCreateWfData] = useState({ artifact_type: '', artifact_action: '', process_definition_key: '', description: '' });

  const [count, setCount] = useState({ users: 0, system_connections: 0, roles: 0, groups: 0, workflows: 0 });

  const navigate = useNavigate();

  const userColumns = [
    { property: 'id', header: 'ID', isHidden: true },
    { property: 'username', header: i18n('Логин') },
    { property: 'display_name', header: i18n('Имя') },
    {
      property: 'user_role_names',
      filter_property: 'user_role_names',
      header: i18n('Роли'),
      render: (row: any) => <div className={styles.pills}>{row.user_roles.map((role:any, i:number) => <span key={`role-pill-${row.id}-${i}`} className={styles.pill}>{role}</span>)}</div>,
    },
  ];

  const connectionColumns = [
    { property: 'id', header: 'ID', isHidden: true },
    { property: 'name', header: i18n('Название') },
    { property: 'connector_name', header: i18n('Тип подключения') },
    { property: 'system_name', header: i18n('Система') },
  ];

  const roleColumns = [
    { property: 'id', header: 'ID', isHidden: true },
    { property: 'name', header: i18n('Название') },
    { property: 'description', header: i18n('Описание') },
  ];

  const groupColumns = [
    { property: 'id', header: 'ID', isHidden: true },
    { property: 'name', header: i18n('Название группы') },
    { property: 'user_role_names', filter_property: 'user_role_names', header: i18n('Роли'),
      render: (row: any) => <div className={styles.pills}>{row.user_roles.map((role:any, i:number) => <span key={`role-pill-${row.id}-${i}`} className={styles.pill}>{role}</span>)}</div>,
    },
    { property: 'permission_names', filter_property: 'permission_names', header: i18n('Разрешения'),
      render: (item: any) => (
        <span className={styles.value}>
          {item.permissions.join(', ')}
        </span>
      ),
    }
  ];

  const workflowColumns = [
    { property: 'id', header: 'ID', isHidden: true },
    { property: 'num', header: i18n('Koд'), sortDisabled: true, filterDisabled: true, width: '55px' },
    { property: 'artifact_type_name', filter_property: 'at.name', sort_property: 'at.name', header: i18n('Тип объекта') },
    { property: 'artifact_action', header: i18n('Событие') },
    { property: 'description', header: i18n('Описание события') },
    { property: 'modified', header: i18n('Дата создания'), render: (row: any) => renderDate(row, 'modified') }
  ];

  const submitCreateUser = () => {
    if (createUserData.username && createUserData.display_name && createUserData.email && createUserData.password) {
      setShowCreateUserDlg(false);

      createUser(createUserData).then(json => {
        if (json && json.uid) {
          navigate(`/settings/users/edit/${encodeURIComponent(json.uid)}`);
        }
      }).catch(handleHttpError)
    } else
      setShowCreateUserValidation(true);
  }

  const submitCreateConn = () => {
    if (createConnData.name && createConnData.system_id) {
      setShowCreateConnDlg(false);

      createSystemConnection({...createConnData, ...newConnectionData, enabled: true }).then(json => {
        if (json && json.metadata.id) {
          navigate(`/settings/connections/edit/${encodeURIComponent(json.metadata.id)}`);
        }
      }).catch(handleHttpError)
    } else
      setShowCreateConnValidation(true);
  }

  const submitCreateRole = () => {
    if (createRoleData.name) {
      setShowCreateRoleDlg(false);

      createRole(createRoleData).then(json => {
        if (json && json.id) {
          navigate(`/settings/roles/edit/${encodeURIComponent(json.id)}`);
        }
      }).catch(handleHttpError)
    } else
      setShowCreateRoleValidation(true);
  }

  const submitCreateGroup = () => {
    if (createGroupData.name) {
      setShowCreateGroupDlg(false);

      createGroup(createGroupData).then(json => {
        if (json && json.metadata.id) {
          navigate(`/settings/groups/edit/${encodeURIComponent(json.metadata.id)}`);
        }
      }).catch(handleHttpError)
    } else
      setShowCreateGroupValidation(true);
  }

  const submitCreateWf = () => {
    if (createWfData.artifact_type && createWfData.artifact_action && createWfData.process_definition_key) {
      setShowCreateWfDlg(false);

      createWorkflowSettings(createWfData).then(json => {
        if (json && json.metadata.id) {
          navigate(`/settings/workflows/edit/${encodeURIComponent(json.metadata.id)}`);
        }
      }).catch(handleHttpError)
    } else
      setShowCreateWfValidation(true);
  }

  useEffect(() => {
    getSettingsCount('users').then(res => { setCount((prev) => ({...prev, users: res})) }).catch(handleHttpError);
  }, [ usersKey ]);

  useEffect(() => {
    getSettingsCount('system_connections').then(res => { setCount((prev) => ({...prev, system_connections: res})) }).catch(handleHttpError);
  }, [ connectionsKey ]);

  useEffect(() => {
    getSettingsCount('roles').then(res => { setCount((prev) => ({...prev, roles: res})) }).catch(handleHttpError);
  }, [ rolesKey ]);

  useEffect(() => {
    getSettingsCount('groups').then(res => { setCount((prev) => ({...prev, groups: res})) }).catch(handleHttpError);
  }, [ groupsKey ]);

  useEffect(() => {
    getSettingsCount('workflows').then(res => { setCount((prev) => ({...prev, workflows: res})) }).catch(handleHttpError);
  }, [ workflowsKey ]);

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    switch (delObjectData.type) {
      case 'user':
        deleteUser(delObjectData.id).then(() => { setUsersKey(uuid()); }).catch(handleHttpError);
        break;
      case 'system_connection':
        deleteSystemConnection(delObjectData.id).then(() => { setConnectionsKey(uuid()); }).catch(handleHttpError);
        break;
      case 'role':
        deleteRole(delObjectData.id).then(() => { setRolesKey(uuid()); }).catch(handleHttpError);
        break;
      case 'group':
        deleteGroup(delObjectData.id).then(() => { setGroupsKey(uuid()); }).catch(handleHttpError);
        break;
      case 'workflow':
        deleteWorkflowSettings(delObjectData.id).then(() => { setWorkflowsKey(uuid()); }).catch(handleHttpError);
        break;
    }
    
    setDelObjectData({ id: '', username: '' });
  };
  
  return (
    <div className={classNames(styles.page, styles.scrollable, { [styles.loaded]: loaded })}>
      {!loaded ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('Настройки')}`}
            <Dropdown className={styles.btn_create_menu}>
              <Dropdown.Toggle className={styles.toggle}>{i18n('Добавить')}</Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setShowCreateUserDlg(true)}>{i18n('Пользователя')}</Dropdown.Item>
                <Dropdown.Item onClick={() => setShowCreateConnDlg(true)}>{i18n('Подключение')}</Dropdown.Item>
                <Dropdown.Item onClick={() => setShowCreateRoleDlg(true)}>{i18n('Роль')}</Dropdown.Item>
                <Dropdown.Item onClick={() => setShowCreateGroupDlg(true)}>{i18n('Группу')}</Dropdown.Item>
                <Dropdown.Item onClick={() => setShowCreateWfDlg(true)}>{i18n('Процесс')}</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
          <Tabs onTabChange={(t: number) => { setState(() => ({ sc: t })); }} tabNumber={state.sc} tabs={[
            {
              key: `tab-users-${usersKey}`,
              title: i18n('Пользователи') + ' <span>' + count.users + '</span>',
              content: <div className={styles.tab_white}>
                <Table cookieKey='users' className={styles.table} columns={userColumns} paginate columnSearch globalSearch dataUrl="/v1/usermgmt/user/search"
                  initialFetchRequest={{
                    sort: 'username+',
                    global_query: '',
                    limit: getTablePageSize(),
                    offset: 0,
                    filters: [],
                    filters_preset: [],
                    filters_for_join: [],
                  }}
                  onRowClick={(row: any) => {
                    navigate(`/settings/users/edit/${encodeURIComponent(row.id)}`);
                  }}
                  onDeleteClicked={(row: any) => {
                    setDelObjectData({ id: row.id, name: row.username, type: 'user' });
                    setShowDelDlg(true);
                  }}
                />
              </div>
            },
            {
              key: `tab-connections-${connectionsKey}`,
              title: i18n('Подключения') + ' <span>' + count.system_connections + '</span>',
              content: <div className={styles.tab_white}>
                <Table cookieKey='connections' className={styles.table} columns={connectionColumns} paginate columnSearch globalSearch dataUrl="/v1/system_connections/search"
                  initialFetchRequest={{
                    sort: 'name+',
                    global_query: '',
                    limit: getTablePageSize(),
                    offset: 0,
                    filters: [],
                    filters_preset: [],
                    filters_for_join: [],
                  }}
                  onRowClick={(row: any) => {
                    navigate(`/settings/connections/edit/${encodeURIComponent(row.id)}`);
                  }}
                  onDeleteClicked={(row: any) => {
                    setDelObjectData({ id: row.id, name: row.name, type: 'system_connection' });
                    setShowDelDlg(true);
                  }}
                />
              </div>
            },
            {
              key: `tab-roles-${rolesKey}`,
              title: i18n('Роли') + ' <span>' + count.roles + '</span>',
              content: <div className={styles.tab_white}>
                <Table
                  cookieKey='roles' className={styles.table} columns={roleColumns} paginate columnSearch globalSearch dataUrl="/v1/usermgmt/roles/search"
                  initialFetchRequest={{
                    sort: 'name+',
                    global_query: '',
                    limit: getTablePageSize(),
                    offset: 0,
                    filters: [],
                    filters_preset: [],
                    filters_for_join: [],
                  }}
                  onRowClick={(row: any) => {
                    navigate(`/settings/roles/edit/${encodeURIComponent(row.id)}`);
                  }}
                  onDeleteClicked={(row: any) => {
                    setDelObjectData({ id: row.id, name: row.name, type: 'role' });
                    setShowDelDlg(true);
                  }}
                />
              </div>
            },
            {
              key: `tab-groups-${groupsKey}`,
              title: i18n('Группы') + ' <span>' + count.groups + '</span>',
              content: <div className={styles.tab_white}>
                <Table cookieKey='groups' className={styles.table} columns={groupColumns} paginate columnSearch globalSearch dataUrl="/v1/usermgmt/external_group/search"
                  initialFetchRequest={{
                    sort: 'name+',
                    global_query: '',
                    limit: getTablePageSize(),
                    offset: 0,
                    filters: [],
                    filters_preset: [],
                    filters_for_join: [],
                  }}
                  onRowClick={(row: any) => {
                    navigate(`/settings/groups/edit/${encodeURIComponent(row.id)}`);
                  }}
                  processRows={async (rows:any[]) => {
                    return getRoles().then(roles => {
                      return getPermissions().then(perms => {
                        return rows.map((r:any) => ({...r, user_roles: r.user_roles.map((rid:string) => { let d = roles.find((rf:any) => rf.id == rid); return d ? d.name : '-'; })
                        , permissions: r.permissions.map((rid:string) => { let d = perms.find((rf:any) => rf.id == rid); return d ? d.name : '-'; })}));
                      });
                    });
                  }}
                  onDeleteClicked={(row: any) => {
                    setDelObjectData({ id: row.id, name: row.name, type: 'group' });
                    setShowDelDlg(true);
                  }}
                />
              </div>
            },
            {
              key: `tab-workflows-${workflowsKey}`,
              title: i18n('Процессы') + ' <span>' + count.workflows + '</span>',
              content: <div className={styles.tab_white}>
                <Table cookieKey='workflows' className={styles.table} columns={workflowColumns} paginate columnSearch globalSearch dataUrl="/v1/workflows/searchSettings"
                  initialFetchRequest={{
                    sort: 'at.name+',
                    global_query: '',
                    limit: getTablePageSize(),
                    offset: 0,
                    filters: [],
                    filters_preset: [],
                    filters_for_join: [],
                  }}
                  onRowClick={(row: any) => {
                    navigate(`/settings/workflows/edit/${encodeURIComponent(row.id)}`);
                  }}
                  onDeleteClicked={(row: any) => {
                    setDelObjectData({ id: row.id, name: row.artifact_type_name + ' - ' + row.artifact_action, type: 'workflow' });
                    setShowDelDlg(true);
                  }}
                />
              </div>
            }
          ]} />

          <DeleteObjectModal show={showDelDlg} objectTitle={delObjectData.name} onClose={() => { setShowDelDlg(false); return false; }} onSubmit={delDlgSubmit} />
          <ModalDlg show={showCreateUserDlg} title={i18n('Создать пользователя')} cancelBtnText={i18n('Отменить')} submitBtnText={i18n('Создать')} onClose={() => setShowCreateUserDlg(false)} dialogClassName={styles.dlg_create} onSubmit={submitCreateUser}>
            <div className={styles.fields}>
                <FieldTextEditor label={i18n('Логин')} isRequired showValidation={showCreateUserValidation} defaultValue='' valueSubmitted={(v) => setCreateUserData((prev) => ({...prev, username: v ?? ''}))} />
                <FieldTextEditor label={i18n('E-mail')} isRequired showValidation={showCreateUserValidation} defaultValue='' valueSubmitted={(v) => setCreateUserData((prev) => ({...prev, email: v ?? ''}))} />
                <FieldTextEditor label={i18n('Имя')} isRequired showValidation={showCreateUserValidation} defaultValue='' valueSubmitted={(v) => setCreateUserData((prev) => ({...prev, display_name: v ?? ''}))} />
                <FieldTextEditor label={i18n('Пароль')} isRequired showValidation={showCreateUserValidation} defaultValue='' valueSubmitted={(v) => setCreateUserData((prev) => ({...prev, password: v ?? ''}))} />
            </div>
          </ModalDlg>
          <ModalDlg show={showCreateConnDlg} title={i18n('Создать подключение')} cancelBtnText={i18n('Отменить')} submitBtnText={i18n('Создать')} onClose={() => setShowCreateConnDlg(false)} dialogClassName={styles.dlg_create} onSubmit={submitCreateConn}>
            <div className={styles.fields}>
                <FieldTextEditor label={i18n('Название')} isRequired showValidation={showCreateConnValidation} defaultValue='' valueSubmitted={(v) => setCreateConnData((prev) => ({...prev, name: v ?? ''}))} />
                <FieldAutocompleteEditor
                  label={i18n('Система')}
                  defaultValue={''}
                  valueSubmitted={(v) => setCreateConnData((prev) => ({...prev, system_id: v ?? ''}))}
                  getDisplayValue={getSystemDisplayValue}
                  getObjects={getSystemAutocompleteObjects}
                  isRequired
                  showValidation={showCreateConnValidation}
                />
                <TaskParamsControl
                  onChangedConnection={(connData) => {
                    setNewConnectionData(connData);
                  }}
                  defaultConnectionData={createConnData}
                  useScheduler={false}
                />
            </div>
          </ModalDlg>
          <ModalDlg show={showCreateRoleDlg} title={i18n('Создать роль')} cancelBtnText={i18n('Отменить')} submitBtnText={i18n('Создать')} onClose={() => setShowCreateRoleDlg(false)} dialogClassName={styles.dlg_create} onSubmit={submitCreateRole}>
            <div className={styles.fields}>
                <FieldTextEditor label={i18n('Название')} isRequired showValidation={showCreateRoleValidation} defaultValue='' valueSubmitted={(v) => setCreateRoleData((prev) => ({...prev, name: v ?? ''}))} />
            </div>
          </ModalDlg>
          <ModalDlg show={showCreateGroupDlg} title={i18n('Создать группу')} cancelBtnText={i18n('Отменить')} submitBtnText={i18n('Создать')} onClose={() => setShowCreateGroupDlg(false)} dialogClassName={styles.dlg_create} onSubmit={submitCreateGroup}>
            <div className={styles.fields}>
                <FieldTextEditor label={i18n('Название')} isRequired showValidation={showCreateGroupValidation} defaultValue='' valueSubmitted={(v) => setCreateGroupData((prev) => ({...prev, name: v ?? ''}))} />
            </div>
          </ModalDlg>
          <ModalDlg show={showCreateWfDlg} title={i18n('Создать стюарда')} cancelBtnText={i18n('Отменить')} submitBtnText={i18n('Создать')} onClose={() => setShowCreateWfDlg(false)} dialogClassName={styles.dlg_create} onSubmit={submitCreateWf}>
            <div className={styles.fields}>
              <FieldAutocompleteEditor
                label={i18n('Тип объекта')}
                defaultValue={''}
                valueSubmitted={(v) => setCreateWfData((prev:any) => ({...prev, artifact_type: v}))}
                getDisplayValue={getArtifactTypeDisplayValue}
                getObjects={getArtifactTypeAutocompleteObjects}
                isRequired
                showValidation={showCreateWfValidation}
              />
              <FieldAutocompleteEditor
                  label={i18n('Событие')}
                  defaultValue={''}
                  valueSubmitted={(v) => setCreateWfData((prev:any) => ({...prev, artifact_action: v}))}
                  getDisplayValue={getArtifactActionDisplayValue}
                  getObjects={getArtifactActionAutocompleteObjects}
                  isRequired
                  showValidation={showCreateWfValidation}
                />
              <FieldAutocompleteEditor
                  label={i18n('Process Definition')}
                  defaultValue={''}
                  valueSubmitted={(v) => setCreateWfData((prev:any) => ({...prev, process_definition_key: v}))}
                  getDisplayValue={getPDDisplayValue}
                  getObjects={getPDAutocompleteObjects}
                  showValidation={showCreateWfValidation}
                  isRequired
                />
                
                <FieldTextEditor
                    label={i18n('Описание события')}
                    defaultValue={''}
                    valueSubmitted={(v) => setCreateWfData((prev:any) => ({...prev, description: v}))}
                    
                />
            </div>
          </ModalDlg>
        </>
      )}
    </div>
  );
}
