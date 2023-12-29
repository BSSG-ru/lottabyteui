import { createSlice, createAction } from '@reduxjs/toolkit';
import {
  ChangeCountAction,
  ChangeCountActionPayload,
  ChangeFiltersAction,
  ChangeFiltersActionPayload,
  ChangeGlobalQueryAction,
  ChangeGlobalQueryActionPayload,
  ChangePageAction,
  ChangePageActionPayload,
  ChangeSortAction,
  ChangeSortActionPayload,
  TYPES,
} from '../../types/redux/domains';
import { TableStateProps } from '../../types/redux/states';

export const initialState: TableStateProps = {
  requestBody: {
    sort: '+name',
    global_query: null,
    limit: 5,
    offset: 0,
    filters: [],
  },
  page: 1,
  count: 0,
};

export const domainSystems = createSlice({
  name: 'domainSystems',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(TYPES.CHANGE_PAGE, (state, action: ChangePageAction) => {
      state.page = action.payload;
      state.requestBody.offset = (state.page - 1) * state.requestBody.limit;
      return state;
    });
    builder.addCase(TYPES.CHANGE_SORT, (state, action: ChangeSortAction) => {
      state.requestBody.sort = action.payload;
      state.page = 1;
      state.requestBody.offset = 0;
      return state;
    });
    builder.addCase(TYPES.CHANGE_COUNT, (state, action: ChangeCountAction) => {
      state.count = action.payload;
      return state;
    });
    builder.addCase(TYPES.CHANGE_GLOBAL_QUERY, (state, action: ChangeGlobalQueryAction) => {
      state.requestBody.global_query = action.payload;
      state.page = 1;
      state.requestBody.offset = 0;
      return state;
    });
    builder.addCase(TYPES.CHANGE_FILTERS, (state, action: ChangeFiltersAction) => {
      state.requestBody.filters = action.payload;
      state.page = 1;
      state.requestBody.offset = 0;
      return state;
    });
  },
});

export const changePageActionDS = createAction<ChangePageActionPayload>(TYPES.CHANGE_PAGE);
export const changeSortActionDS = createAction<ChangeSortActionPayload>(TYPES.CHANGE_SORT);
export const changeCountActionDS = createAction<ChangeCountActionPayload>(TYPES.CHANGE_COUNT);
export const changeGlobalQueryActionDS = createAction<ChangeGlobalQueryActionPayload>(
  TYPES.CHANGE_GLOBAL_QUERY,
);
export const changeFiltersActionDS = createAction<ChangeFiltersActionPayload>(TYPES.CHANGE_FILTERS);
