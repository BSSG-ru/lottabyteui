/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/anchor-has-content */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from '../../components/Dashboard';
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
        <Dashboard />
      
    </div>
  );
}
