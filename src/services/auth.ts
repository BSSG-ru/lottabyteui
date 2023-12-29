import { allowedNodeEnvironmentFlags } from 'process';
import { Mutex } from 'async-mutex';
import { getCookie, setCookie } from '../utils';
import {
  optionsGetSimple, optionsGet, CustomRequest, usermgmtURL,
} from './requst_templates';

let clientLock = new Mutex();

const checkResponse = (res: Response) => (res.ok ? res.json() : Promise.reject(res));

const refreshToken = async () => fetch(`${usermgmtURL}/v1/preauth/refreshToken`, {
  method: 'POST',
  cache: 'no-cache',
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
  },
  body: getCookie('token'),
}).then(checkResponse);

export const fetchWithRefresh = async (url: string, options: CustomRequest) => {
  const origToken = getCookie('token');
  const res = await fetch(url, options);
  if (res.status === 403 || res.status === 401) {
    let release = await clientLock.acquire();
    try {
      if (origToken !== getCookie('token')) {
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${getCookie('token')}`,
          },
        });
      } else {
        const refreshData = await refreshToken();
        setCookie('token', refreshData.accessToken);
        if (options.headers) {
          options.headers.Authorization = refreshData.accessToken;
        }
        return fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${refreshData.accessToken}`,
          },
        });
      }
    } finally {
      release();
    }
  }
  return res;
};

export const getUserRequest = async () => fetch(`${usermgmtURL}/v1/preauth/validateAuth`, optionsGet());

export const loginRequest = async (form: object) => fetch(`${usermgmtURL}/v1/preauth/validateAuth`, {
  method: 'POST',
  cache: 'no-cache',
  headers: {
    'Content-Type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify(form),
});

export const usersInfoRequest = async () => fetchWithRefresh(`${usermgmtURL}/v1/usermgmt/users`, optionsGetSimple());

export const userInfoRequest = async () => fetchWithRefresh(`${usermgmtURL}/v1/usermgmt/user/name/${getCookie('login')}`, optionsGet()); 
