import { fetchWithRefresh } from '../auth';
import {
  optionsGet, optionsPost, optionsPatch, optionsDelete, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getIsInFav = async (artifactId: string) => fetchWithRefresh(`${URL}/v1/user_fav/is_in_fav/${artifactId}`, optionsGet()).then(handleHttpResponse);
export const addToFav = async(artifactId: string, artifactType: string) => fetchWithRefresh(`${URL}/v1/user_fav/add_to_fav/${artifactType}/${artifactId}`, optionsGet()).then(handleHttpResponse);
export const delFromFav = async (artifactId: string) => fetchWithRefresh(`${URL}/v1/user_fav/del_from_fav/${artifactId}`, optionsGet()).then(handleHttpResponse);
export const getFavs = async (artifactType: string) => fetchWithRefresh(`${URL}/v1/user_fav/get_favs` + (artifactType ? ('/' + artifactType) : ''), optionsGet()).then(handleHttpResponse);