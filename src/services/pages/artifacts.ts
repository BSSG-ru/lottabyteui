import { fetchWithRefresh } from '../auth';
import { optionsGet, URL } from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getArtifactsCount = async (limitSteward: boolean) => fetchWithRefresh(`${URL}/v1/artifacts/count/${limitSteward}`, optionsGet()).then(handleHttpResponse);

export const getArtifactsModel = async (artifactType: string) => fetchWithRefresh(`${URL}/v1/artifacts/model/${artifactType}`, optionsGet()).then(handleHttpResponse);

export const getArtifactModel = async (artifactId: string, artifactType: string) => fetchWithRefresh(`${URL}/v1/artifacts/model/${artifactType}/${artifactId}`, optionsGet()).then(handleHttpResponse);

export const getDashboard = async () => fetchWithRefresh(`${URL}/v1/artifacts/dashboard`, optionsGet()).then(handleHttpResponse);

export const getArtifactTypes = async () => fetchWithRefresh(`${URL}/v1/artifacts/artifact_types`, optionsGet()).then(handleHttpResponse);
export const getWorkflowableArtifactTypes = async () => fetchWithRefresh(`${URL}/v1/artifacts/workflowable_artifact_types`, optionsGet()).then(handleHttpResponse);
export const getArtifactActions = async () => fetchWithRefresh(`${URL}/v1/artifacts/artifact_actions`, optionsGet()).then(handleHttpResponse);
export const getArtifactType = async (at: string) => fetchWithRefresh(`${URL}/v1/artifacts/artifact_type/${encodeURIComponent(at)}`, optionsGet()).then(resp => handleHttpResponse(resp, true));