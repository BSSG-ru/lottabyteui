import { fetchWithRefresh } from '../auth';
import { optionsGet, URL } from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const getConnectors = async () => fetchWithRefresh(`${URL}/v1/connectors/?offset=0&limit=999`, optionsGet()).then(
  handleHttpResponse,
);

export const getConnector = async (connector_id: string) => fetchWithRefresh(`${URL}/v1/connectors/${encodeURIComponent(connector_id)}`, optionsGet()).then(
  handleHttpResponse,
);

export const getConnectorConnectionParams = async (connector_id: string) => fetchWithRefresh(
  `${URL}/v1/connectors/${encodeURIComponent(connector_id)}/params`,
  optionsGet(),
).then(handleHttpResponse);
