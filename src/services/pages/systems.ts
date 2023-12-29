import { fetchWithRefresh } from '../auth';
import {
  optionsGet, optionsPost, optionsPatch, optionsDelete, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getSystems = async (body: object | null = null) => fetchWithRefresh(`${URL}/v1/systems/search`, optionsPost(body)).then(handleHttpResponse);

export const getSystem = async (systemId: string) => fetchWithRefresh(`${URL}/v1/systems/${encodeURIComponent(systemId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const getSystemVersion = async (systemId: string, versionId: string) => fetchWithRefresh(`${URL}/v1/systems/${encodeURIComponent(systemId)}/versions/${encodeURIComponent(versionId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const updateSystem = async (systemId: string, data: any) => fetchWithRefresh(`${URL}/v1/systems/${encodeURIComponent(systemId)}`, optionsPatch(data)).then(
  handleHttpResponse,
);

export const deleteDomain = async (domainId: string) => fetchWithRefresh(`${URL}/v1/domains/${encodeURIComponent(domainId)}`, optionsDelete()).then(
  handleHttpResponse,
);

export const createDomain = async (data: any) => fetchWithRefresh(`${URL}/v1/domains/`, optionsPost(data)).then(handleHttpResponse);

export const createSystem = async (data: any) => fetchWithRefresh(`${URL}/v1/systems/system`, optionsPost(data)).then(handleHttpResponse);

export const deleteSystem = async (systemId: string) => fetchWithRefresh(`${URL}/v1/systems/${encodeURIComponent(systemId)}`, optionsDelete()).then(
  handleHttpResponse,
);

export const addSystemTag = async (systemId: string, tagName: string) => fetchWithRefresh(
  `${URL}/v1/tags/linkToArtifact/system/${encodeURIComponent(systemId)}`,
  optionsPost({ name: tagName }),
).then(handleHttpResponse);

export const deleteSystemTag = async (systemId: string, tagName: string) => fetchWithRefresh(
  `${URL}/v1/tags/unlinkFromArtifact/system/${encodeURIComponent(systemId)}`,
  optionsPost({ name: tagName }),
).then(handleHttpResponse);

export const getSystemVersions = async (systemId: string) => fetchWithRefresh(`${URL}/v1/systems/${encodeURIComponent(systemId)}/versions?limit=1000`, optionsGet()).then(
  handleHttpResponse,
);

export const getSystemTypes = async () => fetchWithRefresh(`${URL}/v1/systems/types`, optionsGet()).then(handleHttpResponse);

export const getSystemsUnlikedToDomain = async (domainId: string) => fetchWithRefresh(`${URL}/v1/systems/unliked_to_domain/${encodeURIComponent(domainId)}?limit=999`, optionsGet()).then(handleHttpResponse);