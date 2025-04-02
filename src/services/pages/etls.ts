import { fetchWithRefresh } from '../auth';
import {
  optionsDelete, optionsGet, optionsPatch, optionsPost, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getETL = async (etlId: string) => fetchWithRefresh(`${URL}/v1/etl/${encodeURIComponent(etlId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const deleteETL = async (etlId: string) => fetchWithRefresh(`${URL}/v1/etl/${encodeURIComponent(etlId)}`, optionsDelete()).then(
  handleHttpResponse,
);

export const archiveETL = async (etlId: string) => fetchWithRefresh(`${URL}/v1/etl/archive/${encodeURIComponent(etlId)}`, optionsPost()).then(
  handleHttpResponse,
);

export const restoreETL = async (etlId: string) => fetchWithRefresh(`${URL}/v1/etl/restore/${encodeURIComponent(etlId)}`, optionsPost()).then(
  handleHttpResponse,
);

export const createETL = async (data: any) => fetchWithRefresh(`${URL}/v1/etl/`, optionsPost(data)).then(handleHttpResponse);

export const updateETL = async (etlId: string, data: any) => fetchWithRefresh(`${URL}/v1/etl/${encodeURIComponent(etlId)}`, optionsPatch(data)).then(
  handleHttpResponse,
);

export const getETLVersions = async (etlId: string) => fetchWithRefresh(`${URL}/v1/etl/${encodeURIComponent(etlId)}/versions?limit=1000`, optionsGet()).then(
  handleHttpResponse,
);

export const getETLVersion = async (etlId: string, versionId: string) => fetchWithRefresh(`${URL}/v1/etl/${encodeURIComponent(etlId)}/versions/${encodeURIComponent(versionId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const restoreETLVersion = async (etlId: string, versionId: string) => fetchWithRefresh(`${URL}/v1/etl/${encodeURIComponent(etlId)}/versions/${encodeURIComponent(versionId)}/restore`, optionsPost()).then(
  handleHttpResponse,
);

export const searchETL = async (request: any) => fetchWithRefresh(`${URL}/v1/etl/search`, optionsPost(request)).then(handleHttpResponse);

export const getETLTypes = async () => fetchWithRefresh(`${URL}/v1/etl/etl_types`, optionsGet()).then(handleHttpResponse);
export const getETLType = async (id: string) => fetchWithRefresh(`${URL}/v1/etl/etl_types/${encodeURIComponent(id)}`, optionsGet()).then(handleHttpResponse);