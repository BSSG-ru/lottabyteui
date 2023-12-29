/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/function-component-definition */
import React, { FC, useState } from 'react';

import styles from './Tabs.module.scss';

type TabsProps = {
  tabs: [] | TabProp[],
  tabNumber?: number,
  onTabChange?: (tab: number) => void;
};

export type TabProp = { key: string; title: string; content: React.ReactNode, id? : number };

export const Tabs: FC<TabsProps> = ({ tabs, tabNumber = 1, onTabChange = () => {} }) => {
  for (let i = 0; i < tabs.length; i += 1) {
    tabs[i].id = i + 1;
  }

  const [activeTab, setActiveTab] = useState(tabs[tabNumber - 1].id);

  const tabClick = (tab: TabProp) => {
    setActiveTab(() => tab.id);
    onTabChange(Number(tab.id));
  };

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
            {tab.title}
          </li>
        ))}
      </ul>
      {tabs.map((tab: TabProp) => (
        <div
          key={`${tab.key}-content`}
          className={styles.tabContent}
          style={{ display: tab.id === activeTab ? 'block' : 'none' }}
        >
          {tab.content}
        </div>
      ))}
    </div>
  );
};
