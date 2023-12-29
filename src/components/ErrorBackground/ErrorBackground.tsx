import React, { FC } from 'react';
import { useNavigate } from 'react-router';
import styles from './ErrorBackground.module.scss';
import { ReactComponent as Logo } from '../../assets/icons/logo-sign.svg';
import { ReactComponent as ErrorVertical } from '../../assets/images/error_vertical.svg';
import { ReactComponent as PageNotFound } from '../../assets/images/page_not_found.svg';
import { ReactComponent as ErrorImg } from '../../assets/images/errorImg.svg';
import { i18n } from '../../utils';
import { Button } from '../Button';

export const ErrorBackground: FC = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.background}>
      <div className={styles.logo}>
        <Logo />
      </div>
      <div className={styles.top_line} />
      <div className={styles.middle_line} />
      <div className={styles.bottom_line} />
      <div className={styles.right_line} />
      <div className={styles.left_line} />
      <div className={styles.error_vertical}>
        <ErrorVertical />
      </div>
      <div className={styles.error_img}>
        <ErrorImg />
      </div>
      <div className={styles.page_not_found}>
        <PageNotFound />
      </div>
      <Button
        className={styles.btn_main_page}
        background="orange"
        onClick={() => {
          navigate('/');
        }}
      >
        {i18n('НА ГЛАВНУЮ')}
      </Button>
    </div>
  );
};
