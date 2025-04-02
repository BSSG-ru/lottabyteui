/* eslint-disable react/require-default-props */
import React, {
  FC, useState, KeyboardEvent, useEffect,
} from 'react';
import classNames from 'classnames';
import styles from './Search.module.scss';
import { ReactComponent as SearchIcon } from '../../assets/icons/search.svg';
import { ReactComponent as SearchMyQIcon } from '../../assets/icons/search-my-queries.svg';
import { ReactComponent as SearchPopQIcon } from '../../assets/icons/search-pop-queries.svg';
import { getArtifactTypeDisplayName, getArtifactUrl, getCookie, handleHttpError, i18n, searchArtifactTypes, setCookie } from '../../utils';
import { Button } from '../Button';
import { Input } from '../Input';
import { useNavigate } from 'react-router';
import { searchTags } from '../../services/pages/tags';
import { Dropdown } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { buildElasticSearchRequest, getSearchMyQueries, getSearchPopularQueries, saveSearchQuery, searchPost } from '../../services/pages/search';
import { userInfoRequest } from '../../services/auth';


type SearchProps = {
  query?: string | null;
};

export const Search: FC<SearchProps> = ({ query }) => {
  const [value, setValue] = useState('');
  const navigate = useNavigate();
  const [mode, setMode] = useState('default');
  const [tagSearch, setTagSearch] = useState('');
  const [tags, setTags] = useState<any[]>([]);
  const [tagIndex, setTagIndex] = useState(-1);
  const [tagStartPos, setTagStartPos] = useState(-1);
  const [tagEndPos, setTagEndPos] = useState(-1);
  const [artifactType, setArtifactType] = useState('all');
  const [searchParams] = useSearchParams();
  const [showDropdown, setShowDropdown] = useState(false);
  const [myQueries, setMyQueries] = useState<string[]>([]);
  const [popularQueries, setPopularQueries] = useState<string[]>([]);
  const [artifacts, setArtifacts] = useState<any>(undefined);
  const [userDomains, setUserDomains] = useState<any>(undefined);
  

  useEffect(() => {
    setValue(query ?? '');
  }, [query]);

  
  useEffect(() => {
    if (searchParams.get('at'))
      setArtifactType(searchParams.get('at') ?? '');
  }, [searchParams]);

  useEffect(() => {
    if (tagSearch) {
      searchTags(tagSearch).then(json => {
        
        setTags(json);
        if (json.length > 0)
          setTagIndex(0);
        else
          setTagIndex(-1);
      });
    } else {
      setTags([]);
      setTagIndex(-1);
    }
  }, [ tagSearch ]);

  const tagsPopup = (target: HTMLInputElement) => {

    var s = target.value;
    var pos = target.selectionStart;
    if (pos) {
      var start = pos - 1;
      var end = pos;

      while (start >= 0 && s.at(start) != ' ')
        start--;
      while (end < s.length && s.at(end) != ' ')
        end++;

      if (s.at(start+1) == '#' && end - start > 2) {
        setMode('select-tag');
        setTagSearch(s.substring(start + 2, end));
        setTagStartPos(start+ 2);
        setTagEndPos(end);
      } else {
        setMode('default');
        setTagStartPos(-1);
        setTagEndPos(-1);
      }
    }
  };

  const tagItemClick = (name: string) => {

    setValue(value.substring(0, tagStartPos) + name + (tagEndPos == value.length ? ' ' : '') + value.substring(tagEndPos, value.length));
    var inp = document.getElementById('search-input');
    if (inp) {
      inp.focus();
      (inp as HTMLInputElement).setSelectionRange(tagStartPos + name.length + 1, tagStartPos + name.length + 1);
      
    }

    setMode('default');
  };

  useEffect(() => {
    document.addEventListener('click', (e) => { if (!(e.target as any).closest('.search_wrapper')) setShowDropdown(false);  });
  }, []);

  const loadMyQueries = () => {
    getSearchMyQueries(5).then(res => { setMyQueries(res); }).catch(handleHttpError);
  }

  const loadPopularQueries = () => {
    getSearchPopularQueries(value ? value : ' ', 5).then(res => { setPopularQueries(res); }).catch(handleHttpError);
  }

  const loadArtifacts = () => {
    const r = buildElasticSearchRequest(value, [], [], [], false, '_score', 'desc', userDomains, 0, 10, true);
    searchPost(r).then((json) => {
      if (json && json.length > 1) {
        let res:any = {};
        json.splice(1).forEach((hit:any) => {
          if (typeof res[hit._source.artifact_type] == 'undefined')
            res[hit._source.artifact_type] = [];
          res[hit._source.artifact_type].push({
            id: hit._source.id,
            name: hit.highlight.name ?? hit._source.name,
            url: getArtifactUrl(hit._source.id, hit._source.artifact_type)
          });
        });
        setArtifacts(res);
      } else
        setArtifacts(undefined);
    }).catch(handleHttpError);
  }

  useEffect(() => loadMyQueries(), []);
  useEffect(() => { loadPopularQueries(); loadArtifacts() }, [ value ]);

  useEffect(() => {
    userInfoRequest().then(resp => {
      resp.json().then(data => {
        setCookie('userp', data.permissions.join(','), { path: '/' });
        setUserDomains(data.user_domains);
      });
    });
  }, []);

  const saveMyQuery = (s: string) => {
    /*let arr = [s, ...myQueries.filter(q => q != s)];
    arr.splice(5);
    
    setMyQueries(arr);*/

    saveSearchQuery(s).then(r => { loadMyQueries(); loadPopularQueries(); }).catch(handleHttpError);
  }

  return (
    <div className={classNames(styles.search_wrapper, 'search_wrapper')}>
      <div className={styles.search}>
        <Dropdown className={styles.dd_search}>
          <Dropdown.Toggle className={styles.dd_toggle}>{(artifactType && artifactType != 'all') ? getArtifactTypeDisplayName(artifactType) : i18n('Все')}</Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item key={'dd-at-all'} onClick={() => setArtifactType('all')}>{i18n('Все')}</Dropdown.Item>
            {searchArtifactTypes.map(at => <Dropdown.Item key={'dd-at-' + at} onClick={() => setArtifactType(at)}>{getArtifactTypeDisplayName(at, false)}</Dropdown.Item>)}
          </Dropdown.Menu>
        </Dropdown>
        <div className={styles.sep}></div>
        <div className={styles.input_wrap}>
          <Input
            className={styles.search_input}
            id="search-input"
            placeholder={i18n('Search')}
            value={value} name="s"
            onChange={(e) => setValue(e.target.value)}
            enterKeyBlursInput={false}
            customKeyUpHandler={(e: KeyboardEvent) => {
              tagsPopup(e.target as HTMLInputElement);

              if (e.code == 'ArrowDown') {
                if (tagIndex < tags.length - 1)
                  setTagIndex(tagIndex + 1);
                e.preventDefault();

              } else if (e.code == 'ArrowUp') {
                if (tagIndex > 0)
                  setTagIndex(tagIndex - 1);
                e.preventDefault();
              } else if (e.code == 'Enter' || e.code == 'NumpadEnter') {
                if (mode == 'select-tag')
                  tagItemClick(tags[tagIndex].name);
                else {
                  saveMyQuery(value);
                  window.location.href = `/search/?q=${encodeURIComponent(value)}`;
                }
              }
              
            }}
            customSelectHandler={(e:any) => {
              tagsPopup(e.target as HTMLInputElement);
            }}
            customFocusHandler={(e) => { setShowDropdown(true); }}
            disableAutocomplete
          />
          <Button
            disabled={!value}
            background="none"
            onClick={() => {
              if (value) {
                saveMyQuery(value);
                window.location.href = `/search/?q=${encodeURIComponent(value)}` + (artifactType ? ('&at=' + artifactType) : '');
              }
            }}
            className={classNames(styles.search_button, { [styles.search_button_active]: value })}
          >
            <SearchIcon />
          </Button>
          {mode == 'select-tag' && tagSearch != '' && (
            <div className={styles.tags_popup}>
              <div className={styles.list}>
                {tags.map((tag, i) => <div onClick={() => tagItemClick(tag.name)} className={classNames(styles.item, { [styles.active]: i == tagIndex })}>{tag.name}</div>)}
                {tags.length == 0 && (<span>Не найдено</span>)}
              </div>
            </div>
          )}
          {mode == 'default' && showDropdown && (!value || (artifacts || popularQueries.length > 0)) && (
            <div className={classNames(styles.search_dropdown, 'search_dropdown')}>
              {myQueries.length > 0 && !value && (
                <div className={styles.dd_my_queries}>
                  <div className={styles.dd_sec_head}><SearchMyQIcon/><span>{i18n('Мои запросы')}</span></div>
                  {myQueries.map((s,i) => <div key={'s-my-q-' + i} className={styles.item} onClick={() => { saveMyQuery(s); window.location.href = `/search/?q=${encodeURIComponent(s)}` + (artifactType ? ('&at=' + artifactType) : ''); }}>{s}</div>)}
                </div>
              )}
              {value && artifacts && (
                <div className={styles.dd_artifacts}>
                  {Object.keys(artifacts).map(at => 
                    <div key={'s-at-sec-' + at}>
                      <div className={styles.dd_sec_head}>{getArtifactTypeDisplayName(at)}</div>
                      {artifacts[at].map((a:any) => 
                        <div key={'s-at-lnk-' + a.id} className={styles.item} onClick={() => { navigate(a.url); setShowDropdown(false); }} dangerouslySetInnerHTML={{__html: a.name}}></div>
                      )}
                    </div>
                  )}
                </div>
              )}
              {popularQueries.length > 0 && (
                <div className={styles.dd_pop_queries}>
                  <div className={styles.dd_sec_head}><SearchPopQIcon/><span>{i18n('Популярные запросы')}</span></div>
                  {popularQueries.map((s,i) => <div key={'s-pop-q-' + i} className={styles.item} onClick={() => { saveMyQuery(s.replaceAll(/<[\/]?em>/g, '')); window.location.href = `/search/?q=${encodeURIComponent(s.replaceAll(/<[\/]?em>/g, ''))}` + (artifactType ? ('&at=' + artifactType) : ''); }} dangerouslySetInnerHTML={{__html:s}}></div>)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={styles.tags} />
    </div>
  );
};
