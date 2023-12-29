import { Exception } from 'sass';
import { NavigateFunction, useNavigate } from 'react-router';
import ru from './lang/ru.json';
import en from './lang/en.json';
import { getDomain, getDomains } from './services/pages/domains';
import { getSystem, getSystems } from './services/pages/systems';
import { getEntity } from './services/pages/dataEntities';
import { getBusinessEntities, getBusinessEntity } from './services/pages/businessEntities';
import { getDQRule, searchDQRules } from './services/pages/dqRules';
import { getDataType, getDataTypes } from './services/pages/datatypes';
import { getOwnRatingData, getRatingData, setRating } from './services/pages/rating';
import { addTag, createDraft, deleteTag } from './services/pages/tags';
import { getEntityQueries, getEntityQuery } from './services/pages/entityQueries';
import { getWorkflowTask } from './services/pages/workflow';

export const regexExp = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi;

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
        });
      }

      if (asText !== undefined) { return resp.text(); }
      return resp.json();
    case 400: case 404: case 500:
      resp.clone().json().then((json) => {
        if (json.errors !== undefined && json.errors.length > 0) {
          json.errors.forEach((element: any) => {
            (window as any).notices.addNotice('error', element.message);
          });
        } else {
          throw Error(`Ошибка ${resp.statusText}`);
        }
      });
      return resp.json();
    default:
      throw Error(`Ошибка ${resp.statusText}`);
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
    default:
      return `/${artifactType}s/edit/${artifactId}`;
  }
}

export const getArtifactTypeDisplayName = (artifact_type: string) => {
  switch (artifact_type) {
    case 'domain':
      return i18n('Домен');
    case 'system':
      return i18n('Система');
    case 'entity':
      return i18n('Логический объект');
    case 'entity_query':
      return i18n('Запрос');
    case 'entity_sample':
      return i18n('Сэмпл');
    case 'data_asset':
      return i18n('Актив');
    case 'indicator':
      return i18n('Показатель');
    case 'business_entity':
      return i18n('Бизнес-сущность');
    case 'product':
      return i18n('Продукт');
    case 'task':
      return i18n('Задача');
    case 'dq_rule':
      return i18n('Правило проверки качества');
    default:
      return artifact_type;
  }
};

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
  limit: 10,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => json.items);

export const getDomainAutocompleteObjects = async (search: string) => getDomains({
  sort: 'name+',
  global_query: search,
  limit: 10,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => json.items);

export const getDataTypeAutocompleteObjects = async (search: string) => getDataTypes({
  sort: 'name+',
  global_query: search,
  limit: 10,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => json.items);

export const getSystemAutocompleteObjects = async (search: string) => getSystems({
  sort: 'name+',
  global_query: search,
  limit: 10,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => json.items);

export const getBusinessEntityAutocompleteObjects = async (search: string) => getBusinessEntities({
  sort: 'name+',
  global_query: search,
  limit: 10,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => json.items);

export const getQueryAutocompleteObjects = async (search: string) => getEntityQueries({
  sort: 'name+',
  global_query: search,
  limit: 10,
  offset: 0,
  filters: [],
  filters_for_join: [],
}).then((json) => json.items);

export const updateArtifactsCount = () => {
  const event = new CustomEvent('countUpdateNeeded');
  document.dispatchEvent(event);
};

export const setDataModified = (v: boolean) => {
  if (window.location.href.indexOf('/settings/') != -1) { (window as any).lbDataModified = false; } else { (window as any).lbDataModified = v; }
};

export const getDataModified = () => (window as any).lbDataModified ?? false;

export const doNavigate = (target: string, nav: NavigateFunction) => {
  if (!getDataModified() || confirm('Изменения не сохранены. Продолжить?')) {
    setDataModified(false);
    nav(target);
  }
};

export const getTablePageSize = () => {
  const v = getCookie('table-page-size');
  return v ? parseInt(v) : 50;
};

export const setTablePageSize = (v: number) => {
  setCookie('table-page-size', v.toString());
};

export const loadEditPageData = (id: string, versionId: string, setData: (data: any) => void, setTags: (tags: any) => void,
  setLoading: (v: boolean) => void, setLoaded: (v:boolean) => void,
  getVersion: (id: string, versionId: string) => Promise<any>, loadData: (id: string) => Promise<any>,
  setRatingData: (v:any) => void, setOwnRating: (v:any) => void, getVersions: (id: string) => Promise<any>,
  setVersions: (v:any) => void, setReadOnly: (v:boolean) => void, complete: () => void = () => {}
  ) => {
  const handleData = (json: any) => {
    setData(json);
    setDataModified(false);
    if (document.getElementById(`crumb_${id}`) !== null) {
      document.getElementById(`crumb_${id}`).innerText = json.entity.name;
    }
    setTags(
      json.metadata.tags ? json.metadata.tags.map((x: any) => ({ value: x.name })) : [],
    );

    updateEditPageReadOnly(json, setReadOnly, () => { setLoading(false); setLoaded(true); })

  };

  if (versionId) { 
    getVersion(id, versionId).then(handleData).catch(handleHttpError); 
  } else { 
    loadData(id).then(handleData).catch(handleHttpError); 
  }

  getRatingData(id)
    .then((json) => {
      setRatingData(json);
    })
    .catch(handleHttpError);

  getOwnRatingData(id)
    .then((rating) => {
      setOwnRating(rating);
    })
    .catch(handleHttpError);

  getVersions(id)
    .then((json) => {
      setVersions(
        json.resources.map((x: any) => ({
          name: x.entity.name,
          description: x.entity.description,
          version_id: x.metadata.version_id,
          created_at: new Date(x.metadata.modified_at).toLocaleString(),
        })),
      );
    })
    .catch(handleHttpError);

    if (complete)
      complete();
};

export const tagAddedHandler = (tagName: string, artifactId: string, artifactType: string, artifactState: string, tags: any[], setLoading: (v:boolean) => void,  
  setTags: (tags: any) => void, editUrl: string) => {
  const navigate = useNavigate();

  if (artifactId) {
    if (!tags.some((item) => item.value === tagName)) {
      setLoading(true);

      if (artifactState === 'PUBLISHED') {
        createDraft(artifactId, artifactType).then((json) => {
          if (json.metadata.id) {
            addTag(json.metadata.id, artifactType, tagName).then(() => {
              setLoading(false);
              navigate(`${editUrl}${encodeURIComponent(json.metadata.id)}`);
            }).catch(handleHttpError);
          }
        }).catch(handleHttpError);
      } else {
        addTag(artifactId, artifactType, tagName)
          .then(() => {
            setLoading(false);
            setTags((prevTags:any) => [...prevTags, { value: tagName }]);
          })
          .catch(handleHttpError);
      }
    }
  }
};

export const tagDeletedHandler = (tagName: string, artifactId: string, artifactType: string, artifactState: string, setLoading: (v:boolean) => void,
  setTags: (tags: any) => void, editUrl: string) => {
  const navigate = useNavigate();

  if (artifactId) {
    setLoading(true);

    if (artifactState === 'PUBLISHED') {
      createDraft(artifactId, artifactType).then((json) => {
        if (json.metadata.id) {
          deleteTag(json.metadata.id, artifactType, tagName).then(() => {
            setLoading(false);
            navigate(`${editUrl}${encodeURIComponent(json.metadata.id)}`);
          }).catch(handleHttpError);
        }
      }).catch(handleHttpError);
    } else {
      deleteTag(artifactId, artifactType, tagName)
        .then(() => {
          setLoading(false);
          setTags((prevTags:any) => prevTags.filter((x:any) => x.value !== tagName));
        })
        .catch(handleHttpError);
    }
  }
};

export const rateClickedHandler = (rating: number, artifactId: string, artifactType: string, setOwnRating: (v:any) => void, setRatingData: (v:any) => void) => {
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

export const updateEditPageReadOnly = (json: any, setReadOnly: (v:boolean) => void, done: () => void) => {
  if (json.metadata.workflow_task_id) {
    getWorkflowTask(json.metadata.workflow_task_id).then((task:any) => {
      if (task) {
        const obj = JSON.parse(task);
        setReadOnly(obj.entity.workflow_state && obj.entity.workflow_state != 'Send artifact to Review');
      }
      done();
    });
  } else {
    setReadOnly(json.metadata.state === 'PUBLISHED');
    done();
  }
};

export const setBreadcrumbEntityName = (id: string, name: string) => {
  const el = document.getElementById(`crumb_${id}`);
  if (el !== null) {
    el.innerText = name;
  }
};