import { fetchWithRefresh } from '../auth';
import {
  optionsGet,
  optionsPost,
  optionsPatch,
  optionsDelete,
  usermgmtURL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getUser = async (userId: string) => fetchWithRefresh(
  `${usermgmtURL}/v1/usermgmt/user/${encodeURIComponent(userId)}`,
  optionsGet(),
).then(handleHttpResponse);

export const getUserByLogin = async (login: string) => fetchWithRefresh(
  `${usermgmtURL}/v1/usermgmt/user/name/${encodeURIComponent(login)}`,
  optionsGet(),
).then(handleHttpResponse);

export const updateUserPassword = async (data: any) => fetchWithRefresh(`${usermgmtURL}/v1/usermgmt/user/updatePassword`, optionsPatch(data)).then(handleHttpResponse);

export const getUsers = async (body: object | null = null) => fetchWithRefresh(
  `${usermgmtURL}/v1/usermgmt/user/search`,
  optionsPost(body),
).then(handleHttpResponse);

export const updateUser = async (userId: string, data: any) => fetchWithRefresh(
  `${usermgmtURL}/v1/usermgmt/user/${encodeURIComponent(userId)}`,
  optionsPatch(data),
).then(handleHttpResponse);

export const deleteUser = async (userId: string) => fetchWithRefresh(
  `${usermgmtURL}/v1/usermgmt/user/${encodeURIComponent(userId)}`,
  optionsDelete(),
).then(handleHttpResponse);

export const createUser = async (data: any) => fetchWithRefresh(`${usermgmtURL}/v1/usermgmt/user/`, optionsPost(data)).then(handleHttpResponse);

export const getRoles = async () => fetchWithRefresh(`${usermgmtURL}/v1/usermgmt/roles`, optionsGet()).then(handleHttpResponse);

export const searchRoles = async (data: any) => fetchWithRefresh(`${usermgmtURL}/v1/usermgmt/roles/search`, optionsPost(data)).then(handleHttpResponse);

export const searchPermissions = async (data: any) => fetchWithRefresh(`${usermgmtURL}/v1/usermgmt/permissions/search`, optionsPost(data)).then(handleHttpResponse);

export const getPermissions = async () => fetchWithRefresh(`${usermgmtURL}/v1/usermgmt/permissions`, optionsGet()).then(handleHttpResponse);
