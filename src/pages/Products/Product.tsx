/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import classNames from 'classnames';
import { v4 } from 'uuid';
import styles from './Products.module.scss';
import { doNavigate, getQueryAutocompleteObjects, getQueryDisplayValue, getArtifactUrl, getDQRuleAutocompleteObjects, getDQRuleDisplayValue, getDQRuleSettings, getDomainAutocompleteObjects, getDomainDisplayValue, handleHttpError, i18n, setDataModified, updateArtifactsCount, uuid, getBusinessEntityDisplayValue, loadEditPageData, tagAddedHandler, tagDeletedHandler, rateClickedHandler, updateEditPageReadOnly, setBreadcrumbEntityName, setCookie, getEntityQueryAutocompleteObjects, getDataModified } from '../../utils';
import { Tags, TagProp } from '../../components/Tags';
import { Versions, VersionData } from '../../components/Versions';
import { FieldArrayEditor } from '../../components/FieldArrayEditor/FieldArrayEditor';
import { setRecentView } from '../../services/pages/recentviews';
import { WFItemControl } from '../../components/WFItemControl/WFItemControl';
import { ReactComponent as CloseIcon } from '../../assets/icons/close.svg';
import { ReactComponent as PlusBlue } from '../../assets/icons/plus-blue.svg';
import {
  searchProducts, getProduct, getProductSupplyVariant, getProductType, getProductVersion, getProductVersions, searchProductSupplyVariants, searchProductTypes, updateProduct, deleteProduct, restoreProductVersion, archiveProduct, restoreProduct,
} from '../../services/pages/products';
import { getIndicator, searchIndicators } from '../../services/pages/indicators';
import { ProductData, TDQRule, TData } from '../../types/data';
import { ReactComponent as PlusIcon } from '../../assets/icons/plus.svg';
import { ReactComponent as CrossIcon } from '../../assets/icons/cross.svg';
import { Table } from '../../components/Table';
import { getEntity, getEntityAttribute, getEntityAttributes, searchEntities } from '../../services/pages/dataEntities';
import { Autocomplete2 } from '../../components/Autocomplete2';
import { FieldAutocompleteEditor } from '../../components/FieldAutocompleteEditor';
import { getAsset, searchAssets } from '../../services/pages/dataAssets';
import { FieldCheckboxEditor } from '../../components/FieldCheckboxEditor/FieldCheckboxEditor';
import { getBusinessEntities, getBusinessEntity } from '../../services/pages/businessEntities';
import { userInfoRequest } from '../../services/auth';
import { RelatedObjectsControl } from '../../components/RelatedObjectsControl';
import { DeleteObjectModal } from '../../components/DeleteObjectModal';
import { Button } from '../../components/Button';
import { FieldVisualEditor } from '../../components/FieldVisualEditor';
import { ArtifactInfo } from '../../components/ArtifactInfo';
import { Tabs } from '../../components/Tabs';
import { FieldTextEditor } from '../../components/FieldTextEditor';
import { FieldTextareaEditor } from '../../components/FieldTextareaEditor';
import useUrlState from '@ahooksjs/use-url-state';
import { StaticNoticesArea } from '../../components/StaticNoticesArea';
import { RatingBlock } from '../../components/RatingBlock';
import { ArtifactAuthor } from '../../components/ArtifactAuthor';

export type AttribData = {
  id: string;
  name: string;
};

export function Product() {
  const navigate = useNavigate();

  const [state, setState] = useUrlState({ sc: 1 }, { navigateMode: 'replace' });
  const [data, setData] = useState<ProductData>({
    entity: {
      name: '', description: '', short_description: '', indicator_ids: [], entity_attribute_ids: [], domain_id: null, entity_query_id: null, product_ids: [], problem: '', consumer: '', value: '', finance_source: '', product_type_ids: [],
      product_supply_variant_ids: [], data_asset_ids: [], dq_rules: [], link: '', limits: '', limits_internal: '', term_link_ids: [], roles: ''
    },
    metadata: { id: '', artifact_type: 'product', version_id: '', tags: [], state: 'PUBLISHED', ancestor_draft_id: '' },
  });
  const [ratingData, setRatingData] = useState({ rating: 0, total_rates: 0 });
  const [ownRating, setOwnRating] = useState(0);
  const [versions, setVersions] = useState<VersionData[]>([]);
  const [tags, setTags] = useState<TagProp[]>([]);

  
  const [showValidation, setShowValidation] = useState(false);
  const [selectedProductNames, setSelectedProductNames] = useState<any[]>([]);
  const [selectedIndicatorNames, setSelectedIndicatorNames] = useState<any[]>([]);
  const [selectedDataAssetNames, setSelectedDataAssetNames] = useState<any[]>([]);
  const [selectedTermLinkNames, setSelectedTermLinkNames] = useState<any[]>([]);
  const [allowedEntityIds, setAllowedEntityIds] = useState<any[]>([]);
  const [selectedProductTypeNames, setSelectedProductTypeNames] = useState<any[]>([]);
  const [selectedProductSupplyVariantNames, setSelectedProductSupplyVariantNames] = useState<any[]>([]);
  const [linkedAttribs, setLinkedAttribs] = useState<any[]>([]);
  const [isAttribsEditMode, setAttribsEditMode] = useState<boolean>(false);
  const [attribsEntity, setAttribsEntity] = useState<any>(null);
  const [entitiesCache, setEntityCache] = useState<any>({});

  const [isReadOnly, setReadOnly] = useState(true);
  const [, setLoading] = useState(true);
  const [isLoaded, setLoaded] = useState(false);
  const [isWFLoading, setWFLoading] = useState<boolean>(false);

  const { id, version_id } = useParams();

  const [productId, setProductId] = useState<string>(id ?? '');
  const [productVersionId, setProductVersionId] = useState<string>(version_id ?? '');
  const [table2page, setTable2Page] = useState(1);

  const [delObjectData, setDelObjectData] = useState<any>({ id: '', name: '' });
  const [showDelDlg, setShowDelDlg] = useState(false);

  useEffect(() => {
    if (id) setProductId(id);
    setProductVersionId(version_id ?? '');
    setDataModified(false);
  }, [id, version_id]);

  const loadData = () => {
    
    if (productId) {
      if (!productVersionId) { setRecentView('product', productId); }

      loadEditPageData(productId, productVersionId, setData, setTags, setLoading, setLoaded, getProductVersion, getProduct, setRatingData,
        setOwnRating, getProductVersions, setVersions, setReadOnly);


    } else {

      userInfoRequest().then(resp => {
        resp.json().then(data => {
          setCookie('userp', data.permissions.join(','), { path: '/' });
          setData((prev) => ({ ...prev, metadata: { ...prev.metadata, state: 'DRAFT' }, entity: { ...prev.entity, domain_id: data.steward_domains ? data.steward_domains[0] : null } }));
          setDataModified(false);
          setReadOnly(false);
          setLoaded(true);
        });
      });

    }
  }

  useEffect(() => {
    loadData();
  }, [productId, productVersionId]);

  useEffect(() => {
    setSelectedIndicatorNames(data.entity.indicator_ids.map(x => ''));
    data.entity.indicator_ids.forEach((id) => {
      getIndicator(id).then((json) => {
        let index = data.entity.indicator_ids.indexOf(json.metadata.id);
        setSelectedIndicatorNames((prev) => (prev.map((el, i) => { if (i == index) return `<div><a href="${getArtifactUrl(json.metadata.id, 'indicator')}">${json.entity.name}</a></div>`; else return el; })));
      }).catch(handleHttpError);
    });
  }, [data.entity.indicator_ids]);

  useEffect(() => {
    setSelectedProductNames(data.entity.product_ids.map(x => ''));
    data.entity.product_ids.forEach((id) => {
      getProduct(id).then((json) => {
        let index = data.entity.product_ids.indexOf(json.metadata.id);
        setSelectedProductNames((prev) => (prev.map((el, i) => { if (i == index) return `<div><a href="${getArtifactUrl(json.metadata.id, 'product')}">${json.entity.name}</a></div>`; else return el; })));
      }).catch(handleHttpError);
    });
  }, [data.entity.product_ids]);

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
    for (let i = 0; i < data.entity.term_link_ids.length; i++) { a.push(''); }
    setSelectedTermLinkNames(a);

    data.entity.term_link_ids.forEach((id, index) => {
      getBusinessEntity(id).then((json) => {
        setSelectedTermLinkNames((prev) => ([...prev.slice(0, index), `<div><a href="${getArtifactUrl(json.metadata.id, 'business_entity')}">${json.entity.name}</a></div>`, ...prev.slice(index + 1)]));
      }).catch(handleHttpError);
    });
  }, [data.entity.term_link_ids]);

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

  useEffect( () => {
    setLinkedAttribs([]);
    (data.entity.entity_attribute_ids ?? []).forEach((aid) => {
      getEntityAttribute(aid).then((json) => {
        setLinkedAttribs((prev) => ([...prev, { ...json.entity, id: json.metadata.id }]));
      });
    });
  }, [data.entity.entity_attribute_ids]);

  const removeLinkedAttrib = (id: string) => {
    //setLinkedAttribs((prev: any) => ([ ...prev.filter((x: any) => x.id != id) ]));

    updateProductField('entity_attribute_ids', [...data.entity.entity_attribute_ids.filter((x:any) => x != id)]);

    setDataModified(true);
  };

  useEffect(() => {
    linkedAttribs.filter((i: any) => !i.entity_name).map((item: any) => (item.entity_id)).forEach((eid: string) => {
      if (entitiesCache[eid]) {
        const la = [...linkedAttribs.map((itm: any) => (itm.entity_id == eid ? { ...itm, entity_name: entitiesCache[eid].entity.name } : itm)) ];
        setLinkedAttribs(la);
        
      } else {
        getEntity(eid).then((jsone) => {
          setEntityCache((prev: any) => ({ ...prev, [eid]: jsone }));
          const la = [ ...linkedAttribs.map((itm: any) => (itm.entity_id == eid ? { ...itm, entity_name: jsone.entity.name } : itm)) ];
          setLinkedAttribs(la);
          
        }).catch(handleHttpError);
      }
    });

    
  }, [linkedAttribs]);

  const addLinkedAttrib = async (id: string) => {
    if (linkedAttribs.filter((attr: AttribData) => attr.id == id).length > 0) {
      (window as any).notices.addNotice('error', 'Этот атрибут уже привязан');
      return;
    }

    /*getEntityAttribute(id).then((json) => {
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
    }).catch(handleHttpError);*/

    
    updateProductField('entity_attribute_ids', [...data.entity.entity_attribute_ids, id]);
  };

  const addAllLinkedAttribs = async (entity_id: string) => {

    const newItems = linkedAttribs;
    getEntityAttributes(entity_id).then(json => {
      if (entitiesCache[entity_id]) {
        json.resources.forEach((attr: any) => {
          if (linkedAttribs.filter((a: AttribData) => a.id == attr.metadata.id).length == 0) {
            newItems.push({ ...attr.entity, id: attr.metadata.id, entity_name: entitiesCache[entity_id].entity.name });
          }
        });
        //setLinkedAttribs(newItems);
        var ids = [...data.entity.entity_attribute_ids];
        newItems.forEach(item => {
          if (data.entity.entity_attribute_ids.indexOf(item.id) == -1)
            ids.push(item.id);
        });
        updateProductField('entity_attribute_ids', ids);
        
        setDataModified(true);
      } else {
        getEntity(entity_id).then(jsone => {
          setEntityCache((prev: any) => ({ ...prev, [entity_id]: jsone }));

          json.resources.forEach((attr: any) => {
            if (linkedAttribs.filter((a: AttribData) => a.id == attr.metadata.id).length == 0) {
              newItems.push({ ...attr.entity, id: attr.metadata.id, entity_name: jsone.entity.name });
            }
          });
          //setLinkedAttribs(newItems);
          var ids = [...data.entity.entity_attribute_ids];
          newItems.forEach(item => {
            if (data.entity.entity_attribute_ids.indexOf(item.id) == -1)
              ids.push(item.id);
          });
          updateProductField('entity_attribute_ids', ids);

          setDataModified(true);
        }).catch(handleHttpError);
      }
    }).catch(handleHttpError);

  };

  const removeAllLinkedAttribs = async (entity_id: string) => {

    const newItems = linkedAttribs;
    getEntityAttributes(entity_id).then(json => {
      if (entitiesCache[entity_id]) {
        json.resources.forEach((attr: any) => {
          if (linkedAttribs.filter((a: AttribData) => a.id == attr.metadata.id).length == 0) {
            newItems.push({ ...attr.entity, id: attr.metadata.id, entity_name: entitiesCache[entity_id].entity.name });
          }
        });
        //setLinkedAttribs(newItems);
        var ids = [...data.entity.entity_attribute_ids];
        newItems.forEach(item => {
          ids = ids.filter(x => x != item.id);
        });
        updateProductField('entity_attribute_ids', ids);
        
        setDataModified(true);
      } else {
        getEntity(entity_id).then(jsone => {
          setEntityCache((prev: any) => ({ ...prev, [entity_id]: jsone }));

          json.resources.forEach((attr: any) => {
            if (linkedAttribs.filter((a: AttribData) => a.id == attr.metadata.id).length == 0) {
              newItems.push({ ...attr.entity, id: attr.metadata.id, entity_name: jsone.entity.name });
            }
          });
          //setLinkedAttribs(newItems);
          var ids = [...data.entity.entity_attribute_ids];
          newItems.forEach(item => {
            ids = ids.filter(x => x != item.id);
          });
          updateProductField('entity_attribute_ids', ids);

          setDataModified(true);
        }).catch(handleHttpError);
      }
    }).catch(handleHttpError);

  };

  const getIndicatorOptions = async (search: string) => searchIndicators({ filters: [], filters_for_join: [], global_query: search, limit: 1000, offset: 0, sort: null, state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

  const getProductOptions = async (search: string) => searchProducts({
    filters: [{
      "column": "id",
      "value": productId,
      "operator": "NOT_EQUAL"
    }], filters_for_join: [], global_query: search, limit: 1000, offset: 0, sort: null, state: 'PUBLISHED'
  }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));


  const getDataAssetOptions = async (search: string) => searchAssets({ filters: [], filters_for_join: [], global_query: search, limit: 1000, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

  const getProductTypeOptions = async (search: string) => searchProductTypes({ filters: [], filters_for_join: [], global_query: search, limit: 99999, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

  const getProductSupplyVariantOptions = async (search: string) => searchProductSupplyVariants({ filters: [], filters_for_join: [], global_query: search, limit: 99999, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

  const getEntityOptions = async (search: string) => searchEntities({ filters: [], filters_for_join: [], global_query: search, limit: 99999, offset: 0, sort: 'name+', state: 'PUBLISHED' }).then((json) => json.items.map((item: any) => ({ value: item.id, id: item.id, label: item.name, name: item.name })).filter((data: any) => allowedEntityIds.indexOf(data.id) != -1));

  const postSaveRequest = async () => {
    if (productId) {
      
      return await updateProduct(productId, data.entity)
        .then((json) => {
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
      
      if (json && json.metadata.id && json.metadata.id !== productId) {
        navigate(`/products/edit/${encodeURIComponent(json.metadata.id)}`);
      }
      
    }).catch(handleHttpError);

  }

  const updateProductField = (field: string, value: string | undefined | string[] | [] | TDQRule[]) => {
    setData((prev: any) => ({ ...prev, entity: { ...prev.entity, [field]: value } }));
    setDataModified(true);

    /*if (productId) {
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
    }*/
  };

  const saveAttribsClicked = () => {
    updateProductField('entity_attribute_ids', linkedAttribs.map((attr: AttribData) => attr.id));
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
    limit: 1000,
    offset: 0,
    filters: [...data.entity.term_link_ids, data.metadata.id, data.metadata.published_id ?? ''].filter((id) => id).map((id) => ({ column: 'id', value: id, operator: 'NOT_EQUAL' })),
    filters_for_join: [],
    state: 'PUBLISHED',
  }).then((json) => json.items.map((item: any) => ({ value: item.id, label: item.name, name: item.name })));

  const delDlgSubmit = () => {
    setShowDelDlg(false);
    //setLoading(true);
    deleteProduct(delObjectData.id)
      .then(json => {
        updateArtifactsCount();
        //setLoading(false);

        if (json.metadata && json.metadata.id)
          navigate('/products/edit/' + encodeURIComponent(json.metadata.id));
      })
      .catch(handleHttpError);
    setDelObjectData({ id: '', name: '' });
  };

  const archiveBtnClicked = () => { 
    setWFLoading(true);
    
    archiveProduct(data.metadata.id).then(json => {
    if (json.metadata.id && json.metadata.id != productId) {
      navigate(`/products/edit/${encodeURIComponent(json.metadata.id)}`);
    }
    setDataModified(false);
    setWFLoading(false);
  }).catch(handleHttpError); };

  const restoreBtnClicked = () => { restoreProduct(data.metadata.id).then(json => {
    if (json.metadata.id && json.metadata.id != productId) {
      navigate(`/products/edit/${encodeURIComponent(json.metadata.id)}`);
    }
    setDataModified(false);
  }).catch(handleHttpError); };

  return (
    <div className={classNames(styles.page, styles.transparent, { [styles.loaded]: isLoaded })}>
      <div className={styles.title_row}>
        <h1 className={styles.title}>{data.entity.name}</h1>
        <div className={styles.buttons}>
          {productVersionId && (
            <Button onClick={() => {
              restoreProductVersion(productId, productVersionId).then(json => {
                setDataModified(false);
                if (json.metadata.id && json.metadata.id !== productId) {
                  navigate(`/products/edit/${encodeURIComponent(json.metadata.id)}`);
                } else { setData(json); }
              }).catch(handleHttpError);
            }}>{i18n('Восстановить')}</Button>
          )}
          {!productVersionId && (
            <WFItemControl
              key={`wfc-prod-` + data?.metadata?.workflow_task_id}
              itemMetadata={data.metadata}
              itemIsReadOnly={isReadOnly}
              saveItem={postSaveRequest}
              isLoading={isWFLoading}
              onEditClicked={() => { setReadOnly(false); setDataModified(true); }}
              onArchiveClicked={archiveBtnClicked}
              onRestoreClicked={restoreBtnClicked}
              onDeleteClicked={() => { setDelObjectData({ id: data.metadata.id, name: data.entity.name }); setShowDelDlg(true); }}
              onCancelEditClicked={() => { loadData(); }}
              onSaveClicked={saveData}
              onObjectIdChanged={(id) => {
                if (id) {
                  navigate(`/products/edit/${id}`);
                  /*setProductId(id);
                  window.history.pushState(
                    {},
                    '',
                    `/products/edit/${encodeURIComponent(id)}`,
                  );*/
                } else navigate('/products/');
              }}
              onObjectDataChanged={(d) => {
                setData(d);
                setDataModified(false);
                setBreadcrumbEntityName(productId, d.entity.name);
                setTags(d.metadata.tags ? d.metadata.tags.map((x: any) => ({ value: x.name })) : []);
                updateEditPageReadOnly(d, setReadOnly, () => {  });
              }}
            />
          )}
        </div>
      </div>
      <div className={styles.artifact_info_row}>
        <ArtifactInfo artifactType='product' state={data.metadata.state} favControl artifactId={productId} />
        {(data.metadata.state == 'PUBLISHED' || data.metadata.state == 'ARCHIVED') && (
          <Versions
            version_id={productVersionId || data.metadata.version_id}
            versions={versions}
            version_url_pattern={`/products/${encodeURIComponent(productId)}/version/{version_id}`}
            root_object={{id: productId, artifact_type: 'product'}}
          />
        )}
        {(data.metadata.state == 'PUBLISHED' || data.metadata.state == 'ARCHIVED') && (
          <RatingBlock rating={ratingData.rating} ownRating={ownRating} showRating 
            onRateClick={r => rateClickedHandler(r, productId, 'product', setOwnRating, setRatingData)}
          />
        )}
        <ArtifactAuthor userId={data.metadata.created_by} />
      </div>
      <StaticNoticesArea />
      <Tabs onTabChange={(t: number) => { setState(() => ({ sc: t })); }} tabNumber={state.sc} tabs={[
        {
          key: 'tab-gen',
          title: i18n('Сведения'),
          unscrollable: true,
          content: <div className={styles.tab_2col}>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Общая информация</h2>
              {data.metadata.state != 'ARCHIVED' && (
                <div>
                <button className={styles.btn_scheme} onClick={() => { doNavigate(`/products-model/${encodeURIComponent(productId)}`, navigate); }}>{i18n('Смотреть схему')}</button>
                </div>
              )}

              

              <FieldTextEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Название')}
                  defaultValue={data.entity.name}
                  className=''
                  valueSubmitted={(val) => {
                    updateProductField('name', val);
                  }}
                />

              <FieldAutocompleteEditor
                className=''
                label={i18n('Домен')}
                defaultValue={data.entity.domain_id}
                valueSubmitted={(i) => updateProductField('domain_id', i)}
                getDisplayValue={getDomainDisplayValue}
                getObjects={getDomainAutocompleteObjects}
                showValidation={showValidation}
                artifactType="domain"
                isReadOnly={isReadOnly}
                allowClear
              />

              <FieldTextareaEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Описание')}
                  defaultValue={data.entity.short_description}
                  className=''
                  valueSubmitted={(val) => {
                    updateProductField('short_description', val ?? '');
                  }}
                />

              
              <div data-uitest="product_tag" className={styles.tags_block}>
                <div className={styles.label}>{i18n('Теги')}</div>
                <Tags
                  key={'tags-' + productId + '-' + productVersionId + '-' + uuid()}
                  isReadOnly={isReadOnly}
                  tags={tags}
                  tagPrefix='#'
                  onTagAdded={(tagName: string) => tagAddedHandler(tagName, productId, 'product', data.metadata.state ?? '', tags, setLoading, setTags, '/products/edit/', navigate)}
                  onTagDeleted={(tagName: string) => tagDeletedHandler(tagName, productId, 'product', data.metadata.state ?? '', setLoading, setTags, '/products/edit/', navigate)}
                />
              </div>
            
            </div>
            <div className={classNames(styles.col, styles.scrollable)}>
              <h2>Дополнительные параметры</h2>

              <FieldTextEditor
                isReadOnly={isReadOnly}
                label={i18n('Решаемая проблема')}
                defaultValue={data.entity.problem}
                className=''
                valueSubmitted={(val) => {
                  updateProductField('problem', val);
                }}
              />

              <FieldTextEditor
                isReadOnly={isReadOnly}
                label={i18n('Потребитель')}
                defaultValue={data.entity.consumer}
                className=''
                valueSubmitted={(val) => {
                  updateProductField('consumer', val);
                }}
              />

              <FieldTextEditor
                isReadOnly={isReadOnly}
                label={i18n('Ценность')}
                defaultValue={data.entity.value}
                className=''
                valueSubmitted={(val) => {
                  updateProductField('value', val);
                }}
              />

              <FieldTextEditor
                isReadOnly={isReadOnly}
                label={i18n('Источник финансирования')}
                defaultValue={data.entity.finance_source}
                className=''
                valueSubmitted={(val) => {
                  updateProductField('finance_source', val);
                }}
              />

              <FieldAutocompleteEditor
                className=''
                label={i18n('Запрос')}
                defaultValue={data.entity.entity_query_id}
                valueSubmitted={(i) => updateProductField('entity_query_id', i)}
                getDisplayValue={getQueryDisplayValue}
                getObjects={getQueryAutocompleteObjects}
                showValidation={showValidation}
                artifactType="entity_query"
                isReadOnly={isReadOnly}
                allowClear
              />

              <FieldArrayEditor
                key={`ed-prod-${productId}`}
                getOptions={getProductOptions}
                isReadOnly={isReadOnly}
                label={i18n('Продукты')}
                className={styles.long_input}
                defaultValue={selectedProductNames}
                inputPlaceholder={i18n('Выберите продукт')}
                addBtnText={i18n('Добавить')}
                valueSubmitted={() => { updateProductField('product_ids', data.entity.product_ids); }}
                onValueIdAdded={(id: string, name: string) => {
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, product_ids: [...prev.entity.product_ids, id] } }));
                }}
                onValueIdRemoved={(id: string) => {
                  const arr = [...data.entity.product_ids];
                  arr.splice(parseInt(id), 1);
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, product_ids: arr } }));
                }}
              />

              <FieldArrayEditor
                key={`ed-ind-${productId}`}
                getOptions={getIndicatorOptions}
                isReadOnly={isReadOnly}
                label={i18n('Содержит показатели')}
                className={styles.long_input}
                defaultValue={selectedIndicatorNames}
                inputPlaceholder={i18n('Выберите показатель')}
                addBtnText={i18n('Добавить')}
                valueSubmitted={() => { updateProductField('indicator_ids', data.entity.indicator_ids); }}
                onValueIdAdded={(id: string, name: string) => {
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, indicator_ids: [...prev.entity.indicator_ids, id] } }));
                }}
                onValueIdRemoved={(id: string) => {
                  const arr = [...data.entity.indicator_ids];
                  arr.splice(parseInt(id), 1);
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, indicator_ids: arr } }));
                }}
              />

              <FieldArrayEditor
                key={`ed-ptype-${productId}`}
                getOptions={getProductTypeOptions}
                isReadOnly={isReadOnly}
                label={i18n('Тип')}
                className=''
                defaultValue={selectedProductTypeNames}
                inputPlaceholder={i18n('Выберите тип продукта')}
                addBtnText={i18n('Добавить')}
                valueSubmitted={() => { updateProductField('product_type_ids', data.entity.product_type_ids); }}
                onValueIdAdded={(id: string, name: string) => {
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, product_type_ids: [...prev.entity.product_type_ids, id] } }));
                }}
                onValueIdRemoved={(id: string) => {
                  const arr = [...data.entity.product_type_ids];
                  arr.splice(parseInt(id), 1);
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, product_type_ids: arr } }));
                }}
              />

              <FieldArrayEditor
                key={`ed-psv-${productId}`}
                getOptions={getProductSupplyVariantOptions}
                isReadOnly={isReadOnly}
                label={i18n('Варианты поставки')}
                className=''
                defaultValue={selectedProductSupplyVariantNames}
                inputPlaceholder={i18n('Выберите вариант поставки')}
                addBtnText={i18n('Добавить')}
                valueSubmitted={() => { updateProductField('product_supply_variant_ids', data.entity.product_supply_variant_ids); }}
                onValueIdAdded={(id: string, name: string) => {
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, product_supply_variant_ids: [...prev.entity.product_supply_variant_ids, id] } }));
                }}
                onValueIdRemoved={(id: string) => {
                  const arr = [...data.entity.product_supply_variant_ids];
                  arr.splice(parseInt(id), 1);
                  setData((prev) => ({ ...prev, entity: { ...prev.entity, product_supply_variant_ids: arr } }));
                }}
              />

              <FieldArrayEditor
                key={`ed-dass-${productId}`}
                getOptions={getDataAssetOptions}
                isReadOnly={isReadOnly}
                label={i18n('Источники данных (активы)')}
                className=''
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

                <FieldTextEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Ссылка на справочник')}
                  defaultValue={data.entity.link}
                  className=''
                  valueSubmitted={(val) => {
                    updateProductField('link', val);
                  }}
                />
                <FieldTextEditor
                  isReadOnly={isReadOnly}
                  label={`${i18n('Законодательные ограничения')}:`}
                  defaultValue={data.entity.limits}
                  className=''
                  valueSubmitted={(val) => {
                    updateProductField('limits', val);
                  }}
                />
                <FieldTextEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Внутренние ограничения')}
                  defaultValue={data.entity.limits_internal}
                  className=''
                  valueSubmitted={(val) => {
                    updateProductField('limits_internal', val);
                  }}
                />
                <FieldTextEditor
                  isReadOnly={isReadOnly}
                  label={i18n('Ключевые роли процесса')}
                  defaultValue={data.entity.roles}
                  className=''
                  valueSubmitted={(val) => {
                    updateProductField('roles', val);
                  }}
                />

                <FieldArrayEditor
                  key={`ed-syn-${productId}`}
                  getOptions={getTermLinkObjects}
                  isReadOnly={isReadOnly}
                  label={i18n('Ссылки на другие Термины')}
                  defaultValue={selectedTermLinkNames}
                  inputPlaceholder={i18n('Выберите')}
                  addBtnText={i18n('Добавить')}
                  valueSubmitted={() => { updateProductField('term_link_ids', data.entity.term_link_ids); }}
                  onValueIdAdded={(id: string) => {
                    setData((prev) => ({ ...prev, entity: { ...prev.entity, term_link_ids: [...prev.entity.term_link_ids, id] } }));
                  }}
                  onValueIdRemoved={(id: string) => {
                    const arr = [...data.entity.term_link_ids];
                    arr.splice(parseInt(id), 1);
                    setData((prev) => ({ ...prev, entity: { ...prev.entity, term_link_ids: arr } }));
                  }}
                />

              <div className={styles.attributes}>
                <div className={styles.field_editor}>
                  <div className={styles.row_h} data-uitest="product_lo_attr">
                    <div className={styles.value}>{i18n('Атрибуты в связанных дата-активах')}</div>
                    {!isReadOnly && (
                      <Autocomplete2
                        getOptions={getEntityOptions}
                        defaultOptions
                        className={styles.select_entity}
                        placeholder={i18n('Выберите модель...')}
                        onChanged={(data: any) => { setAttribsEntity(data); }}
                        defaultInputValue={attribsEntity ? attribsEntity.name : ''}
                      />
                    )}
                    

                  </div>
                  <div className={classNames(styles.row_linked_attribs, { [styles.hidden]: isReadOnly })}>

                    <div className={styles.tbl}>
                      <Table
                        cookieKey='prod-attrs-linked'
                        key={`tbl-la-${productId}-${linkedAttribs.length}`}
                        columns={[
                          { property: 'name', header: i18n('Название') },
                          { property: 'attribute_type', header: i18n('Тип') },
                          { property: 'entity_name', header: i18n('Модель') },
                          { property: 'id', header: '', sortDisabled: true, filterDisabled: true, render: (item: any) => { return <div><a onClick={() => removeLinkedAttrib(item.id)} className={classNames(styles.btn_remove_attrib)}><CrossIcon /></a></div>; return <div />; } },
                        ]}
                        paginate
                        dataUrl=""
                        initialData={linkedAttribs ?? []}
                        initialFetchRequest={{ offset: 0, limit: 5, filters: [] }}
                        fullWidthLayout
                        columnSearch
                        subtitle={isAttribsEditMode ? (i18n('Привязанные атрибуты') + (linkedAttribs.length == 0 ? ` (${i18n('нет')})` : '')) : ''}
                        tableButtons={isAttribsEditMode ? [
                          {
                            text: 'Отвязать все атрибуты',
                            onClick: () => {
                              setLinkedAttribs([]);
                              setDataModified(true);
                            }
                          }
                        ] : []}
                      />
                    </div>
                  </div>
                  {!isReadOnly && attribsEntity && (
                    <div className={styles.row_entity_attribs}>
                      <div className={styles.btns}>
                        <Button background='outlined-blue' onClick={() => { addAllLinkedAttribs(attribsEntity.value); }}>{i18n('Привязать все')}</Button>
                        <Button background='outlined-blue' onClick={() => { removeAllLinkedAttribs(attribsEntity.value); }}>{i18n('Отвязать все')}</Button>
                      </div>
                      <Table
                        cookieKey='prods-attrs-unlinked'
                        key={uuid()}
                        columns={[
                          { property: 'name', header: i18n('Название') },
                          { property: 'attribute_type', header: i18n('Тип'), sortDisabled: true, filterDisabled: true },
                          { property: 'entity_id', header: i18n('Модель'), sortDisabled: true, filterDisabled: true, render: (item: any) => <div>{attribsEntity ? attribsEntity.name : ''}</div> },
                          { property: 'id', header: '', sortDisabled: true, filterDisabled: true, render: (item: any) => <div><a key={`a${linkedAttribs.length}${item.id}`} onClick={() => { addLinkedAttrib(item.id); }} className={styles.btn_add_attrib}><PlusIcon /></a></div> },
                        ]}
                        paginate
                        dataUrl={attribsEntity ? `/v1/entities/search_attributes_by_entity_id/${encodeURIComponent(attribsEntity.value)}` : ''}
                        initialFetchRequest={{ sort: 'name+', global_query: '', limit: 5, offset: 5 * (table2page - 1), filters: linkedAttribs.map((la: any) => ({ column: 'id', operator: 'NOT_EQUAL', value: la.id })), filters_preset: [], filters_for_join: [] }}
                        showCreateBtn={false}
                        fullWidthLayout
                        columnSearch
                        onPageChange={(page) => { setTable2Page(page); }}
                        subtitle={i18n('Не привязанные атрибуты')}
                      />
                    </div>
                  )}
                </div>
              </div>
             
            </div>
          </div>
        },
        {
          key: 'tab-related',
          title: i18n('Связи'),
          content: <div className={styles.tab_white}>
            <RelatedObjectsControl artifactId={productId} artifactType='product'></RelatedObjectsControl>
          </div>
        },
        {
          key: 'tab-dq',
          title: i18n('Настройки качества'),
          content: (
            <div className={classNames(styles.dqrule_wrap, styles.tab_white)}>
                  <div className={styles.dqrule_head}>
                    <label>{`${i18n('Правила проверки качества')}:`}</label>
                    {!isReadOnly && (<PlusBlue onClick={addDQRule} />)}
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
                        className={styles.col2}
                        label={i18n('Настройки')}
                        defaultValue={(v as TData).entity.settings}
                        valueSubmitted={(val) => {
                          updateDQRuleField(index, (v as TData).metadata.id, 'settings', (val as string));
                        }}
                        isRequired
                        showValidation={showValidation}
                      />
                      <FieldCheckboxEditor
                        key={`ce1${(v as TData).metadata.id}`}
                        className={styles.col3}
                        isReadOnly={isReadOnly}
                        label={i18n('Выключена')}
                        defaultValue={Boolean((v as TData).entity.disabled)}
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
                        <div key={`d${(v as TData).metadata.id}`} className={styles.dqrule_close}>
                          <CloseIcon key={`fec${(v as TData).metadata.id}`} onClick={() => delDQRule(index, (v as TData).metadata.id)} />
                        </div>
                      )}
                    </div>
                  ))}

                </div>
          )
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
                  updateProductField('description', val.toString());
                }}
              />  
          
          </div>
        }
      ]} />

      <DeleteObjectModal show={showDelDlg} objectTitle={delObjectData.name} onClose={() => { setShowDelDlg(false); return false; }} onSubmit={delDlgSubmit} />
    </div>
  );
}
