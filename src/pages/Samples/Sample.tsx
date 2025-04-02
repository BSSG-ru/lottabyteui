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
import { v4 } from 'uuid';
import styles from './Samples.module.scss';
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg';
import { ReactComponent as PlusInCircle } from '../../assets/icons/plus-blue.svg';
import {
  doNavigate, getCookie, getDQRuleAutocompleteObjects, getDQRuleDisplayValue, getDQRuleSettings, getEntityAutocompleteObjects, getEntityDisplayValue, getQueryAutocompleteObjects, getQueryDisplayValue, getSystemAutocompleteObjects, getSystemDisplayValue, handleHttpError, handleHttpResponse, i18n, setDataModified, tagAddedHandler, tagDeletedHandler, updateArtifactsCount, uuid,
} from '../../utils';
import { optionsGet, URL } from '../../services/requst_templates';
import { Tags, TagProp } from '../../components/Tags';

import {
  deleteSampleProperty,
  getSample,
  getSampleBody,
  updateSample,
  updateSampleProperty,
  updateSampleDQRule,
  deleteSampleDQRule,
  createSampleDQRule,
  deleteSample,
  getSampleProperties,
} from '../../services/pages/samples';
import { Autocomplete } from '../../components/Autocomplete';
import { getEntityAttributes } from '../../services/pages/dataEntities';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { fetchWithRefresh } from '../../services/auth';
import { FieldCheckboxEditor } from '../../components/FieldCheckboxEditor';
import { TData, TDQRule } from '../../types/data';
import { getUserByLogin } from '../../services/pages/users';
import { FieldVisualEditor } from '../../components/FieldVisualEditor';
import { searchMetaColumns } from '../../services/pages/metadata';
import { EditPage } from '../../components/EditPage';
import classNames from 'classnames';
import { FieldTextEditor } from '../../components/FieldTextEditor';

export function Sample() {
  const navigate = useNavigate();
  const [, setLoading] = useState(true);
  const [isLoaded, setLoaded] = useState(false);
  const [state, setState] = useUrlState({
    t: '1',
  }, { navigateMode: 'replace' });
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
  const [tags, setTags] = useState<TagProp[]>([]);
  const [showDelPropDlg, setShowDelPropDlg] = useState(false);
  const [delPropData, setDelPropData] = useState({ id: '', name: '' });
  const [sampleBody, setSampleBody] = useState<any>('');
  const [sampleProperties, setSampleProperties] = useState<any[]>([]);
  const [entityAttributes, setEntityAttributes] = useState([]);
  const [showValidation, setShowValidation] = useState(false);
  const [sampleId, setSampleId] = useState<string>('');
  const [isReadOnly, setReadOnly] = useState(true);

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

  const getMetaColumnObjects = async (search: string) => {
    return await searchMetaColumns({ sort: 'name+', global_query: '', limit: 1000, offset: 0, filters: [{ column: 'tbl1.system_id', value: data.entity.system_id, operator: 'EQUAL' }, { column: '(tbl1.schema_name || \'.\' || tbl1.meta_object_name || \'.\' || tbl1.name)', value: search, operator: 'LIKE' }], filters_for_join: [] }).then(json => {
      return json.items.map((itm:any) => ({ id: itm.id, name: itm.schema_name + '.' + itm.meta_object_name + '.' + itm.name + ' (версия ' + itm.version_id + ')' }));
    })
  }

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
    setDataModified(true);
  };

  const tabs = [
    {
      key: 'tab-data',
      title: i18n('Данные'),
      content: (
        <div className={classNames(styles.tab_data, styles.tab_white)}>
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
                            <td key={uuid()}>{x}</td>
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
      title: i18n('Мэппинг'),
      content: (
        <table className={classNames(styles.tbl_mappings, styles.tab_white)}>
          <thead>
            <tr>
              <th>Свойство сэмпла</th>
              <th>Свойство модели</th>
              <th>&nbsp;</th>
              <th style={{width:'500px'}}>Метаданные</th>
              <th>&nbsp;</th>
            </tr>
          </thead>
          <tbody>
            {sampleProperties.map((prop: any) => (
              <tr
                key={`row_prop_${prop.id}_${(prop.mapped_attribute_ids ?? []).length}_${uuid()}`}
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
                    defaultInputValue={prop.entity_attribute_name}
                    
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

                <td className={styles.val}>
                  <Autocomplete 
                    getOptions={getMetaColumnObjects}
                    inputValue={prop.meta_column_name}
                    onChanged={(d: any) => {
                      updateSampleProperty(prop.id, { entity_sample_id: sampleId, mapped_meta_column_id: d.id, }).then(() => {
                        setSampleProperties(
                          sampleProperties.map((p: any) => {
                            if (p.id === prop.id) {
                              return {
                                ...p,
                                //mapped_attribute_ids: [d.id],
                                meta_column_id: d.id,
                                meta_column_name: d.name
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
                      updateSampleProperty(prop.id, { entity_sample_id: sampleId, mapped_meta_column_id: '' }).then((json) => {
                        if (json && json.metadata && json.metadata.id) {
                          setSampleProperties(
                            sampleProperties.map((p: any) => {
                              if (p.id === prop.id) {
                                return {
                                  ...p,
                                  meta_column_id: '',
                                  meta_column_name: '',
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
      title: i18n('Настройки качества'),
      content: (
        <div className={classNames(styles.dqrule_wrap, styles.tab_white)}>
          <div className={styles.dqrule_head}>
            <label>{`${i18n('Правила проверки качества')}:`}</label>
            {!isReadOnly && (
              <PlusInCircle onClick={addDQRule} />
            )}
          </div>
          {data.entity.dq_rules && data.entity.dq_rules.map((v, index) => (
            <div key={`d${(v as TData).metadata.id ? (v as TData).metadata.id : uuid()}`} className={styles.dqrule_item}>
              <FieldAutocompleteEditor
                key={`se${(v as TData).metadata.id}`}
                className={styles.col1}
                isReadOnly={isReadOnly}
                label={i18n('Правило')}
                defaultValue={(v as TData).entity.dq_rule_id}
                valueSubmitted={(val) => updateDQRuleField(index, (v as TData).metadata.id, 'dq_rule_id', val)}
                getDisplayValue={getDQRuleDisplayValue}
                getObjects={getDQRuleAutocompleteObjects}
                artifactType="dq_rule"
              />
              <FieldTextEditor
                key={`fe${(v as TData).metadata.id}`}
                isReadOnly={isReadOnly}
                label={i18n('Настройки')}
                defaultValue={(v as TData).entity.settings}
                className={styles.col2}
                valueSubmitted={(val) => {
                  updateDQRuleField(index, (v as TData).metadata.id, 'settings', (val as string));
                }}
                isRequired
                showValidation={showValidation}
              />
              <FieldCheckboxEditor
                key={`ce1${(v as TData).metadata.id}`}
                isReadOnly={isReadOnly}
                label={i18n('Выключена')}
                defaultValue={Boolean((v as TData).entity.disabled)}
                className={styles.col3}
                valueSubmitted={(val) => {
                  updateDQRuleField(index, (v as TData).metadata.id, 'disabled', String(val));
                }}
                isRequired
                showValidation={showValidation}
              />
              <FieldCheckboxEditor
                key={`ce2${(v as TData).metadata.id}`}
                isReadOnly={isReadOnly}
                label={i18n('Рассылать уведомления об ошибках')}
                defaultValue={Boolean((v as TData).entity.send_mail)}
                className={styles.col4}
                valueSubmitted={(val) => {
                  updateDQRuleField(index, (v as TData).metadata.id, 'send_mail', String(val));
                }}
                isRequired
                showValidation={showValidation}
              />

              {!isReadOnly && (
                <div key={`dc${(v as TData).metadata.id}`} className={styles.dqrule_close}>
                  <CloseIcon key={`fec${(v as TData).metadata.id}`} onClick={() => delDQRule(index, (v as TData).metadata.id)} />
                </div>
              )}
            </div>
          ))}

        </div>
      ),
    },
  ];

  useEffect(() => {
    if (data.entity.entity_id) {
      getEntityAttributes(data.entity.entity_id).then((json) => {
        setEntityAttributes(json.resources);
      });
    }
  }, [data.entity.entity_id]);

  const updateSampleField = (field: string, value: string | string[] | undefined) => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    setDataModified(true);
  };

  return (
    
    <>

      <EditPage objectId={sampleId} objectVersionId={''} data={data} urlSlug='samples' setData={setData} isReadOnly={isReadOnly} setReadOnly={setReadOnly}
              artifactType='entity_sample' setTags={setTags} getObject={getSample} deleteObject={deleteSample}
              updateObject={updateSample} tabs={[
                {
                  key: 'tab-gen',
                  title: i18n('Сведения'),
                  content: <div className={styles.tab_2col}>
                    <div className={classNames(styles.col, styles.scrollable)}>
                      <h2>Общая информация</h2>
                      <div>
                        <button className={styles.btn_scheme} onClick={() => { doNavigate(`/samples-model/${encodeURIComponent(sampleId)}`, navigate); }}>{i18n('Смотреть схему')}</button>
                      </div>

                      <FieldTextEditor
                        isReadOnly={isReadOnly}
                        label={i18n('Название')}
                        defaultValue={data.entity.name}
                        className={styles.title}
                        valueSubmitted={(val) => {
                          updateSampleField('name', val);
                        }}
                        isRequired
                        showValidation={showValidation}
                      />

                      <div className={styles.tags_block}>
                        <div className={styles.label}>{i18n('Теги')}</div>
                        <Tags
                          key={'tags-' + sampleId + '-' + uuid()}
                          isReadOnly={isReadOnly}
                          tags={tags}
                          tagPrefix='#'
                          onTagAdded={(tagName: string) => tagAddedHandler(tagName, sampleId, 'entity_sample', 'PUBLISHED', tags, setLoading, setTags, '/samples/edit/', navigate)}
                          onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, sampleId, 'entity_sample', 'PUBLISHED', setLoading, setTags, '/samples/edit/', navigate)}
                        />
                      </div>

                      <FieldAutocompleteEditor
                        label={i18n('Модель')}
                        defaultValue={data.entity.entity_id}
                        valueSubmitted={(identity) => {
                          updateSampleField('entity_id', identity);
                        }}
                        getDisplayValue={getEntityDisplayValue}
                        getObjects={getEntityAutocompleteObjects}
                        isRequired isReadOnly={isReadOnly}
                        showValidation={showValidation}
                        artifactType="entity"
                      />
                      <FieldAutocompleteEditor
                        label={i18n('Система')}
                        defaultValue={data.entity.system_id}
                        valueSubmitted={(identity) => {
                          updateSampleField('system_id', identity);
                        }}
                        getDisplayValue={getSystemDisplayValue}
                        getObjects={getSystemAutocompleteObjects}
                        isRequired isReadOnly={isReadOnly}
                        showValidation={showValidation}
                        artifactType="system"
                      />
                      <FieldAutocompleteEditor
                        label={i18n('Запрос')}
                        defaultValue={data.entity.entity_query_id}
                        valueSubmitted={(identity) => {
                          updateSampleField('entity_query_id', identity);
                        }}
                        getDisplayValue={getQueryDisplayValue}
                        getObjects={getQueryAutocompleteObjects}
                        isRequired isReadOnly={isReadOnly}
                        showValidation={showValidation}
                        artifactType="entity_query"
                      />
                    </div>
                    <div className={classNames(styles.col, styles.scrollable)}>
                      <h2>Дополнительные параметры</h2>

                      <FieldTextEditor
                        isReadOnly={isReadOnly}
                        label={i18n('Ключевые роли процесса')}
                        defaultValue={data.entity.roles}
                        className={styles.editor}
                        valueSubmitted={(val) => {
                          updateSampleField('roles', val);
                        }}
                      />
                    </div>
                    


                  </div>
                },
                ...tabs,
                {
                  key: 'tab-desc',
                  title: i18n('Расширенное описание'),
                  content: <div className={styles.tab_transparent}>
        
                    <FieldVisualEditor
                        isReadOnly={isReadOnly}
                        defaultValue={data.entity.description}
                        className=''
                        valueSubmitted={(val) => {
                          updateSampleField('description', val);
                        }}
                      />  
                  
                  </div>
                }
              ]} onLoadDataComplete={(json) => {
                getSampleBody(sampleId)
                .then((text) => {
                  if (json.entity.sample_type === 'table') setSampleBody(JSON.parse(text));
                  else if (typeof text === 'string') setSampleBody(text);
                  else setSampleBody(text.toString());
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
          
              }} />

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
    </>
  );
}
