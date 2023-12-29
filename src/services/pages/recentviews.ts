import { fetchWithRefresh } from '../auth';
import { optionsGet, optionsPost, URL } from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getRecentViews = async () => fetchWithRefresh(`${URL}/v1/recent_views/`, optionsGet()).then(handleHttpResponse);

export const setRecentView = async (artifactType: string, artifactId: string) => fetchWithRefresh(
  `${URL}/v1/recent_views/${encodeURIComponent(artifactType)}/${encodeURIComponent(artifactId)}`,
  optionsPost(),
).then(handleHttpResponse);
