import { fetchWithRefresh } from '../auth';
import {
  optionsGet,
  optionsPost,
  optionsPatch,
  optionsDelete,
  URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getSteward = async (stewardId: string) => fetchWithRefresh(
  `${URL}/v1/stewards/${encodeURIComponent(stewardId)}`,
  optionsGet(),
).then(handleHttpResponse);

export const updateSteward = async (stewardId: string, data: any) => fetchWithRefresh(
  `${URL}/v1/stewards/${encodeURIComponent(stewardId)}`,
  optionsPatch(data),
).then(handleHttpResponse);

export const deleteSteward = async (stewardId: string) => fetchWithRefresh(
  `${URL}/v1/stewards/${encodeURIComponent(stewardId)}`,
  optionsDelete(),
).then(handleHttpResponse);

export const createSteward = async (data: any) => fetchWithRefresh(`${URL}/v1/stewards/`, optionsPost(data)).then(handleHttpResponse);
