/* eslint-disable react/no-array-index-key */
import React, { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import classNames from 'classnames';
import styles from './Crumbs.module.scss';
import { urls } from '../../mocks/urls';
import { i18n, regexExp, loadWord, doNavigate, regexNum } from '../../utils';



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
      var el = pathnameElem;
      if (el == 'connections')
        el = '?sc=2';
      if (el == 'users')
        el = '?sc=1';
      if (el == 'roles')
        el = '?sc=3';
      if (el == 'groups')
        el = '?sc=4';
      if (el == 'workflows')
        el = '?sc=5';
      var href = ((index > 1 && urls[1][pathnameElems[index - 1]]) ? ('/' + pathnameElems[index - 1]) : '') + '/' + el;
      
      crumbs.push({
        title: item[pathnameElem],
        href: href,
        id: index.toString(),
      });
    } else if (regexExp.test(pathnameElem)) {
      crumbs.push({
        title: loadWord,
        href: pathnameElem,
        id: pathnameElem,
      });
    } else if (regexNum.test(pathnameElem)) {
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
        <div key={'cr-d-' + index} className={styles.df}>
          {index > 0 && (<div key={'cr-sep-' + index} className={styles.slash}>/</div>)}
          <a
            id={`crumb_${crumb.id}`}
            key={'cr-' + index}
            className={classNames(styles.link, {
              [styles.link_active]: index === crumbs.length - 1,
            })}
            href={crumb.href}
            onClick={(e) => { e.preventDefault(); doNavigate(crumb.href, navigate); }}
          >
            {i18n(crumb.title)}
          </a>
        </div>
      ) : (
        <div key={'cr-d2-' + index} className={styles.df}>
          {crumbs.length > 0 && (<div className={styles.slash}>/</div>)}
          <div id={`crumb_${crumb.id}`} key={index} className={classNames(styles.link, styles.link_active)}>{i18n(crumb.title)}</div>
        </div>
      )))}
    </div>
  );
};
