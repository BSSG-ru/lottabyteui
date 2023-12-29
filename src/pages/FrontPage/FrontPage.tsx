/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import useUrlState from '@ahooksjs/use-url-state';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../../components/Dashboard';
import { doNavigate, getTablePageSize, handleHttpError, i18n, updateArtifactsCount } from '../../utils';
import { Domains } from '../Domains';
import styles from './FrontPage.module.scss';

export function FrontPage() {
  const navigate = useNavigate();

  const [showAdvanced, setShowAdvanced] = useState((window as any).dashboardSwitch ? (window as any).dashboardSwitch.getShowAdvanced() : true);

  useEffect(() => {
    window.addEventListener('dashboardModeChanged', function (e) {
      setShowAdvanced((e as any).showAdvanced);
    })
  }, []);

  return (
    <div className={styles.page}>
      {!showAdvanced && (<div className={styles.dashboard}>
        <Dashboard />
      </div>)}
      {showAdvanced && (<div className={styles.domains}>
        <Domains />
      </div>)}
    </div>
  );
}
