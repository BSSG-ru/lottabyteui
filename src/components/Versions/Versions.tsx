/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-return-assign */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/function-component-definition */
import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { i18n, uuid } from '../../utils';
import { ReactComponent as Star } from '../../assets/icons/star.svg';
import styles from './Versions.module.scss';
import { stringify } from 'querystring';
import { Navigate, useNavigate } from 'react-router';

export type VersionData = {
  name: string;
  description: string;
  version_id: string;
  created_at: string;
};

type VersionsProps = {
  rating: number;
  ownRating: number;
  showRating?: boolean;
  version_id: string;
  versions: VersionData[];
  version_url_pattern?: string;
  root_object_url?: string;
  onRateClick: (rating: number) => void;
};

export const Versions: FC<VersionsProps> = ({
  rating,
  ownRating,
  showRating = true,
  version_id,
  versions,
  version_url_pattern,
  root_object_url,
  onRateClick,
}) => {
  const [, setRate] = useState<number | null>(0);
  const [hover, setHover] = useState<number | null>(null);
  const stars = [...new Array(5)];

  const navigate = useNavigate();

  useEffect(() => {
    setRate(ownRating);
  }, [ownRating]);

  return (
    <div className={styles.wrapper}>
      {showRating && (<div className={styles.rate_block}>
        <div className={styles.rate_header}>
          <span className={styles.header_item}>
            <span className={styles.header_title}>{i18n('Рейтинг')}</span>
            <span className={classNames(styles.header_value, styles.header_value_marked)}>
              {rating}
            </span>
          </span>
          <span className={styles.header_item}>
            <span className={styles.header_title}>{i18n('Версия')}</span>
            <span className={styles.header_value}>{version_id}</span>
          </span>
        </div>
        <div className={styles.stars}>
          {stars.map((_, index) => (
            <span
              className={classNames(
                styles.star,
                {
                  [styles.star_active]:
                    ownRating !== null && hover === null ? index < ownRating : false,
                },
                { [styles.star_hover]: hover !== null ? index < hover : false },
              )}
              key={uuid()}
              onClick={() => {
                setRate((prev: number | null) => {
                  let current = index + 1;
                  if (prev === current) {
                    current = 0;
                  }
                  onRateClick(current);
                  return current;
                });
              }}
              onMouseEnter={() => {
                setHover(() => {
                  const current = index + 1;
                  return current;
                });
              }}
              onMouseLeave={() => {
                setHover((prev: number | null) => (prev = null));
              }}
            >
              <Star />
            </span>
          ))}
        </div>
      </div>)}
      <div className={styles.versions}>
        <div className={styles.versions_title}>
          {i18n('Версии')}
          <span className={styles.versions_title_index}>
            (
            <span>{versions.length}</span>
            )
          </span>
        </div>
        <div className={styles.versions_wrapper}>
          {versions.map((version) => (
            <a href='#'
              onClick={(e) => { e.preventDefault(); navigate(version_id == version.version_id ? (root_object_url ?? '') : (version_url_pattern ? version_url_pattern.replaceAll('{version_id}', version.version_id) : '')); }}
              key={uuid()}
              className={classNames( styles.version, { [styles.active] : (version_id == version.version_id) } )}
            >
              <div className={styles.version_title}>
                {`${i18n('Версия')} ${version.version_id}`}
              </div>
              <div className={styles.version_create}>
                {`${i18n('Создана')} ${version.created_at}`}
              </div>
              <div className={styles.version_description}>
                <span>{i18n('Номер версии:')}</span>
                <span className={styles.version_description_text}>{version.version_id}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
