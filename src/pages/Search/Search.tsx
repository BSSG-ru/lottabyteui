/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable nonblock-statement-body-position */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './Search.module.scss';
import { buildElasticSearchRequest, saveSearchQuery, searchPost } from '../../services/pages/search';
import { doNavigate, getArtifactTypeDisplayName, getArtifactUrl, getTablePageSize, handleHttpError, i18n, searchArtifactTypes, setCookie, setTablePageSize, uuid } from '../../utils';
import { Pagination } from '../../components/Pagination';

import classNames from 'classnames';
import { userInfoRequest } from '../../services/auth';
import Cookies from 'js-cookie';
import { Autocomplete2 } from '../../components/Autocomplete2';
import { ArtifactInfo } from '../../components/ArtifactInfo';
import { SearchCrumbs } from '../../components/SearchCrumbs';
import { SearchPill } from '../../components/SearchPill';
import { Dropdown } from 'react-bootstrap';
import { Button } from '../../components/Button';

import { ReactComponent as SortAscIco } from '../../assets/icons/sort-asc.svg';
import { ReactComponent as SortDescIco } from '../../assets/icons/sort-desc.svg';
import { searchTags } from '../../services/pages/tags';
import { Tag } from '../../components/Tag';


export function Search() {
  const [hits, setHits] = useState([]);
  const [totalHits, setTotalHits] = useState(0);
  const [totalPhrase, setTotalPhrase] = useState<string>('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [useFlatLayout, setUseFlatLayout] = useState(true);
  const [includeArchive, setIncludeArchive] = useState(false);
  const [sortBy, setSortBy] = useState('_score');
  const [sortOrderDesc, setSortOrderDesc] = useState(true);
  const navigate = useNavigate();

  const sortByOptions:any = { '_score': i18n('Релевантность'), 'name.keyword': i18n('Название'), 'artifact_type_display_name.keyword': i18n('Тип') };

  const [searchParams] = useSearchParams();
  const [searchRequest, setSearchRequest] = useState<any>(null);

  const ck_fat = Cookies.get('search-artifact-types');

  const [selectedArtifactTypes, setSelectedArtifactTypes] = useState<string[]>(ck_fat ? JSON.parse(ck_fat) : []);
  const [selectedArtifacts, setSelectedArtifacts] = useState<any[]>([]);
  const [selectedArtifactAttribs, setSelectedArtifactAttribs] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [query, setQuery] = useState('');
  const [userDomains, setUserDomains] = useState<any>(undefined);
  const [readyToSearch, setReadyToSearch] = useState(false);

  useEffect(() => {
    Cookies.set('search-artifact-types', JSON.stringify(selectedArtifactTypes), { expires: 500 });
  }, [ selectedArtifactTypes ]);

  useEffect(() => {
    if (readyToSearch && query)
      setSearchRequest(buildElasticSearchRequest((query + ' ' + selectedTags.map(t => '#' + t).join(' ')).trim(), selectedArtifactTypes, selectedArtifacts, selectedArtifactAttribs, includeArchive, sortBy, sortOrderDesc ? 'desc' : 'asc', userDomains, 0, getTablePageSize()));
      
    
  }, [query, selectedArtifactTypes, selectedArtifacts, selectedArtifactAttribs, selectedTags, includeArchive, sortBy, sortOrderDesc, readyToSearch]);

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      userInfoRequest().then(resp => {
        resp.json().then(data => {
          setCookie('userp', data.permissions.join(','), { path: '/' });
          setQuery(q);
          setUserDomains(data.user_domains);
          
        });
      });
    }

    const at = searchParams.get('at');
    if (at) {
      if (at == 'all')
        setSelectedArtifactTypes([]);
      else
        setSelectedArtifactTypes([ at ]);
    }

    setTimeout(() => setReadyToSearch(true), 300);
  }, [searchParams]);

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
    <div className={classNames(styles.search_page, { [styles.flat_layout]: useFlatLayout })}>
      <div className={styles.left}>
        <div className={styles.total_msg}>По запросу <span className={styles.q}>{searchParams.get('q')}</span> {totalPhrase}.</div>
        <div className={styles.filter_wrap}>
          <Autocomplete2 key={uuid()} className={styles.select} defaultInputValue={'Все типы объектов'} getOptions={async (s) => { return [{id: '', name: 'Все типы объектов'}, ...searchArtifactTypes.map((k:string) => ({id: k, name: getArtifactTypeDisplayName(k)}))].filter(x => x.name.toLowerCase().indexOf(s.toLowerCase()) !== -1) }} 
            defaultOptions onChanged={(data: any) => {
              setSelectedArtifactTypes((prev) => ([...prev, data.id]));
            }} />
          <Autocomplete2 key={uuid()} className={styles.select_tags} defaultInputValue={''} placeholder={'Теги'} getOptions={async (s) => { return await searchTags(s, 1000); }} 
            defaultOptions onChanged={(data: any) => {
              setSelectedTags((prev) => ([...prev, data.name]));
            }} />
          <div className={styles.filter_pills}>
            {selectedArtifactTypes.map((at, ind) => 
              <SearchPill key={'pill-at-' + ind} artifactType={at} 
                onDeleteClick={() => setSelectedArtifactTypes((prev) => ([...prev.filter((v,i) => i != ind)]))} 
                onArtifactSelected={(a) => { 
                  setSelectedArtifactTypes((prev) => ([...prev.filter((v,i) => i != ind)]))
                  setSelectedArtifacts((prev) => ([...prev, a]));
                }}
                onArtifactAttribSelected={(attr, valId, valName) => {
                  setSelectedArtifactTypes((prev) => ([...prev.filter((v,i) => i != ind)]))
                  setSelectedArtifactAttribs((prev) => ([...prev, { attr: attr, valId: valId, valName: valName }]));
                }} 
              />
            )}
            {selectedArtifacts.map((art, ind) => 
              <SearchPill key={'pill-at2-' + ind} artifactType={art.artifact_type} 
                onDeleteClick={() => setSelectedArtifacts((prev) => ([...prev.filter((v,i) => i != ind)]))} 
                onArtifactSelected={(a) => { setSelectedArtifacts((prev) => ([...prev.map((v,i) => i == ind ? a : v)])) }}
                selectedArtifact={art}
                onArtifactAttribSelected={(attr, valId, valName) => {
                  setSelectedArtifacts((prev) => ([...prev.filter((v,i) => i != ind)]));
                  setSelectedArtifactAttribs((prev) => ([...prev, { attr: attr, valId: valId, valName: valName }]));
                }}
              />
            )}
            {selectedArtifactAttribs.map((attrib, ind) => 
              <SearchPill key={'pill-at3-' + ind} artifactType={attrib.attr.artifactType} 
                onDeleteClick={() => setSelectedArtifactAttribs((prev) => ([...prev.filter((v,i) => i != ind)]))} 
                onArtifactSelected={(a) => { 
                  setSelectedArtifactAttribs((prev) => ([...prev.filter((v,i) => i != ind)]))
                  setSelectedArtifacts((prev) => ([...prev, a]));
                }}
                selectedArtifactAttrib={attrib}
                onArtifactAttribSelected={(attr, valId, valName) => {
                  setSelectedArtifactAttribs((prev) => ([...prev.map((v,i) => i == ind ? { attr: attr, valId: valId, valName: valName } : v)]));
                }}
              />
            )}
            {selectedTags.map((tag, ind) => 
              <Tag key={'tc-' + ind} value={'#' + tag} onDelete={(s) => setSelectedTags((prev) => ([...prev.filter(t => t != s)]))} />
            )}

          </div>
        </div>
        <div className={styles.filter_additional}>
          <div className={styles.archive_switch + (includeArchive ? ' ' + styles.checked : '')}>
            <div id="archive-switch-bg" className={styles.switch_bg} onClick={() => { setIncludeArchive(!includeArchive); }}>
              <div id="archive-switch-handler" className={styles.switch_handler}></div>
            </div>
            <label onClick={() => setIncludeArchive(!includeArchive)}>{i18n('Архивные')}</label>
          </div>
          <Dropdown className={styles.dd_sort_by}>
            <Dropdown.Toggle className={styles.toggle}>{sortByOptions[sortBy]}</Dropdown.Toggle>
            <Dropdown.Menu>
              {Object.keys(sortByOptions).map((k, i) => <Dropdown.Item key={'sb-opt-' + i} onClick={() => setSortBy(k)}>{sortByOptions[k]}</Dropdown.Item>)}
            </Dropdown.Menu>
          </Dropdown>
          <Button background='none' className={styles.btn_sort_order} onClick={() => setSortOrderDesc(!sortOrderDesc)}>{sortOrderDesc ? (<SortDescIco />) : (<SortAscIco />)}</Button>
        </div>
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
