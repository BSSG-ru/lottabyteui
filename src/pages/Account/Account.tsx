/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import useUrlState from '@ahooksjs/use-url-state';
import styles from './Account.module.scss';
import { getCookie, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { renderDate, Table, TableDataRequest } from '../../components/Table';
import { Loader } from '../../components/Loader';
import { deleteDomain } from '../../services/pages/domains';
import { useNavigate } from "react-router-dom";
import { getUserByLogin, updateUserPassword } from '../../services/pages/users';
import { Prev } from 'react-bootstrap/esm/PageItem';
import { Button } from '../../components/Button';

export function Account() {
  const navigate = useNavigate();
  const [state, setState] = useUrlState({ p: '1', q: undefined }, { navigateMode: 'replace' });
  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({ login: '', email: '' });
  const [newPasswordData, setNewPasswordData] = useState({ old_password: '', new_password: '', confirm_password: '' });
  
  useEffect(() => {
    getUserByLogin(getCookie('login') || '').then(json => {
        setData(json);
    });
  }, []);

  const updatePassword = () => {
    updateUserPassword(newPasswordData).then(json => {
    });
  };

  return (
    <div className={styles.page}>
      {loading ? (
        <Loader className="centrify" />
      ) : (
        <>
          <div className={styles.title}>{`${i18n('ПРОФИЛЬ')}`}</div>
          
          <div className={styles.datarow}>
            <div className={styles.label}>{i18n('Логин')}</div>
            <div className={styles.value}>{getCookie('login')}</div>
          </div>
          <div className={styles.datarow}>
            <div className={styles.label}>{i18n('E-mail')}</div>
            <div className={styles.value}>{data.email}</div>
          </div>
          
          <div className={styles.title2}>{`${i18n('Смена пароля')}`}</div>
          <div className={styles.datarow}>
            <div className={styles.label}>{i18n('Старый пароль')}</div>
            <div className={styles.value}><input type="password" value={newPasswordData.old_password} onChange={(e) => { setNewPasswordData(prev => ({...prev, old_password: e.target.value })) }} /></div>
          </div>
          <div className={styles.datarow}>
            <div className={styles.label}>{i18n('Новый пароль')}</div>
            <div className={styles.value}><input type="password" value={newPasswordData.new_password} onChange={(e) => { setNewPasswordData(prev => ({...prev, new_password: e.target.value })) }} /></div>
          </div>
          <div className={styles.datarow}>
            <div className={styles.label}>{i18n('Повторите пароль')}</div>
            <div className={styles.value}><input type="password" value={newPasswordData.confirm_password} onChange={(e) => { setNewPasswordData(prev => ({...prev, confirm_password: e.target.value })) }} /></div>
          </div>
          <div className={styles.buttons}>
            <Button background="outlined-orange" onClick={updatePassword}>Сохранить</Button>
          </div>
        </>
      )}
    </div>
  );
}
