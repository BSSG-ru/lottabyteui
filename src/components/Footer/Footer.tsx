import React, { FC } from 'react';
import styles from './Footer.module.scss';

import { ReactComponent as Copyright } from '../../assets/icons/copyright.svg';
import { Notices } from '../Notices/Notices';

export const Footer: FC = () => (
  <>
    <Notices />
    <footer className={styles.footer}>
      <Copyright />
      <span className={styles.lotta}>Lottabyte, 2022</span>
    </footer>
  </>
);
