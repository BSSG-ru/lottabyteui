import { fetchWithRefresh } from '../auth';
import {
  optionsGet, optionsPost, optionsPatch, optionsDelete, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getSystemConnections = async (body: object | null = null) => fetchWithRefresh(`${URL}/v1/system_connections/search`, optionsPost(body)).then(
  handleHttpResponse,
);

export const getSystemConnection = async (connector_param_id: string) => fetchWithRefresh(
  `${URL}/v1/system_connections/${encodeURIComponent(connector_param_id)}`,
  optionsGet(),
).then(handleHttpResponse);

export const getSystemConnectionParams = async (system_connection_id: string) => fetchWithRefresh(
  `${URL}/v1/system_connections/${encodeURIComponent(system_connection_id)}/params`,
  optionsGet(),
).then(handleHttpResponse);

export const getConnectorParam = async (connector_param_id: string) => fetchWithRefresh(
  `${URL}/v1/connectors/params/${encodeURIComponent(connector_param_id)}`,
  optionsGet(),
).then(handleHttpResponse);

export const createSystemConnection = async (data: any) => fetchWithRefresh(`${URL}/v1/system_connections/`, optionsPost(data)).then(handleHttpResponse);

export const updateSystemConnection = async (system_connection_id: string, data: any) => fetchWithRefresh(
  `${URL}/v1/system_connections/${encodeURIComponent(system_connection_id)}`,
  optionsPatch(data),
).then(handleHttpResponse);

export const deleteSystemConnection = async (system_connection_id: string) => fetchWithRefresh(
  `${URL}/v1/system_connections/${encodeURIComponent(system_connection_id)}`,
  optionsDelete(),
).then(handleHttpResponse);
