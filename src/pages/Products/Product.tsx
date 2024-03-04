/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import { v4 } from 'uuid';
import styles from './Products.module.scss';
import { doNavigate, getArtifactUrl, getDQRuleAutocompleteObjects, getDQRuleDisplayValue, getDQRuleSettings, getDomainAutocompleteObjects, getDomainDisplayValue, handleHttpError, i18n, setDataModified, updateArtifactsCount, uuid, getBusinessEntityDisplayValue, loadEditPageData, tagAddedHandler, tagDeletedHandler, rateClickedHandler, updateEditPageReadOnly, setBreadcrumbEntityName } from '../../utils';
import { Tags, TagProp } from '../../components/Tags';
import { Versions, VersionData } from '../../components/Versions';
import { FieldArrayEditor } from '../../components/FieldArrayEditor/FieldArrayEditor';
import { FieldEditor } from '../../components/FieldEditor';
import { setRecentView } from '../../services/pages/recentviews';
import { WFItemControl } from '../../components/WFItemControl/WFItemControl';
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg';
import { ReactComponent as PlusInCircle } from '../../assets/icons/plus-in-circle.svg';
import {
  createProduct, getProduct, getProductSupplyVariant, getProductType, getProductVersion, getProductVersions, searchProductSupplyVariants, searchProductTypes, updateProduct,
} from '../../services/pages/products';
import { getIndicator, searchIndicators } from '../../services/pages/indicators';
import { ProductData, TDQRule, TData } from '../../types/data';
import { ReactComponent as OrangePencilIcon } from '../../assets/icons/pencil_org.svg';
import { ReactComponent as PlusIcon } from '../../assets/icons/plus.svg';
import { ReactComponent as CrossIcon } from '../../assets/icons/cross.svg';
import { ReactComponent as Close } from '../../assets/icons/close.svg';
import { Table } from '../../components/Table';
import { getEntity, getEntityAttribute, getEntityAttributes, searchEntities } from '../../services/pages/dataEntities';
import { Autocomplete2 } from '../../components/Autocomplete2';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { getAsset, searchAssets } from '../../services/pages/dataAssets';
import { FieldCheckboxEditor } from '../../components/FieldCheckboxEditor/FieldCheckboxEditor';
import { getBusinessEntities } from '../../services/pages/businessEntities';
import { userInfoRequest } from '../../services/auth';
import { Prev } from 'react-bootstrap/esm/PageItem';

export type AttribData = {
  id: string;
  name: string;
};

export function Product() {
  const navigate = useNavigate();

  const [, setLoading] = useState(true);
  const [data, setData] = useState<ProductData>({
    entity: { name: '', description: '', indicator_ids: [], entity_attribute_ids: [], domain_id: null, problem: '', consumer: '', value: '', finance_source: '', product_type_ids: [], 
      product_supply_variant_ids: [], data_asset_ids: [], dq_rules: [], link: '', limits: '', limits_internal: '', term_link_ids: [], roles: '' },
    metadata: { id: '', artifact_type: 'product', version_id: '', tags: [], state: 'PUBLISHED', ancestor_draft_id: '' },
  });
  const [ratingData, setRatingData] = useState({ rating: 0, total_rates: 0 });
  const [ownRating, setOwnRating] = useState(0);
  const [versions, setVersions] = useState<VersionData[]>([]);
  const [tags, setTags] = useState<TagProp[]>([]);

  const [isCreateMode, setCreateMode] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [selectedIndicatorNames, setSelectedIndicatorNames] = useState<any[]>([]);
  const [selectedDataAssetNames, setSelectedDataAssetNames] = useState<any[]>([]);
  const [allowedEntityIds, setAllowedEntityIds] = useState<any[]>([]);
  const [selectedProductTypeNames, setSelectedProductTypeNames] = useState<any[]>([]);
  const [selectedProductSupplyVariantNames, setSelectedProductSupplyVariantNames] = useState<any[]>([]);
  const [linkedAttribs, setLinkedAttribs] = useState<any>({ items: [] });
  const [isAttribsEditMode, setAttribsEditMode] = useState<boolean>(false);
  const [attribsEntity, setAttribsEntity] = useState<any>(null);
  const [entitiesCache, setEntityCache] = useState<any>({});

  const [isReadOnly, setReadOnly] = useState(true);
  const [isLoaded, setLoaded] = useState(false);

  const { id, version_id } = useParams();

  const [productId, setProductId] = useState<string>(id ?? '');
  const [productVersionId, setProductVersionId] = useState<string>(version_id ?? '');
  const [table2page, setTable2Page] = useState(1);

  useEffect(() => {
    if (id) setProductId(id);
    setProductVersionId(version_id ?? '');
    setDataModified(false);
  }, [id, version_id]);

  useEffect(() => {
    setCreateMode(productId === '');
    if (productId) {
      if (!productVersionId) { setRecentView('product', productId); }

      loadEditPageData(productId, productVersionId, setData, setTags, setLoading, setLoaded, getProductVersion, getProduct, setRatingData,
        setOwnRating, getProductVersions, setVersions, setReadOnly);

      
    } else {

      userInfoRequest().then(resp => {
        resp.json().then(data => {
          setData((prev) => ({ ...prev, metadata: { ...prev.metadata, state: 'DRAFT' }, entity: { ...prev.entity, domain_id: data.user_domains ? data.user_domains[0] : null} }));
          setDataModified(false);
          setReadOnly(false);
          setLoaded(true);
        });
      });

    }
  }, [productId, productVersionId]);

  useEffect(() => {
    if (isCreateMode) {
      if (data.entity.name) {
        createProduct({
          name: data.entity.name,
          description: data.entity.description,
          domain_id: data.entity.domain_id
        })
          .then((json) => {
            setDataModified(false);
            if (json.metadata.id) {
              updateArtifactsCount();
              setProductId(json.metadata.id);
              window.history.pushState(
                {},
                '',
                `/products/edit/${encodeURIComponent(json.metadata.id)}`,
              );
            }
          })
          .catch(handleHttpError);
      }
    }
  }, [data]);

  useEffect(() => {
    setSelectedIndicatorNames(data.entity.indicator_ids.map(x => ''));
    data.entity.indicator_ids.forEach((id) => {
      getIndicator(id).then((json) => {
        let index = data.entity.indicator_ids.indexOf(json.metadata.id);
        setSelectedIndicatorNames((prev) => (prev.map( (el, i) => { if (i == index) return `<div><a href="${getArtifactUrl(json.metadata.id, 'indicator')}">${json.entity.name}</a></div>`; else return el; } )));
      }).catch(handleHttpError);
    });
  }, [data.entity.indicator_ids]);

  useEffect(() => {
    const a = [];
    for (let i = 0; i < data.entity.data_asset_ids.length; i++) { a.push(''); }
    setSelectedDataAssetNames(a);

    setAllowedEntityIds([]);

    data.entity.data_asset_ids.forEach((id, index) => {
      getAsset(id).then((json) => {
        setSelectedDataAssetNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'data_asset')}">${json.entity.name}</a></div>`, ...prev.slice(index + 1)]));
        setAllowedEntityIds((prev) => ([...prev, json.entity.entity_id]));
      }).catch(handleHttpError);
    });
  }, [data.entity.data_asset_ids]);

  useEffect(() => {
    const a = [];
    for (let i = 0; i < data.entity.product_type_ids.length; i++) { a.push(''); }
    setSelectedProductTypeNames(a);

    data.entity.product_type_ids.forEach((id, index) => {
      getProductType(id).then((json) => {
        setSelectedProductTypeNames((prev) => ([...prev.slice(0, index), '<div>' + json.entity.name + '</div>', ...prev.slice(index + 1)]));
      }).catch(handleHttpError);
    });
  }, [data.entity.product_type_ids]);

  useEffect(() => {
    const a = [];
    for (let i = 0; i < data.entity.product_supply_variant_ids.length; i++) { a.push(''); }
    setSelectedProductSupplyVariantNames(a);

    data.entity.product_supply_variant_ids.forEach((id, index) => {
      getProductSupplyVariant(id).then((json) => {
        setSelectedProductSupplyVariantNames((prev) => ([...prev.slice(0, index), '<div>' + json.entity.name + '</div>', ...prev.slice(index + 1)]));
      }).catch(handleHttpError);
    });
  }, [data.entity.product_supply_variant_ids]);

  const resetLinkedAttribs = () => {
    setLinkedAttribs({ items: [] });
    (data.entity.entity_attribute_ids ?? []).forEach((aid) => {
      getEntityAttribute(aid).then((json) => {
        setLinkedAttribs((prev: any) => ({ ...prev, items: [...prev.items, { ...json.entity, id: json.metadata.id }] }));
      });
    });
  };

  useEffect(() => {
    resetLinkedAttribs();
  }, [data.entity.entity_attribute_ids]);

  const removeLinkedAttrib = (id: string) => {
    setLinkedAttribs((prev: any) => ({ ...prev, items: prev.items.filter((x: any) => x.id != id) }));
    setDataModified(true);
  };

  useEffect(() => {
    linkedAttribs.items.filter((i: any) => !i.entity_name).map((item: any) => (item.entity_id)).forEach((eid: string) => {
      if (entitiesCache[eid]) {
        setLinkedAttribs((prev: any) => ({ ...prev, items: prev.items.map((itm: any) => (itm.entity_id == eid ? { ...itm, entity_name: entitiesCache[eid].entity.name } : itm)) }));
      } else {
        getEntity(eid).then((jsone) => {
          setEntityCache((prev: any) => ({ ...prev, [eid]: jsone }));
          setLinkedAttribs((prev: any) => ({ ...prev, items: prev.items.map((itm: any) => (itm.entity_id == eid ? { ...itm, entity_name: jsone.entity.name } : itm)) }));
        }).catch(handleHttpError);
      }
    });
  }, [linkedAttribs]);

  const addLinkedAttrib = async (id: string) => {
    if (linkedAttribs.items.filter((attr: AttribData) => attr.id == id).length > 0) {
      (window as any).notices.addNotice('error', 'Этот атрибут уже привязан');
      return;
    }

    getEntityAttribute(id).then((json) => {
      if (entitiesCache[json.entity.entity_id]) {
        const newItems = linkedAttribs.items;
        newItems.push({ ...json.entity, id: json.metadata.id, entity_name: entitiesCache[json.entity.entity_id].entity.name });
        setLinkedAttribs((prev: any) => ({ ...prev, items: newItems }));
        setDataModified(true);
      } else {
        getEntity(json.entity.entity_id).then((jsone) => {
          setEntityCache((prev: any) => ({ ...prev, [json.entity.entity_id]: jsone }));

          const newItems = linkedAttribs.items;
          newItems.push({ ...json.entity, id: json.metadata.id, entity_name: jsone.entity.name });

          setLinkedAttribs((prev: any) => ({ ...prev, items: newItems }));
          setDataModified(true);
        }).catch(handleHttpError);
      }
    }).catch(handleHttpError);
  };

  const addAllLinkedAttribs = async (entity_id: string) => {

    const newItems = linkedAttribs.items;
    getEntityAttributes(entity_id).then(json => {
      console.log('attribs', json);
      if (entitiesCache[entity_id]) {
        json.resources.forEach((attr:any) => {
          if (linkedAttribs.items.filter((a:AttribData) => a.id == attr.metadata.id).length == 0) {
            newItems.push({ ...attr.entity, id: attr.metadata.id, entity_name: entitiesCache[entity_id].entity.name });
          }
        });
        setLinkedAttribs((prev: any) => ({ ...prev, items: newItems }));
        setDataModified(true);
      } else {
        getEntity(entity_id).then(jsone => {
          setEntityCache((prev: any) => ({ ...prev, [entity_id]: jsone }));

          json.resources.forEach((attr:any) => {
            if (linkedAttribs.items.filter((a:AttribData) => a.id == attr.metadata.id).length == 0) {
              newItems.push({ ...attr.entity, id: attr.metadata.id, entity_name: jsone.entity.name });
            }
          });
          setLinkedAttribs((prev: any) => ({ ...prev, items: newItems }));
          setDataModified(true);
        }).catch(handleHttpError);
      }
    }).catch(handleHttpError);

  };

  const getIndicatorOptions = async (search: string) => searchIndicators({ filters: [], filters_for_join: [], global_query: search, limit: 15, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

  const getDataAssetOptions = async (search: string) => searchAssets({ filters: [], filters_for_join: [], global_query: search, limit: 15, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

  const getProductTypeOptions = async (search: string) => searchProductTypes({ filters: [], filters_for_join: [], global_query: search, limit: 99999, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

  const getProductSupplyVariantOptions = async (search: string) => searchProductSupplyVariants({ filters: [], filters_for_join: [], global_query: search, limit: 99999, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

  const getEntityOptions = async (search: string) => searchEntities({ filters: [], filters_for_join: [], global_query: search, limit: 99999, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, id: item.id, label: item.name, name: item.name })).filter((data: any) => allowedEntityIds.indexOf(data.id) != -1));

  const updateProductField = (field: string, value: string | string[] | [] | TDQRule[]) => {
    if (productId) {
      const d: any = {};
      d[field] = value;
      updateProduct(productId, d)
        .then((json) => {
          setDataModified(false);
          if (json.metadata.id && json.metadata.id !== productId) {
            navigate(`/products/edit/${encodeURIComponent(json.metadata.id)}`);
          } else { setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } })); }
        })
        .catch(handleHttpError);
    } else {
      setShowValidation(true);
      setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
      setDataModified(false);
    }
  };

  const editAttribsClicked = () => {
    if (isAttribsEditMode) {
      setAttribsEditMode(false);
      resetLinkedAttribs();
    } else {
      setAttribsEditMode(true);
    }
  };

  const saveAttribsClicked = () => {
    updateProductField('entity_attribute_ids', linkedAttribs.items.map((attr: AttribData) => attr.id));
    setAttribsEditMode(false);
  };

  const addDQRule = () => {
    setData((prev: any) => ({
      ...prev,
      entity: {
        ...prev.entity,
        dq_rules: [...prev.entity.dq_rules, {
          entity: {
            id: '',
            product_id: productId,
            dq_rule_id: '',
            settings: '',
            disabled: 'false',
            send_mail: 'true',
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
      updateProductField('dq_rules', arr);
    }
  };

  const updateDQRuleField = async (index: number, rowId: string, field: string, value: string) => {
    if (rowId !== '') {
      (data.entity.dq_rules[index] as TData).entity[field as keyof TDQRule] = value;

      updateProductField('dq_rules', data.entity.dq_rules);
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
      updateProductField('dq_rules', data.entity.dq_rules);
    }
  };

  const addTermLink = () => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, term_link_ids: [...prev.entity.term_link_ids, ''] } }));
  };

  const delTermLink = (k: number) => {
    const arr: string[] = [...data.entity.term_link_ids];
    arr.splice(k, 1);

    updateProductField('term_link_ids', arr.filter((x) => x));
  };

  const updateTermLink = (k: number, id: string) => {
    const arr: string[] = [...data.entity.term_link_ids];
    if (arr.length > k) { arr[k] = id; } else { arr.push(id); }

    updateProductField('term_link_ids', arr.filter((x) => x));
  };

  const getTermLinkObjects = async (search: string) => getBusinessEntities({
    sort: 'name+',
    global_query: search,
    limit: 10,
    offset: 0,
    filters: [...data.entity.term_link_ids, data.metadata.id, data.metadata.published_id ?? ''].filter((id) => id).map((id) => ({ column: 'id', value: id, operator: 'NOT_EQUAL' })),
    filters_for_join: [],
    state: 'PUBLISHED',
  }).then((json) => json.items);

  return (
    <div className={classNames(styles.page, styles.productPage, { [styles.loaded]: isLoaded })}>
      <div className={styles.mainContent}>
        {!productVersionId && (
          <WFItemControl
            key={`wfc-${uuid()}`}
            itemMetadata={data.metadata}
            itemIsReadOnly={isReadOnly}
            onEditClicked={() => { setReadOnly(false); }}
            onObjectIdChanged={(id) => {
              if (id) {
                setProductId(id);
                window.history.pushState(
                  {},
                  '',
                  `/products/edit/${encodeURIComponent(id)}`,
                );
              } else navigate('/products/');
            }}
            onObjectDataChanged={(d) => {
              setData(d);
              setDataModified(false);
              setBreadcrumbEntityName(productId, d.entity.name);
              setTags(d.metadata.tags ? d.metadata.tags.map((x: any) => ({ value: x.name })) : []);
              updateEditPageReadOnly(d, setReadOnly, () => {  setLoading(false); setLoaded(true); });
            }}
          />
        )}
        <div className={styles.title}>
          <FieldEditor
            isReadOnly={isReadOnly}
            labelPrefix={`${i18n('ПРОДУКТ')}: `}
            defaultValue={data.entity.name}
            className={styles.title}
            valueSubmitted={(val) => {
              updateProductField('name', val.toString());
            }}
            isRequired
            onBlur={(val) => {
              updateProductField('name', val.toString());
            }}
            showValidation={showValidation}
          />
        </div>
        {!isCreateMode && (
          <button className={styles.btn_scheme} onClick={() => { doNavigate(`/products-model/${encodeURIComponent(productId)}`, navigate); }}>{i18n('Схема')}</button>
        )}
        {!isCreateMode && (
          <Tags
            isReadOnly={isReadOnly}
            tags={tags}
            onTagAdded={(tagName: string) => tagAddedHandler(tagName, productId, 'product', data.metadata.state ?? '', tags, setLoading, setTags, '/products/edit/', navigate)}
            onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, productId, 'product', data.metadata.state ?? '', setLoading, setTags, '/products/edit/', navigate)}
          />
        )}
        <div className={styles.domain}>
              <FieldAutocompleteEditor
                className={styles.long_input}
                label={`${i18n('Домен')}: `}

                defaultValue={data.entity.domain_id}
                valueSubmitted={(i) => updateProductField('domain_id', i)}
                getDisplayValue={getDomainDisplayValue}
                getObjects={getDomainAutocompleteObjects}
                showValidation={showValidation}
                artifactType="domain"
                isReadOnly={isReadOnly}
                allowClear
              />
            </div>
        {!isCreateMode && (
          <>
            <div className={styles.description}>
              <FieldEditor
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${`${i18n('Описание')}:`} `}
                defaultValue={data.entity.description}
                className={styles.long_input}
                valueSubmitted={(val) => {
                  updateProductField('description', val.toString());
                }}
                onBlur={(val) => {
                  updateProductField('description', val);
                }}
              />
            </div>

            <div className={styles.problem}>
              <FieldEditor
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${`${i18n('Решаемая проблема')}:`} `}
                defaultValue={data.entity.problem}
                className={styles.long_input}
                valueSubmitted={(val) => {
                  updateProductField('problem', val.toString());
                }}
                onBlur={(val) => {
                  updateProductField('problem', val);
                }}
              />
            </div>
            <div className={styles.consumer}>
              <FieldEditor
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${`${i18n('Потребитель')}:`} `}
                defaultValue={data.entity.consumer}
                className={styles.long_input}
                valueSubmitted={(val) => {
                  updateProductField('consumer', val.toString());
                }}
                onBlur={(val) => {
                  updateProductField('consumer', val);
                }}
              />
            </div>
            <div className={styles.value}>
              <FieldEditor
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${`${i18n('Ценность')}:`} `}
                defaultValue={data.entity.value}
                className={styles.long_input}
                valueSubmitted={(val) => {
                  updateProductField('value', val.toString());
                }}
                onBlur={(val) => {
                  updateProductField('value', val);
                }}
              />
            </div>
            <div className={styles.finance_source}>
              <FieldEditor
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${`${i18n('Источник финансирования')}:`} `}
                defaultValue={data.entity.finance_source}
                className={styles.long_input}
                valueSubmitted={(val) => {
                  updateProductField('finance_source', val.toString());
                }}
                onBlur={(val) => {
                  updateProductField('finance_source', val);
                }}
              />
            </div>
            
            <div className={styles.indicators}>
              <FieldArrayEditor
                key={`ed-ind-${productId}`}
                getOptions={getIndicatorOptions}
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${i18n('Содержит показатели')}: `}
                className={styles.long_input}
                defaultValue={selectedIndicatorNames}
                inputPlaceholder={i18n('Выберите показатель')}
                addBtnText={i18n('Добавить')}
                valueSubmitted={() => { updateProductField('indicator_ids', data.entity.indicator_ids); }}
                onValueIdAdded={(id: string) => {
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, indicator_ids: [...prev.entity.indicator_ids, id] } }));
                }}
                onValueIdRemoved={(id: string) => {
                  const arr = [...data.entity.indicator_ids];
                  arr.splice(parseInt(id), 1);
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, indicator_ids: arr } }));
                }}
              />
            </div>
            <div className={styles.product_type}>
              <FieldArrayEditor
                key={`ed-ptype-${productId}`}
                getOptions={getProductTypeOptions}
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${i18n('Тип')}: `}
                className={styles.long_input}
                defaultValue={selectedProductTypeNames}
                inputPlaceholder={i18n('Выберите тип продукта')}
                addBtnText={i18n('Добавить')}
                valueSubmitted={() => { updateProductField('product_type_ids', data.entity.product_type_ids); }}
                onValueIdAdded={(id: string) => {
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, product_type_ids: [...prev.entity.product_type_ids, id] } }));
                }}
                onValueIdRemoved={(id: string) => {
                  const arr = [...data.entity.product_type_ids];
                  arr.splice(parseInt(id), 1);
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, product_type_ids: arr } }));
                }}
              />
            </div>
            <div className={styles.product_supply_variant}>
              <FieldArrayEditor
                key={`ed-psv-${productId}`}
                getOptions={getProductSupplyVariantOptions}
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${i18n('Варианты поставки')}: `}
                className={styles.long_input}
                defaultValue={selectedProductSupplyVariantNames}
                inputPlaceholder={i18n('Выберите вариант поставки')}
                addBtnText={i18n('Добавить')}
                valueSubmitted={() => { updateProductField('product_supply_variant_ids', data.entity.product_supply_variant_ids); }}
                onValueIdAdded={(id: string) => {
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, product_supply_variant_ids: [...prev.entity.product_supply_variant_ids, id] } }));
                }}
                onValueIdRemoved={(id: string) => {
                  const arr = [...data.entity.product_supply_variant_ids];
                  arr.splice(parseInt(id), 1);
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, product_supply_variant_ids: arr } }));
                }}
              />
            </div>
            <div className={styles.data_assets}>
              <FieldArrayEditor
                key={`ed-dass-${productId}`}
                getOptions={getDataAssetOptions}
                isReadOnly={isReadOnly}
                layout="separated"
                labelPrefix={`${i18n('Источники данных (активы)')}: `}
                className={styles.long_input}
                defaultValue={selectedDataAssetNames}
                inputPlaceholder={i18n('Выберите актив')}
                addBtnText={i18n('Добавить')}
                valueSubmitted={() => { updateProductField('data_asset_ids', data.entity.data_asset_ids); }}
                onValueIdAdded={(id: string) => {
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, data_asset_ids: [...prev.entity.data_asset_ids, id] } }));
                }}
                onValueIdRemoved={(id: string) => {
                  const arr = [...data.entity.data_asset_ids];
                  arr.splice(parseInt(id), 1);
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, data_asset_ids: arr } }));
                }}
              />
            </div>
            {!isCreateMode && (
                <FieldEditor
                  isReadOnly={isReadOnly}
                  layout="separated"
                  labelPrefix={`${i18n('Ссылка на справочник')} `}
                  defaultValue={data.entity.link}
                  className={styles.long_input}
                  valueSubmitted={(val) => {
                    updateProductField('link', val.toString());
                  }}
                />
            )}
            {!isCreateMode && (
                <FieldEditor
                  isReadOnly={isReadOnly}
                  layout="separated"
                  labelPrefix={`${i18n('Законодательные ограничения')} `}
                  defaultValue={data.entity.limits}
                  className={styles.long_input}
                  valueSubmitted={(val) => {
                    updateProductField('limits', val.toString());
                  }}
                />
            )}
            {!isCreateMode && (
                <FieldEditor
                  isReadOnly={isReadOnly}
                  layout="separated"
                  labelPrefix={`${i18n('Внутренние ограничения')} `}
                  defaultValue={data.entity.limits_internal}
                  className={styles.long_input}
                  valueSubmitted={(val) => {
                    updateProductField('limits_internal', val.toString());
                  }}
                />
            )}
            {!isCreateMode && (
                <FieldEditor
                  isReadOnly={isReadOnly}
                  layout="separated"
                  labelPrefix={`${i18n('Ключевые роли процесса')} `}
                  defaultValue={data.entity.roles}
                  className={styles.long_input}
                  valueSubmitted={(val) => {
                    updateProductField('roles', val.toString());
                  }}
                />
            )}
            {!isCreateMode && (
              <div className={classNames(styles.data_row, styles.synonyms_row)}>
                <div className={styles.synonyms_head}>
                  <label>{`${i18n('Ссылки на другие Термины')}:`}</label>
                  {!isReadOnly && (<PlusInCircle onClick={addTermLink} />)}
                </div>
                {(data.entity.term_link_ids ?? []).map((sId, k) => (
                  <div key={`si22${k}-${sId}`} className={styles.synonym_item}>
                    <FieldAutocompleteEditor
                      key={`se22${k}`}
                      className={styles.long_input}
                      isReadOnly={isReadOnly}
                      label=""
                      defaultValue={sId}
                      valueSubmitted={(identity) => updateTermLink(k, identity)}
                      getDisplayValue={getBusinessEntityDisplayValue}
                      getObjects={getTermLinkObjects}
                    />
                    {!isReadOnly && (<Close key={`ds22${k}`} onClick={() => delTermLink(k)} />)}
                  </div>
                ))}
              </div>

            )}
            <div className={styles.attributes}>
              <div className={`${styles.field_editor} ${styles.long_input}`}>
                <div className={styles.row_value}>
                  <div className={styles.value}>{i18n('Атрибуты в связанных дата-активах')}</div>
                  {!isReadOnly && isAttribsEditMode && (
                    <Autocomplete2
                      getOptions={getEntityOptions}
                      defaultOptions
                      className={styles.select_entity}
                      placeholder={i18n('Выберите логический объект...')}
                      onChanged={(data: any) => { setAttribsEntity(data); }}
                      defaultInputValue={attribsEntity ? attribsEntity.name : ''}
                    />
                  )}
                  {!isReadOnly && (
                    <a
                      className={styles.btn_edit}
                      onClick={editAttribsClicked}
                    />
                  )}

                </div>
                <div className={classNames(styles.row_linked_attribs, { [styles.hidden]: !isAttribsEditMode })}>

                  <div className={styles.tbl}>
                    <Table
                      cookieKey='prod-attrs-linked'
                      key={`tbl-la-${productId}`}
                      columns={[
                        { property: 'name', header: i18n('Название') },
                        { property: 'attribute_type', header: i18n('Тип') },
                        { property: 'entity_name', header: i18n('Логический объект') },
                        { property: 'id', header: '', sortDisabled: true, filterDisabled: true, render: (item: any) => { return <div><a onClick={() => removeLinkedAttrib(item.id)} className={classNames(styles.btn_remove_attrib)}><CrossIcon /></a></div>; return <div />; } },
                      ]}
                      paginate
                      dataUrl=""
                      initialData={linkedAttribs.items}
                      initialFetchRequest={{ offset: 0, limit: 5, filters: [] }}
                      fullWidthLayout
                      columnSearch
                      subtitle={isAttribsEditMode ? (i18n('Привязанные атрибуты') + (linkedAttribs.items.length == 0 ? ` (${i18n('нет')})` : '')) : ''}
                      tableButtons={isAttribsEditMode ? [
                        {
                          text: 'Отвязать все атрибуты',
                          onClick: () => {
                            setLinkedAttribs((prev:any) => ({...prev, items: []}));
                            setDataModified(true);
                          }
                        }
                      ] : []}
                    />
                  </div>
                  {!isReadOnly && isAttribsEditMode && (<a className={styles.btn_save} onClick={saveAttribsClicked}><OrangePencilIcon /></a>)}
                </div>
                {!isReadOnly && isAttribsEditMode && attribsEntity && (
                  <div className={styles.row_entity_attribs}>
                    <Table
                      cookieKey='prods-attrs-unlinked'
                      key={uuid()}
                      columns={[
                        { property: 'name', header: i18n('Название') },
                        { property: 'attribute_type', header: i18n('Тип'), sortDisabled: true, filterDisabled: true },
                        { property: 'entity_id', header: i18n('Логический объект'), sortDisabled: true, filterDisabled: true, render: (item: any) => <div>{attribsEntity ? attribsEntity.name : ''}</div> },
                        { property: 'id', header: '', sortDisabled: true, filterDisabled: true, render: (item: any) => <div><a key={`a${linkedAttribs.length}${item.id}`} onClick={() => { addLinkedAttrib(item.id); }} className={styles.btn_add_attrib}><PlusIcon /></a></div> },
                      ]}
                      paginate
                      dataUrl={attribsEntity ? `/v1/entities/search_attributes_by_entity_id/${encodeURIComponent(attribsEntity.value)}` : ''}
                      initialFetchRequest={{ sort: 'name+', global_query: '', limit: 5, offset: 5 * (table2page - 1), filters: linkedAttribs.items.map((la: any) => ({ column: 'id', operator: 'NOT_EQUAL', value: la.id })), filters_preset: [], filters_for_join: [] }}
                      showCreateBtn={false}
                      fullWidthLayout
                      columnSearch
                      onPageChange={(page) => { setTable2Page(page); }}
                      subtitle={i18n('Не привязанные атрибуты')}
                      tableButtons={[
                        { text: 'Привязать все', onClick: () => {
                          addAllLinkedAttribs(attribsEntity.value);
                        }}
                      ]}
                    />
                  </div>
                )}
              </div>
            </div>

          </>
        )}
        {!isCreateMode && (
          <div className={styles.dqrule_wrap}>
            <div className={styles.dqrule_head}>
              <label>{`${i18n('Правила проверки качества')}:`}</label>
              {!isReadOnly && (<PlusInCircle onClick={addDQRule} />)}
            </div>
            {data.entity.dq_rules && data.entity.dq_rules.map((v, index) => (
              <div key={`d${(v as TData).metadata.id}`} className={styles.dqrule_item}>
                <FieldAutocompleteEditor
                  key={`se${(v as TData).metadata.id}`}
                  className={styles.long_input}
                  isReadOnly={isReadOnly}
                  label=""
                  defaultValue={(v as TData).entity.dq_rule_id}
                  valueSubmitted={(val) => updateDQRuleField(index, (v as TData).metadata.id, 'dq_rule_id', val)}
                  getDisplayValue={getDQRuleDisplayValue}
                  getObjects={getDQRuleAutocompleteObjects}
                  artifactType="dq_rule"
                />
                <FieldEditor
                  key={`fe${(v as TData).metadata.id}`}
                  isReadOnly={isReadOnly}
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
                  isReadOnly={isReadOnly}
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
                  isReadOnly={isReadOnly}
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
                {!isReadOnly && (
                  <div key={`d${(v as TData).metadata.id}`} className={styles.dqrule_close}>
                    <CloseIcon key={`fec${(v as TData).metadata.id}`} onClick={() => delDQRule(index, (v as TData).metadata.id)} />
                  </div>
                )}
              </div>
            ))}

          </div>
        )}
      </div>
      {!isCreateMode && (
        <div className={styles.rightBar}>
          {data.metadata.state === 'PUBLISHED' && (
            <Versions
              rating={ratingData.rating}
              ownRating={ownRating}
              version_id={productVersionId || data.metadata.version_id}
              versions={versions}
              version_url_pattern={`/products/${encodeURIComponent(productId)}/version/{version_id}`}
              root_object_url={`/products/edit/${encodeURIComponent(productId)}`}
              onRateClick={r => rateClickedHandler(r, productId, 'product', setOwnRating, setRatingData)}
            />
          )}
        </div>
      )}

    </div>
  );
}
