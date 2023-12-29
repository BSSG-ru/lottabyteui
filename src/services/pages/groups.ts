import { fetchWithRefresh } from '../auth';
import {
  optionsGet,
  optionsPost,
  optionsPatch,
  optionsDelete,
  usermgmtURL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const updateGroup = async (groupId: string, data: any) => fetchWithRefresh(
    `${usermgmtURL}/v1/usermgmt/user/group/${encodeURIComponent(groupId)}`,
    optionsPatch(data),
  ).then(handleHttpResponse);
  
  export const deleteGroup = async (groupId: string) => fetchWithRefresh(
    `${usermgmtURL}/v1/usermgmt/user/group/${encodeURIComponent(groupId)}`,
    optionsDelete(),
  ).then(handleHttpResponse);
  
  export const createGroup = async (data: any) => fetchWithRefresh(`${usermgmtURL}/v1/usermgmt/user/group`, optionsPost(data)).then(handleHttpResponse);

  export const getGroup = async (groupId: string) => fetchWithRefresh(
    `${usermgmtURL}/v1/usermgmt/user/group/${encodeURIComponent(groupId)}`,
    optionsGet(),
  ).then(handleHttpResponse);
  