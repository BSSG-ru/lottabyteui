import { fetchWithRefresh } from '../auth';
import {
  optionsGet, optionsPost, optionsPatch, optionsDelete, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const createEntityQuery = async (data: any) => fetchWithRefresh(`${URL}/v1/queries/`, optionsPost(data)).then(handleHttpResponse);

export const deleteEntityQuery = async (queryId: string) => fetchWithRefresh(`${URL}/v1/queries/${encodeURIComponent(queryId)}`, optionsDelete()).then(
  handleHttpResponse,
);

export const getEntityQuery = async (queryId: string) => fetchWithRefresh(`${URL}/v1/queries/${encodeURIComponent(queryId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const getEntityQueryVersion = async (queryId: string, versionId: string) => fetchWithRefresh(`${URL}/v1/queries/${encodeURIComponent(queryId)}/versions/${encodeURIComponent(versionId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const getEntityQueryVersions = async (queryId: string) => fetchWithRefresh(`${URL}/v1/queries/${encodeURIComponent(queryId)}/versions?limit=1000`, optionsGet()).then(
  handleHttpResponse,
);

export const updateEntityQuery = async (queryId: string, data: any) => fetchWithRefresh(`${URL}/v1/queries/${encodeURIComponent(queryId)}`, optionsPatch(data)).then(
  handleHttpResponse,
);

export const getEntityQueries = async (body: object | null = null) => fetchWithRefresh(`${URL}/v1/queries/search`, optionsPost(body)).then(handleHttpResponse);
