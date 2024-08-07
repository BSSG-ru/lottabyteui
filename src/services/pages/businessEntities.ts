import { fetchWithRefresh } from '../auth';
import {
  optionsDelete, optionsGet, optionsPatch, optionsPost, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getBusinessEntity = async (beId: string) => fetchWithRefresh(`${URL}/v1/business_entities/${encodeURIComponent(beId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const deleteBusinessEntity = async (beId: string) => fetchWithRefresh(`${URL}/v1/business_entities/${encodeURIComponent(beId)}`, optionsDelete()).then(
  handleHttpResponse,
);

export const archiveBusinessEntity = async (beId: string) => fetchWithRefresh(`${URL}/v1/business_entities/archive/${encodeURIComponent(beId)}`, optionsPost()).then(
  handleHttpResponse,
);

export const restoreBusinessEntity = async (beId: string) => fetchWithRefresh(`${URL}/v1/business_entities/restore/${encodeURIComponent(beId)}`, optionsPost()).then(
  handleHttpResponse,
);


export const createBusinessEntity = async (data: any) => fetchWithRefresh(`${URL}/v1/business_entities/`, optionsPost(data)).then(handleHttpResponse);

export const updateBusinessEntity = async (beId: string, data: any) => fetchWithRefresh(`${URL}/v1/business_entities/${encodeURIComponent(beId)}`, optionsPatch(data)).then(
  handleHttpResponse,
);

export const getBusinessEntityVersions = async (beId: string) => fetchWithRefresh(`${URL}/v1/business_entities/${encodeURIComponent(beId)}/versions?limit=1000`, optionsGet()).then(
  handleHttpResponse,
);
export const getBusinessEntityVersion = async (beId: string, versionId: string) => fetchWithRefresh(`${URL}/v1/business_entities/${encodeURIComponent(beId)}/versions/${encodeURIComponent(versionId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const restoreBusinessEntityVersion = async (beId: string, versionId: string) => fetchWithRefresh(`${URL}/v1/business_entities/${encodeURIComponent(beId)}/versions/${encodeURIComponent(versionId)}/restore`, optionsPost()).then(
  handleHttpResponse,
);

export const getBusinessEntities = async (body: object | null = null) => fetchWithRefresh(`${URL}/v1/business_entities/search`, optionsPost(body)).then(handleHttpResponse);

export const getBETree = async (body: object | null = null) => fetchWithRefresh(`${URL}/v1/business_entities/tree`, optionsPost(body)).then(handleHttpResponse);

