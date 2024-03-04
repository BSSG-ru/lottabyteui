/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import { changeTokenAction, changeValidateAction } from '../../redux/reducers/auth';
import { authToken } from '../../redux/selectors';
import { userInfoRequest } from '../../services/auth';
import { ChangeTokenAction, ChangeValidateAction } from '../../types/redux/auth';
import { deleteCookie, getCookie, setCookie } from '../../utils';

export function Loading() {
  const token = useSelector(authToken) || getCookie('token');
  const dispatch = useDispatch();

  useEffect(() => {
    if (token) {
      userInfoRequest().then((response) => {
        if (response.status === 200) {
          dispatch(changeValidateAction(true) as ChangeValidateAction);
          response.json().then(json => {
            setCookie('userp', json.permissions.join(','), { path: '/' });
          });
          
        } else {
          deleteCookie('token');
          deleteCookie('login');
          dispatch(changeValidateAction(false) as ChangeValidateAction);
          dispatch(changeTokenAction(null) as ChangeTokenAction);
        }
      });
    } else {
      dispatch(changeValidateAction(false));
    }
  }, []);

  return <> </>;
}
