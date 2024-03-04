/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import classNames from 'classnames';
import { RawDraftContentState } from 'draft-js';
import styles from './DQRules.module.scss';
import { handleHttpError, i18n, loadEditPageData, rateClickedHandler, setBreadcrumbEntityName, setDataModified, tagAddedHandler, tagDeletedHandler, updateArtifactsCount, updateEditPageReadOnly } from '../../utils';
import { Versions, VersionData } from '../../components/Versions';

import { FieldEditor } from '../../components/FieldEditor';
import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import {
  createDQRule,
  deleteDQRule,
  getDQRule,
  getDQRuleVersions,
  getDQRuleVersion,
  updateDQRule,
  getRuleTypes,
  getRuleType,
} from '../../services/pages/dqRules';

import { setRecentView } from '../../services/pages/recentviews';
import { WFItemControl } from '../../components/WFItemControl/WFItemControl';
import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';
import { TagProp, Tags } from '../../components/Tags';
import { DQRuleData } from '../../types/data';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';

export function DQRule() {
  const navigate = useNavigate();

  const [, setLoading] = useState(true);

  const [data, setData] = useState<DQRuleData>({
    metadata: { id: '', artifact_type: 'dq_rule', version_id: '', tags: [], state: 'PUBLISHED', published_id: '' },
    entity: {
      name: '', description: '', rule_ref: '', settings: '', rule_type_id: null
    },
  });
  const [ratingData, setRatingData] = useState({ rating: 0, total_rates: 0 });
  const [ownRating, setOwnRating] = useState(0);
  const [versions, setVersions] = useState<VersionData[]>([]);

  const [isCreateMode, setCreateMode] = useState(false);
  const [showValidation, setShowValidation] = useState(false);

  const [isReadOnly, setReadOnly] = useState(true);
  const [isLoaded, setLoaded] = useState(false);

  const { id, version_id } = useParams();

  const [ruleTypes, setRuleTypes] = useState();
  const [dqRuleId, setDQRuleId] = useState<string>(id ?? '');
  const [dqRuleVersionId, setDQRuleVersionId] = useState<string>(version_id ?? '');
  const [tags, setTags] = useState<TagProp[]>([]);

  const [showAddEntityDlg, setShowAddEntityDlg] = useState(false);
  const [newEntityData, setNewEntityData] = useState<any>({
    name: '',
    description: '',
    rule_ref: '',
    settings: '',
  });

  const [showDelDlg, setShowDelDlg] = useState(false);
  const [delData, setDelData] = useState<any>({ id: '', name: '' });

  const handleAddEntityDlgClose = () => {
    setShowAddEntityDlg(false);
    return false;
  };
  const handleDelEntityDlgClose = () => {
    setShowDelDlg(false);
    return false;
  };

  const addDlgSubmit = () => {
    setShowAddEntityDlg(false);
    setLoading(true);
    createDQRule(newEntityData)
      .then(() => {
        setLoading(false);
        updateArtifactsCount();
      })
      .catch(handleHttpError);
    setNewEntityData({ name: '', description: '' });
  };

  const delEntityDlgSubmit = (identity: string) => {
    setShowDelDlg(false);
    setLoading(true);
    deleteDQRule(identity)
      .then(() => {
        setLoading(false);
      })
      .catch(handleHttpError);
    setDelData({ id: '', name: '' });
  };

  useEffect(() => {
    if (id) setDQRuleId(id);
    setDQRuleVersionId(version_id ?? '');
    setDataModified(false);
  }, [id, version_id]);

  const loadDQRuleData = () => {
    loadEditPageData(dqRuleId, dqRuleVersionId, setData, setTags, setLoading, setLoaded, getDQRuleVersion, getDQRule,
      setRatingData, setOwnRating, getDQRuleVersions, setVersions, setReadOnly);

  };

  useEffect(() => {
    setCreateMode(dqRuleId === '');
    if (dqRuleId) {
      if (!dqRuleVersionId) { setRecentView('dq_rule', dqRuleId); }

      loadDQRuleData();
    } else {
      setData((prev) => ({ ...prev, metadata: { ...prev.metadata, state: 'DRAFT' } }));
      setDataModified(false);
      setReadOnly(false);
      setLoaded(true);
    }
  }, [dqRuleId, dqRuleVersionId]);

  useEffect(() => {
    if (isCreateMode) {
      if (data.entity.name && data.entity.rule_type_id) {
        createDQRule({
          name: data.entity.name,
          description: data.entity.description,
          rule_ref: data.entity.rule_ref,
          settings: data.entity.settings,
          rule_type_id: data.entity.rule_type_id
        })
          .then((json) => {
            setDataModified(false);
            if (json.metadata.id) {
              updateArtifactsCount();
              setDQRuleId(json.metadata.id);
              window.history.pushState(
                {},
                '',
                `/dq_rule/edit/${encodeURIComponent(json.metadata.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

  useEffect(() => {
    getRuleTypes().then((json) => {
      const map = new Map();
      for (let i = 0; i < json.length; i += 1) {
        map.set(json[i].id, json[i].name);
      }
      //setRuleTypes(map);
    }).catch(handleHttpError);
  }, []);

  const getRuleTypeObj = async (search: string) => getRuleTypes().then((json) => {
    const res = [];
    const map = new Map();
    for (let i = 0; i < json.length; i += 1) {
      res.push({ id: json[i].id, name: json[i].name });
      map.set(json[i].id, json[i].name);
    }
    //setRuleTypes(map);
    return res.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
  });

  const getRuleTypeDisplayValue = async (i: string) => {
    if (!i) return '';

    return getRuleType(i).then((json: any) => {
      if (json && json.name) return json.name;
      return '';
    }).catch(handleHttpError);
  };

  const updateDQRuleField = (field: string, value: string | string[] | RawDraftContentState) => {
    if (dqRuleId) {
      const d: any = {};
      if (typeof value !== 'string' && !Array.isArray(value)) { d[field] = JSON.stringify(value); } else { d[field] = value; }
      updateDQRule(dqRuleId, d)
        .then((json) => {
          setDataModified(false);
          if (json.metadata.id && json.metadata.id !== dqRuleId) {
            navigate(`/dq_rule/edit/${encodeURIComponent(json.metadata.id)}`);
          } else { setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } })); }
        })
        .catch((err) => { handleHttpError(err); loadDQRuleData(); });
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
      setDataModified(false);
    }
  };

  return (
    <div className={classNames(styles.page, styles.dqRulePage, { [styles.loaded]: isLoaded })}>
      <div className={styles.mainContent}>
        {!dqRuleVersionId && (
          <WFItemControl
            itemMetadata={data.metadata}
            itemIsReadOnly={isReadOnly}
            onEditClicked={() => { setReadOnly(false); }}
            onObjectIdChanged={(localDQRuleId) => {
              if (localDQRuleId) {
                setDQRuleId(localDQRuleId);
                window.history.pushState(
                  {},
                  '',
                  `/dq_rule/edit/${encodeURIComponent(localDQRuleId)}`,
                );
              } else navigate('/dq_rule/');
            }}
            onObjectDataChanged={(data) => {
              setData(data);
              setDataModified(false);
              setBreadcrumbEntityName(dqRuleId, data.entity.name);
              setTags(data.metadata.tags ? data.metadata.tags.map((x: any) => ({ value: x.name })) : []);

              updateEditPageReadOnly(data, setReadOnly, () => { setLoading(false); setLoaded(true); });
            }}
          />
        )}

        <div className={styles.title}>
          <FieldEditor
            isReadOnly={isReadOnly}
            labelPrefix={`${i18n('Название правила')}: `}
            defaultValue={data.entity.name}
            className={styles.title}
            valueSubmitted={(val) => {
              updateDQRuleField('name', val.toString());
            }}
            isRequired
            onBlur={(val) => {
              updateDQRuleField('name', val);
            }}
            showValidation={showValidation}
          />
        </div>

        {!isCreateMode && (
          <Tags
            tags={tags}
            isReadOnly={isReadOnly}
            onTagAdded={(tagName: string) => tagAddedHandler(tagName, dqRuleId, 'dq_rule', data.metadata.state ?? '', tags, setLoading, setTags, '/dq_rule/edit/', navigate)}
            onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, dqRuleId, 'dq_rule', data.metadata.state ?? '', setLoading, setTags, '/dq_rule/edit/', navigate)}
          />
        )}

        <FieldAutocompleteEditor
          className={styles.long_input}
          label={i18n('Тип: ')}
          isReadOnly={isReadOnly}
          defaultValue={data.entity.rule_type_id}
          valueSubmitted={(identity) => updateDQRuleField('rule_type_id', identity)}
          getDisplayValue={getRuleTypeDisplayValue}
          getObjects={getRuleTypeObj}
          showValidation={showValidation}
        />

        {!isCreateMode && (
          <div className={styles.data_row}>
            <FieldEditor
              isReadOnly={isReadOnly}
              layout="separated"
              labelPrefix={`${i18n('Функция проверки качества')} `}
              isMultiline
              defaultValue={data.entity.rule_ref}
              className={styles.editor}
              valueSubmitted={(val) => {
                updateDQRuleField('rule_ref', val.toString());
              }}
            />
          </div>
        )}
        {!isCreateMode && (
          <div className={styles.data_row}>
            <FieldTextareaEditor
              isReadOnly={isReadOnly}
              labelPrefix={`${i18n('Описание')}`}
              isMultiline
              defaultValue={data.entity.description}
              className={styles.editor}
              valueSubmitted={(val) => {
                updateDQRuleField('description', val);
              }}

            />
          </div>
        )}
        {!isCreateMode && (
          <div className={styles.data_row}>
            <FieldTextareaEditor
              isReadOnly={isReadOnly}
              labelPrefix={`${i18n('Пример настроек')}`}
              isMultiline
              defaultValue={data.entity.settings}
              className={styles.editor}
              valueSubmitted={(val) => {
                updateDQRuleField('settings', val);
              }}
            />
          </div>
        )}
      </div>
      {!isCreateMode && (
        <div className={styles.rightBar}>
          {data.metadata.state === 'PUBLISHED' && (
            <Versions
              rating={ratingData.rating}
              ownRating={ownRating}
              version_id={dqRuleVersionId || data.metadata.version_id}
              versions={versions}
              version_url_pattern={`/dq_rule/${encodeURIComponent(dqRuleId)}/version/{version_id}`}
              root_object_url={`/dq_rule/edit/${encodeURIComponent(dqRuleId)}`}
              onRateClick={r => rateClickedHandler(r, dqRuleId, 'dq_rule', setOwnRating, setRatingData)}
            />
          )}
        </div>
      )}

      <Modal
        show={showAddEntityDlg}
        backdrop={false}
        onHide={handleAddEntityDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>{i18n('Создание нового правила проверки качества')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Input
            label={i18n('Название')}
            value={newEntityData.name}
            onChange={(e) => {
              setNewEntityData((prev: any) => ({ ...prev, name: e.target.value }));
            }}
          />
          <Textarea
            label={i18n('Описание')}
            value={newEntityData.description}
            onChange={(e) => {
              setNewEntityData((prev: any) => ({ ...prev, description: e.target.value }));
            }}
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={addDlgSubmit}
          >
            Создать
          </Button>
          <Button
            variant="secondary"
            onClick={handleAddEntityDlgClose}
          >
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal
        show={showDelDlg}
        backdrop={false}
        onHide={handleDelEntityDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Вы действительно хотите удалить
            {' '}
            {delData.name}
            ?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body />
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => delEntityDlgSubmit(delData.id)}
          >
            Удалить
          </Button>
          <Button
            variant="secondary"
            onClick={handleDelEntityDlgClose}
          >
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}
