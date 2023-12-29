import { fetchWithRefresh } from '../auth';
import {
  optionsGet, optionsPost, optionsDelete, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getRatingData = async (artifactId: string) => fetchWithRefresh(`${URL}/v1/ratings/${encodeURIComponent(artifactId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const getOwnRatingData = async (artifactId: string) => fetchWithRefresh(`${URL}/v1/ratings/${encodeURIComponent(artifactId)}/own`, optionsGet()).then(
  handleHttpResponse,
);

export const setRating = async (artifactId: string, artifactType: string, rating: number) => {
  if (rating === 0) {
    return fetchWithRefresh(
      `${URL}/v1/ratings/${encodeURIComponent(artifactId)}`,
      optionsDelete(),
    ).then(handleHttpResponse);
  }
  return fetchWithRefresh(
    `${URL}/v1/ratings/${encodeURIComponent(artifactType)}/${encodeURIComponent(
      artifactId,
    )}/${encodeURIComponent(rating)}`,
    optionsPost(),
  ).then(handleHttpResponse);
};
