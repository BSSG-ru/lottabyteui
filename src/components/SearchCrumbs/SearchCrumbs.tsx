import React, {
    FC, useState, useEffect,
  } from 'react';
  import classNames from 'classnames';
  import styles from './SearchCrumbs.module.scss';
import { getArtifactListUrl, getArtifactTypeDisplayName, getArtifactUrl } from '../../utils';
import { getEntity, getEntityAttribute } from '../../services/pages/dataEntities';
  
  type SearchCrumbsProps = {
    artifact_id: string;
    artifact_type: string;
    artifact_name: string;
  };

  export const SearchCrumbs: FC<SearchCrumbsProps> = ({ artifact_id, artifact_type, artifact_name }) => {

    const [links, setLinks] = useState<any[]>([]);

    useEffect(() => {
        
        if (artifact_id && artifact_type) {
            switch (artifact_type) {
                case 'entity_attribute':
                    
                    getEntityAttribute(artifact_id).then(json => {
                        getEntity(json.entity.entity_id).then(jsone => {
                            var arr = [];
                            arr.push({ url: getArtifactListUrl('entity'), title: getArtifactTypeDisplayName('entity', true)});
                            arr.push({ url: getArtifactUrl(jsone.metadata.id, 'entity'), title: jsone.metadata.name});
                            arr.push({ url: false, title: artifact_name });
                            setLinks(arr);
                        })
                    });
                    break;
                default: 
                    var arr = [];
                    arr.push({ url: getArtifactListUrl(artifact_type), title: getArtifactTypeDisplayName(artifact_type, true) }); 
                    arr.push({ url: getArtifactUrl(artifact_id, artifact_type), title: artifact_name });
                    setLinks(arr);
                    break;
            }

            
        }
        
    }, [ artifact_id, artifact_type ]);

    return <div className={styles.search_crumbs}>
        {links.map((link, i) => <div className={styles.part} key={`sc-p-${i}`}>
            {i > 0 && (<div className={styles.sep}>/</div>)}
            {link.url ? (
                <a href={link.url} className={styles.link}>{link.title}</a>
            ) : (
                <div className={styles.text}>{link.title}</div>
            )}
        </div>)}
    </div>
  };