import { fetchWithRefresh } from '../auth';
import {
  optionsDelete, optionsGet, optionsPatch, optionsPost, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const createComment = async (data: any) => fetchWithRefresh(`${URL}/v1/comments/`, optionsPost(data)).then(handleHttpResponse);

export const getComments = async (artifactId: string) => fetchWithRefresh(`${URL}/v1/comments/${encodeURIComponent(artifactId)}`, optionsGet()).then(handleHttpResponse);