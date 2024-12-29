import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import styles from './ArtifactInfo.module.scss';
import { ReactComponent as Domains } from '../../assets/icons/domains-icon.svg';
import { ReactComponent as Systems } from '../../assets/icons/systems-icon.svg';
import { ReactComponent as LogicObjects } from '../../assets/icons/lo-icon.svg';
import { ReactComponent as Queries } from '../../assets/icons/requests-icon.svg';
import { ReactComponent as Samples } from '../../assets/icons/samples-icon.svg';
import { ReactComponent as Assets } from '../../assets/icons/assets-icon.svg';
import { ReactComponent as Indicators } from '../../assets/icons/indicators-icon.svg';
import { ReactComponent as BusinessEntities } from '../../assets/icons/business-ent-icon.svg';
import { ReactComponent as Products } from '../../assets/icons/products-icon.svg';
import { ReactComponent as Tasks } from '../../assets/icons/tasks-icon.svg';
import { ReactComponent as DQRules } from '../../assets/icons/dq-rule.svg';

import { ReactComponent as UserIco } from '../../assets/icons/user.svg';
import { ReactComponent as ConnectionIco } from '../../assets/icons/connection.svg';
import { ReactComponent as RoleIco } from '../../assets/icons/role.svg';
import { ReactComponent as GroupIco } from '../../assets/icons/group.svg';
import { ReactComponent as WfIco } from '../../assets/icons/workflow.svg';

import { ReactComponent as Star } from '../../assets/icons/star.svg';

import { getArtifactUrl, handleHttpError, i18n, uuid } from '../../utils';
import { getDomain } from '../../services/pages/domains';
import { addToFav, delFromFav, getIsInFav } from '../../services/pages/userfav';


type ArtifactInfoProps = {
    artifactType: string;
    tagNames?: string[];
    state?: string;
    type?: string;
    domain_ids?: string[];
    favControl?: boolean;
    artifactId?: string;
};

export const ArtifactInfo: FC<ArtifactInfoProps> = ({ artifactType, tagNames, state, type, domain_ids, favControl, artifactId }) => {
    const [domainNames, setDomainNames] = useState<string[]>([]);
    const [id, setId] = useState(uuid());
    const [isInFav, setIsInFav] = useState(false);

    useEffect(() => {
        if (domain_ids) {
            const a = [];
            for (let i = 0; i < domain_ids.length; i++) { a.push(''); }
            setDomainNames(a);
        
            domain_ids.forEach((id:string, index:number) => {
                if (id) {
                    getDomain(id).then((json) => {
                        if (json.metadata && json.metadata.state == 'PUBLISHED')
                            setDomainNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'domain')}">${i18n('Домен')} ${json.metadata.name}</a></div>`, ...prev.slice(index + 1)]));
                        else
                            setDomainNames((prev) => ([...prev.slice(0, index), '', ...prev.slice(index + 1)]));
                    }).catch(handleHttpError);
                } else
                    setDomainNames((prev) => ([...prev.slice(0, index), '', ...prev.slice(index + 1)]));
            });
        }
      }, [domain_ids]);

    useEffect(() => {
        if (favControl && artifactId) {
            getIsInFav(artifactId).then(json => {
                setIsInFav(json);
            }).catch(handleHttpError);
        }
    }, [artifactId, favControl]);

    const favClick = () => {
        if (artifactId && artifactType) {
            if (isInFav) {
                delFromFav(artifactId).then(() => {
                    setIsInFav(false);
                }).catch(handleHttpError);
            } else {
                addToFav(artifactId, artifactType).then(() => {
                    setIsInFav(true);
                }).catch(handleHttpError);
            }
        }
    }

    return (
        <div className={styles.artifact_info}>
            <div className={classNames(styles.artifact_type, { [styles.transparent]: type == 'transparent' })}>
                {artifactType == 'domain' && (<><Domains /><div className={styles.name}>{i18n('Домен')}</div></>)}
                {artifactType == 'system' && (<><Systems /><div className={styles.name}>{i18n('Система')}</div></>)}
                {artifactType == 'entity' && (<><LogicObjects /><div className={styles.name}>{i18n('Модель')}</div></>)}
                {artifactType == 'entity_attribute' && (<><LogicObjects /><div className={styles.name}>{i18n('Атрибут модели')}</div></>)}
                {artifactType == 'entity_query' && (<><Queries /><div className={styles.name}>{i18n('Запрос')}</div></>)}
                {artifactType == 'entity_sample' && (<><Samples /><div className={styles.name}>{i18n('Сэмпл')}</div></>)}
                {artifactType == 'data_asset' && (<><Assets /><div className={styles.name}>{i18n('Актив')}</div></>)}
                {artifactType == 'indicator' && (<><Indicators /><div className={styles.name}>{i18n('Показатель')}</div></>)}
                {artifactType == 'business_entity' && (<><BusinessEntities /><div className={styles.name}>{i18n('Глоссарий')}</div></>)}
                {artifactType == 'product' && (<><Products /><div className={styles.name}>{i18n('Продукт')}</div></>)}
                {artifactType == 'task' && (<><Tasks /><div className={styles.name}>{i18n('Задача')}</div></>)}
                {artifactType == 'dq_rule' && (<><DQRules /><div className={styles.name}>{i18n('Правило проверки качества')}</div></>)}
                {artifactType == 'meta_database' && (<><LogicObjects /><div className={styles.name}>{i18n('Метаданные')}</div></>)}
                {artifactType == 'meta_object' && (<><LogicObjects /><div className={styles.name}>{i18n('Метаобъект')}</div></>)}
                {artifactType == 'meta_column' && (<><LogicObjects /><div className={styles.name}>{i18n('Колонка')}</div></>)}
                {artifactType == 'user' && (<><UserIco /><div className={styles.name}>{i18n('Пользователь')}</div></>)}
                {artifactType == 'system_connection' && (<><ConnectionIco /><div className={styles.name}>{i18n('Подключение')}</div></>)}
                {artifactType == 'role' && (<><RoleIco /><div className={styles.name}>{i18n('Роль')}</div></>)}
                {artifactType == 'group' && (<><GroupIco /><div className={styles.name}>{i18n('Группа')}</div></>)}
                {artifactType == 'steward' && (<div className={styles.name}>{i18n('Стюард')}</div>)}
                {artifactType == 'workflow_settings' && (<><WfIco /><div className={styles.name}>{i18n('Процесс')}</div></>)}
            </div>
            {state && (<div className={styles.artifact_state}>{state == 'PUBLISHED' ? 'Опубликован' : ( state == 'ARCHIVED' ? 'Архив' : 'Черновик')}</div>)}
            {domain_ids && (
                <div className={styles.domains}>
                    {domainNames.filter(x => x).map((dn, i) => <div key={`ai-domain-${id}-${i}`} className={styles.domain} dangerouslySetInnerHTML={{__html: dn}}></div>)}
                </div>
            )}
            {favControl && (!state || state == 'PUBLISHED') && (
                <div className={classNames(styles.fav, {[styles.active]: isInFav})} onClick={favClick}>
                    <label>{i18n('Избранное')}</label>
                    <Star />
                </div>
            )}
        </div>
    );
};
