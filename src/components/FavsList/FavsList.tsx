import classNames from 'classnames';
import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { DashboardEntity, UserFavData } from '../../types/artifact';
import { getArtifactTypeDisplayName, getArtifactUrl, handleHttpError, i18n } from '../../utils';
import styles from './FavsList.module.scss';
import { ReactComponent as Star } from '../../assets/icons/star.svg';
import { ArtifactInfo } from '../ArtifactInfo';
import { delFromFav, getFavs } from '../../services/pages/userfav';
import { Autocomplete2 } from '../Autocomplete2';

export type FavsListProps = {
    className?: string;
    title?: string;
};

export const FavsList: FC<FavsListProps> = ({ className, title }) => {
    const [favItems, setFavItems] = useState<UserFavData[]>([]);
    const [filterArtifactType, setFilterArtifactType] = useState('');

    const loadFavs = () => {
        getFavs(filterArtifactType).then(json => {
            setFavItems(json);
        }).catch(handleHttpError);
    }

    const getFilterArtifactTypeOptions = async (s:string) => {
        return [
            {id: '', name: i18n('Все типы объектов')},
            {id: 'domain', name: getArtifactTypeDisplayName('domain')},
            {id: 'system', name: getArtifactTypeDisplayName('system')},
            {id: 'task', name: getArtifactTypeDisplayName('task')},
            {id: 'entity', name: getArtifactTypeDisplayName('entity')},
            {id: 'entity_query', name: getArtifactTypeDisplayName('entity_query')},
            {id: 'entity_sample', name: getArtifactTypeDisplayName('entity_sample')},
            {id: 'data_asset', name: getArtifactTypeDisplayName('data_asset')},
            {id: 'indicator', name: getArtifactTypeDisplayName('indicator')},
            {id: 'business_entity', name: getArtifactTypeDisplayName('business_entity')},
            {id: 'product', name: getArtifactTypeDisplayName('product')},
            {id: 'dq_rule', name: getArtifactTypeDisplayName('dq_rule')},
            {id: 'metadata', name: getArtifactTypeDisplayName('metadata')},
        ].filter(item => !s || item.name.toLowerCase().indexOf(s.toLowerCase()) != -1);
    }

    useEffect(() => {
        loadFavs();
    }, [ filterArtifactType ]);

    const starClick = (artifact_id: string) => {
        delFromFav(artifact_id).then(() => {
            loadFavs();
        }).catch(handleHttpError);
    }

    return <div className={classNames(styles.favs_list, className )}>
    <div className={classNames(styles.block, styles.fav)}>
        {title && (<h2>{title}</h2>)}
        <div className={styles.filter}>
            <Autocomplete2 className={styles.select} defaultInputValue={filterArtifactType ? getArtifactTypeDisplayName(filterArtifactType) : i18n('Все типы объектов') } getOptions={getFilterArtifactTypeOptions} 
            defaultOptions onChanged={(data: any) => {
                setFilterArtifactType(data.id);
            }} />
        </div>
        <div className={styles.list}>
            {favItems.map(item => <div key={'fav-' + item.id} className={styles.item}>
                <div className={styles.head}>
                    <a href={getArtifactUrl(item.artifact_id, item.artifact_type)}><h3 title={item.artifact_name}>{item.artifact_name}</h3></a><div title={i18n('Удалить из избранного')} className={styles.star} onClick={() => starClick(item.artifact_id)}><Star /></div>
                </div>
                <ArtifactInfo artifactType={item.artifact_type} />
            </div>)}
        </div>
    </div>
</div>
}