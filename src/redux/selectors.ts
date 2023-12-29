import { createSelector } from 'reselect';
import {
  AuthState, DomainsState, DomainState, TabsState,
} from '../types/redux/states';

export const selectAuth = (state: AuthState) => state.auth;
export const authToken = createSelector(selectAuth, (auth) => auth.token);
export const authValidate = createSelector(selectAuth, (auth) => auth.validate);

export const selectDomains = (state: DomainsState) => state.domains;
export const selectDomainSystems = (state: DomainState) => state.domainSystems;
export const selectDomainQueries = (state: DomainState) => state.domainQueries;
export const selectActiveTab = (state: TabsState) => state.activeTab;
export const domainsPage = createSelector(selectDomains, (auth) => auth.page);
export const domainSystemsPage = createSelector(selectDomainSystems, (auth) => auth.page);
export const domainQueriesPage = createSelector(selectDomainQueries, (auth) => auth.page);
export const domainsCount = createSelector(selectDomains, (auth) => auth.count);
export const domainsRequestBody = createSelector(selectDomains, (auth) => auth.requestBody);
export const domainSystemsRequestBody = createSelector(
  selectDomainSystems,
  (auth) => auth.requestBody,
);
export const domainQueriesRequestBody = createSelector(
  selectDomainQueries,
  (auth) => auth.requestBody,
);

export const tabsActiveTab = createSelector(selectActiveTab, (auth) => auth);
