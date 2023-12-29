import React, { FC } from 'react';
import styles from './SignBackground.module.scss';
import { ReactComponent as Logo } from '../../assets/icons/logo-sign.svg';
import { ReactComponent as DiagramsLeft } from '../../assets/images/diagrams-sign.svg';
import { ReactComponent as DiagramsRight } from '../../assets/images/diagrams-sign-with-months.svg';

export const SignBackground: FC = () => (
  <div className={styles.background}>
    <div className={styles.logo}>
      <Logo />
    </div>
    <div className={styles.top_line} />
    <div className={styles.bottom_line} />
    <div className={styles.right_line} />
    <div className={styles.diagrams_left}>
      <DiagramsLeft />
    </div>
    <div className={styles.diagrams_right}>
      <DiagramsRight />
    </div>
  </div>
);
