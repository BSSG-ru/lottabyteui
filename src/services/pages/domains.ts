import { TableRequestBody } from '../../types/redux/states';
import { fetchWithRefresh } from '../auth';
import {
  optionsGet, optionsPost, optionsPatch, optionsDelete, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getDomains = async (body: object | null = null) => fetchWithRefresh(`${URL}/v1/domains/search`, optionsPost(body)).then(handleHttpResponse);

export const getDomain = async (domainId: string) => fetchWithRefresh(`${URL}/v1/domains/${encodeURIComponent(domainId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const getDomainVersion = async (domainId: string, versionId: string) => fetchWithRefresh(`${URL}/v1/domains/${encodeURIComponent(domainId)}/versions/${encodeURIComponent(versionId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const getDomainSystems = async (domainId: string, body: TableRequestBody | null = null) => {
  const body2 = {
    ...body,
    filters_for_join: [
      {
        table: 'system_to_domain',
        column: 'domain_id',
        value: `'${domainId}'`,
        on_column: '',
        equal_column: 'system_id',
        operator: 'EQUAL',
      },
    ],
  };

  return fetchWithRefresh(`${URL}/v1/systems/search`, optionsPost(body2)).then(handleHttpResponse);
};

export const getDomainQueries = async (domainId: string, body: TableRequestBody | null = null) => fetchWithRefresh(`${URL}/v1/queries/search`, optionsPost(body)).then(handleHttpResponse);
export const updateDomain = async (domainId: string, data: any) => fetchWithRefresh(`${URL}/v1/domains/${encodeURIComponent(domainId)}`, optionsPatch(data)).then(
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

export const getDomainVersions = async (domainId: string) => fetchWithRefresh(`${URL}/v1/domains/${encodeURIComponent(domainId)}/versions?limit=1000`, optionsGet()).then(
  handleHttpResponse,
);
