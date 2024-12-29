/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react/function-component-definition */
import React, { FC, useEffect, useState } from 'react';

import { useLocation } from 'react-router';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Aside } from '../../components/Aside';
import { Crumbs } from '../../components/Crumbs';
import styles from './Layout.module.scss';
import { LimitStewardSwitch } from '../../components/LimitStewardSwitch/LimitStewardSwitch';
import { uuid } from '../../utils';
import { Notices } from '../../components/Notices/Notices';

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const [showCrumbs, setShowCrumbs] = useState(true);

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
            <Header />
            
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
            </div>
            
            <Notices />
          </>
        )}
    </>
  );
};
