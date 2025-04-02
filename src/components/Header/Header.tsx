import React, { FC, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './Header.module.scss';
import { ReactComponent as Logo } from '../../assets/icons/logo.svg';
import { ReactComponent as ProfileIcon } from '../../assets/icons/profile.svg';
import { Search } from '../Search';
import { Button } from '../Button';
import { i18n, doNavigate, uuid, getCookie, setCookie } from '../../utils';
import { Dropdown } from 'react-bootstrap';

type HeaderProps = {
  showChat: boolean;
  setShowChat: (v: boolean) => void;
}

export const Header: FC<HeaderProps> = ({ showChat, setShowChat }) => {
  
  const navigate = useNavigate();
  
  const [searchParams] = useSearchParams();
  const [showAdvanced, setShowAdvanced] = useState(getCookie('top-dash-adv') == 'true');
  
  const setAdvMode = (v: boolean) => {
    setShowAdvanced(v);
    setCookie('top-dash-adv', '' + v, { expires: 3600 * 24 * 30 });
    let e = document.createEvent('HTMLEvents');
    e.initEvent('dashboardModeChanged', true, true);
    (e as any).eventName = 'dashboardModeChanged';
    (e as any).showAdvanced = v;
    window.dispatchEvent(e);
  }


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
          
        </div>
        <div className={styles.actions}>
          <Dropdown className={styles.dd_mode}>
            <Dropdown.Toggle className={styles.toggle}>{showAdvanced ? i18n('Продвинутый режим') : i18n('Простой режим')}</Dropdown.Toggle>
            <Dropdown.Menu className={styles.menu}>
              <Dropdown.Item onClick={() => setAdvMode(false)}>{i18n('Простой режим')}</Dropdown.Item>
              <Dropdown.Item onClick={() => setAdvMode(true)}>{i18n('Продвинутый режим')}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button background='none' className={styles.btn_chat} onClick={() => setShowChat(!showChat)}></Button>
          <Button
            className={styles.btn_icon}
            background="none"
            onClick={() => { navigate('/account'); }}
          >
            <ProfileIcon />
          </Button>
        </div>
      </header>
      
    </>
  );
};
