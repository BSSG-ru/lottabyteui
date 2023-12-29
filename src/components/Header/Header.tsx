import React, { FC, useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import styles from './Header.module.scss';
import { ReactComponent as Logo } from '../../assets/icons/logo.svg';
import { ReactComponent as StewardSvg } from '../../assets/icons/steward.svg';
import { Search } from '../Search';
import { Button } from '../Button';
import { setCookie, deleteCookie, getCookie, i18n, handleHttpError, doNavigate, uuid } from '../../utils';
import { changeTokenAction, changeValidateAction } from '../../redux/reducers/auth';
import { Crumbs } from '../Crumbs';
import { getUser, getUserByLogin } from '../../services/pages/users';
import { getRole } from '../../services/pages/roles';
import { LimitStewardSwitch } from '../LimitStewardSwitch/LimitStewardSwitch';
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
  const nav = useLocation();

  const navParts = nav.pathname.split('/');
  const slug = navParts[navParts.length - 1];

  return (
    <>
      <header className={styles.header}>
        <div className={styles.logo}>
          <a href="" onClick={(e) => { e.preventDefault(); doNavigate('/', navigate); }}>
            <Logo />
          </a>
        </div>
        <div className={styles.search}>
          <Search query={searchParams.get('q')} />
          <DashboardSwitch key={uuid()} cookieKey={'top'} ref={(dashboardSwitch:any) => { (window as any).dashboardSwitch = dashboardSwitch; }} />
        </div>
        <div className={styles.actions}>
        <Button
            background="outlined-blue"
            onClick={() => { navigate('/account'); }}
          >
            {i18n('My account')}
          </Button>
          <Button
            background="outlined-blue"
            onClick={() => logoutHandler(dispatch)}
          >
            {i18n('Exit')}
          </Button>
        </div>
      </header>
      <div className={styles.subheader}>
        <Crumbs />
        <LimitStewardSwitch key={uuid()} cookieKey={slug ? slug : 'domains'} ref={(limitStewardSwitch:any) => { (window as any).limitStewardSwitch = limitStewardSwitch; }} />
      </div>
    </>
  );
};
