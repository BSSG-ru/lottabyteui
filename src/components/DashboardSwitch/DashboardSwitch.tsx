import React, { FC, KeyboardEvent, useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { getCookie, handleHttpError, i18n, setCookie } from '../../utils';
import styles from './DashboardSwitch.module.scss';

export type DashboardSwitchProps = {
    ref: React.Ref<HTMLElement>
};

export class DashboardSwitch extends React.Component<{ cookieKey: string }, { showAdvanced: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { showAdvanced: getCookie(this.props.cookieKey + '-dash-adv') == 'true' };
        (window as any).dashboardSwitch = this;

    }
    

    getShowAdvanced = () => {
        return this.state.showAdvanced;
    };

    setShowAdvanced = (v:boolean) => {
        this.setState({ showAdvanced: v });
    };

    render() {
        return (
            <div>
            
                <div className={styles.dashboard_switch + (!this.state.showAdvanced ? ' ' + styles.checked : '')}>
                    <div id="dashboard-switch-bg" className={styles.switch_bg} data-tooltip-content={ this.state.showAdvanced ? i18n('В простой режим') : i18n('В продвинутый режим')} onClick={() => {  
                    let v = !this.state.showAdvanced;
                    setCookie(this.props.cookieKey + '-dash-adv', '' + v, { expires: 3600 * 24 * 30 });
                    this.setState({ showAdvanced: v });
                    let e = document.createEvent('HTMLEvents');
                    e.initEvent('dashboardModeChanged', true, true);
                    (e as any).eventName = 'dashboardModeChanged';
                    (e as any).showAdvanced = v;
                    window.dispatchEvent(e);
                }}>
                    <div id="dashboard-switch-handler" className={styles.switch_handler}></div>
                    </div>
                    <Tooltip anchorId={'dashboard-switch-bg'} noArrow className="tooltip" place='right' delayShow={200} />
                </div>
            
            </div>);
    }

};