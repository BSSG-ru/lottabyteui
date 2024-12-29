import { FC, useCallback, useEffect, useRef, useState } from 'react';

import styles from './Dashboard.module.scss';
import React from 'react';
import { getDashboardFavorites, getDashboardPopular, getDashboardRecommended } from "../../services/pages/artifacts";
import { getArtifactUrl, handleHttpError, i18n, uuid } from "../../utils";
import { ArtifactInfo } from '../ArtifactInfo';
import { ReactComponent as SliderDot } from '../../assets/icons/slider-dot.svg';
import { ReactComponent as SliderDotActive } from '../../assets/icons/slider-dot-active.svg';
import { ReactComponent as SliderRight } from '../../assets/icons/slider-right.svg';
import { ReactComponent as Star } from '../../assets/icons/star-y.svg';
import classNames from 'classnames';
import Carousel, { ArrowProps, ButtonGroupProps } from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { RatingBlock } from '../RatingBlock';
import { ArtifactAuthor } from '../ArtifactAuthor';
import { FavsList } from '../FavsList/FavsList';
import { DashboardEntity } from '../../types/artifact';



export type DashboardProps = {};


type CustomDotProps = {
    onClick?: any;
    onMove?: boolean;
    index?: number;
    active?: boolean;
    carouselState?: any;
};

const CustomDot = (props: CustomDotProps) => {
    // onMove means if dragging or swiping in progress.
    // active is provided by this lib for checking if the item is active or not.
    return (
      <button
        className={styles.dot}
        onClick={() => props.onClick()}
      >
        {props.active ? (<SliderDotActive />) : (<SliderDot />)}
      </button>
    );
  };

const CustomArrows = (props: ButtonGroupProps) => {
    return <div className={styles.custom_arrows}>
        <button className={styles.left} onClick={props.previous}><SliderRight /></button>
        <button className={styles.right} onClick={props.next}><SliderRight /></button>
    </div>
}

export const Dashboard: FC<DashboardProps> = ({}) => {
    const [recommendedItems, setRecommendedItems] = useState<DashboardEntity[]>([]);
    const [popularItems, setPopularItems] = useState<DashboardEntity[]>([]);
    const [favItems, setFavItems] = useState<DashboardEntity[]>([]);
    const [key1, setKey1] = useState(uuid());
    const [key2, setKey2] = useState(uuid());

    useEffect(() => {
        
        getDashboardRecommended().then(json => {
            setRecommendedItems(json.slice(0, 10));
        }).catch(handleHttpError);

        getDashboardPopular().then(json => {
            setPopularItems(json);
        }).catch(handleHttpError);

        getDashboardFavorites().then(json => {
            setFavItems(json);
        }).catch(handleHttpError);
        
        window.addEventListener('asideResized', (e) => {
            setKey1(uuid());
            setKey2(uuid());
        });
    }, []);

    return <div className={styles.dashboard}>
        <div className={styles.col1}>
            <div className={classNames(styles.block, styles.popular)}>
                <h2>{i18n('Популярное')}</h2>
                <Carousel key={key1} responsive={{ desktop: { breakpoint: { max: 5000, min: 0 }, items: 1, slidesToSlide: 1 }}} className={styles.carousel} swipeable draggable showDots arrows={false} customDot={<CustomDot />} autoPlay autoPlaySpeed={8000}>
                    {popularItems.map(item => <div key={'pop-' + item.id} className={styles.popular_item}>
                        <a href={getArtifactUrl(item.id, item.artifactType)} className={styles.lnk}>
                            <h3>{item.name}</h3>
                            {item.description && (<div className={styles.desc}>{item.description}</div>)}
                            <div className={styles.info}>
                                <ArtifactInfo artifactType={item.artifactType} />
                                <RatingBlock rating={item.rating ?? 0} showRating />
                                <ArtifactAuthor userId={item.createdBy} />
                            </div>
                        </a>
                    </div>)}
                </Carousel>
            </div>
            <div className={classNames(styles.block, styles.recommended)}>
                <h2>{i18n('Рекомендации')}</h2>
                <Carousel key={key2} responsive={{ desktop: { breakpoint: { max: 5000, min: 0 }, items: 6, slidesToSlide: 1 }}} className={styles.carousel} swipeable draggable arrows={false} customButtonGroup={<CustomArrows />} renderButtonGroupOutside>
                    {recommendedItems.map(item => <a key={'rec-' + item.id} href={getArtifactUrl(item.id, item.artifactType)} className={styles.rec_item}>
                        <div className={styles.top}>
                            <ArtifactInfo artifactType={item.artifactType} type='transparent' />
                            {item.isInFav && (<Star />)}
                        </div>
                        <div className={styles.head}>
                            {item.name}
                        </div>
                        
                    </a>)}
                </Carousel>
            </div>
        </div>
        <FavsList className={classNames(styles.col2, styles.block)} title={i18n('Избранное')} />
    </div>;
};
