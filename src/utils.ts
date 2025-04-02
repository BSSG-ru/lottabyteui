import { Exception } from 'sass';
import { NavigateFunction, useNavigate } from 'react-router';
import ru from './lang/ru.json';
import en from './lang/en.json';
import { getDomain, getDomains } from './services/pages/domains';
import { getSystem, getSystems } from './services/pages/systems';
import { getEntities, getEntity } from './services/pages/dataEntities';
import { getBusinessEntities, getBusinessEntity } from './services/pages/businessEntities';
import { getDQRule, getRuleType, getRuleTypes, searchDQRules } from './services/pages/dqRules';
import { getDataType, getDataTypes } from './services/pages/datatypes';
import { getOwnRatingData, getRatingData, setRating } from './services/pages/rating';
import { addTag, createDraft, deleteTag } from './services/pages/tags';
import { getEntityQueries, getEntityQuery } from './services/pages/entityQueries';
import { getProcessDefinitions, getWorkflowTask } from './services/pages/workflow';
import { getSystemConnection, getSystemConnections } from './services/pages/systemConnections';
import { getIndicatorType, getIndicatorTypes } from './services/pages/indicators';
import { getUser, getUsers } from './services/pages/users';
import { getArtifactActions, getArtifactType, getWorkflowableArtifactTypes } from './services/pages/artifacts';
import { getETLType, getETLTypes } from './services/pages/etls';

export const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;
export const regexNum = /^[0-9]+$/gi;

export const searchArtifactTypes = [ 'data_asset', 'entity_attribute', 'business_entity', 'domain', 'task', 'entity_query', 'metadata', 'entity', 'indicator', 'dq_rule', 'product', 'system', 'entity_sample', 'etl' ];

export function i18n(phrase: string) {
  const language = 'ru'; // navigator.languages[0]
  const languages = {
    ru,
    en,
  };
  const keys = languages[language];
  const translate = keys[phrase as keyof typeof keys];
  return translate ?? phrase;
}

export const loadWord = i18n('Loading...');

export function getCookie(name: string) {
  const matches = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1')}=([^;]*)`),
  );
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

export function setCookie(
  name: string,
  value: string | null,
  props?: {
    [key: string]: Date | string | number | boolean;
  },
) {
  props = props || {};
  if (typeof props.path === 'undefined') { props.path = '/'; }
  let exp = props.expires;
  if (exp !== undefined && typeof exp === 'number') {
    const d = new Date();
    d.setTime(d.getTime() + exp * 1000);
    exp = props.expires = d;
  }
  if (exp !== undefined && typeof exp === 'object') {
    props.expires = exp.toUTCString();
  }
  if (typeof value === 'string') {
    value = encodeURIComponent(value);
  }
  let updatedCookie = `${name}=${value}`;
  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const propName in props) {
    updatedCookie += `; ${propName}`;
    const propValue = props[propName];
    if (propValue !== true) {
      updatedCookie += `=${propValue}`;
    }
  }
  document.cookie = updatedCookie;
}

export function deleteCookie(name: string) {
  setCookie(name, null, { expires: -1 });
}

export function uuid() {
  return Number(String(Math.random()) + Date.now())
    .toString(32)
    .slice(2);
}

export function parseGetParams(params: { [key: string]: string | number }) {
  return `?${Object.entries(params)
    .map((entry) => `${entry[0]}=${encodeURIComponent(entry[1])}`)
    .join('&')}`;
}
export function handleHttpError(err: Exception) {
  console.log('err', err);
  if (err.name != 'AbortError') // cancelled ajax request
  { (window as any).notices.addNotice('error', err.message); }
}

export function handleHttpResponse(resp: Response, asText?: boolean) {
  switch (resp.status) {
    case 200:
      if (asText === undefined) {
        resp.clone().json().then((json) => {
          if (json.errors !== undefined && json.errors.length > 0) {
            json.errors.forEach((element: any) => {
              (window as any).notices.addNotice('error', element.message);
            });
          }
        }).catch(handleHttpError);
      }

      if (asText !== undefined) { return resp.text(); }
      return resp.json();
    case 400: case 401: case 403: case 404: case 500: case 409:
      try {
        resp.clone().json().then((json) => {
          if (json.errors !== undefined && json.errors.length > 0) {
            if (resp.status != 401) {
              json.errors.forEach((element: any) => {
                var msg = element.message;
                if (!msg) {
                  msg = element.code;
                  if (msg == 'not_found')
                    msg = i18n('объект не найден');
                  msg = i18n('Ошибка') + ': ' + msg;
                }
                if (!msg)
                  msg = i18n('Ошибка');
                (window as any).notices.addNotice('error', msg);
              });
            }
          } else {
            throw Error(`Ошибка ${resp.statusText}`);
          }
        })
        .catch(handleHttpError);
      } catch (e) {
        console.log('exc', e);
        throw Error("Exxxxception");
      }
      return resp.json();
    default:
      throw Error(`Ошибка ${resp.statusText}`);
  }
}

export function getArtifactListUrl(artifactType: string) {
  switch (artifactType) {
    case 'entity':
      return `/logic-objects/`;
    case 'entity_query':
      return `/queries/`;
    case 'entity_sample':
      return `/samples/`;
    case 'business_entity':
      return `/business-entities/`;
    case 'dq_rule':
      return `/dq_rule/`;
    case 'meta_database':
      return `/metadata/`;
    case 'meta_object': case 'meta_table':
      return `/metadata/`;
    case 'meta_view':
      return `/metadata/`;
    case 'meta_schema':
      return `/metadata/`;
    case 'meta_column':
      return `/metadata/`;
    case 'system_connection':
      return `/settings/connections/`;
    case 'etl':
      return `/etl/`;
    default:
      return `/${artifactType}s/`;
  }
}

export function getArtifactUrl(artifactId: string, artifactType: string) {
  switch (artifactType) {
    case 'entity':
      return `/logic-objects/edit/${artifactId}`;
    case 'entity_query':
      return `/queries/edit/${artifactId}`;
    case 'entity_sample':
      return `/samples/edit/${artifactId}`;
    case 'business_entity':
      return `/business-entities/edit/${artifactId}`;
    case 'dq_rule':
      return `/dq_rule/edit/${artifactId}`;
    case 'meta_database':
      return `/metadata/${artifactId}`;
    case 'meta_object': case 'meta_table':
      return `/metadata/${artifactId}?t=2`;
    case 'meta_view':
      return `/metadata/${artifactId}?t=3`;
    case 'meta_schema':
      return `/metadata/${artifactId}?t=1`;
    case 'meta_column':
      return `/metadata/${artifactId}?t=4`;
    case 'system_connection':
      return `/settings/connections/edit/${artifactId}`;
    case 'etl':
      return `/etl/edit/${artifactId}`;
    default:
      return `/${artifactType}s/edit/${artifactId}`;
  }
}

export const getArtifactTypeDisplayName = (artifact_type: string, plural?: boolean) => {
  switch (artifact_type) {
    case 'domain':
      return plural ? i18n('Домены') : i18n('Домен');
    case 'system':
      return plural ? i18n('Системы') : i18n('Система');
    case 'entity':
      return plural ? i18n('Модели') : i18n('Модель');
    case 'entity_query':
      return plural ? i18n('Запросы') : i18n('Запрос');
    case 'entity_sample':
      return plural ? i18n('Сэмплы') : i18n('Сэмпл');
    case 'data_asset':
      return plural ? i18n('Активы') : i18n('Актив');
    case 'indicator':
      return plural ? i18n('Показатели') : i18n('Показатель');
    case 'business_entity':
      return plural ? i18n('Глоссарии') : i18n('Глоссарий');
    case 'product':
      return plural ? i18n('Продукты') : i18n('Продукт');
    case 'task':
      return plural ? i18n('Задачи') : i18n('Задача');
    case 'dq_rule':
      return plural ? i18n('Качество') : i18n('Правило проверки качества');
    case 'entity_attribute':
      return plural ? i18n('Атрибуты модели') : i18n('Атрибут модели');
    case 'metadata':
      return i18n('Метаданные');
    case 'meta_database':
      return i18n('Метаданные: база данных');
    case 'meta_object':
      return i18n('Метаданные: таблица/представление');
    case 'meta_column':
      return i18n('Метаданные: колонка');
    case 'etl':
      return plural ? i18n('Трансформации') : i18n('Трансформация');
    default:
      return artifact_type;
  }
};

export const getRuleTypeDisplayValue = async (i: string) => {
  if (!i) return '';

  return getRuleType(i).then((json: any) => {
    if (json && json.name) return json.name;
    return '';
  }).catch(handleHttpError);
};

export const getRuleTypeAutocompleteObjects = async (search: string) => getRuleTypes().then((json) => {
  const res = [];
  const map = new Map();
  for (let i = 0; i < json.length; i += 1) {
    res.push({ id: json[i].id, name: json[i].name });
    map.set(json[i].id, json[i].name);
  }
  //setRuleTypes(map);
  return res.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
});

export const getIndicatorTypeDisplayValue = async (i: string) => {
  if (!i) return '';

  return getIndicatorType(i).then((json: any) => {
    if (json && json.name) return json.name;
    return '';
  }).catch(handleHttpError);
};

export const getIndicatorTypeAutocompleteObjects = async (search: string) => getIndicatorTypes().then((json) => {
  const res = [];
  const map = new Map();
  for (let i = 0; i < json.length; i += 1) {
    res.push({ id: json[i].id, name: json[i].name });
    map.set(json[i].id, json[i].name);
  }
  return res.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
});

export const getETLTypeDisplayValue = async (i: string) => {
  if (!i) return '';

  return getETLType(i).then((json: any) => {
    if (json && json.name) return json.name;
    return '';
  }).catch(handleHttpError);
};

export const getETLTypeAutocompleteObjects = async (search: string) => getETLTypes().then((json) => {
  const res = [];
  const map = new Map();
  for (let i = 0; i < json.length; i += 1) {
    res.push({ id: json[i].id, name: json[i].name });
    map.set(json[i].id, json[i].name);
  }
  return res.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
});

export const getDomainDisplayValue = async (identity: string) => {
  if (!identity) return '';
  return getDomain(identity)
    .then((json) => {
      if (json && json.entity) return json.entity.name;
      return undefined;
    })
    .catch((e) => {
      handleHttpError(e);
      return '';
    });
};

export const getDataTypeDisplayValue = async (identity: string) => {
  if (!identity) return '';
  return getDataType(identity)
    .then((json) => {
      if (json && json.entity) return json.entity.name;
      return undefined;
    })
    .catch((e) => {
      handleHttpError(e);
      return '';
    });
};

const getDQRuleLocal = async (identity: string) => {
  if (!identity) return '';
  return getDQRule(identity)
    .then((json) => {
      if (json && json.entity) return json.entity;
      return undefined;
    })
    .catch((e) => {
      handleHttpError(e);
      return '';
    });
};

export const getPDAutocompleteObjects = async (search: string) => getProcessDefinitions().then((json) => {
  const res = [];
  for (var k in json)
    res.push({ id: k, name: json[k] });
  return res.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
});

export const getPDDisplayValue = async (i: string) => {
  if (!i)
    return '';

  return getProcessDefinitions().then((json) => {
    if (json[i])
      return json[i];
    return '';
  }).catch(handleHttpError);
};

export const getArtifactActionDisplayValue = async (i: string) => {
  return i;
};

export const getArtifactActionAutocompleteObjects = async (search: string) => getArtifactActions().then((json) => {
  const res = [];
  
  for (let i = 0; i < json.length; i += 1) {
    res.push({ id: json[i], name: json[i] });
  }
  
  return res.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
});

export const getArtifactTypeDisplayValue = async (i: string) => {
  if (!i) return '';

  return getArtifactType(i).then((name: string) => {
    if (name) return name;
    return '';
  }).catch(handleHttpError);
};

export const getArtifactTypeAutocompleteObjects = async (search: string) => getWorkflowableArtifactTypes().then((json) => {
  const res = [];
  for (var k in json) {
    res.push({ id: k, name: json[k] });
  }
  
  return res.filter((x) => x.name.toLowerCase().indexOf(search.toLowerCase()) !== -1);
});

export const getUserDisplayValue = async (identity: string) => {
  if (!identity) return '';
  return getUser(identity)
    .then((json) => {
      if (json) return json.username;
      return undefined;
    })
    .catch((e) => {
      handleHttpError(e);
      return '';
    });
};

/*export const getUserAutocompleteObjects = async (search: string) => getUsers({
  sort: 'username+',
  global_query: search,
  limit: 1000,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => {
  const res = [];
  for (let i = 0; i < json.items.length; i += 1) {
    res.push({ id: json.items[i].id, name: json.items[i].username, description: json.items[i].display_name });
  }
  return res;
});*/

export const getDQRuleDisplayValue = async (identity: string) => getDQRuleLocal(identity).then((json) => json.name);
export const getDQRuleSettings = async (identity: string) => {
  const res = await getDQRuleLocal(identity);
  return res.settings;
};

export const getEntityDisplayValue = async (identity: string) => {
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

export const getBusinessEntityDisplayValue = async (identity: string) => {
  if (!identity) return '';
  return getBusinessEntity(identity)
    .then((json) => {
      if (json && json.entity) return json.entity.name;
      return undefined;
    })
    .catch((e) => {
      handleHttpError(e);
      return '';
    });
};

export const getQueryDisplayValue = async (identity: string) => {
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

export const getSystemConnectionDisplayValue = async (identity: string) => {
  if (!identity) return '';
  return getSystemConnection(identity)
    .then((json) => {
      if (json && json.entity) return json.entity.name;
      return undefined;
    })
    .catch((e) => {
      handleHttpError(e);
      return '';
    });
};

export const getSystemDisplayValue = async (identity: string) => {
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

export const getDQRuleAutocompleteObjects = async (search: string) => searchDQRules({
  sort: 'name+',
  global_query: search,
  limit: 1000,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => json.items);

export const getDomainAutocompleteObjects = async (search: string) => getDomains({
  sort: 'name+',
  global_query: search,
  limit: 1000,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => json.items);

export const getEntityQueryAutocompleteObjects = async (search: string) => getEntityQueries({
  sort: 'name+',
  global_query: search,
  limit: 1000,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => json.items);

export const getEntityAutocompleteObjects = async (search: string) => getEntities({
  sort: 'name+',
  global_query: search,
  limit: 1000,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => json.items);

export const getDataTypeAutocompleteObjects = async (search: string) => getDataTypes({
  sort: 'name+',
  global_query: search,
  limit: 1000,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => json.items);

export const getSystemAutocompleteObjects = async (search: string) => getSystems({
  sort: 'name+',
  global_query: search,
  limit: 1000,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => json.items);

export const getBusinessEntityAutocompleteObjects = async (search: string) => getBusinessEntities({
  sort: 'name+',
  global_query: search,
  limit: 1000,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => json.items);

export const getQueryAutocompleteObjects = async (search: string) => getEntityQueries({
  sort: 'name+',
  global_query: search,
  limit: 1000,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => json.items);

export const getSystemConnectionAutocompleteObjects = async (search: string) => getSystemConnections({
  sort: 'name+',
  global_query: search,
  limit: 1000,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => json.items);

export const updateArtifactsCount = () => {
  const event = new CustomEvent('countUpdateNeeded');
  document.dispatchEvent(event);
};

export const setDataModified = (v: boolean) => {
  (window as any).lbDataModified = v;
};

export const getDataModified = () => (window as any).lbDataModified ?? false;

export const doNavigate = (target: string, nav: NavigateFunction) => {
  if (!getDataModified() || confirm('Изменения не сохранены. Продолжить?')) {
    setDataModified(false);
    window.location.href = target;
    //nav(target);
  }
};

export const getTablePageSize = (suffix?: string) => {
  const v = getCookie('table-page-size' + (suffix ? ('-' + suffix) : ''));
  return v ? parseInt(v) : 50;
};

export const setTablePageSize = (v: number, suffix?: string) => {
  setCookie('table-page-size' + (suffix ? ('-' + suffix) : ''), v.toString());
};

export const loadEditPageData = (id: string, versionId: string, setData: (data: any) => void, setTags: ((tags: any) => void) | undefined,
  setLoading: (v: boolean) => void, setLoaded: (v: boolean) => void,
  getVersion: ((id: string, versionId: string) => Promise<any>) | undefined, loadData: (id: string) => Promise<any>,
  setRatingData: null|((v: any) => void), setOwnRating: null|((v: any) => void), getVersions: ((id: string) => Promise<any>) | undefined,
  setVersions: ((v: any) => void) | undefined, setReadOnly: (v: boolean) => void, complete: (json:any) => void = (json) => { }
) => {
  const handleData = (json: any) => {
    setData(json);
    setDataModified(false);
    const elem = document.getElementById(`crumb_${id}`);
    if (elem !== null) {
      elem.innerText = json.entity.name;
    }
    if (setTags)
      setTags(
        json.metadata.tags ? json.metadata.tags.map((x: any) => ({ value: x.name })) : [],
      );

    updateEditPageReadOnly(json, setReadOnly, () => { setLoading(false); setLoaded(true); })

    if (complete)
      complete(json);
  };

  if (versionId && getVersion) {
    getVersion(id, versionId).then(handleData).catch(handleHttpError);
  } else {
    loadData(id).then(handleData).catch(handleHttpError);
  }

  if (setRatingData) {
    getRatingData(id)
      .then((json) => {
        setRatingData(json);
      })
      .catch(handleHttpError);
  }

  if (setOwnRating) {
    getOwnRatingData(id)
      .then((rating) => {
        setOwnRating(rating);
      })
      .catch(handleHttpError);
  }

    if (getVersions && setVersions) {
      getVersions(id)
        .then((json) => {
          const list = json.resources ?? json;
          setVersions(
            list.map((x: any) => ({
              name: x.entity.name,
              description: x.entity.description,
              version_id: x.metadata.version_id,
              created_at: new Date(x.metadata.modified_at).toLocaleString(),
              modifier_display_name: x.metadata.modifier_display_name,
              modifier_email: x.metadata.modifier_email,
              modifier_description: x.metadata.modifier_description,
            })),
          );
        })
        .catch(handleHttpError);
  }

  
};

export const tagAddedHandler = (tagName: string, artifactId: string, artifactType: string, artifactState: string, tags: any[], setLoading: (v: boolean) => void,
  setTags: (tags: any) => void, editUrl: string, navigateFunc: (url: string) => void) => {//yhh

  if (artifactId) {
    if (!tags.some((item) => item.value === tagName)) {
      setLoading(true);

      if (artifactState === 'PUBLISHED' && artifactType != 'meta_database' && artifactType != 'entity_sample') {
        createDraft(artifactId, artifactType).then((json) => {
          if (json.metadata.id) {
            addTag(json.metadata.id, artifactType, tagName).then(() => {
              setLoading(false);
              navigateFunc(`${editUrl}${encodeURIComponent(json.metadata.id)}`);
            }).catch(handleHttpError);
          }
        }).catch(handleHttpError);
      } else {
        addTag(artifactId, artifactType, tagName)
          .then(() => {
            setLoading(false);
            setTags((prevTags: any) => [...prevTags, { value: tagName }]);
          })
          .catch(handleHttpError);
      }
    }
  }
};

export const tagDeletedHandler = (tagName: string, artifactId: string, artifactType: string, artifactState: string, setLoading: (v: boolean) => void,
  setTags: (tags: any) => void, editUrl: string, navigateFunc: (url: string) => void) => {

  if (artifactId) {
    setLoading(true);

    if (artifactState === 'PUBLISHED' && artifactType != 'meta_database' && artifactType != 'entity_sample') {
      createDraft(artifactId, artifactType).then((json) => {
        if (json.metadata.id) {
          deleteTag(json.metadata.id, artifactType, tagName).then(() => {
            setLoading(false);
            navigateFunc(`${editUrl}${encodeURIComponent(json.metadata.id)}`);
          }).catch(handleHttpError);
        }
      }).catch(handleHttpError);
    } else {
      deleteTag(artifactId, artifactType, tagName)
        .then(() => {
          setLoading(false);
          setTags((prevTags: any) => prevTags.filter((x: any) => x.value !== tagName));
        })
        .catch(handleHttpError);
    }
  }
};

export const rateClickedHandler = (rating: number, artifactId: string, artifactType: string, setOwnRating: (v: any) => void, setRatingData: (v: any) => void) => {
  if (artifactId) {
    setRating(artifactId, artifactType, rating)
      .then(() => {
        getOwnRatingData(artifactId)
          .then((r) => {
            setOwnRating(r);
          })
          .catch(handleHttpError);
        getRatingData(artifactId)
          .then((json) => {
            setRatingData(json);
          })
          .catch(handleHttpError);
      })
      .catch(handleHttpError);
  }
};

export const updateEditPageReadOnly = (json: any, setReadOnly: (v: boolean) => void, done: () => void) => {
  if (json.metadata.workflow_task_id) {
    getWorkflowTask(json.metadata.workflow_task_id).then((task: any) => {
      if (task) {
        const obj = JSON.parse(task);
        setReadOnly(obj.entity.workflow_state && obj.entity.workflow_state != 'Send artifact to Review');
      }
      done();
    });
  } else {
    setReadOnly(json.metadata.state === 'PUBLISHED' || json.metadata.state === 'ARCHIVED' || json.metadata.artifact_type == 'entity_sample');
    done();
  }
};

export const setBreadcrumbEntityName = (id: string, name: string) => {
  const el = document.getElementById(`crumb_${id}`);
  if (el !== null) {
    el.innerText = name;
  }
};

export const hasPermission = (permission: string) => {
  var userp = getCookie('userp');
  return userp ? userp.split(',').indexOf(permission) !== -1 : false;
};