import React, { FC, KeyboardEvent, useEffect, useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { getRole } from '../../services/pages/roles';
import { getUserByLogin } from '../../services/pages/users';
import { getCookie, handleHttpError, i18n, setCookie } from '../../utils';
import styles from './LimitStewardSwitch.module.scss';

export type LimitStewardSwitchProps = {
    ref: React.Ref<HTMLElement>
};

export class LimitStewardSwitch extends React.Component<{ cookieKey: string }, { limitSteward: boolean, isSteward: boolean }> {
    constructor(props: any) {
        super(props);
        this.state = { limitSteward: getCookie(this.props.cookieKey + '-ls') == 'true', isSteward: false };
        (window as any).limitStewardSwitch = this;

        const login = getCookie('login');
        if (login) {
            getUserByLogin(login).then(json => {
                let emitEvent = false;
                const oldLimitSteward = this.state.limitSteward;
                if (json && json.steward_id) {
                    this.setState({ isSteward: true, limitSteward: this.state.limitSteward });
                    
                } else {
                    if (oldLimitSteward)
                        emitEvent = true;
                    this.setState({ isSteward: false, limitSteward: false });
                }

                if (emitEvent) {
                    let e = document.createEvent('HTMLEvents');
                    e.initEvent('limitStewardChanged', true, true);
                    (e as any).eventName = 'limitStewardChanged';
                    (e as any).limitSteward = !oldLimitSteward;
                    window.dispatchEvent(e);
                }
            });
        }
    }
    

    getLimitSteward = () => {
        return this.state.limitSteward;
    };

    setLimitSteward = (v:boolean) => {
        this.setState({ limitSteward: v, isSteward: this.state.isSteward });
    };

    render() {
        return (
            <div>
            {this.state.isSteward && (
                <div className={styles.steward_switch + (!this.state.limitSteward ? ' ' + styles.checked : '')}>
                    <div id="steward-switch-bg" className={styles.switch_bg} data-tooltip-content={ this.state.limitSteward ? i18n('Показывать все') : i18n('Показывать мои')} onClick={() => {  
                    let v = !this.state.limitSteward;
                    setCookie(this.props.cookieKey + '-ls', '' + v, { expires: 3600 * 24 * 30 });
                    this.setState({ limitSteward: v });
                    let e = document.createEvent('HTMLEvents');
                    e.initEvent('limitStewardChanged', true, true);
                    (e as any).eventName = 'limitStewardChanged';
                    (e as any).limitSteward = v;
                    window.dispatchEvent(e);
                }}>
                    <div id="steward-switch-handler" className={styles.switch_handler}></div>
                    </div>
                    <Tooltip anchorId={'steward-switch-bg'} noArrow className="tooltip" place='right' delayShow={200} />
                </div>
            )}
            </div>);
    }

};