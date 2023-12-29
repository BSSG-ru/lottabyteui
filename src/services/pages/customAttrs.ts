import { fetchWithRefresh } from '../auth';
import { optionsGet, optionsPost, URL } from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getCustomAttrDefinitions = async (artifactType: string) => fetchWithRefresh(
  `${URL}/v1/custom_attribute/definition/type/${encodeURIComponent(
    artifactType,
  )}?offset=0&limit=999`,
  optionsGet(),
).then(handleHttpResponse);

export const getCustomAttrDefElements = async (body: object | null = null) => fetchWithRefresh(`${URL}/v1/custom_attribute/defelement/`, optionsPost(body)).then(
  handleHttpResponse,
);
