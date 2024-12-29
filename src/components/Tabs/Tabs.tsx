/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/function-component-definition */
import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';

import styles from './Tabs.module.scss';

type TabsProps = {
  tabs: [] | TabProp[],
  tabNumber?: number,
  onTabChange?: (tab: number) => void;
};

export type TabProp = { key: string; title: string; content: React.ReactNode, id? : number, unscrollable?: boolean };

export const Tabs: FC<TabsProps> = ({ tabs, tabNumber = 1, onTabChange = () => {} }) => {
  for (let i = 0; i < tabs.length; i += 1) {
    tabs[i].id = i + 1;
  }

  const [activeTab, setActiveTab] = useState(tabs && tabs[tabNumber - 1] ? tabs[tabNumber - 1].id : 0);

  const tabClick = (tab: TabProp) => {
    setActiveTab(() => tab.id);
    onTabChange(Number(tab.id));
  };

  useEffect(() => {
    if (tabs && tabs[tabNumber - 1])
    setActiveTab(() => tabs[tabNumber - 1].id);
  }, [ tabs ]);

  if (tabs.length === 1 && tabs[0].key === 'null' && tabs[0].title === 'null') {
    return <> </>;
  }

  return (
    <div className={styles.tabcontrol}>
      <ul className={styles.tabsList}>
        {tabs.map((tab: TabProp) => (
          <li
            key={tab.key}
            className={`${styles.tab} ${tab.id === activeTab ? styles.active : ''}`}
            onClick={() => tabClick(tab)}
          >
            <div dangerouslySetInnerHTML={{__html: tab.title}}></div>
          </li>
        ))}
      </ul>
      {tabs.map((tab: TabProp) => (
        <div
          key={`${tab.key}-content`}
          className={classNames(styles.tabContent, { [styles.unscrollable] : tab.unscrollable })}
          style={{ display: tab.id === activeTab ? 'flex' : 'none' }}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};
