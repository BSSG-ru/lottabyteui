import { fetchWithRefresh } from '../auth';
import {
  optionsDelete, optionsGet, optionsPatch, optionsPost, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getDQRule = async (id: string) => fetchWithRefresh(`${URL}/v1/dq_rule/${encodeURIComponent(id)}`, optionsGet()).then(
  handleHttpResponse,
);

export const deleteDQRule = async (id: string) => fetchWithRefresh(`${URL}/v1/dq_rule/${encodeURIComponent(id)}`, optionsDelete()).then(
  handleHttpResponse,
);

export const createDQRule = async (data: any) => fetchWithRefresh(`${URL}/v1/dq_rule/`, optionsPost(data)).then(handleHttpResponse);

export const updateDQRule = async (id: string, data: any) => fetchWithRefresh(`${URL}/v1/dq_rule/${encodeURIComponent(id)}`, optionsPatch(data)).then(
  handleHttpResponse,
);

export const getDQRuleVersions = async (id: string) => fetchWithRefresh(`${URL}/v1/dq_rule/${encodeURIComponent(id)}/versions?limit=1000`, optionsGet()).then(
  handleHttpResponse,
);

export const getDQRuleVersion = async (id: string, versionId: string) => fetchWithRefresh(`${URL}/v1/dq_rule/${encodeURIComponent(id)}/versions/${encodeURIComponent(versionId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const searchDQRules = async (request: any) => fetchWithRefresh(`${URL}/v1/dq_rule/search`, optionsPost(request)).then(handleHttpResponse);

export const getRuleTypes = async () => fetchWithRefresh(`${URL}/v1/dq_rule/rule_types`, optionsGet()).then(handleHttpResponse);
export const getRuleType = async (id: string) => fetchWithRefresh(`${URL}/v1/dq_rule/rule_types/${encodeURIComponent(id)}`, optionsGet()).then(handleHttpResponse);
