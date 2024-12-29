import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import styles from './RatingBlock.module.scss';
import { ReactComponent as LikeYellow } from '../../assets/icons/like-yellow.svg';
import { ReactComponent as LikeEmpty } from '../../assets/icons/like-empty.svg';
import { i18n, uuid } from '../../utils';


type RatingBlockProps = {
    rating: number;
    ownRating?: number;
    showRating?: boolean;
    onRateClick?: (rating: number) => void;
};

export const RatingBlock: FC<RatingBlockProps> = ({
    rating,
    ownRating,
    showRating = true,
    onRateClick,
  }) => {
    const [, setRate] = useState<number | null>(0);
    const [hover, setHover] = useState<number | null>(null);
    const stars = [...new Array(5)];
  
    useEffect(() => {
      if (ownRating)
        setRate(ownRating);
      else
        setRate(rating);
    }, [ownRating, rating]);
  
    return (
      <div className={styles.wrapper}>
        {showRating && (<div className={styles.rate_block}>
          <div className={styles.title}>{i18n('Рейтинг')}</div>
          <div className={styles.stars}>
            {stars.map((_, index) => (
              <span
                className={classNames(
                  styles.star,
                  {
                    [styles.star_active]:
                      ownRating ? (hover === null ? index < ownRating : false) : (hover === null ? index < rating : false),
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
                    if (onRateClick)
                      onRateClick(current);
                    return current;
                  });
                }}
                onMouseEnter={() => {
                  if (onRateClick)
                    setHover(() => {
                      const current = index + 1;
                      return current;
                    });
                }}
                onMouseLeave={() => {
                  setHover((prev: number | null) => (prev = null));
                }}
              >
                {((ownRating ? (hover === null ? index < ownRating : false) : (hover === null ? index < rating : false)) || (hover !== null ? index < hover : false)) ? (
                  <LikeYellow />
                ) : (
                  <LikeEmpty />
                )}
              </span>
            ))}
          </div>
        </div>)}
      </div>
      
    );
  };
  
  