import React, { FC, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import styles from './Header.module.scss';
import { ReactComponent as Logo } from '../../assets/icons/logo.svg';
import { ReactComponent as ProfileIcon } from '../../assets/icons/profile.svg';
import { Search } from '../Search';
import { Button } from '../Button';
import { deleteCookie, i18n, doNavigate, uuid } from '../../utils';
import { changeTokenAction, changeValidateAction } from '../../redux/reducers/auth';
import { DashboardSwitch } from '../DashboardSwitch/DashboardSwitch';

export const Header: FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const logoutHandler = (disp: Dispatch) => {
    deleteCookie('token');
    deleteCookie('login');
    disp(changeTokenAction(null));
    disp(changeValidateAction(null));
    navigate('/signin');
  };

  

  const [searchParams] = useSearchParams();
  

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>
          <a href="" className={styles.logo_link} onClick={(e) => { e.preventDefault(); doNavigate('/', navigate); }}>
            <Logo /><h1 className={styles.sitetitle}>Lottabyte</h1>
          </a>
        </div>
        <div className={styles.search}>
          <Search query={searchParams.get('q')} />
          <DashboardSwitch key={uuid()} cookieKey={'top'} ref={(dashboardSwitch:any) => { (window as any).dashboardSwitch = dashboardSwitch; }} />
        </div>
        <div className={styles.actions}>
        <Button
            className={styles.btn_icon}
            background="none"
            onClick={() => { navigate('/account'); }}
          >
            <ProfileIcon />
          </Button>
          <Button
            background="outlined-blue"
            onClick={() => logoutHandler(dispatch)}
          >
            {i18n('Exit')}
          </Button>
        </div>
      </header>
      
    </>
  );
};
