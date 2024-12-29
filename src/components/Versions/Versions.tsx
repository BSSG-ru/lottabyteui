/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-return-assign */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/function-component-definition */
import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { getArtifactUrl, handleHttpError, i18n, uuid } from '../../utils';
import styles from './Versions.module.scss';
import Modal from 'react-bootstrap/Modal';
import { useNavigate } from 'react-router';
import Button from 'react-bootstrap/Button';
import { Dropdown } from 'react-bootstrap';
import { getProduct } from '../../services/pages/products';
import { getEntity } from '../../services/pages/dataEntities';
import { getMetaDatabase } from '../../services/pages/metadata';
import { getDomain } from '../../services/pages/domains';
import { getSystem } from '../../services/pages/systems';
import { getTask } from '../../services/pages/tasks';
import { getEntityQuery } from '../../services/pages/entityQueries';
import { getSample } from '../../services/pages/samples';
import { getAsset } from '../../services/pages/dataAssets';
import { getIndicator } from '../../services/pages/indicators';
import { getBusinessEntity } from '../../services/pages/businessEntities';
import { getDQRule } from '../../services/pages/dqRules';

export type VersionData = {
  name: string;
  description: string;
  version_id: string;
  created_at: string;
  modifier_display_name: string | null;
  modifier_email: string | null;
  modifier_description: string | null;
};

export type VersionRootObject = {
  id: string;
  artifact_type: string;
};

type VersionsProps = {
  version_id: string;
  versions: VersionData[];
  version_url_pattern?: string;
  root_object?: VersionRootObject;
};

export const Versions: FC<VersionsProps> = ({
  version_id,
  versions,
  version_url_pattern,
  root_object = undefined
}) => {
  
  const [showUserInfoDlg, setShowUserInfoDlg] = useState(false);
  const [userInfoData, setUserInfoData] = useState({ name: '', email: '', description: ''});
  const [rootObject, setRootObject] = useState<any>(undefined);

  const navigate = useNavigate();

  const handleUserInfoDlgClose = () => {
    setShowUserInfoDlg(false);
    return false;
  };

  const getMdb = async (id:string) => { 
    return await getMetaDatabase(id).then(json => { 
      return { entity: json, metadata: {id: json.id, state: 'PUBLISHED'} }; 
    }); 
  }

  useEffect(() => {
    if (root_object) {
      var f = undefined;
      switch (root_object.artifact_type) {
        case 'product': f = getProduct; break;
        case 'entity': f = getEntity; break;
        case 'domain': f = getDomain; break;
        case 'system': f = getSystem; break;
        case 'task': f = getTask; break;
        case 'entity_query': f = getEntityQuery; break;
        case 'entity_sample': f = getSample; break;
        case 'data_asset': f = getAsset; break;
        case 'indicator': f = getIndicator; break;
        case 'business_entity': f = getBusinessEntity; break;
        case 'dq_rule': f = getDQRule; break;
        case 'meta_database': f = getMetaDatabase; break;
      }
      if (f && root_object.id) {
        f(root_object.id).then(json => { 
          setRootObject(json.metadata ? json : { entity: json, metadata: { id: json.id, state: json.state, version_id: json.version_id } }); 
        }).catch(handleHttpError);
      }
    }
  }, [ root_object ]);

  const showUserInfo = (name: string, description: string, email: string) => {
    setUserInfoData({ name: name, email: email, description: description});
    setShowUserInfoDlg(true);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.versions}>

        <Dropdown className={styles.versions_dd}>
          <Dropdown.Toggle className={styles.toggle}>{i18n('Версия') + ' ' + version_id}</Dropdown.Toggle>
          <Dropdown.Menu className={styles.menu}>
            <Dropdown.Item className={classNames(styles.item, { [styles.current]: rootObject && version_id == rootObject.metadata.version_id })} onClick={(e) => { e.preventDefault(); if (root_object) navigate(getArtifactUrl(root_object.id, root_object.artifact_type)); }}>
              <div className={styles.version_name}>{i18n('Версия')} {rootObject ? rootObject.metadata.version_id : ''}</div>
            </Dropdown.Item>
            {versions.map(version => <Dropdown.Item key={'itm-ver-' + version.version_id} className={classNames(styles.item, { [styles.current]: version_id == version.version_id })} onClick={(e) => { e.preventDefault(); navigate(version_url_pattern ? version_url_pattern.replaceAll('{version_id}', version.version_id) : ''); }}> 
              <div className={styles.version_name}>{i18n('Версия') + ' ' + version.version_id}</div>
              {version.created_at && (<div className={styles.version_date}>{i18n('Создана')} {version.created_at}</div>)}
              {version.modifier_display_name && (<div className={styles.version_responsible}>{`${i18n('Ответственный')}`}: {`${version.modifier_display_name}`}</div>)}
            </Dropdown.Item>)}
          </Dropdown.Menu>
        </Dropdown>
      </div>
      <Modal
        show={showUserInfoDlg}
        backdrop={false}
        onHide={handleUserInfoDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Данные пользователя {userInfoData.name}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          E-mail: {userInfoData.email ? (<a href={'mailto:' + userInfoData.email}>{userInfoData.email}</a>) : ('(' + i18n('нет') + ')')}
          <div className={styles.user_desc}>{userInfoData.description}</div>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={handleUserInfoDlgClose}
          >
            Закрыть
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
    
  );
};
