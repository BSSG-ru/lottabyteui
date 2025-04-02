/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react/function-component-definition */
import React, { FC, useEffect, useState } from 'react';

import { useLocation } from 'react-router';
import { Header } from '../../components/Header';
import { Aside } from '../../components/Aside';
import { Crumbs } from '../../components/Crumbs';
import styles from './Layout.module.scss';
import { LimitStewardSwitch } from '../../components/LimitStewardSwitch/LimitStewardSwitch';
import { i18n, uuid } from '../../utils';
import { Notices } from '../../components/Notices/Notices';
import { ReactComponent as Minimize } from '../../assets/icons/aside-minimize.svg';
import { ReactComponent as ClockIcon } from '../../assets/icons/clock.svg';
import { ReactComponent as CrossIcon } from '../../assets/icons/cross.svg';

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const [showCrumbs, setShowCrumbs] = useState(true);
  const [showChat, setShowChat] = useState(false);

  const navParts = pathname.split('/');
  const slug = navParts[navParts.length - 1];

  useEffect(() => {
    setShowCrumbs(pathname != '/' && pathname.indexOf('/search/') == -1 && pathname.indexOf('/account') == -1 && pathname.indexOf('-model/') == -1 && pathname.indexOf('/model') == -1);
  }, [ pathname ]);

  return (
    <>
      {pathname === '/signin'
      || pathname === '/signup'
      || pathname === '/error'
      || pathname === '/tutorial' ? (
        <>{children}</>
        ) : (
          <>
            <Header showChat={showChat} setShowChat={setShowChat} />
            
            <div className={styles.content}>
              <aside className={styles.aside}>
                <Aside />
              </aside>
              <main className={styles.main}>
                <div className={styles.crumbs}>
                  {showCrumbs ? (
                    <Crumbs />
                  ) : (<div className={styles.crumbs_placeholder}></div>)}
                  <LimitStewardSwitch key={uuid()} cookieKey={slug ? slug : 'domains'} ref={(limitStewardSwitch:any) => { (window as any).limitStewardSwitch = limitStewardSwitch; }} />
                </div>
                {children}
              </main>
              {showChat && (<div className={styles.smartchat}>
                <div className={styles.chat_head}>
                  <a href="#" className={styles.btn_expand}><Minimize /></a>
                  <div className={styles.title}>{i18n('Смартчат')}</div>
                  <div className={styles.right}>
                    <ClockIcon />
                    <div className={styles.sep}></div>
                    <a href="#" className={styles.btn_close} onClick={() => setShowChat(false)}><CrossIcon /></a>
                  </div>
                </div>
                <div className={styles.chat_body}>
                    <div className={styles.chat_stub}></div>
                    <div className={styles.slogan}>СКОРО</div>
                </div>
              </div>)}
            </div>
            
            <Notices />
          </>
        )}
    </>
  );
};
