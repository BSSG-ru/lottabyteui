import { fetchWithRefresh } from '../auth';
import {
  optionsDelete, optionsGet, optionsPatch, optionsPost, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getIndicator = async (indicatorId: string) => fetchWithRefresh(`${URL}/v1/indicators/${encodeURIComponent(indicatorId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const deleteIndicator = async (indicatorId: string) => fetchWithRefresh(`${URL}/v1/indicators/${encodeURIComponent(indicatorId)}`, optionsDelete()).then(
  handleHttpResponse,
);

export const createIndicator = async (data: any) => fetchWithRefresh(`${URL}/v1/indicators/`, optionsPost(data)).then(handleHttpResponse);

export const updateIndicator = async (indicatorId: string, data: any) => fetchWithRefresh(`${URL}/v1/indicators/${encodeURIComponent(indicatorId)}`, optionsPatch(data)).then(
  handleHttpResponse,
);

export const getIndicatorVersions = async (indicatorId: string) => fetchWithRefresh(`${URL}/v1/indicators/${encodeURIComponent(indicatorId)}/versions?limit=1000`, optionsGet()).then(
  handleHttpResponse,
);

export const getIndicatorVersion = async (indicatorId: string, versionId: string) => fetchWithRefresh(`${URL}/v1/indicators/${encodeURIComponent(indicatorId)}/versions/${encodeURIComponent(versionId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const searchIndicators = async (request: any) => fetchWithRefresh(`${URL}/v1/indicators/search`, optionsPost(request)).then(handleHttpResponse);

export const getEntityAttributesByIndicatorId = async (indicatorId: string) => fetchWithRefresh(`${URL}/v1/indicators/entity_attributes_by_indicator/${encodeURIComponent(indicatorId)}`, optionsGet()).then(handleHttpResponse);

export const getIndicatorTypes = async () => fetchWithRefresh(`${URL}/v1/indicators/indicator_types`, optionsGet()).then(handleHttpResponse);
export const getIndicatorType = async (id: string) => fetchWithRefresh(`${URL}/v1/indicators/indicator_types/${encodeURIComponent(id)}`, optionsGet()).then(handleHttpResponse);

export const createIndicatorDQRule = async (indicatorId: string, data: any) => {
  fetchWithRefresh(
    `${URL}/v1/indicators/${encodeURIComponent(indicatorId)}/dq_rules`,
    optionsPost(data),
  ).then(handleHttpResponse);
};

export const deleteIndicatorDQRule = async (dqRuleId: string) => {
  fetchWithRefresh(
    `${URL}/v1/samples/dq_rules/${encodeURIComponent(dqRuleId)}`,
    optionsDelete(),
  ).then(handleHttpResponse);
};
export const updateIndicatorDQRule = async (dqRuleId: string, data: any) => {
  fetchWithRefresh(
    `${URL}/v1/samples/dq_rules/${encodeURIComponent(dqRuleId)}`,
    optionsPatch(data),
  ).then(handleHttpResponse);
};
export const getIndicatorDQRules = async (data: any) => fetchWithRefresh(`${URL}/v1/samples/dq_rules/search`, optionsPost(data)).then(
  handleHttpResponse,
);
export const getIndicatorDQRulesByIndicatorId = async (sampleId: string) => fetchWithRefresh(`${URL}/v1/indicators/dq_rules/${encodeURIComponent(sampleId)}`, optionsGet()).then(
  handleHttpResponse,
);
