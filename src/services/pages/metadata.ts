import { handleHttpResponse } from "../../utils";
import { fetchWithRefresh } from "../auth";
import { optionsGet, optionsPatch, optionsPost, URL } from "../requst_templates";

export const getMetaDataTree = async (body: object | null = null) => fetchWithRefresh(`${URL}/v1/metadata/tree`, optionsPost(body)).then(handleHttpResponse);

export const searchMetaColumns = async (body: object | null = null) => fetchWithRefresh(`${URL}/v1/metadata/column/search`, optionsPost(body)).then(handleHttpResponse);

export const getMetaDatabase = async (dbId: string) => {
    return await fetchWithRefresh((`${URL}/v1/metadata/db/` + dbId).replace('db//', 'db/'), optionsGet()).then(handleHttpResponse);
}

export const updateMetaDatabase = async (id: string, data: object) => fetchWithRefresh(`${URL}/v1/metadata/db/${id}/update`, optionsPatch(data)).then(handleHttpResponse);

export const getMetaDatabaseVersions = async (id: string) => fetchWithRefresh(`${URL}/v1/metadata/db/${encodeURIComponent(id)}/versions`, optionsGet()).then(handleHttpResponse);

export const getMetaDatabaseVersion = async (id: string, version_id: string) => fetchWithRefresh(`${URL}/v1/metadata/db/${encodeURIComponent(id)}/version/${version_id}`, optionsGet()).then(handleHttpResponse);