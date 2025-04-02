import { fetchWithRefresh } from '../auth';
import { optionsGet, optionsPost, URL } from '../requst_templates';
import { handleHttpResponse, searchArtifactTypes } from '../../utils';

export const searchPost = async (data: any) => fetchWithRefresh(`${URL}/v1/search/`, optionsPost(data)).then(handleHttpResponse);

export const getSearchPopularQueries = async (search: string, count: number) => fetchWithRefresh(`${URL}/v1/search/queries/popular/${count}`, optionsPost(search)).then(handleHttpResponse);
export const getSearchMyQueries = async (count: number) => fetchWithRefresh(`${URL}/v1/search/queries/my/${count}`, optionsGet()).then(handleHttpResponse);
export const saveSearchQuery = async (query: string) => fetchWithRefresh(`${URL}/v1/search/queries/save`, optionsPost(query)).then(handleHttpResponse);

export const buildElasticSearchRequest = (q: string, selectedArtifactTypes: string[], selectedArtifacts: any[], selectedArtifactAttribs:any[], incArchive: boolean, sortBy: string, sortOrder: string, userDomains: any, from: number, size: number, searchByNameOnly?: boolean) => {

    let parts = q.toLowerCase().split(' ').filter(s => s);
    let tags_parts = parts.filter(s => s.indexOf('#') === 0);

    let inner_q:any = {
      'query_string': {
        'query': `${parts.filter(s => s.indexOf('#') !== 0).map(s => ('*' + s + '*')).join(' ')}`,
        'default_operator': 'AND'
      }
    };

    if (searchByNameOnly)
        inner_q = {
            'query_string': {
                'fields': ['name'],
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
            must: [
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
    selectedArtifactTypes.forEach(at => {
      if (at == 'metadata') {
        filter_by_at.push({ match: { artifact_type: 'meta_database' }});
        filter_by_at.push({ match: { artifact_type: 'meta_object' }});
        filter_by_at.push({ match: { artifact_type: 'meta_column' }});
      } else
        filter_by_at.push({ match: { artifact_type: at }});
    });
    if (filter_by_at.length == 0) {
      searchArtifactTypes.forEach(at => {
        filter_by_at.push({ match: { artifact_type: at }});
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

    if (userDomains && userDomains.length > 0) {
      must.push({
        bool: {
          should: userDomains.map((x:string) => ({ match: { domains: x } }))
        }
      });
    }
    var rel_art_ids:any[] = [];

    selectedArtifacts.forEach(sa => {
      rel_art_ids.push(sa.id);
    })

    if (rel_art_ids.length > 0) {
      rel_art_ids.forEach(id => {
        must.push({ match: { "related_artifacts.artifact_id": id } });
      });
    }

    selectedArtifactAttribs.forEach(sattr => {
      must.push({ match: { [sattr.attr.name + '.keyword']: sattr.valId }});
    })

    if (!incArchive) {
      must.push({ match: { "artifact_state": "PUBLISHED" }});
    } else {
      must.push({ bool: { should: [ {match: { "artifact_state": "PUBLISHED" }}, { match: { "artifact_state": "ARCHIVED" } } ] }});
    }

    var sort = undefined;
    if (sortBy != '') {
      sort = [{ [sortBy]: sortOrder }];
    }

    return {
      size,
      from,
      _source: ['artifact_type', 'artifact_type_display_name', 'id', 'artifact_id', 'name', 'short_description', 'domains', 'entity_id', 'tech_name', 'artifact_state', 'meta_database_id', 'meta_object_type', 'related_artifacts'],
      query: {
        bool: {
          must: must,
        },
      },
      sort: sort
    }
  };