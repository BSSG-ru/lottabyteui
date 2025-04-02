import { fetchWithRefresh } from '../auth';
import { optionsGet, optionsPost, URL } from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getArtifactsCount = async (limitSteward: boolean) => fetchWithRefresh(`${URL}/v1/artifacts/count/${limitSteward}`, optionsGet()).then(handleHttpResponse);

export const getArtifactsModel = async (artifactType: string) => fetchWithRefresh(`${URL}/v1/artifacts/model/${artifactType}`, optionsGet()).then(handleHttpResponse);

export const getArtifactModel = async (artifactId: string, artifactType: string) => fetchWithRefresh(`${URL}/v1/artifacts/model/${artifactType}/${artifactId}`, optionsGet()).then(handleHttpResponse);

export const getDashboard = async () => fetchWithRefresh(`${URL}/v1/artifacts/dashboard`, optionsGet()).then(handleHttpResponse);
export const getDashboardRecommended = async () => fetchWithRefresh(`${URL}/v1/artifacts/dashboard/recommended`, optionsGet()).then(handleHttpResponse);
export const getDashboardPopular = async () => fetchWithRefresh(`${URL}/v1/artifacts/dashboard/popular`, optionsGet()).then(handleHttpResponse);
export const getDashboardFavorites = async () => fetchWithRefresh(`${URL}/v1/artifacts/dashboard/favorites`, optionsGet()).then(handleHttpResponse);

export const getArtifactTypes = async () => fetchWithRefresh(`${URL}/v1/artifacts/artifact_types`, optionsGet()).then(handleHttpResponse);
export const getWorkflowableArtifactTypes = async () => fetchWithRefresh(`${URL}/v1/artifacts/workflowable_artifact_types`, optionsGet()).then(handleHttpResponse);
export const getArtifactActions = async () => fetchWithRefresh(`${URL}/v1/artifacts/artifact_actions`, optionsGet()).then(handleHttpResponse);
export const getArtifactType = async (at: string) => fetchWithRefresh(`${URL}/v1/artifacts/artifact_type/${encodeURIComponent(at)}`, optionsGet()).then(resp => handleHttpResponse(resp, true));

export const getRelatedObjectArtifactTypes = async (artifactType: string) => fetchWithRefresh(`${URL}/v1/artifacts/related_artifact_types/${artifactType}`, optionsGet()).then(handleHttpResponse);

export const getSettingsCount = async (type: string) => fetchWithRefresh(`${URL}/v1/artifacts/settings/count/${encodeURIComponent(type)}`, optionsGet()).then(handleHttpResponse);

export const searchArtifacts = async (body: object | null = null) => fetchWithRefresh(`${URL}/v1/artifacts/search`, optionsPost(body)).then(handleHttpResponse);
export const getArtifact = async (id: string) => fetchWithRefresh(`${URL}/v1/artifacts/${id}`, optionsGet()).then(handleHttpResponse);