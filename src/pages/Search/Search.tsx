/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable nonblock-statement-body-position */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './Search.module.scss';
import { searchPost } from '../../services/pages/search';
import { doNavigate, getArtifactTypeDisplayName, getArtifactUrl, getTablePageSize, handleHttpError, i18n, setCookie, setTablePageSize } from '../../utils';
import { Pagination } from '../../components/Pagination';

import classNames from 'classnames';
import { userInfoRequest } from '../../services/auth';
import Cookies from 'js-cookie';
import { Autocomplete2 } from '../../components/Autocomplete2';
import { ArtifactInfo } from '../../components/ArtifactInfo';
import { SearchCrumbs } from '../../components/SearchCrumbs';


export function Search() {
  const [hits, setHits] = useState([]);
  const [totalHits, setTotalHits] = useState(0);
  const [totalPhrase, setTotalPhrase] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState(false);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [searchRequest, setSearchRequest] = useState<any>(null);

  const ck_fat = Cookies.get('search-filters');

  const [filterArtifactTypes, setFilterArtifactTypes] = useState<any>((ck_fat && ck_fat.indexOf('metadata') != -1) ? JSON.parse(ck_fat) : {
    domain: true,
    system: true,
    task: true,
    entity: true,
    entity_query: true,
    entity_sample: true,
    data_asset: true,
    indicator: true,
    business_entity: true,
    product: true,
    dq_rule: true,
    entity_attribute: true,
    metadata: true
  });

  useEffect(() => {
    Cookies.set('search-filters', JSON.stringify(filterArtifactTypes), { expires: 500 });
  }, [ filterArtifactTypes ]);

  const buildSearchRequest = (q: string, filterArtifactTypes: any, userDomains: any, from: number, size: number) => {

    let parts = q.toLowerCase().split(' ').filter(s => s);
    let tags_parts = parts.filter(s => s.indexOf('#') === 0);

    let inner_q:any = {
      'query_string': {
        'query': `${parts.filter(s => s.indexOf('#') !== 0).map(s => ('*' + s + '*')).join(' ')}`,
        'default_operator': 'AND'
      }
    };

    if (tags_parts.length > 0) {
      let tags_q = {
        'query_string': {
          fields: ['tags'],
          query: `${tags_parts.map(s => ('*' + s.substring(1, s.length) + '*')).join(' ')}`,
        }
      };
      
      if (parts.length > tags_parts.length) {
        inner_q = {
          bool: {
            should: [
              inner_q,
              tags_q
            ]
          }
        };
      } else {
        inner_q = tags_q;
      }
    }

    var filter_by_at:any[] = [];
    Object.keys(filterArtifactTypes).filter(x => filterArtifactTypes[x]).forEach(at => {
      if (at == 'metadata') {
        filter_by_at.push({ match: { artifact_type: 'meta_database' }});
        filter_by_at.push({ match: { artifact_type: 'meta_object' }});
        filter_by_at.push({ match: { artifact_type: 'meta_column' }});
      } else
        filter_by_at.push({ match: { artifact_type: at }});
    });
    if (filter_by_at.length == 0) {
      Object.keys(filterArtifactTypes).forEach(at => {
        
        filter_by_at.push({ match: { artifact_type: true }});
      });
    }

    var must = [
      inner_q,
      {
        bool: {
          should: filter_by_at,
        },
      },
    ];

    if (userDomains) {
      must.push({
        bool: {
          should: userDomains.map((x:string) => ({ match: { domains: x } }))
        }
      });
    }

    return {
      size,
      from,
      _source: ['artifact_type', 'id', 'artifact_id', 'name', 'short_description', 'domains', 'entity_id', 'tech_name', 'artifact_state', 'meta_database_id', 'meta_object_type'],
      query: {
        bool: {
          must: must,
        },
      },
    }
  };

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      userInfoRequest().then(resp => {
        resp.json().then(data => {
          setCookie('userp', data.permissions.join(','), { path: '/' });
          setSearchRequest(buildSearchRequest(q, filterArtifactTypes, data.user_domains, 0, getTablePageSize()));
        });
      });
      
    }
  }, [searchParams, filterArtifactTypes]);

  useEffect(() => {
    var f = i18n('найдено');
    var o = i18n('объектов');
    var d = (totalHits - (totalHits / 10));
    var d2 = (totalHits / 10 - (totalHits / 100));
    if (d == 1)
      f = i18n('найден');
    
    if (d == 1)
      o = i18n('объект');
    else if (d2 != 1 && (d == 2 || d == 3 || d == 4))
      o = i18n('объекта');

    setTotalPhrase(f + ' ' + totalHits + ' ' + o);
  }, [ totalHits ]);

  useEffect(() => {
    if (searchRequest) {
      setSearchLoading(true);
      searchPost(searchRequest)
        .then((json) => {
          setSearchLoading(false);
          if (json && json.length > 1) {
            setTotalHits(json[0].size);
            setHits(json.splice(1));
          } else {
            setTotalHits(0);
            setHits([]);
          }
        })
        .catch(handleHttpError);
    }
  }, [searchRequest]);

  const getHitUrl = (hit: any) => {
    if (hit._source.id && hit._source.artifact_type) {
      if (hit._source.artifact_type == 'entity_attribute' && hit._source.entity_id)
        return getArtifactUrl(hit._source.entity_id, 'entity');
      else if (hit._source.artifact_type == 'meta_object' && hit._source.meta_object_type == 'SCHEMA' && hit._source.meta_database_id)
        return getArtifactUrl(hit._source.meta_database_id, 'meta_schema');
      else if (hit._source.artifact_type == 'meta_object' && hit._source.meta_object_type == 'TABLE' && hit._source.meta_database_id)
        return getArtifactUrl(hit._source.meta_database_id, 'meta_table');
      else if (hit._source.artifact_type == 'meta_object' && hit._source.meta_object_type == 'VIEW' && hit._source.meta_database_id)
        return getArtifactUrl(hit._source.meta_database_id, 'meta_view');
      else if (hit._source.artifact_type == 'meta_column' && hit._source.meta_database_id)
        return getArtifactUrl(hit._source.meta_database_id, hit._source.artifact_type);
      else
        return getArtifactUrl(hit._source.id, hit._source.artifact_type);
    }

    return null;
  };

  return (
    <div className={styles.search_page}>
      <div className={styles.left}>
        <div className={styles.total_msg}>По запросу <span className={styles.q}>{searchParams.get('q')}</span> {totalPhrase}.</div>
        <Autocomplete2 className={styles.select} defaultInputValue={Object.keys(filterArtifactTypes).filter(x => filterArtifactTypes[x]).length != 1 ? 'Все типы объектов' : getArtifactTypeDisplayName(Object.keys(filterArtifactTypes).filter(x => filterArtifactTypes[x])[0])} getOptions={async (s) => { return [{id: '', name: 'Все типы объектов'}, ...Object.keys(filterArtifactTypes).map((k:string) => ({id: k, name: getArtifactTypeDisplayName(k)}))].filter(x => x.name.toLowerCase().indexOf(s.toLowerCase()) !== -1) }} 
          defaultOptions onChanged={(data: any) => {
            var obj:any = {};
            for (var k in filterArtifactTypes)
              obj[k] = data.id ? false : true;

            if (data.id)
              obj[data.id] = true;
            setFilterArtifactTypes(obj);
          }} />
      </div>
      <div className={classNames(styles.right, { [styles.loading]: searchLoading })}>
        {hits.map((hit: any) => {
          const url = getHitUrl(hit);
          return (
            <div key={`sr_${hit._source.id}`} className={classNames(styles.search_result, {[styles.archive]: hit._source.artifact_state == 'ARCHIVED'})}>
              <SearchCrumbs artifact_id={hit._source.id} artifact_type={hit._source.artifact_type} artifact_name={hit._source.name} />
              <a
                href={url ?? '#'}
                className={classNames(styles.search_result_link)}
                onClick={() => { if (url) doNavigate(url, navigate); return false; }}
              >
                <h3 className={styles.name}>{hit._source.name}</h3>
              </a>
              <div className={styles.description}><pre>{hit._source.short_description ? hit._source.short_description.replace(/<[^<>]*>/g, '') : ''}</pre></div>
              <ArtifactInfo artifactType={hit._source.artifact_type} state={hit._source.artifact_state} domain_ids={Array.from(new Set(hit._source.domains))} artifactId={hit._source.id} favControl />
            </div>
          );
        })}

        {searchRequest && (
          <Pagination
            page={searchRequest.from / searchRequest.size + 1}
            pageSize={searchRequest.size}
            inTotal={Math.ceil(totalHits / searchRequest.size)}
            setPage={(payload: number) => {
              setSearchRequest((prev: any) => ({
                ...prev,
                from: prev.size * (payload - 1),
              }));
            }}
            setPageSize={(size:number) => {
              setSearchRequest((prev: any) => ({
                ...prev,
                size: size
              }));
              setTablePageSize(size);
            }}
            className={styles.pagination_wrapper}
          />
        )}
      </div>

      
    </div>
  );
}
