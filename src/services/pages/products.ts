import { fetchWithRefresh } from '../auth';
import {
  optionsGet, optionsPost, optionsPatch, optionsDelete, URL,
} from '../requst_templates';
import { handleHttpResponse } from '../../utils';

export const deleteProduct = async (productId: string) => fetchWithRefresh(`${URL}/v1/product/${encodeURIComponent(productId)}`, optionsDelete()).then(
  handleHttpResponse,
);

export const getProductVersion = async (productId: string, versionId: string) => fetchWithRefresh(`${URL}/v1/product/${encodeURIComponent(productId)}/versions/${encodeURIComponent(versionId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const updateProduct = async (productId: string, data: any) => fetchWithRefresh(`${URL}/v1/product/${encodeURIComponent(productId)}`, optionsPatch(data)).then(
  handleHttpResponse,
);

export const getProductVersions = async (productId: string) => fetchWithRefresh(
  `${URL}/v1/product/${encodeURIComponent(productId)}/versions?limit=1000`,
  optionsGet(),
).then(handleHttpResponse);

export const getProduct = async (productId: string) => fetchWithRefresh(`${URL}/v1/product/${encodeURIComponent(productId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const createProduct = async (data: any) => fetchWithRefresh(`${URL}/v1/product/`, optionsPost(data)).then(handleHttpResponse);

export const searchIndicatorReference = async (data: any) => fetchWithRefresh(`${URL}/v1/product/search_indicator_reference/`, optionsPost(data)).then(handleHttpResponse);

export const searchProductTypes = async (request: any) => fetchWithRefresh(`${URL}/v1/product/type/search`, optionsPost(request)).then(handleHttpResponse);

export const getProductType = async (productTypeId: string) => fetchWithRefresh(`${URL}/v1/product/type/${encodeURIComponent(productTypeId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const searchProductSupplyVariants = async (request: any) => fetchWithRefresh(`${URL}/v1/product/supply_variant/search`, optionsPost(request)).then(handleHttpResponse);

export const getProductSupplyVariant = async (productTypeId: string) => fetchWithRefresh(`${URL}/v1/product/supply_variant/${encodeURIComponent(productTypeId)}`, optionsGet()).then(
  handleHttpResponse,
);

export const createProductDQRule = async (indicatorId: string, data: any) => {
  fetchWithRefresh(
    `${URL}/v1/product/${encodeURIComponent(indicatorId)}/dq_rules`,
    optionsPost(data),
  ).then(handleHttpResponse);
};

export const deleteProductDQRule = async (dqRuleId: string) => {
  fetchWithRefresh(
    `${URL}/v1/samples/dq_rules/${encodeURIComponent(dqRuleId)}`,
    optionsDelete(),
  ).then(handleHttpResponse);
};
export const updateProductDQRule = async (dqRuleId: string, data: any) => {
  fetchWithRefresh(
    `${URL}/v1/samples/dq_rules/${encodeURIComponent(dqRuleId)}`,
    optionsPatch(data),
  ).then(handleHttpResponse);
};
export const getProductDQRules = async (data: any) => fetchWithRefresh(`${URL}/v1/samples/dq_rules/search`, optionsPost(data)).then(
  handleHttpResponse,
);
export const getProductDQRulesByProductId = async (sampleId: string) => fetchWithRefresh(`${URL}/v1/product/dq_rules/${encodeURIComponent(sampleId)}`, optionsGet()).then(
  handleHttpResponse,
);
