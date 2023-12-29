import { TableRequestBody } from '../../types/redux/states';
import { fetchWithRefresh } from '../auth';
import {
  optionsGet, optionsPost, optionsPatch, optionsDelete, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getWorkflowTask = async (workflowTaskId: string) => fetchWithRefresh(`${URL}/v1/workflows/tasks/${encodeURIComponent(workflowTaskId)}`, optionsGet()).then(
    resp => handleHttpResponse(resp, true)
  );
  
  export const deleteWorkflowSettings = async (id: string) => fetchWithRefresh(`${URL}/v1/workflows/settings/${encodeURIComponent(id)}`, optionsDelete()).then(
    handleHttpResponse,
  );

  export const getWorkflowSettings = async (id: string) => fetchWithRefresh(`${URL}/v1/workflows/settings/${encodeURIComponent(id)}`, optionsGet()).then(handleHttpResponse);

  export const updateWorkflowSettings = async (id: string, data: any) => fetchWithRefresh(`${URL}/v1/workflows/settings/${encodeURIComponent(id)}`, optionsPatch(data)).then(
    handleHttpResponse,
  );
  
  export const createWorkflowSettings = async (data: any) => fetchWithRefresh(`${URL}/v1/workflows/settings`, optionsPost(data)).then(handleHttpResponse);

  export const getProcessDefinitions = async () => fetchWithRefresh(`${URL}/v1/workflows/processDefinitions`, optionsGet()).then(handleHttpResponse);