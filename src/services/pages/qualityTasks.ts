import { fetchWithRefresh } from '../auth';
import { optionsGet, optionsPost, URL } from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getQualityTasksByRunId = async (runId: string) => fetchWithRefresh(`${URL}/v1/quality_tasks/${encodeURIComponent(runId)}`, optionsGet()).then(
  handleHttpResponse,
);
export const getQualityTasksAssertionByRunId = async (runId: string) => fetchWithRefresh(`${URL}/v1/quality_tasks/${encodeURIComponent(runId)}/assertions`, optionsGet()).then(
  handleHttpResponse,
);
export const getQualityRuleRuns = async (ruleId: string) => fetchWithRefresh(`${URL}/v1/quality_tasks/${encodeURIComponent(ruleId)}/runs`, optionsGet()).then(
  handleHttpResponse,
);
export const runTask = async (ruleId: string) => fetchWithRefresh(`${URL}/v1/quality_tasks/${encodeURIComponent(ruleId)}/rule_task`, optionsPost()).then((resp) => handleHttpResponse(resp, true));
