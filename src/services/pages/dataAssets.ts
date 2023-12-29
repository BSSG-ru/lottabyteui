import { fetchWithRefresh } from '../auth';
import {
  optionsGet, optionsPost, optionsPatch, optionsDelete, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const createDataAsset = async (data: any) => fetchWithRefresh(`${URL}/v1/data_assets/`, optionsPost(data)).then(handleHttpResponse);

export const deleteDataAsset = async (assetId: string) => fetchWithRefresh(`${URL}/v1/data_assets/${encodeURIComponent(assetId)}`, optionsDelete()).then(
  handleHttpResponse,
);

export const getAsset = async (assetId: string) => fetchWithRefresh(`${URL}/v1/data_assets/${encodeURIComponent(assetId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const getAssetVersion = async (assetId: string, versionId: string) => fetchWithRefresh(`${URL}/v1/data_assets/${encodeURIComponent(assetId)}/versions/${encodeURIComponent(versionId)}`, optionsGet()).then(
  handleHttpResponse,
);


export const getAssets = async (body: object | null = null) => fetchWithRefresh(`${URL}/v1/data_assets/search`, optionsPost(body)).then(handleHttpResponse);

export const getAssetVersions = async (assetId: string) => fetchWithRefresh(
  `${URL}/v1/data_assets/${encodeURIComponent(assetId)}/versions?limit=1000`,
  optionsGet(),
).then(handleHttpResponse);

export const updateAsset = async (assetId: string, data: any) => fetchWithRefresh(`${URL}/v1/data_assets/${encodeURIComponent(assetId)}`, optionsPatch(data)).then(
  handleHttpResponse,
);

export const searchAssets = async (request: any) => fetchWithRefresh(`${URL}/v1/data_assets/search`, optionsPost(request)).then(handleHttpResponse);