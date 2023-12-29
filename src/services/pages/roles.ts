import { fetchWithRefresh } from '../auth';
import {
  optionsDelete,
  optionsGet,
  optionsPatch, optionsPost, URL,
  usermgmtURL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getRole = async (roleId: string) => fetchWithRefresh(
  `${usermgmtURL}/v1/usermgmt/role/${encodeURIComponent(roleId)}`,
  optionsGet(),
).then(handleHttpResponse);

export const getPermission = async (permissionId: string) => fetchWithRefresh(
  `${usermgmtURL}/v1/usermgmt/permissions/${encodeURIComponent(permissionId)}`,
  optionsGet(),
).then(handleHttpResponse);

export const updateRole = async (roleId: string, data: any) => fetchWithRefresh(
  `${usermgmtURL}/v1/usermgmt/role/${encodeURIComponent(roleId)}`,
  optionsPatch(data),
).then(handleHttpResponse);

export const getPermissions = async () => fetchWithRefresh(`${usermgmtURL}/v1/usermgmt/permissions`, optionsGet()).then(
  handleHttpResponse,
);

export const createRole = async (data: any) => fetchWithRefresh(`${usermgmtURL}/v1/usermgmt/role/`, optionsPost(data)).then(handleHttpResponse);

export const deleteRole = async (roleId: string) => fetchWithRefresh(
  `${usermgmtURL}/v1/usermgmt/role/${encodeURIComponent(roleId)}`,
  optionsDelete(),
).then(handleHttpResponse);
