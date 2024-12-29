import React, { FC } from 'react';
import styles from './Footer.module.scss';

import { ReactComponent as Copyright } from '../../assets/icons/copyright.svg';

export const Footer: FC = () => (
  <>
    
    <footer className={styles.footer}>
      <Copyright />
      <span className={styles.lotta}>Lottabyte, 2024</span>
    </footer>
  </>
);
