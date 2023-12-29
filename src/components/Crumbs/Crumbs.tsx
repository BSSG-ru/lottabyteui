/* eslint-disable react/no-array-index-key */
import React, { FC } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './Crumbs.module.scss';
import { urls } from '../../mocks/urls';
import { i18n, regexExp, loadWord, doNavigate } from '../../utils';



type Crumb = {
  id: string;
  title: string;
  href: string;
};

export const Crumbs: FC = () => {
  const pathnameElems: string[] = useLocation().pathname.split('/');
  const crumbs: Crumb[] = [];
  const navigate = useNavigate();

  pathnameElems.forEach((pathnameElem: string, index: number) => {
    const item = urls[index];
    if (item?.[pathnameElem]) {
      crumbs.push({
        title: item[pathnameElem],
        href: pathnameElem,
        id: index.toString(),
      });
    } else if (regexExp.test(pathnameElem)) {
      crumbs.push({
        title: loadWord,
        href: pathnameElem,
        id: pathnameElem,
      });
    }
  });

  return (
    <div className={styles.crumbs}>
      {crumbs.map((crumb, index) => (index < crumbs.length - 1 ? (
        <a
          id={`crumb_${crumb.id}`}
          key={index}
          className={classNames(styles.link, {
            [styles.link_active]: index === crumbs.length - 1,
          })}
          href={crumb.href}
          onClick={(e) => { e.preventDefault(); doNavigate('/' + crumb.href, navigate); }}
        >
          {i18n(crumb.title)}
        </a>
      ) : (
        <div
          id={`crumb_${crumb.id}`}
          key={index}
          className={classNames(styles.link, styles.link_active)}
        >
          {i18n(crumb.title)}
        </div>
      )))}
    </div>
  );
};
