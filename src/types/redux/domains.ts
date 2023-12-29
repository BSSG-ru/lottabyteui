import { TableFilter } from './states';

export enum TYPES {
  CHANGE_PAGE = 'CHANGE_PAGE',
  CHANGE_SORT = 'CHANGE_SORT',
  CHANGE_COUNT = 'CHANGE_COUNT',
  CHANGE_GLOBAL_QUERY = 'CHANGE_GLOBAL_QUERY',
  CHANGE_FILTERS = 'CHANGE_FILTERS',
}

export type ChangePageActionPayload = number;
export type ChangePageAction = {
  type: TYPES.CHANGE_PAGE;
  payload: ChangePageActionPayload;
};

export type ChangeSortActionPayload = string;
export type ChangeSortAction = {
  type: TYPES.CHANGE_SORT;
  payload: ChangeSortActionPayload;
};

export type ChangeCountActionPayload = number;
export type ChangeCountAction = {
  type: TYPES.CHANGE_COUNT;
  payload: ChangeCountActionPayload;
};

export type ChangeGlobalQueryActionPayload = string | null;
export type ChangeGlobalQueryAction = {
  type: TYPES.CHANGE_GLOBAL_QUERY;
  payload: ChangeGlobalQueryActionPayload;
};

export type ChangeFiltersActionPayload = TableFilter[];
export type ChangeFiltersAction = {
  type: TYPES.CHANGE_FILTERS;
  payload: ChangeFiltersActionPayload;
};
