import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { uuid } from '../../utils';
import styles from './StaticNoticesArea.module.scss';

export type StaticNotice = {
    type: string;
    message: string;
    id: string;
};

export const raiseStaticNotice = (type: string, message: string) => {
    var e = document.createEvent('HTMLEvents');
    e.initEvent('static_notice', true, true);
    (e as any).noticeType = type;
    (e as any).noticeMessage = message;

    window.dispatchEvent(e);
    
}

export const clearStaticNotices = () => {
    var e = document.createEvent('HTMLEvents');
    e.initEvent('static_notices_clear', true, true);

    window.dispatchEvent(e);
    
}

export const StaticNoticesArea: FC<{}> = ({ }) => {
    const [notices, setNotices] = useState<StaticNotice[]>([]);

    useEffect(() => {
        window.addEventListener('static_notice', (e) => {
            const notice_id = uuid();
            setNotices((prev) => ([...prev, { type: (e as any).noticeType, message: (e as any).noticeMessage, id: notice_id }]));
        });

        window.addEventListener('static_notices_clear', (e) => {
            
            setNotices([]);
        });
      }, []);

    const delNotice = (index: number) => {
        setNotices((prev) => ([...prev.filter((x, ind) => { return ind != index; })]));
    };

    return (
        <div className={styles.static_notices_area}>
            {notices.map((item:StaticNotice, index) => (<div key={'notice-' + index} className={classNames(styles.notice, styles[item.type])} ><div dangerouslySetInnerHTML={{__html: item.message}}></div></div>))}
        </div>
    )
};
