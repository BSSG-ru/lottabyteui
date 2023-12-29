/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import React, {
  FC, MutableRefObject, useEffect, useRef,
} from 'react';
import { i18n } from '../../utils';
import { Button } from '../Button';
import styles from './Form.module.scss';

type FormProps = {
  title?: string;
  action?: string;
  btn_title?: string;
  className?: string;
  children?: React.ReactNode;
  submitHandler: React.FormEventHandler;
};

export const Form: FC<FormProps> = ({
  title = 'Form',
  action,
  btn_title = i18n('Войти'),
  children,
  submitHandler,
  className = '',
}) => {
  const myRefname = useRef() as MutableRefObject<HTMLButtonElement>;
  useEffect(() => {
    const listener = (event: { code: string; preventDefault: () => void }) => {
      if (event.code === 'Enter' || event.code === 'NumpadEnter') {
        event.preventDefault();
        myRefname.current.click();
      }
    };
    document.addEventListener('keydown', listener);
    return () => {
      document.removeEventListener('keydown', listener);
    };
  }, []);
  return (
    <form
      action={action}
      className={classNames(styles.form, { [className]: className })}
      onSubmit={submitHandler}
    >
      <div className={styles.title}>{i18n(title)}</div>
      <div
        className={styles.input_wrapper}
        id="input-wrapper"
        data-name="input-wrapper"
      >
        {children}
      </div>
      <div className={styles.btn_wrapper}>
        <Button
          isSubmit
          className={styles.btn}
          reff={myRefname}
        >
          {i18n(btn_title)}
        </Button>
      </div>
    </form>
  );
};
