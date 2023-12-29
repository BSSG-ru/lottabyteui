/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Checkbox } from '../../components/Checkbox';
import { Form } from '../../components/Form';
import { Input } from '../../components/Input';
import { SignBackground } from '../../components/SignBackground';
import { loginRequest } from '../../services/auth';
import { i18n, setCookie } from '../../utils';

import {
  changeLoginAction,
  changeTokenAction,
  changeValidateAction,
} from '../../redux/reducers/auth';
import { ChangeLoginAction, ChangeTokenAction, ChangeValidateAction } from '../../types/redux/auth';
import styles from './SignIn.module.scss';

export function SignIn() {
  const navigate = useNavigate();
  const submitHandler = (
    event: React.FormEvent<HTMLFormElement>,
    dispatch: Dispatch,
    setErrorText: React.Dispatch<React.SetStateAction<string>>,
  ): void => {
    const textTypes = ['text', 'password'];
    const { length } = Array.from(event.currentTarget.children).filter(
      (child) => child.id === 'input-wrapper',
    )[0].children;
    const result: { [key: string]: string } = {};

    for (let i = 0; i < length; i += 1) {
      const element = event.currentTarget[i] as HTMLFormElement;
      if (element.name && textTypes.includes(element.type)) {
        result[element.name] = element.value;
      }
      if (element.name && element.type === 'checkbox') {
        result[element.name] = element.checked;
      }
    }

    if (result.email && result.password) {
      loginRequest({
        username: result.email,
        password: result.password,
        language: 'ru'
      })
        .then((response) => response.json())
        .then((json) => {
          const token: string = json.accessToken as string;
          const login: string = result.email;

          if (token) {
            setCookie('token', token);
            setCookie('login', login);
            dispatch(changeTokenAction(token) as ChangeTokenAction);
            dispatch(changeLoginAction(login) as ChangeLoginAction);
            dispatch(changeValidateAction(true) as ChangeValidateAction);
            navigate('/');
          } else {
            setErrorText(i18n('Неверный логин или пароль'));
          }
        });
    } else {
      setErrorText(i18n('Не все поля заполнены'));
    }
    event.preventDefault();
  };

  const dispatch = useDispatch();
  const [errorText, setErrorText] = useState('');

  return (
    <div>
      <SignBackground />
      <div className={styles.form_wrapper}>
        <Form
          className={styles.form}
          title="Enter"
          action="/v1/preauth/validateAuth"
          submitHandler={(e: React.FormEvent<HTMLFormElement>) => submitHandler(e, dispatch, setErrorText)}
        >
          <Input
            label={i18n('Email')}
            id="email"
            name="email"
            type="text"
          />
          <Input
            label={i18n('Password')}
            id="password"
            name="password"
            type="password"
          />
          <Checkbox
            className={styles.checkbox}
            name="save-pass"
            id="save-pass"
            label="Запомнить пароль"
          />
          {errorText ? <div className={styles.error}>{errorText}</div> : ''}
        </Form>
      </div>
    </div>
  );
}
