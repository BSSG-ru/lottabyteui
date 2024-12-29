import useUrlState from '@ahooksjs/use-url-state';
import classNames from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { setRecentView } from '../../services/pages/recentviews';
import { handleHttpError, i18n, loadEditPageData, rateClickedHandler, setBreadcrumbEntityName, setDataModified, updateArtifactsCount, updateEditPageReadOnly } from '../../utils';
import { ArtifactAuthor } from '../ArtifactAuthor';
import { ArtifactInfo } from '../ArtifactInfo';
import { Button } from '../Button';
import { DeleteObjectModal } from '../DeleteObjectModal';
import { RatingBlock } from '../RatingBlock';
import { StaticNoticesArea } from '../StaticNoticesArea';
import { TabProp, Tabs } from '../Tabs/Tabs';
import { TagProp } from '../Tags';
import { VersionData, Versions } from '../Versions';
import { WFItemControl } from '../WFItemControl/WFItemControl';
import styles from './EditPage.module.scss';

export type EditPageProps = {
    data: any;
    tabs: TabProp[];
    objectId: string;
    objectVersionId: string;
    restoreVersion?: (objectId: string, objectVersionId: string) => any;
    urlSlug: string;
    setData: (data: any) => void;
    isReadOnly: boolean;
    setReadOnly: (v:boolean) => void;
    updateObject: (id: string, data: any) => any;
    archiveObject?: (id: string) => any;
    restoreObject?: (id: string) => any;
    artifactType: string;
    setTags?: (tags: TagProp[]) => void;
    getObjectVersion?: (id: string, versionId: string) => Promise<any>;
    getObjectVersions?: (id: string) => any;
    getObject: (id: string) => any;
    deleteObject?: (id: string) => any;
    onLoadDataComplete?: (json:any) => void;
    noRecentViews?: boolean;
    noRating?: boolean;
};

export const EditPage: FC<EditPageProps> = ({
    data,
    tabs,
    objectId,
    objectVersionId,
    restoreVersion,
    urlSlug,
    setData,
    isReadOnly,
    setReadOnly,
    updateObject,
    archiveObject,
    restoreObject,
    artifactType,
    setTags,
    getObjectVersion,
    getObject,
    getObjectVersions,
    deleteObject,
    onLoadDataComplete = (json) => {},
    noRating = false,
    noRecentViews = false
}) => {
    const navigate = useNavigate();
    const [state, setState] = useUrlState({
        sc: 1, t: '1', dm: '1', p1: '1', p2: '1', p3: '1', p4: '1', p5: '1', p6: '1', p7: '1', p8: '1',
        }, { navigateMode: 'replace' });
        
    const [, setLoading] = useState(true);
    const [isLoaded, setLoaded] = useState(false);
    const [isWFLoading, setWFLoading] = useState<boolean>(false);

    const [delObjectData, setDelObjectData] = useState<any>({ id: '', name: '' });
    const [showDelDlg, setShowDelDlg] = useState(false);

    const [ratingData, setRatingData] = useState({ rating: 0, total_rates: 0 });
    const [ownRating, setOwnRating] = useState(0);
    const [versions, setVersions] = useState<VersionData[]>([]);

    const archiveBtnClicked = () => { 
        setWFLoading(true);
        
        if (archiveObject)
          archiveObject(data.metadata.id).then((json:any) => {
            if (json.metadata.id && json.metadata.id != objectId) {
              navigate(`/${urlSlug}/edit/${encodeURIComponent(json.metadata.id)}`);
            }
            setDataModified(false);
            setWFLoading(false);
          }).catch(handleHttpError); };

    const restoreBtnClicked = () => { if (restoreObject) restoreObject(data.metadata.id).then((json:any) => {
        if (json.metadata.id && json.metadata.id != objectId) {
          navigate(`/${urlSlug}/edit/${encodeURIComponent(json.metadata.id)}`);
        }
        setDataModified(false);
      }).catch(handleHttpError); };

    const loadData = () => {
        if (objectId) {
            if (!objectVersionId && !noRecentViews) { setRecentView(artifactType, objectId); }

            loadEditPageData(objectId, objectVersionId, setData, setTags, setLoading, setLoaded, getObjectVersion, getObject,
            noRating ? null : setRatingData, noRating ? null : setOwnRating, getObjectVersions, setVersions, setReadOnly, onLoadDataComplete);
            
        }
    }

    const postSaveRequest = async () => {
        if (objectId) {
          return await updateObject(objectId, data.entity)
            .then((json:any) => {
              (window as any).notices.addNotice('info', 'Данные сохранены');
              return json;
            })
            .catch(handleHttpError).finally(() => setWFLoading(false));
        } else
          return undefined;
      }

    const saveData = async () => {
        setWFLoading(true);
    
        await postSaveRequest().then((json:any) => {
          setDataModified(false);
          //setReadOnly(true);
          
          if (json && json.metadata.id && json.metadata.id !== objectId) {
            window.location.href = `/${urlSlug}/edit/${encodeURIComponent(json.metadata.id)}`;
          }
          
        }).catch(handleHttpError);
    
      }

    const delDlgSubmit = () => {
    setShowDelDlg(false);
    if (deleteObject)
      deleteObject(delObjectData.id)
        .then((json:any) => {
          updateArtifactsCount();

          if (json.metadata && json.metadata.id)
            navigate(`/${urlSlug}/edit/` + encodeURIComponent(json.metadata.id));
          else
            navigate(`/${urlSlug}`);
        })
        .catch(handleHttpError);
    setDelObjectData({ id: '', name: '' });
    };

    useEffect(() => {
        loadData();
      }, [objectId, objectVersionId]);

    return (
        <div className={classNames(styles.page, styles.transparent, { [styles.loaded]: isLoaded })}>
          <div className={styles.title_row}>
            <h1 className={styles.title}>{data.entity.name}</h1>
            <div className={styles.buttons}>
              {objectVersionId && restoreVersion && (
                <Button onClick={() => {
                  restoreVersion(objectId, objectVersionId).then((json:any) => {
                    setDataModified(false);
                    if (json.metadata.id && json.metadata.id !== objectId) {
                      navigate(`/${urlSlug}/edit/${encodeURIComponent(json.metadata.id)}`);
                    } else { setData(json); }
                  }).catch(handleHttpError);
                }}>{i18n('Восстановить')}</Button>
              )}
              {!objectVersionId && (
                <WFItemControl
                  key={`wfc-prod-` + data?.metadata?.workflow_task_id ?? '0'}
                  itemMetadata={data.metadata}
                  itemIsReadOnly={isReadOnly}
                  saveItem={postSaveRequest}
                  isLoading={isWFLoading}
                  onEditClicked={() => { setReadOnly(false); setDataModified(true); }}
                  onArchiveClicked={archiveObject ? archiveBtnClicked : undefined}
                  onRestoreClicked={restoreObject ? restoreBtnClicked : undefined}
                  onDeleteClicked={ deleteObject ? () => { setDelObjectData({ id: data.metadata.id, name: data.entity.name }); setShowDelDlg(true); } : undefined}
                  onCancelEditClicked={() => { loadData(); }}
                  onSaveClicked={saveData}
                  onObjectIdChanged={(id) => {
                    if (id) {
                      navigate(`/${urlSlug}/edit/${id}`);
                    } else {
                      /*if (data.metadata.published_id)
                        navigate(`/${urlSlug}/edit/${data.metadata.published_id}`);
                      else*/
                        navigate(`/${urlSlug}/`);
                    }
                  }}
                  onObjectDataChanged={(d) => {
                    setData(d);
                    setDataModified(false);
                    setBreadcrumbEntityName(objectId, d.entity.name);
                    if (setTags)
                      setTags(d.metadata.tags ? d.metadata.tags.map((x: any) => ({ value: x.name })) : []);
                    updateEditPageReadOnly(d, setReadOnly, () => {  });
                  }}
                />
              )}
            </div>
          </div>
          <div className={styles.artifact_info_row}>
            <ArtifactInfo artifactType={artifactType} state={data.metadata.state} favControl={artifactType != 'user'} artifactId={objectId} />
            {(data.metadata.state == 'PUBLISHED' || data.metadata.state == 'ARCHIVED' || data.metadata.state == 'DRAFT_HISTORY') && getObjectVersions && (
              <Versions
                version_id={objectVersionId || data.metadata.version_id}
                versions={versions}
                version_url_pattern={`/${urlSlug}/${encodeURIComponent(objectId)}/version/{version_id}`}
                root_object={{id: objectId, artifact_type: artifactType}}
              />
            )}
            {(data.metadata.state == 'PUBLISHED' || data.metadata.state == 'ARCHIVED') && !noRating && (
              <RatingBlock rating={ratingData.rating} ownRating={ownRating} showRating 
                onRateClick={r => rateClickedHandler(r, objectId, artifactType, setOwnRating, setRatingData)}
              />
            )}
            <ArtifactAuthor userId={data.metadata.created_by} />
          </div>
          <StaticNoticesArea />
          <Tabs onTabChange={(t: number) => { setState(() => ({ sc: t })); }} tabNumber={state.sc} tabs={tabs} />
          
          <DeleteObjectModal show={showDelDlg} objectTitle={delObjectData.name} onClose={() => { setShowDelDlg(false); return false; }} onSubmit={delDlgSubmit} />
        </div>
      );
}