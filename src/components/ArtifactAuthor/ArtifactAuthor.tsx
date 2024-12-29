import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { getUser } from '../../services/pages/users';
import { handleHttpError } from '../../utils';
import styles from './ArtifactAuthor.module.scss';
import { ReactComponent as AuthorIcon } from '../../assets/icons/author.svg';

type ArtifactAuthorProps = {
    userId: string|undefined;
};

export const ArtifactAuthor: FC<ArtifactAuthorProps> = ({ userId }) => {

    const [userName, setUserName] = useState(undefined);

    useEffect(() => {
        if (userId) {
            getUser(userId).then(json => {
                setUserName(json.display_name);
            }).catch(handleHttpError);
        }
    }, [ userId ]);

    return (
        <>
        {userName ? (
            <div className={styles.artifact_author}>
                <AuthorIcon />
                <div>{userName}</div>
            </div>
        ) : ('')}
        </>
    );
};

