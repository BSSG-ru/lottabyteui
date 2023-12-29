import { createSlice, createAction } from '@reduxjs/toolkit';
import { TabsStateProps } from '../../types/redux/states';
import { ChangeActiveTabAction, ChangeActiveTabPayload, TYPES } from '../../types/redux/tabs';

export const initialState: TabsStateProps = {
  activeTab: '',
};

export const tabs = createSlice({
  name: 'tabs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(TYPES.CHANGE_ACTIVE_TAB, (state, action: ChangeActiveTabAction) => {
      state.activeTab = action.payload;

      return state;
    });
  },
});

export const changeActiveTabAction = createAction<ChangeActiveTabPayload>(TYPES.CHANGE_ACTIVE_TAB);
