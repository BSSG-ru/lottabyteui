/* eslint-disable react/require-default-props */
import classNames from 'classnames';
import React, { FC } from 'react';
import { uuid } from '../../utils';
import styles from './Loader.module.scss';

type LoaderProps = {
  size?: number;
  className?: string;
};

export const Loader: FC<LoaderProps> = ({ size = 80, className = '' }) => {
  const divsCount = 4;
  const divsInit = [...new Array(divsCount)].map(() => 'init');

  return (
    <div
      className={classNames(styles.lds_ring, { [className]: className })}
      style={{ width: size, height: size }}
    >
      {divsInit.map(() => (
        <div
          key={uuid()}
          style={{ borderWidth: size / 10 }}
        />
      ))}
    </div>
  );
  return <div />;
};
