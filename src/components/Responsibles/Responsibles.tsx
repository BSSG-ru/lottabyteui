import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { getDomainResponsibles } from '../../services/pages/domains';
import { UserData } from '../../types/user';
import { i18n } from '../../utils';
import styles from './Responsibles.module.scss';
import { ReactComponent as UserIcon } from '../../assets/icons/users-icon.svg';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';



type ResponsiblesProps = {
    domain_id: string | null;
};

export const Responsibles: FC<ResponsiblesProps> = ({ domain_id }) => {

    const [users, setUsers] = useState<UserData[]>([]);
    const [showUserInfoDlg, setShowUserInfoDlg] = useState(false);
    const [userInfoData, setUserInfoData] = useState({ name: '', email: '', description: ''});

    const handleUserInfoDlgClose = () => {
        setShowUserInfoDlg(false);
        return false;
    };

    const showUserInfo = (name: string, description: string, email: string) => {
        setUserInfoData({ name: name, email: email, description: description});
        setShowUserInfoDlg(true);
    };
    
    useEffect(() => {
        if (domain_id) {
            getDomainResponsibles(domain_id).then(json => {
                console.log('responsibles', json);
                setUsers(json);
            })
        } else
            setUsers([]);
    }, [ domain_id ]);

    return <div className={styles.responsibles_widget}>
        <div className={styles.title}>{i18n('Ответственные')}<span className={styles.title_index}>(<span>{users.length}</span>)</span></div>

        {users.map(user => <a key={'r-u-' + user.uid} href="#" onClick={(e) => { e.preventDefault(); e.stopPropagation(); showUserInfo(user.display_name, user.description, user.email); return false; }} className={styles.item}>
            <UserIcon></UserIcon>
            <div className={styles.name}>{user.display_name}</div>
        </a>)}
        <Modal show={showUserInfoDlg} backdrop={false} onHide={handleUserInfoDlgClose} >
            <Modal.Header closeButton>
                <Modal.Title>Данные пользователя {userInfoData.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            E-mail: {userInfoData.email ? (<a href={'mailto:' + userInfoData.email}>{userInfoData.email}</a>) : ('(' + i18n('нет') + ')')}
                <div className={styles.user_desc}>{userInfoData.description}</div>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="primary" onClick={handleUserInfoDlgClose}>Закрыть</Button>
            </Modal.Footer>
      </Modal>
    </div>
}