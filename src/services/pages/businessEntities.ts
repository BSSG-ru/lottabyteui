import { fetchWithRefresh } from '../auth';
import {
  optionsDelete, optionsGet, optionsPatch, optionsPost, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getBusinessEntity = async (indicatorId: string) => fetchWithRefresh(`${URL}/v1/business_entities/${encodeURIComponent(indicatorId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const deleteBusinessEntity = async (indicatorId: string) => fetchWithRefresh(`${URL}/v1/business_entities/${encodeURIComponent(indicatorId)}`, optionsDelete()).then(
  handleHttpResponse,
);

export const createBusinessEntity = async (data: any) => fetchWithRefresh(`${URL}/v1/business_entities/`, optionsPost(data)).then(handleHttpResponse);

export const updateBusinessEntity = async (indicatorId: string, data: any) => fetchWithRefresh(`${URL}/v1/business_entities/${encodeURIComponent(indicatorId)}`, optionsPatch(data)).then(
  handleHttpResponse,
);

export const getBusinessEntityVersions = async (beId: string) => fetchWithRefresh(`${URL}/v1/business_entities/${encodeURIComponent(beId)}/versions?limit=1000`, optionsGet()).then(
  handleHttpResponse,
);
export const getBusinessEntityVersion = async (entityId: string, versionId: string) => fetchWithRefresh(`${URL}/v1/business_entities/${encodeURIComponent(entityId)}/versions/${encodeURIComponent(versionId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const getBusinessEntities = async (body: object | null = null) => fetchWithRefresh(`${URL}/v1/business_entities/search`, optionsPost(body)).then(handleHttpResponse);

export const getBETree = async (body: object | null = null) => fetchWithRefresh(`${URL}/v1/business_entities/tree`, optionsPost(body)).then(handleHttpResponse);

