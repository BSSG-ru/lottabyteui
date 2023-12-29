import React from 'react';
import { Button } from '../../components/Button';
import styles from './Controls.module.scss';
import { ReactComponent as PlusInCircle } from '../../assets/icons/plus-in-circle.svg';

export function Controls() {
  return (
    <>
      <div
        className={styles.group}
        data-title="Buttons"
      >
        <div className={styles.group_sub}>
          <Button>Text</Button>
          <Button disabled>Text</Button>
        </div>
        <div className={styles.group_sub}>
          <Button icon>
            <PlusInCircle />
            Text
          </Button>
          <Button
            icon
            disabled
          >
            <PlusInCircle />
            Text
          </Button>
        </div>
        <div className={styles.group_sub}>
          <Button size="big">Text</Button>
          <Button
            size="big"
            disabled
          >
            Text
          </Button>
        </div>
      </div>
      <div
        className={styles.group}
        data-title="Tags"
      />
      <div
        className={styles.group}
        data-title="Versions"
      />
    </>
  );
}
