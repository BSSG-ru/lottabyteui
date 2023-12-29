/* eslint-disable react/function-component-definition */
import classNames from 'classnames';
import React, { FC, useState, useEffect } from 'react';
import { NavLink, useLocation, useRoutes, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';
import { ReactComponent as Users } from '../../assets/icons/users-icon.svg';
import { ReactComponent as Roles } from '../../assets/icons/roles-icon.svg';
import { ReactComponent as Groups } from '../../assets/icons/groups-icon.svg';
import { ReactComponent as Tags } from '../../assets/icons/tags-icon.svg';
import { ReactComponent as Connections } from '../../assets/icons/connections-icon.svg';
import { ReactComponent as Logs } from '../../assets/icons/logs-icon.svg';
import { ReactComponent as Stewards } from '../../assets/icons/stewards-icon.svg';

import { ReactComponent as Domains } from '../../assets/icons/domains-icon.svg';
import { ReactComponent as Systems } from '../../assets/icons/systems-icon.svg';
import { ReactComponent as LogicObjects } from '../../assets/icons/lo-icon.svg';
import { ReactComponent as Queries } from '../../assets/icons/requests-icon.svg';
import { ReactComponent as Samples } from '../../assets/icons/samples-icon.svg';
import { ReactComponent as Assets } from '../../assets/icons/assets-icon.svg';
import { ReactComponent as Indicators } from '../../assets/icons/indicators-icon.svg';
import { ReactComponent as BusinessEntities } from '../../assets/icons/business-ent-icon.svg';
import { ReactComponent as Products } from '../../assets/icons/products-icon.svg';
import { ReactComponent as Tasks } from '../../assets/icons/tasks-icon.svg';
import { ReactComponent as Eye } from '../../assets/icons/eye.svg';
import { ReactComponent as Settings } from '../../assets/icons/settings.svg';
import { ReactComponent as DQRules } from '../../assets/icons/dq-rule.svg';

import styles from './Aside.module.scss';
import { urls } from '../../mocks/urls';
import { doNavigate, getArtifactUrl, handleHttpError, i18n } from '../../utils';
import { getArtifactsCount } from '../../services/pages/artifacts';
import { getRecentViews, setRecentView } from '../../services/pages/recentviews';

export const Aside: FC = () => {
  const navigate = useNavigate();
  const [recentViews, setRecentViews] = useState<any[]>([]);

  const [count, setCount] = useState({
    data_asset: '',
    domain: '',
    task: '',
    entity: '',
    entity_query: '',
    entity_sample: '',
    system: '',
    indicator: '',
    business_entity: '',
    product: '',
    dq_rule: '',
    draft: ''
  });

  const nav = useLocation();
  const listener = () => {
    let limit_steward = false;
    const lss = (window as any).limitStewardSwitch;
    if (lss) { limit_steward = lss.state.limitSteward; }
    getArtifactsCount(limit_steward).then((json) => {
      setCount(json);
    });
  };

  const [currPath, setCurrPath] = useState('/');
  useEffect(() => {
    document.addEventListener('countUpdateNeeded', listener, false);
    window.addEventListener('limitStewardChanged', (e) => {
      getArtifactsCount((e as any).limitSteward).then((json) => {
        setCount(json);
      });
    });
    const pathParts = nav.pathname.split('/');
    const first = pathParts[1];
    if (first === 'settings' && pathParts.length > 2) setCurrPath(`/${first}/${pathParts[2]}`);
    else setCurrPath(first);

    listener();
  }, [nav.pathname]);

  const linksSettings = [
    {
      icon: <Users />,
      title: urls[2].users,
      href: 'settings/users',
      count: 0,
    },
    {
      icon: <Connections />,
      title: urls[2].connections,
      href: 'settings/connections',
      count: 0,
    },
    {
      icon: <Roles />,
      title: urls[2].roles,
      href: 'settings/roles',
      count: 0,
    },
    {
      icon: <Groups />,
      title: urls[2].groups,
      href: 'settings/groups',
      count: 0,
    },
    {
      icon: <Stewards />,
      title: urls[2].stewards,
      href: 'settings/stewards',
      count: 0,
    },
    {
      icon: <Connections />,
      title: urls[2].workflows,
      href: 'settings/workflows',
      count: ''
    }
  ];

  const links = [
    {
      icon: <Domains />,
      title: urls[1].domains,
      href: 'domains',
      count: count.domain,
    },
    {
      icon: <Systems />,
      title: urls[1].systems,
      href: 'systems',
      count: count.system,
    },
    {
      icon: <Tasks />,
      title: urls[1].tasks,
      href: 'tasks',
      count: count.task,
    },
    {
      icon: <LogicObjects />,
      title: urls[1]['logic-objects'],
      href: 'logic-objects',
      count: count.entity,
    },
    {
      icon: <Queries />,
      title: urls[1].queries,
      href: 'queries',
      count: count.entity_query,
    },
    {
      icon: <Samples />,
      title: urls[1].samples,
      href: 'samples',
      count: count.entity_sample,
    },
    {
      icon: <Assets />,
      title: urls[1].assets,
      href: 'data_assets',
      count: count.data_asset,
    },
    {
      icon: <Indicators />,
      title: urls[1].indicators,
      href: 'indicators',
      count: count.indicator,
    },
    {
      icon: <BusinessEntities />,
      title: urls[1]['business-entities'],
      href: 'business-entities',
      count: count.business_entity,
    },
    {
      icon: <Products />,
      title: urls[1].products,
      href: 'products',
      count: count.product,
    },
    {
      icon: <DQRules />,
      title: urls[1].dq_rule,
      href: 'dq_rule',
      count: count.dq_rule,
    },
    {
      icon: <Domains />,
      title: urls[1].draft,
      href: 'drafts',
      count: count.draft
    }
  ];

  const menu = useRoutes([
    {
      path: '/settings/*',
      element: (
        <ul>
          {linksSettings.map((link) => (
            <li key={link.href}>
              <a
                id={`icon${link.href}`}
                data-tooltip-content={i18n(link.title)}
                href=""
                className={classNames(styles.link, {
                  [styles.link_active]: link.href === currPath,
                })}
                onClick={(e) => { e.preventDefault(); doNavigate(`/${link.href}`, navigate); return false; }}
              >
                <span className={styles.icon}>{link.icon}</span>
                <span className={styles.title}>{i18n(link.title)}</span>
              </a>
              <Tooltip anchorId={`icon${link.href}`} noArrow className="tooltip mob-only" place="right" />
            </li>
          ))}
        </ul>
      ),
    },
    {
      path: '/*',
      element: (
        <ul>
          {links.map((link) => (

            <li key={link.href}>
              <a
                id={`icon${link.href}`}
                data-tooltip-content={i18n(link.title)}
                href=""
                className={classNames(styles.link, {
                  [styles.link_active]: link.href === currPath,
                })}
                onClick={(e) => { e.preventDefault(); doNavigate(`/${link.href}`, navigate); return false; }}
              >
                <span className={styles.icon}>{link.icon}</span>
                <span className={styles.title}>{i18n(link.title)}</span>
                <span className={styles.count}>{link.count}</span>

              </a>
              <Tooltip anchorId={`icon${link.href}`} noArrow className="tooltip mob-only" place="right" />
            </li>

          ))}
          {recentViews.length > 0 && (
            <>
              <li className={styles.recent_header}>
                <div className={styles.link}>
                  <span className={styles.icon}>
                    <Eye />
                  </span>
                  <span className={styles.title}>{i18n('Недавно просмотренные')}</span>
                </div>
              </li>
              {recentViews.map((item: any) => (
                <li
                  key={`recent_${item.artifactId}`}
                  className={styles.recent}
                >
                  <NavLink
                    to="#"
                    className={styles.link}
                    id={`link-recent-${item.artifactId}`}
                    onClick={async () => {
                      await setRecentView(item.artifactType, item.artifactId).then(() => {
                        doNavigate(getArtifactUrl(item.artifactId, item.artifactType), navigate);
                      });
                    }}
                  >
                    <span className={styles.title}>{item.name.length > 20 ? `${item.name.substring(0, 20)}...` : item.name}</span>
                  </NavLink>
                  {item.name.length > 20 && (
                    <Tooltip anchorId={`link-recent-${item.artifactId}`} noArrow className="tooltip" place="right" content={item.name} delayShow={200} positionStrategy="absolute" />
                  )}
                </li>
              ))}
            </>
          )}
          <li key="/settings">
            <NavLink
              id="iconsettings"
              data-tooltip-content={i18n('Настройки')}
              to="/settings"
              className={classNames(styles.link, styles.settings_link, {
                [styles.link_active]: currPath === '/settings',
              })}
            >
              <span className={styles.icon}>
                <Settings />
              </span>
              <span className={styles.title}>{i18n('Настройки')}</span>
            </NavLink>
            <Tooltip anchorId="iconsettings" noArrow className="tooltip mob-only" place="right" />
          </li>
        </ul>
      ),
    },
  ]);

  useEffect(() => {
    getRecentViews()
      .then((json) => {
        setRecentViews(json);
      })
      .catch(handleHttpError);
  }, [nav]);

  return (
    <div className={styles.aside}>
      <nav>{menu}</nav>

    </div>
  );
};
