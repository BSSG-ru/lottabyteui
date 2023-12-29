import { fetchWithRefresh } from '../auth';
import {
  optionsGet, optionsPost, optionsPatch, optionsDelete, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getEntities = async (body: object | null = null) => fetchWithRefresh(`${URL}/v1/entities/search`, optionsPost(body)).then(handleHttpResponse);

export const getEntity = async (entityId: string) => fetchWithRefresh(`${URL}/v1/entities/${encodeURIComponent(entityId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const getEntityVersion = async (entityId: string, versionId: string) => fetchWithRefresh(`${URL}/v1/entities/${encodeURIComponent(entityId)}/versions/${encodeURIComponent(versionId)}`, optionsGet()).then(
  handleHttpResponse,
);


export const updateEntity = async (entityId: string, data: any) => fetchWithRefresh(`${URL}/v1/entities/${encodeURIComponent(entityId)}`, optionsPatch(data)).then(
  handleHttpResponse,
);

export const deleteEntity = async (entityId: string) => fetchWithRefresh(`${URL}/v1/entities/${encodeURIComponent(entityId)}`, optionsDelete()).then(
  handleHttpResponse,
);

export const deleteEntityAttr = async (entityAttrId: string) => fetchWithRefresh(
  `${URL}/v1/entities/attributes/${encodeURIComponent(entityAttrId)}/false`,
  optionsDelete(),
).then(handleHttpResponse);

export const createEntity = async (data: any) => fetchWithRefresh(`${URL}/v1/entities/`, optionsPost(data)).then(handleHttpResponse);

export const getEntityVersions = async (entityId: string) => fetchWithRefresh(
  `${URL}/v1/entities/${encodeURIComponent(entityId)}/versions?limit=1000`,
  optionsGet(),
).then(handleHttpResponse);

export const getEntityAttributes = async (entityId: string) => fetchWithRefresh(
  `${URL}/v1/entities/${encodeURIComponent(entityId)}/attributes/?offset=0&limit=99999`,
  optionsGet(),
).then(handleHttpResponse);

export const getEntityAttribute = async (attrId: string) => fetchWithRefresh(
  `${URL}/v1/entities/attributes/${encodeURIComponent(attrId)}`,
  optionsGet(),
).then(handleHttpResponse);

export const createAttr = async (entityId: string, data: any) => fetchWithRefresh(
  `${URL}/v1/entities/${encodeURIComponent(entityId)}/attributes`,
  optionsPost(data),
).then(handleHttpResponse);

export const updateAttr = async (logicObjectId: string, attributeId: string, data: any) => {
  data.entity_id = logicObjectId;
  data.artifact_type = 'entity';
  delete data.id;
  return fetchWithRefresh(
    `${URL}/v1/entities/attributes/${encodeURIComponent(attributeId)}`,
    optionsPatch(data),
  ).then(handleHttpResponse);
};

export const getAttrTypes = async () => fetchWithRefresh(`${URL}/v1/entities/attributes/types`, optionsGet()).then(handleHttpResponse);

export const searchEntities = async (request: any) => fetchWithRefresh(`${URL}/v1/entities/search`, optionsPost(request)).then(handleHttpResponse);

export const searchEntityAttributes = async (request: any) => fetchWithRefresh(`${URL}/v1/entities/search_attributes`, optionsPost(request)).then(handleHttpResponse);

export const getEntitiesModel = async () => fetchWithRefresh(`${URL}/v1/entities/model`, optionsGet()).then(handleHttpResponse);