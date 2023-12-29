/* eslint-disable react/button-has-type */
/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { a11yLight } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import useUrlState from '@ahooksjs/use-url-state';
import { List } from 'immutable';
import { v4 } from 'uuid';
import async from 'react-select/dist/declarations/src/async/index';
import styles from './Samples.module.scss';
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg';
import { ReactComponent as PlusInCircle } from '../../assets/icons/plus-in-circle.svg';
import {
  doNavigate, getCookie, getDQRuleAutocompleteObjects, getDQRuleDisplayValue, getDQRuleSettings, handleHttpError, handleHttpResponse, i18n, setDataModified, updateArtifactsCount, uuid,
} from '../../utils';
import { optionsGet, URL } from '../../services/requst_templates';
import { getRatingData, getOwnRatingData, setRating } from '../../services/pages/rating';
import { addTag, deleteTag } from '../../services/pages/tags';
import { Tags, TagProp } from '../../components/Tags';
import { Versions, VersionData } from '../../components/Versions';
import { Tabs } from '../../components/Tabs';
import { FieldEditor } from '../../components/FieldEditor';

import {
  createSample,
  deleteSampleProperty,
  getSample,
  getSampleBody,
  getSampleProperties,
  getSampleVersions,
  updateSample,
  updateSampleProperty,
  getSampleDQRulesBySampleId,
  getSampleDQRules,
  updateSampleDQRule,
  deleteSampleDQRule,
  createSampleDQRule,
} from '../../services/pages/samples';
import { Autocomplete } from '../../components/Autocomplete';
import { getEntities, getEntity, getEntityAttributes } from '../../services/pages/dataEntities';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { getSystem, getSystems } from '../../services/pages/systems';
import { getEntityQueries, getEntityQuery } from '../../services/pages/entityQueries';
import { fetchWithRefresh } from '../../services/auth';
import { FieldCheckboxEditor } from '../../components/FieldCheckboxEditor';
import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';
import { setRecentView } from '../../services/pages/recentviews';
import { TData, TDQRule } from '../../types/data';
import { getUserByLogin } from '../../services/pages/users';

export function Sample() {
  const navigate = useNavigate();

  const [state, setState] = useUrlState({
    t: '1',
  }, { navigateMode: 'replace' });
  const [, setLoading] = useState(true);
  const [data, setData] = useState({
    entity: {
      name: '',
      description: '',
      entity_id: null,
      system_id: null,
      entity_query_id: null,
      sample_type: '',
      dq_rules: [],
      roles: '',
      sample_link_ids: []
    },
    metadata: { version_id: '', tags: [] },
  });
  const [ratingData, setRatingData] = useState({ rating: 0, total_rates: 0 });
  const [ownRating, setOwnRating] = useState(0);
  const [versions, setVersions] = useState<VersionData[]>([]);
  const [tags, setTags] = useState<TagProp[]>([]);
  const [showDelPropDlg, setShowDelPropDlg] = useState(false);
  const [delPropData, setDelPropData] = useState({ id: '', name: '' });
  const [sampleBody, setSampleBody] = useState<any>('');
  const [sampleProperties, setSampleProperties] = useState<any[]>([]);
  const [entityAttributes, setEntityAttributes] = useState([]);
  const [isCreateMode, setCreateMode] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [sampleId, setSampleId] = useState<string>('');

  const handleDelPropDlgClose = () => {
    setShowDelPropDlg(false);
    return false;
  };

  const delPropDlgSubmit = (id: string) => {
    setShowDelPropDlg(false);
    setLoading(true);
    deleteSampleProperty(id)
      .then(() => {
        setLoading(false);
      })
      .catch(handleHttpError);
    setDelPropData({ id: '', name: '' });
  };

  const { id } = useParams();

  useEffect(() => {
    if (!sampleId && id) setSampleId(id);
    setDataModified(false);
  }, [id]);

  const getEntityAttrObjects = async (search: string) => entityAttributes
    .map((attr: any) => ({ id: attr.metadata.id, name: attr.entity.name }))
    .filter((d: any) => !search || d.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);

  const fileUpload = React.useRef(null);
  const addDQRule = () => {
    setData((prev: any) => ({
      ...prev,
      entity: {
        ...prev.entity,
        dq_rules: [...prev.entity.dq_rules, {
          entity: {
            id: '',
            entity_sample_id: sampleId,
            dq_rule_id: '',
            settings: '',
          },
          metadata: {
            id: '',
          },
        }],
      },
    }));
  };

  const delDQRule = (index: number, ruleId: string) => {
    if (ruleId !== '') {
      const arr: TDQRule[] = [...data.entity.dq_rules];
      arr.splice(index, 1);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, dq_rules: arr } }));
      deleteSampleDQRule(ruleId);
    }
  };

  const updateDQRuleField = async (index: number, rowId: string, field: string, value: string) => {
    if (rowId !== '') {
      (data.entity.dq_rules[index] as TData).entity[field as keyof TDQRule] = value;

      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, dq_rules: data.entity.dq_rules } }));
      updateSampleDQRule(rowId, (data.entity.dq_rules[index] as TData).entity);
    } else {
      const uid = v4();
      (data.entity.dq_rules[index] as TData).entity.disabled = 'false';
      (data.entity.dq_rules[index] as TData).entity.send_mail = 'true';
      if (field === 'dq_rule_id') {
        (data.entity.dq_rules[index] as TData).entity.dq_rule_id = value;
        const s = await getDQRuleSettings(value);
        (data.entity.dq_rules[index] as TData).entity.settings = s;
      } else {
        (data.entity.dq_rules[index] as TData).entity[field as keyof TDQRule] = value;
      }
      (data.entity.dq_rules[index] as TData).entity.id = uid;
      (data.entity.dq_rules[index] as TData).metadata.id = uid;
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, dq_rules: data.entity.dq_rules } }));
      createSampleDQRule(sampleId, (data.entity.dq_rules[index] as TData).entity);
    }
    setDataModified(false);
  };

  const tabs = [
    {
      key: 'tab-data',
      title: i18n('ДАННЫЕ'),
      content: (
        <div className={styles.tab_data}>
          <form
            id="formSampleUpload"
            target="_blank"
            style={{ display: 'none' }}
            action={`/v1/samples/body/${sampleId}/upload/`}
            method="POST"
            encType="multipart/form-data"
          >
            <input
              type="file"
              id="upload-sample-file"
              ref={fileUpload}
              onChange={async (e) => {
                if (e.target && e.target.files) {
                  const formData = new FormData();
                  formData.append('file', e.target.files[0]);
                  const token = getCookie('token') ?? '';
                  fetch(`${URL}/v1/samples/body/${sampleId}/upload/`, {
                    method: 'POST',
                    body: formData,
                    headers: { Authorization: `Bearer ${token}` },
                  }).then(handleHttpResponse).catch(handleHttpError);
                }
              }}
            />
          </form>
          <label htmlFor="upload-sample-file">
            <button
              className={styles.btn_upload}
              onClick={() => {
                if (fileUpload && fileUpload.current) (fileUpload.current as any).click();
              }}
            />
          </label>

          <button
            className={styles.btn_download}
            onClick={() => {
              const login = getCookie('login');
              if (login) {
                let filename = '';
                getUserByLogin(login).then((json:any) => {
                  fetchWithRefresh(`${URL}/v1/samples/body/${encodeURIComponent(sampleId ?? '')}?tenant_id=${json.tenant}&as_file=true`, optionsGet()).then((resp) => {
                    filename = resp.headers.get('content-disposition')?.replace('attachment; filename=', '').replaceAll('"', '') ?? '';
                    return resp.blob();
                  })
                    .then((blob) => {
                      // Create blob link to download
                      const url = window.URL.createObjectURL(
                        new Blob([blob]),
                      );
                      const link = document.createElement('a');
                      link.href = url;
                      link.setAttribute(
                        'download',
                        filename ?? 'file.txt',
                      );

                      // Append to html link element page
                      document.body.appendChild(link);

                      // Start download
                      link.click();

                      // Clean up and remove the link
                      if (link.parentNode) { link.parentNode.removeChild(link); }
                    });
                }).catch(handleHttpError);
              }
            }}
          />
          {data.entity.sample_type === 'table' ? (
            <div className={styles.table_wrap}>
              <table className={styles.table_data}>
                <tbody>
                  {sampleBody && sampleBody.fields && (
                    <tr>
                      {sampleBody.fields.map((fld: any) => (
                        <th key={uuid()}>{fld.name}</th>
                      ))}
                    </tr>
                  )}
                  {sampleBody && sampleBody.records && (
                    <>
                      {sampleBody.records.map((rec: any) => (
                        <tr key={uuid()}>
                          {rec.map((x: string) => (
                            <td>{x}</td>
                          ))}
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <SyntaxHighlighter
              language="json"
              customStyle={{ marginTop: '20px' }}
              wrapLongLines
              style={a11yLight}
            >
              {sampleBody}
            </SyntaxHighlighter>
          )}
        </div>
      ),
    },
    {
      key: 'tab-props',
      title: i18n('МЭППИНГ С ЛОГИЧЕСКОЙ СИСТЕМОЙ'),
      content: (
        <table className={styles.tbl_mappings}>
          <thead>
            <tr>
              <th>Свойство сэмпла</th>
              <th>Свойство логического объекта</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {sampleProperties.map((prop: any) => (
              <tr
                key={`row_prop_${prop.id}`}
                className={styles.row_property}
              >
                <td className={styles.name}>{prop.name}</td>
                <td className={styles.val}>
                  <Autocomplete
                    defaultOptions={entityAttributes.map((attr: any) => ({
                      id: attr.metadata.id,
                      name: attr.entity.name,
                    }))}
                    getOptions={getEntityAttrObjects}
                    inputValue={prop.entity_attribute_name}
                    onChanged={(d: any) => {
                      updateSampleProperty(prop.id, {
                        entity_sample_id: sampleId,
                        mapped_attribute_ids: [d.id],
                      }).then(() => {
                        setSampleProperties(
                          sampleProperties.map((p: any) => {
                            if (p.id === prop.id) {
                              return {
                                ...p,
                                mapped_attribute_ids: [d.id],
                                entity_attribute_name: d.name,
                              };
                            }
                            return p;
                          }),
                        );
                      });
                    }}
                  />
                </td>
                <td className={styles.actions}>
                  <CloseIcon
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      updateSampleProperty(prop.id, { entity_sample_id: sampleId, mapped_attribute_ids: [] }).then((json) => {
                        if (json && json.metadata && json.metadata.id) {
                          setSampleProperties(
                            sampleProperties.map((p: any) => {
                              if (p.id === prop.id) {
                                return {
                                  ...p,
                                  mapped_attribute_ids: [],
                                  entity_attribute_name: '',
                                };
                              }
                              return p;
                            }),
                          );
                        }
                      });
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ),
    },
    {
      key: 'tab-dq',
      title: i18n('НАСТРОЙКИ КАЧЕСТВА'),
      content: (
        <div className={styles.dqrule_wrap}>
          <div className={styles.dqrule_head}>
            <label>{`${i18n('Правила проверки качества')}:`}</label>
            <PlusInCircle onClick={addDQRule} />
          </div>
          {data.entity.dq_rules && data.entity.dq_rules.map((v, index) => (
            <div key={`d${(v as TData).metadata.id}`} className={styles.dqrule_item}>
              <FieldAutocompleteEditor
                key={`se${(v as TData).metadata.id}`}
                className={styles.long_input}
                isReadOnly={false}
                label=""
                defaultValue={(v as TData).entity.dq_rule_id}
                valueSubmitted={(val) => updateDQRuleField(index, (v as TData).metadata.id, 'dq_rule_id', val)}
                getDisplayValue={getDQRuleDisplayValue}
                getObjects={getDQRuleAutocompleteObjects}
                artifactType="dq_rule"
              />
              <FieldEditor
                key={`fe${(v as TData).metadata.id}`}
                isReadOnly={false}
                labelPrefix={`${i18n('Настройки')}: `}
                defaultValue={(v as TData).entity.settings}
                className={styles.long_input}
                valueSubmitted={(val) => {
                  updateDQRuleField(index, (v as TData).metadata.id, 'settings', (val as string));
                }}
                isRequired
                isMultiline
                onBlur={(val) => {
                  updateDQRuleField(index, (v as TData).metadata.id, 'settings', (val as string));
                }}
                showValidation={showValidation}
              />
              <FieldCheckboxEditor
                key={`ce1${(v as TData).metadata.id}`}
                isReadOnly={false}
                labelPrefix={i18n('Выключена')}
                defaultValue={Boolean((v as TData).entity.disabled)}
                className=""
                layout="separated"
                valueSubmitted={(val) => {
                  updateDQRuleField(index, (v as TData).metadata.id, 'disabled', String(val));
                }}
                isRequired
                showValidation={showValidation}
              />
              <FieldCheckboxEditor
                key={`ce2${(v as TData).metadata.id}`}
                isReadOnly={false}
                labelPrefix={i18n('Рассылать уведомления об ошибках')}
                defaultValue={Boolean((v as TData).entity.send_mail)}
                className=""
                layout="separated"
                valueSubmitted={(val) => {
                  updateDQRuleField(index, (v as TData).metadata.id, 'send_mail', String(val));
                }}
                isRequired
                showValidation={showValidation}
              />

              <div key={`dc${(v as TData).metadata.id}`} className={styles.dqrule_close}>
                <CloseIcon key={`fec${(v as TData).metadata.id}`} onClick={() => delDQRule(index, (v as TData).metadata.id)} />
              </div>
            </div>
          ))}

        </div>
      ),
    },
  ];

  useEffect(() => {
    setCreateMode(sampleId === '');

    if (sampleId) {
      setRecentView('entity_sample', sampleId);
      getSample(sampleId).then((json: any) => {
        setData(json);
        setDataModified(false);
        if (document.getElementById(`crumb_${sampleId}`) !== null) {
          document.getElementById(`crumb_${sampleId}`)!.innerText = json.entity.name;
        }
        setTags(json.metadata.tags ? json.metadata.tags.map((x: any) => ({ value: x.name })) : []);

        getSampleBody(sampleId)
          .then((text) => {
            if (json.entity.sample_type === 'table') setSampleBody(JSON.parse(text));
            else if (typeof text === 'string') setSampleBody(text);
            else setSampleBody(text.toString());
          })
          .catch(handleHttpError);

        setLoading(false);
      });

      getRatingData(sampleId)
        .then((json) => {
          setRatingData(json);
        })
        .catch(handleHttpError);

      getOwnRatingData(sampleId)
        .then((rating) => {
          setOwnRating(rating);
        })
        .catch(handleHttpError);

      getSampleVersions(sampleId)
        .then((json) => {
          setVersions(
            json.resources.map((x: any) => ({
              name: x.entity.name,
              description: x.entity.description,
              version_id: x.metadata.version_id,
              created_at: new Date(x.metadata.created_at).toLocaleString(),
            })),
          );
        })
        .catch(handleHttpError);

      getSampleProperties({
        sort: 'name+',
        offset: 0,
        limit: 999,
        filters: [{ column: 'entity_sample_id', value: sampleId, operator: 'EQUAL' }],
        filters_for_join: [],
      }).then((json) => {
        setSampleProperties(json.items);
      });
    }
  }, [sampleId]);

  useEffect(() => {
    if (isCreateMode) {
      if (
        data.entity.name
        && data.entity.entity_id
        && data.entity.system_id
        && data.entity.entity_query_id
      ) {
        createSample({
          name: data.entity.name,
          description: data.entity.description,
          entity_id: data.entity.entity_id,
          system_id: data.entity.system_id,
          entity_query_id: data.entity.entity_query_id,
          sample_type: 'json',
        })
          .then((json) => {
            setDataModified(false);
            updateArtifactsCount();
            if (json.metadata.id) {
              setSampleId(json.metadata.id);
              window.history.pushState(
                {},
                '',
                `/samples/edit/${encodeURIComponent(json.metadata.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

  useEffect(() => {
    if (data.entity.entity_id) {
      getEntityAttributes(data.entity.entity_id).then((json) => {
        setEntityAttributes(json.resources);
      });
    }
  }, [data.entity.entity_id]);

  const tagAdded = (tagName: string) => {
    if (sampleId) {
      setLoading(true);
      addTag(sampleId, 'entity_sample', tagName)
        .then(() => {
          setLoading(false);
          setTags((prevTags) => [...prevTags, { value: tagName }]);
        })
        .catch(handleHttpError);
    }
  };

  const tagDeleted = (tagName: string) => {
    if (sampleId) {
      setLoading(true);
      deleteTag(sampleId, 'entity_sample', tagName)
        .then(() => {
          setLoading(false);
          setTags((prevTags) => prevTags.filter((x) => x.value !== tagName));
        })
        .catch(handleHttpError);
    }
  };

  const updateSampleField = (field: string, value: string | JSON | [] | TDQRule[]) => {
    if (sampleId) {
      updateSample(sampleId, { [field]: value })
        .then(() => { setDataModified(false); })
        .catch(handleHttpError);
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
      setDataModified(false);
    }
  };

  const getEntityDisplayValue = async (identity: string) => {
    if (!identity) return '';
    return getEntity(identity)
      .then((json) => {
        if (json && json.entity) return json.entity.name;
        return undefined;
      })
      .catch((e) => {
        handleHttpError(e);
        return '';
      });
  };

  const getSystemDisplayValue = async (identity: string) => {
    if (!identity) return '';
    return getSystem(identity)
      .then((json) => {
        if (json && json.entity) return json.entity.name;
        return undefined;
      })
      .catch((e) => {
        handleHttpError(e);
        return '';
      });
  };

  const getEntityQueryDisplayValue = async (identity: string) => {
    if (!identity) return '';
    return getEntityQuery(identity)
      .then((json) => {
        if (json && json.entity) return json.entity.name;
        return undefined;
      })
      .catch((e) => {
        handleHttpError(e);
        return '';
      });
  };

  const getEntityObjects = async (search: string) => getEntities({
    sort: 'name+',
    global_query: search,
    limit: 10,
    offset: 0,
    filters: [],
    filters_for_join: [],
  }).then((json) => json.items);

  const getSystemObjects = async (search: string) => getSystems({
    sort: 'name+',
    global_query: search,
    limit: 10,
    offset: 0,
    filters: [],
    filters_for_join: [],
  }).then((json) => json.items);

  const getEntityQueryObjects = async (search: string) => getEntityQueries({
    sort: 'name+',
    global_query: search,
    limit: 10,
    offset: 0,
    filters: [],
    filters_for_join: [],
  }).then((json) => json.items);

  return (
    <div className={`${styles.page} ${styles.samplePage}`}>
      <div className={styles.mainContent}>
        <div className={styles.title}>
          <FieldEditor
            isReadOnly={false}
            labelPrefix={`${i18n('СЭМПЛ')}: `}
            defaultValue={data.entity.name}
            className={styles.title}
            valueSubmitted={(val) => {
              updateSampleField('name', val.toString());
            }}
            isRequired
            showValidation={showValidation}
          />
        </div>
        {!isCreateMode && (
          <button className={styles.btn_scheme} onClick={() => { doNavigate('/samples-model/' + encodeURIComponent(sampleId), navigate); }}>{i18n('Схема')}</button>
        )}
        {!isCreateMode && (
          <Tags
            tags={tags}
            onTagAdded={tagAdded}
            onTagDeleted={tagDeleted}
          />
        )}

        <div className={styles.general_data}>
          <div className={styles.data_row_desc}>
            <FieldTextareaEditor
                isReadOnly={false}
                labelPrefix={`${i18n('Описание')}`}
                isMultiline
                isRequired
                showValidation={showValidation}
                defaultValue={data.entity.description}
                className={styles.editor}
                valueSubmitted={(val) => {
                  updateSampleField('description', val);
                }}

              />
          </div>
          <div className={styles.data_row}>
            <FieldEditor
              isReadOnly={false}
              layout="separated"
              labelPrefix={`${i18n('Ключевые роли процесса')} `}
              defaultValue={data.entity.roles}
              className={styles.editor}
              valueSubmitted={(val) => {
                updateSampleField('roles', val.toString());
              }}
            />
          </div>
          <div className={styles.data_row}>
            <FieldAutocompleteEditor
              className=""
              label={i18n('Логический объект')}
              defaultValue={data.entity.entity_id}
              valueSubmitted={(identity) => {
                updateSampleField('entity_id', identity);
              }}
              getDisplayValue={getEntityDisplayValue}
              getObjects={getEntityObjects}
              isRequired
              showValidation={showValidation}
              artifactType="entity"
            />
            <FieldAutocompleteEditor
              className=""
              label={i18n('Система')}
              defaultValue={data.entity.system_id}
              valueSubmitted={(identity) => {
                updateSampleField('system_id', identity);
              }}
              getDisplayValue={getSystemDisplayValue}
              getObjects={getSystemObjects}
              isRequired
              showValidation={showValidation}
              artifactType="system"
            />
            <FieldAutocompleteEditor
              className=""
              label={i18n('Запрос')}
              defaultValue={data.entity.entity_query_id}
              valueSubmitted={(identity) => {
                updateSampleField('entity_query_id', identity);
              }}
              getDisplayValue={getEntityQueryDisplayValue}
              getObjects={getEntityQueryObjects}
              isRequired
              showValidation={showValidation}
              artifactType="entity_query"
            />
            {!isCreateMode && (
              <></>
            )}
          </div>
        </div>

        {!isCreateMode && <Tabs tabs={tabs} tabNumber={state.t} onTabChange={(tab: number) => { setState(() => ({ t: tab })); }} />}
      </div>

      <Modal
        show={showDelPropDlg}
        backdrop={false}
        onHide={handleDelPropDlgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Вы действительно хотите удалить
            {delPropData.name}
            ?
          </Modal.Title>
        </Modal.Header>
        <Modal.Body />
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => delPropDlgSubmit(delPropData.id)}
          >
            Удалить
          </Button>
          <Button
            variant="secondary"
            onClick={handleDelPropDlgClose}
          >
            Отмена
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
