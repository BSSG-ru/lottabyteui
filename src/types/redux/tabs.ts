export enum TYPES {
  CHANGE_ACTIVE_TAB = 'CHANGE_ACTIVE_TAB',
}

export type ChangeActiveTabPayload = string;
export type ChangeActiveTabAction = {
  type: TYPES.CHANGE_ACTIVE_TAB;
  payload: ChangeActiveTabPayload;
};
