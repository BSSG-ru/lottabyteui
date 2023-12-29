import { fetchWithRefresh } from '../auth';
import { optionsGet, optionsPost, URL } from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const searchGet = async (query: string) => fetchWithRefresh(`${URL}/v1/search/?query=${encodeURIComponent(query)}`, optionsGet()).then(
  handleHttpResponse,
);

export const searchPost = async (data: any) => fetchWithRefresh(`${URL}/v1/search/`, optionsPost(data)).then(handleHttpResponse);
