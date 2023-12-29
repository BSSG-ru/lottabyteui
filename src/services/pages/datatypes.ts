import { fetchWithRefresh } from '../auth';
import {
  optionsDelete, optionsGet, optionsPatch, optionsPost, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getDataType = async (dataTypeId: string) => fetchWithRefresh(`${URL}/v1/datatype/${encodeURIComponent(dataTypeId)}`, optionsGet()).then(handleHttpResponse);

export const getDataTypes = async (body: object | null = null) => fetchWithRefresh(`${URL}/v1/datatype/search`, optionsPost(body)).then(handleHttpResponse);