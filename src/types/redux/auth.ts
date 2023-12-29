export enum TYPES {
  CHANGE_TOKEN = 'CHANGE_TOKEN',
  CHANGE_VALIDATE = 'CHANGE_VALIDATE',
  CHANGE_LOGIN = 'CHANGE_LOGIN',
}

export type ChangeTokenActionPayload = string | null;
export type ChangeTokenAction = {
  type: TYPES.CHANGE_TOKEN;
  payload: ChangeTokenActionPayload;
};

export type ChangeValidateActionPayload = boolean | null;
export type ChangeValidateAction = {
  type: TYPES.CHANGE_VALIDATE;
  payload: ChangeValidateActionPayload;
};

export type ChangeLoginActionPayload = string | null;
export type ChangeLoginAction = {
  type: TYPES.CHANGE_LOGIN;
  payload: ChangeLoginActionPayload;
};

