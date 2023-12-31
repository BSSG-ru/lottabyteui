import { getCookie } from '../utils';

export type CustomRequest = {
  method?: string;
  mode?: RequestMode | undefined;
  cache?: RequestCache | undefined;
  credentials?: RequestCredentials | undefined;
  headers?: {
    'Content-Type'?: string;
    Authorization?: string;
    accept?: string;
    'Access-Control-Allow-Headers'?: string;
  };
  redirect?: RequestRedirect | undefined;
  referrerPolicy?: ReferrerPolicy | undefined;
  body?: string;
  signal?: AbortSignal | null;
};
const {
  REACT_APP_BASE_API_URL = 'https://lottatest.bssg.ru',
  REACT_APP_USER_MGT_API_URL = 'https://lottatest.bssg.ru/usermgmt',
} = process.env;
export const URL = REACT_APP_BASE_API_URL;

export const usermgmtURL = REACT_APP_USER_MGT_API_URL;

export const optionsGet = (signal?: AbortSignal | null): CustomRequest => ({
  method: 'GET',
  mode: 'cors',
  cache: 'no-cache',
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getCookie('token')}`,
  },
  redirect: 'follow',
  referrerPolicy: 'no-referrer',
  signal: signal
});

export const optionsGetSimple = (): CustomRequest => ({
  method: 'GET',
  cache: 'no-cache',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${getCookie('token')}`,
    'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
  },
});

export const optionsPost = (body: object | null = null, signal?: AbortSignal | null) => {
  const options: CustomRequest = {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      Authorization: `Bearer ${getCookie('token')}`,
      'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
    },
    signal: signal
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return options;
};

export const optionsPatch = (body: object | null = null) => {
  const options: CustomRequest = {
    method: 'PATCH',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      Authorization: `Bearer ${getCookie('token')}`,
      'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return options;
};

export const optionsDelete = (body: object | null = null) => {
  const options: CustomRequest = {
    method: 'DELETE',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      accept: 'application/json',
      Authorization: `Bearer ${getCookie('token')}`,
      'Access-Control-Allow-Headers': 'Origin, Content-Type, X-Auth-Token',
    },
  };
  if (body) {
    options.body = JSON.stringify(body);
  }
  return options;
};
