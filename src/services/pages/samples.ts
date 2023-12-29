import { fetchWithRefresh } from '../auth';
import {
  optionsGet, optionsPost, optionsPatch, optionsDelete, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const createSample = async (data: any) => fetchWithRefresh(`${URL}/v1/samples/`, optionsPost(data)).then(handleHttpResponse);

export const deleteSample = async (sampleId: string) => fetchWithRefresh(`${URL}/v1/samples/${encodeURIComponent(sampleId)}/true`, optionsDelete()).then(
  handleHttpResponse,
);

export const getSample = async (sampleId: string) => fetchWithRefresh(`${URL}/v1/samples/${encodeURIComponent(sampleId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const getSampleBody = async (sampleId: string) => fetchWithRefresh(
  `${URL}/v1/samples/body_pretty/${encodeURIComponent(sampleId)}`,
  optionsGet(),
).then((resp) => handleHttpResponse(resp, true));

export const getSampleVersions = async (sampleId: string) => fetchWithRefresh(`${URL}/v1/samples/${encodeURIComponent(sampleId)}/versions?limit=1000`, optionsGet()).then(
  handleHttpResponse,
);

export const updateSample = async (sampleId: string, data: any) => fetchWithRefresh(`${URL}/v1/samples/${encodeURIComponent(sampleId)}`, optionsPatch(data)).then(
  handleHttpResponse,
);

export const createSampleProperty = async (sampleId: string, data: any) => fetchWithRefresh(
  `${URL}/v1/samples/${encodeURIComponent(sampleId)}/properties`,
  optionsPost(data),
).then(handleHttpResponse);

export const deleteSampleProperty = async (propertyId: string) => fetchWithRefresh(
  `${URL}/v1/samples/properties/${encodeURIComponent(propertyId)}`,
  optionsDelete(),
).then(handleHttpResponse);

export const updateSampleProperty = async (propertyId: string, data: any) => fetchWithRefresh(
  `${URL}/v1/samples/properties/${encodeURIComponent(propertyId)}`,
  optionsPatch(data),
).then(handleHttpResponse);

export const getSampleProperties = async (data: any) => fetchWithRefresh(`${URL}/v1/samples/properties/search`, optionsPost(data)).then(
  handleHttpResponse,
);

export const createSampleDQRule = async (sampleId: string, data: any) => {
  fetchWithRefresh(
    `${URL}/v1/samples/${encodeURIComponent(sampleId)}/dq_rules`,
    optionsPost(data),
  ).then(handleHttpResponse);
};

export const deleteSampleDQRule = async (dqRuleId: string) => {
  fetchWithRefresh(
    `${URL}/v1/samples/dq_rules/${encodeURIComponent(dqRuleId)}`,
    optionsDelete(),
  ).then(handleHttpResponse);
};
export const updateSampleDQRule = async (dqRuleId: string, data: any) => {
  fetchWithRefresh(
    `${URL}/v1/samples/dq_rules/${encodeURIComponent(dqRuleId)}`,
    optionsPatch(data),
  ).then(handleHttpResponse);
};
export const getSampleDQRules = async (data: any) => fetchWithRefresh(`${URL}/v1/samples/dq_rules/search`, optionsPost(data)).then(
  handleHttpResponse,
);
export const getSampleDQRulesBySampleId = async (sampleId: string) => fetchWithRefresh(`${URL}/v1/samples/dq_rules/${encodeURIComponent(sampleId)}`, optionsGet()).then(
  handleHttpResponse,
);
