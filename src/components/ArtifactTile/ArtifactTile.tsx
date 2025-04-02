import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { getArtifactUrl } from '../../utils';
import { ArtifactInfo } from '../ArtifactInfo';
import styles from './ArtifactTile.module.scss';
import { ReactComponent as Star } from '../../assets/icons/star-y.svg';

type ArtifactTileProps = {
    artifactId: string;
    artifactType: string;
    artifactName: string;
    isInFav?: boolean;
};

export const ArtifactTile: FC<ArtifactTileProps> = ({ artifactId, artifactType, artifactName, isInFav }) => {
    return <a key={'a-tile-' + artifactId} href={getArtifactUrl(artifactId, artifactType)} className={styles.artifact_tile}>
        <div className={styles.top}>
            <ArtifactInfo artifactType={artifactType} type='transparent' />
            {isInFav && (<Star />)}
        </div>
        <div className={styles.head}>
            {artifactName}
        </div>
    </a>
}