import { fetchWithRefresh } from '../auth';
import {
  optionsGet, optionsPost, optionsPatch, optionsDelete, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getTask = async (taskId: string) => fetchWithRefresh(`${URL}/v1/tasks/${encodeURIComponent(taskId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const getTasksByQueryId = async (queryId: string) => fetchWithRefresh(
  `${URL}/v1/tasks/by_query/${encodeURIComponent(queryId)}?offset=0&limit=999`,
  optionsGet(),
).then(handleHttpResponse);

export const getTasks = async () => fetchWithRefresh(`${URL}/v1/tasks/?offset=0&limit=999`, optionsGet()).then(handleHttpResponse);

export const createTask = async (data: any) => fetchWithRefresh(`${URL}/v1/tasks/`, optionsPost(data)).then(handleHttpResponse);

export const updateTask = async (taskId: string, data: any) => fetchWithRefresh(`${URL}/v1/tasks/${encodeURIComponent(taskId)}`, optionsPatch(data)).then(
  handleHttpResponse,
);

export const deleteTask = async (taskId: string) => fetchWithRefresh(`${URL}/v1/tasks/${encodeURIComponent(taskId)}`, optionsDelete()).then(
  handleHttpResponse,
);

export const runTask = async (taskId: string) => fetchWithRefresh(`${URL}/v1/tasks/run/test/${encodeURIComponent(taskId)}`, optionsGet()).then((resp) => handleHttpResponse(resp, true));
