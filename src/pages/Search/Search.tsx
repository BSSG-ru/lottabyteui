/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable nonblock-statement-body-position */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './Search.module.scss';
import { searchPost } from '../../services/pages/search';
import { doNavigate, getArtifactTypeDisplayName, getArtifactUrl, getTablePageSize, handleHttpError, i18n } from '../../utils';
import { Pagination } from '../../components/Pagination';
import { ReactComponent as Domains } from '../../assets/icons/domains-icon.svg';
import { ReactComponent as Systems } from '../../assets/icons/systems-icon.svg';
import { ReactComponent as LogicObjects } from '../../assets/icons/lo-icon.svg';
import { ReactComponent as Queries } from '../../assets/icons/requests-icon.svg';
import { ReactComponent as Samples } from '../../assets/icons/samples-icon.svg';
import { ReactComponent as Assets } from '../../assets/icons/assets-icon.svg';
import { ReactComponent as Indicators } from '../../assets/icons/indicators-icon.svg';
import { ReactComponent as BusinessEntities } from '../../assets/icons/business-ent-icon.svg';
import { ReactComponent as Products } from '../../assets/icons/products-icon.svg';
import { ReactComponent as Tasks } from '../../assets/icons/tasks-icon.svg';

import { Button } from '../../components/Button';
import classNames from 'classnames';
import { getUserRequest, userInfoRequest } from '../../services/auth';
import { ReactComponent as DQRules } from '../../assets/icons/dq-rule.svg';


export function Search() {
  const [hits, setHits] = useState([]);
  const [totalHits, setTotalHits] = useState(0);
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();
  const [searchRequest, setSearchRequest] = useState<any>(null);

  const [filterArtifactTypes, setFilterArtifactTypes] = useState<any>({
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
    dq_rule: true
    
  });

  const buildSearchRequest = (q: string, filterArtifactTypes: any, userDomains: any, from: number, size: number) => {

    let parts = q.toLowerCase().split(' ').filter(s => s);
    let tags_parts = parts.filter(s => s.indexOf('@') === 0);

    let inner_q:any = {
      'query_string': {
        'query': `${parts.filter(s => s.indexOf('@') !== 0).map(s => ('*' + s + '*')).join(' ')}`,
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
      filter_by_at.push({ match: { artifact_type: at }});
    });

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
      _source: ['artifact_type', 'id', 'artifact_id', 'name', 'description', 'domains'],
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
          setSearchRequest(buildSearchRequest(q, filterArtifactTypes, data.user_domains, 0, getTablePageSize()));
        });
      });
      
    }
  }, [searchParams, filterArtifactTypes]);

  const getTotalText = (n: number) => {
    const rest = n % 10;
    let txt = 'объектов';
    if (n < 10 || n > 20) {
      switch (rest) {
        case 1:
          txt = 'объект';
          break;
        case 2:
        case 3:
        case 4:
          txt = 'объекта';
          break;
      }
    }

    return `${n} ${txt}`;
  };

  useEffect(() => {
    if (searchRequest) {
      searchPost(searchRequest)
        .then((json) => {
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
      return getArtifactUrl(hit._source.id, hit._source.artifact_type);
    }

    return null;
  };

  const getArtifactTypeIcon = (artifact_type: string) => {
    switch (artifact_type) {
      case 'domain':
        return <Domains />;
      case 'system':
        return <Systems />;
      case 'entity':
        return <LogicObjects />;
      case 'entity_query':
        return <Queries />;
      case 'entity_sample':
        return <Samples />;
      case 'data_asset':
        return <Assets />;
      case 'indicator':
        return <Indicators />;
      case 'business_entity':
        return <BusinessEntities />;
      case 'product':
        return <Products />;
      case 'task':
        return <Tasks />;
      case 'dq_rule':
        return <DQRules />;
      default:
        return '';
    }
  };

  return (
    <div className={styles.search_page}>

      <div className={styles.search_filters}>
        {Object.keys(filterArtifactTypes).map((at, index) => {
          return <Button className={classNames(styles.btn_filter_at, { [styles.active]: filterArtifactTypes[at] })} onClick={() => { setFilterArtifactTypes((prev:any) => ({...prev, [at]: !filterArtifactTypes[at]})) }}>{getArtifactTypeDisplayName(at)}</Button>
        })}
        
      </div>

      <div className={styles.total_msg}>
        По вашему запросу найдено&nbsp;
        {getTotalText(totalHits)}.
      </div>

      {hits.map((hit: any) => {
        const url = getHitUrl(hit);
        return (
          <div
            key={`sr_${hit._source.id}`}
            className={styles.search_result}
          >
            <div className={styles.search_header}>
              {getArtifactTypeIcon(hit._source.artifact_type)}
              <div className={styles.at}>{getArtifactTypeDisplayName(hit._source.artifact_type)}</div>
            </div>
            <a href='' className={styles.name} onClick={() => { if (url) doNavigate(url, navigate); return false; }}>{hit._source.name}</a>
            <div className={styles.description}>{hit._source.description}</div>
            
          </div>
        );
      })}

      {searchRequest && (
        <Pagination
          label={`${i18n('Показано с')} ${searchRequest.from + 1} ${i18n('по')} ${
            searchRequest.from + searchRequest.size > totalHits
              ? totalHits
              : searchRequest.from + searchRequest.size
          } 
            ${i18n(' из ')} ${totalHits}`}
          page={searchRequest.from / searchRequest.size + 1}
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
          }}
          className={styles.pagination_wrapper}
        />
      )}
    </div>
  );
}
