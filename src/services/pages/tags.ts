import { fetchWithRefresh } from '../auth';
import { optionsGet, optionsPost, URL } from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const addTag = async (artifactId: string, artifactType: string, tagName: string) => fetchWithRefresh(
  `${URL}/v1/tags/linkToArtifact/${encodeURIComponent(artifactType)}/${encodeURIComponent(
    artifactId,
  )}`,
  optionsPost({ name: tagName }),
).then(handleHttpResponse);

export const deleteTag = async (artifactId: string, artifactType: string, tagName: string) => fetchWithRefresh(
  `${URL}/v1/tags/unlinkFromArtifact/${artifactType}/${encodeURIComponent(artifactId)}`,
  optionsPost({ name: tagName }),
).then(handleHttpResponse);

export const createDraft = async (artifactId: string, artifactType: string) => fetchWithRefresh(
  `${URL}/v1/workflows/create/draft/${artifactType}/${encodeURIComponent(artifactId)}`,
  optionsPost(),
).then(handleHttpResponse);

export const createTag = async(name: string) => fetchWithRefresh(`${URL}/v1/tags/`, optionsPost({ name: name, tag_category_id: 'd7cf3076-4cb4-4b74-8d69-938a70018db3' })).then(handleHttpResponse);

export const getTags = async () => fetchWithRefresh(`${URL}/v1/tags/?limit=20&offset=0`, optionsGet()).then(handleHttpResponse);

export const searchTags = async (search: string) => fetchWithRefresh(`${URL}/v1/tags/search2`, optionsPost({ query: search, offset: 0, limit: 15 })).then(handleHttpResponse);