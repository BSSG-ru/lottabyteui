/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react/function-component-definition */
import React, { FC } from 'react';

import { useLocation } from 'react-router';
import { Header } from '../../components/Header';
import { Footer } from '../../components/Footer';
import { Aside } from '../../components/Aside';
import { Crumbs } from '../../components/Crumbs';
import styles from './Layout.module.scss';

type LayoutProps = {
  children: React.ReactNode;
};

export const Layout: FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();

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
              <main className={styles.main}>{children}</main>
            </div>
            <Footer />
          </>
        )}
    </>
  );
};
