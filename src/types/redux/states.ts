import { ChangeTokenActionPayload } from './auth';

export type AuthState = {
  auth: AuthStateProps;
};
export type AuthStateProps = {
  token: ChangeTokenActionPayload;
  validate: null | boolean;
  login: null | string;
};

export type DomainsState = {
  domains: TableStateProps;
};
export type DomainState = {
  domainSystems: TableStateProps;
  domainQueries: TableStateProps;
};
export type TabsState = {
  activeTab: string;
};
export type TableFilter = {
  column: string;
  operator: string;
  value: string;
};
export type TableFilters = TableFilter[];
export type TableStateProps = {
  requestBody: TableRequestBody;
  page: number;
  count: number;
};
export type TableRequestBody = {
  sort: string | null;
  global_query: string | null;
  limit: number;
  offset: number;
  filters: TableFilters;
};
export type TabsStateProps = {
  activeTab: string;
};
