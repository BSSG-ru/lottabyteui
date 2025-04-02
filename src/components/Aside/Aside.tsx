/* eslint-disable react/function-component-definition */
import classNames from 'classnames';
import React, { FC, useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Tooltip } from 'react-tooltip';

import { ReactComponent as Domains } from '../../assets/icons/domains-icon.svg';
import { ReactComponent as Drafts } from '../../assets/icons/drafts-icon.svg';
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
import { ReactComponent as Minimize } from '../../assets/icons/aside-minimize.svg';
import { ReactComponent as Maximize } from '../../assets/icons/aside-maximize.svg';
import { ReactComponent as DQRules } from '../../assets/icons/dq-rule.svg';

import styles from './Aside.module.scss';
import { urls } from '../../mocks/urls';
import { doNavigate, getArtifactUrl, getCookie, handleHttpError, i18n, setCookie } from '../../utils';
import { getArtifactsCount } from '../../services/pages/artifacts';
import { getRecentViews, setRecentView } from '../../services/pages/recentviews';
import { userInfoRequest } from '../../services/auth';

export const Aside: FC = () => {
  const navigate = useNavigate();
  const [isMinimized, setMinimized] = useState(getCookie('side-min') === 'true');
  const [recentViews, setRecentViews] = useState<any[]>([]);
  const [showSettings, setShowSettings] = useState(false);

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
    draft: '',
    meta_database: '',
    etl: ''
  });

  const nav = useLocation();
  const listener = () => {
    let limit_steward = false;
    let is_steward = false;
    const lss = (window as any).limitStewardSwitch;
    if (lss) {
      limit_steward = lss.state.limitSteward;
      is_steward = lss.state.isSteward;
    }
    getArtifactsCount(limit_steward && is_steward).then((json) => {
      setCount(json);
    });
  };

  const [isAdvancedMode, setAdvancedMode] = useState(getCookie('top-dash-adv') == 'true');
  const [currPath, setCurrPath] = useState('/');
  const [links, setLinks] = useState<any[]>([]);
  useEffect(() => {
    document.addEventListener('countUpdateNeeded', listener, false);
    window.addEventListener('limitStewardChanged', (e) => {
      getArtifactsCount((e as any).limitSteward && (e as any).isSteward).then((json) => {
        setCount(json);
      });
    });
    const pathParts = nav.pathname.split('/');
    const first = pathParts[1];
    if (first === 'settings' && pathParts.length > 2) setCurrPath(`/${first}/${pathParts[2]}`);
    else setCurrPath(first);

    listener();
  }, [nav.pathname]);

  useEffect(() => {
    window.addEventListener('dashboardModeChanged', function (e) {
      setAdvancedMode((e as any).showAdvanced);
    })
  }, []);

  useEffect(() => {
    userInfoRequest().then(resp => {
      resp.json().then(data => {
        var arr = [
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
            advanced: true
          },
          {
            icon: <Tasks />,
            title: urls[1].tasks,
            href: 'tasks',
            count: count.task,
            advanced: true
          },
          {
            icon: <LogicObjects />,
            title: urls[1]['logic-objects'],
            href: 'logic-objects',
            count: count.entity,
            advanced: true
          },
          {
            icon: <Queries />,
            title: urls[1].queries,
            href: 'queries',
            count: count.entity_query,
            advanced: true
          },
          {
            icon: <Samples />,
            title: urls[1].samples,
            href: 'samples',
            count: count.entity_sample,
            advanced: true
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
            icon: <Indicators />,
            title: urls[1].etls,
            href: 'etl',
            count: count.etl,
            advanced: true
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
            advanced: true
          },
          {
            icon: <LogicObjects />,
            title: urls[1].metadata,
            href: 'metadata',
            count: count.meta_database,
            advanced: true
          }
        ];
      
        if (data.permissions.filter((x:String) => x == 'task_r').length > 0)
          arr.push({
            icon: <Drafts />,
            title: urls[1].draft,
            href: 'drafts',
            count: count.draft
          });
        setShowSettings(data.permissions.filter((x:String) => x == 'settings_r').length > 0);

        setLinks(arr);
      });
    })
  }, [ count ]);

  
  

  useEffect(() => {
    var e2 = document.createEvent('HTMLEvents');
    e2.initEvent('asideResized', true, true);
    (e2 as any).eventName = 'asideResized';
    window.dispatchEvent(e2);
  }, [ isMinimized ])

  useEffect(() => {
    getRecentViews()
      .then((json) => {
        setRecentViews(json);
      })
      .catch(handleHttpError);
  }, [nav]);

  return (
    <div className={classNames(styles.aside, { [styles.minimized]: isMinimized })}>
      <nav>
        <ul>
            {links.filter(lnk => !lnk.advanced || isAdvancedMode).map((link) => (
                <li key={link.href + '-' + isAdvancedMode}>
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
                    {!isMinimized && (<span className={styles.title}>{i18n(link.title)}</span>)}
                    {!isMinimized && (<span className={styles.count}>{link.count}</span>)}

                  </a>
                  <Tooltip anchorId={`icon${link.href}`} noArrow className="tooltip mob-only" place="right" />
                </li>
            ))}
            {recentViews.length > 0 && !isMinimized && (
              <>
                <li className={styles.recent_header}>
                  <div className={styles.link}>
                    <span className={styles.icon}>
                      <Eye />
                    </span>
                    <span className={styles.title}>{i18n('Просмотрено')}</span>
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
                      <span className={styles.title}>{item.name.length > 18 ? `${item.name.substring(0, 18)}...` : item.name}</span>
                    </NavLink>
                    {item.name.length > 20 && (
                      <Tooltip anchorId={`link-recent-${item.artifactId}`} noArrow className="tooltip" place="right" content={item.name} delayShow={200} positionStrategy="absolute" />
                    )}
                  </li>
                ))}
              </>
            )}
            {isAdvancedMode && showSettings && (
              <li key="/settings">
                <NavLink
                  id="iconsettings"
                  data-tooltip-content={i18n('Администрирование')}
                  to="/settings"
                  className={classNames(styles.link, styles.settings_link, {
                    [styles.link_active]: currPath === '/settings',
                  })}
                >
                  <span className={styles.icon}>
                    <Settings />
                  </span>
                  {!isMinimized && (<span className={styles.title}>{i18n('Администрирование')}</span>)}
                </NavLink>
                <Tooltip anchorId="iconsettings" noArrow className="tooltip mob-only" place="right" />
              </li>
            )}
            {!isMinimized && (
            <li key="/minimize">
              <a href='#' onClick={(e) => { e.preventDefault(); setMinimized(true); setCookie('side-min', 'true') }} className={classNames(styles.link, styles.minimize_link)}>
                <span className={styles.icon}>
                  <Minimize />
                </span>
                {!isMinimized && (<span className={styles.title}>{i18n('Свернуть')}</span>)}
              </a>
            </li>
            )}
            {isMinimized && (
            <li key="/maximize">
              <a href='#' onClick={(e) => { e.preventDefault(); setMinimized(false); setCookie('side-min', 'false'); }} className={classNames(styles.link, styles.maximize_link)}>
                <span className={styles.icon}>
                  <Maximize />
                </span>
              </a>
            </li>
            )}
          </ul>
      </nav>

    </div>
  );
};
