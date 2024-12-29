/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import classNames from 'classnames';
import styles from './DQRules.module.scss';
import { getRuleTypeAutocompleteObjects, getRuleTypeDisplayValue, handleHttpError, i18n, loadEditPageData, rateClickedHandler, setBreadcrumbEntityName, setDataModified, tagAddedHandler, tagDeletedHandler, updateArtifactsCount, updateEditPageReadOnly, uuid } from '../../utils';

import { Input } from '../../components/Input';
import { Textarea } from '../../components/Textarea';
import {
  createDQRule,
  deleteDQRule,
  getDQRule,
  getDQRuleVersions,
  getDQRuleVersion,
  updateDQRule,
} from '../../services/pages/dqRules';

import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';
import { TagProp, Tags } from '../../components/Tags';
import { DQRuleData } from '../../types/data';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { FieldVisualEditor } from '../../components/FieldVisualEditor';
import { EditPage } from '../../components/EditPage';
import { FieldTextEditor } from '../../components/FieldTextEditor';

export function DQRule() {
  const navigate = useNavigate();
  const [, setLoading] = useState(true);

  const [data, setData] = useState<DQRuleData>({
    metadata: { id: '', artifact_type: 'dq_rule', version_id: '', tags: [], state: 'PUBLISHED', published_id: '', created_by: '' },
    entity: {
      name: '', description: '', rule_ref: '', settings: '', rule_type_id: null, short_description: ''
    },
  });

  const [showValidation, setShowValidation] = useState(false);

  const [isReadOnly, setReadOnly] = useState(true);
  const [isLoaded, setLoaded] = useState(false);

  const { id, version_id } = useParams();

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

  const handleAddEntityDlgClose = () => {
    setShowAddEntityDlg(false);
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

  useEffect(() => {
    if (id) setDQRuleId(id);
    setDQRuleVersionId(version_id ?? '');
    setDataModified(false);
  }, [id, version_id]);


  const updateDQRuleField = (field: string, value: string | string[] | undefined) => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    setDataModified(true);
  };

  return (
    <>
      <EditPage objectId={dqRuleId} objectVersionId={dqRuleVersionId} data={data} urlSlug='dq_rule' setData={setData} isReadOnly={isReadOnly} setReadOnly={setReadOnly}
          artifactType='dq_rule' setTags={setTags} getObjectVersion={getDQRuleVersion} getObjectVersions={getDQRuleVersions} getObject={getDQRule} deleteObject={deleteDQRule}
          updateObject={updateDQRule} tabs={[
          {
            key: 'tab-gen',
            title: i18n('Сведения'),
            unscrollable: true,
            content: <div className={styles.tab_2col}>
              <div className={classNames(styles.col, styles.scrollable)}>
                <h2>Общая информация</h2>

                <FieldTextEditor
                    isReadOnly={isReadOnly}
                    label={i18n('Название')}
                    defaultValue={data.entity.name}
                    valueSubmitted={(val) => {
                      updateDQRuleField('name', val);
                    }}
                  />

                <FieldAutocompleteEditor
                  label={i18n('Тип')}
                  isReadOnly={isReadOnly}
                  defaultValue={data.entity.rule_type_id}
                  valueSubmitted={(identity) => updateDQRuleField('rule_type_id', identity)}
                  getDisplayValue={getRuleTypeDisplayValue}
                  getObjects={getRuleTypeAutocompleteObjects}
                  showValidation={showValidation}
                />

                <FieldTextareaEditor
                    isReadOnly={isReadOnly}
                    label={i18n('Описание')}
                    defaultValue={data.entity.short_description}
                    valueSubmitted={(val) => {
                      updateDQRuleField('short_description', val ?? '');
                    }}
                  />

                <div data-uitest="dq_rule_tag" className={styles.tags_block}>
                  <div className={styles.label}>{i18n('Теги')}</div>
                  <Tags
                    key={'tags-' + dqRuleId + '-' + dqRuleVersionId + '-' + uuid()}
                    isReadOnly={isReadOnly}
                    tags={tags}
                    tagPrefix='#'
                    onTagAdded={(tagName: string) => tagAddedHandler(tagName, dqRuleId, 'dq_rule', data.metadata.state ?? '', tags, setLoading, setTags, '/dq_rule/edit/', navigate)}
                    onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, dqRuleId, 'dq_rule', data.metadata.state ?? '', setLoading, setTags, '/dq_rule/edit/', navigate)}
                  />
                </div>
              </div>
              <div className={classNames(styles.col, styles.scrollable)}>
                <h2>Дополнительные параметры</h2>

                <FieldTextareaEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Функция проверки качества')}
                  defaultValue={data.entity.rule_ref}
                  valueSubmitted={(val) => {
                    updateDQRuleField('rule_ref', val);
                  }}
                />

                <FieldTextareaEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Пример настроек')}
                  defaultValue={data.entity.settings}
                  valueSubmitted={(val) => {
                    updateDQRuleField('settings', val);
                  }}
                />
              </div>
            </div>
          },
          {
            key: 'tab-desc',
            title: i18n('Расширенное описание'),
            content: <div className={styles.tab_transparent}>

              <FieldVisualEditor
                  isReadOnly={isReadOnly}
                  defaultValue={data.entity.description}
                  className=''
                  valueSubmitted={(val) => {
                    updateDQRuleField('description', val);
                  }}
                />  
            
            </div>
          }
        ]} />

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

    </>
  );
}
