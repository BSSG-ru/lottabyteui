/* eslint-disable no-plusplus */
import React from 'react';
import { Checkbox } from '../../components/Checkbox';
import { Form } from '../../components/Form';
import { Input } from '../../components/Input';
import { SignBackground } from '../../components/SignBackground';
import { i18n } from '../../utils';
import styles from '../SignIn/SignIn.module.scss';

export function SignUp() {
  const submitHandler: React.FormEventHandler<HTMLFormElement> = (
    event: React.FormEvent<HTMLFormElement>,
  ): void => {
    const textTypes = ['text', 'password'];
    const { length } = Array.from(event.currentTarget.children).filter(
      (child) => child.id === 'input-wrapper',
    )[0].children;
    const result: { [key: string]: string } = {};

    for (let i = 0; i < length; i++) {
      const element = event.currentTarget[i] as HTMLFormElement;
      if (element.name !== undefined && textTypes.includes(element.type)) {
        result[element.name] = element.value;
      }
      if (element.name !== undefined && element.type === 'checkbox') {
        result[element.name] = element.checked;
      }
    }
    event.preventDefault();
  };

  return (
    <div>
      <SignBackground />
      <div className={styles.form_wrapper}>
        <Form
          className={styles.form}
          title="Зарегистрироваться"
          submitHandler={submitHandler}
          btn_title="Зарегистрироваться"
        >
          <Input
            label={i18n('ФИО')}
            id="usernames"
            name="usernames"
            type="text"
          />
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
          <Input
            label={i18n('Подтвердите пароль')}
            id="repeat-password"
            name="repeat-password"
            type="password"
          />
          <Checkbox
            className={styles.checkbox}
            name="save-pass"
            id="save-pass"
            label="Запомнить пароль"
          />
        </Form>
      </div>
    </div>
  );
}
