import { createSlice, createAction } from '@reduxjs/toolkit';
import {
  ChangeLoginAction,
  ChangeLoginActionPayload,
  ChangeTokenAction,
  ChangeTokenActionPayload,
  ChangeValidateAction,
  ChangeValidateActionPayload,
  TYPES,
} from '../../types/redux/auth';
import { AuthStateProps } from '../../types/redux/states';

export const initialState: AuthStateProps = {
  token: null,
  validate: null,
  login: null,
};

export const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(TYPES.CHANGE_TOKEN, (state, action: ChangeTokenAction) => {
      state.token = action.payload;
      return state;
    });
    builder.addCase(TYPES.CHANGE_VALIDATE, (state, action: ChangeValidateAction) => {
      state.validate = action.payload;
      return state;
    });
    builder.addCase(TYPES.CHANGE_LOGIN, (state, action: ChangeLoginAction) => {
      state.login = action.payload;
      return state;
    });
  },
});

export const changeTokenAction = createAction<ChangeTokenActionPayload>(TYPES.CHANGE_TOKEN);
export const changeValidateAction = createAction<ChangeValidateActionPayload>(
  TYPES.CHANGE_VALIDATE,
);
export const changeLoginAction = createAction<ChangeLoginActionPayload>(TYPES.CHANGE_LOGIN);
