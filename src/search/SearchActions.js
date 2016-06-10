import _ from 'lodash';
import {clamp} from 'components/utils/math';
import {xenia} from 'app/AppActions';
import { populateDistributionStore } from 'filters/FiltersActions';
import { fetchSections, fetchAuthors } from 'filters/FiltersActions';

export const QUERYSET_SELECTED = 'QUERYSET_SELECTED';
export const QUERYSET_REQUEST = 'QUERYSET_REQUEST'; // request data for a single queryset
export const QUERYSETS_REQUEST = 'QUERYSETS_REQUEST';
export const QUERYSETS_REQUEST_FAILURE = 'QUERYSETS_REQUEST_FAILURE';
export const QUERYSET_REQUEST_FAILURE = 'QUERYSET_REQUEST_FAILURE';
export const QUERYSETS_RECEIVED = 'QUERYSETS_RECEIVED';
export const QUERYSET_RECEIVED = 'QUERYSET_RECEIVED';

export const QUERYSET_SAVE_SUCCESS = 'QUERYSET_SAVE_SUCCESS';
export const QUERYSET_SAVE_FAILED = 'QUERYSET_SAVE_FAILED';
export const CREATE_QUERY = 'CREATE_QUERY';

export const SUBMIT_CUSTOM_QUERY = 'SUBMIT_CUSTOM_QUERY';

export const PILLAR_SEARCHLIST_REQUEST = 'PILLAR_SEARCHLIST_REQUEST';
export const PILLAR_SEARCHLIST_SUCCESS = 'PILLAR_SEARCHLIST_SUCCESS';
export const PILLAR_SEARCHLIST_FAILED = 'PILLAR_SEARCHLIST_FAILED';

export const PILLAR_SEARCH_SAVE_INIT = 'PILLAR_SEARCH_SAVE_INIT';
export const PILLAR_SEARCH_SAVE_SUCCESS = 'PILLAR_SEARCH_SAVE_SUCCESS';
export const PILLAR_SEARCH_SAVE_FAILED = 'PILLAR_SEARCH_SAVE_FAILED';

export const PILLAR_SEARCH_DELETE_INIT = 'PILLAR_SEARCH_DELETE_INIT';
export const PILLAR_SEARCH_DELETED = 'PILLAR_SEARCH_DELETED';
export const PILLAR_SEARCH_DELETE_FAILURE = 'PILLAR_SEARCH_DELETE_FAILURE';

export const PILLAR_SEARCH_REQUEST = 'PILLAR_SEARCH_REQUEST';
export const PILLAR_SEARCH_SUCCESS = 'PILLAR_SEARCH_SUCCESS';
export const PILLAR_SEARCH_FAILED = 'PILLAR_SEARCH_FAILED';

export const PILLAR_SAVED_SEARCH_EDIT_REQUEST = 'PILLAR_SAVED_SEARCH_EDIT_REQUEST';
export const PILLAR_EDIT_SEARCH_SUCCESS = 'PILLAR_EDIT_SEARCH_SUCCESS';
export const PILLAR_EDIT_SEARCH_FAILED = 'PILLAR_EDIT_SEARCH_FAILED';

export const PILLAR_SEARCH_UPDATE_SUCCESS = 'PILLAR_SEARCH_UPDATE_SUCCESS';
export const PILLAR_SEARCH_UPDATE_FAILED = 'PILLAR_SEARCH_UPDATE_FAILED';

// when we're initializing a Saved Search update to Pillar
export const PILLAR_SAVED_SEARCH_UPDATE = 'PILLAR_SAVED_SEARCH_UPDATE';

export const CLEAR_USER_LIST = 'CLEAR_USER_LIST';
export const CLEAR_USER = 'CLEAR_USER';
export const CLEAR_RECENT_SAVED_SEARCH = 'CLEAR_RECENT_SAVED_SEARCH';

export const selectQueryset = (queryset) => {
  return {
    type: QUERYSET_SELECTED,
    queryset
  };
};

export const requestQueryset = (queryset) => {
  return {
    type: QUERYSET_REQUEST,
    queryset
  };
};

const requestSearches = () => {
  return {type: PILLAR_SEARCHLIST_REQUEST};
};

const receivedSearches = (searches) => {
  return {type: PILLAR_SEARCHLIST_SUCCESS, searches};
};

const searchesFailed = (error) => {
  return {type: PILLAR_SEARCHLIST_FAILED, error};
};
const requestSearch = () => {
  return {type: PILLAR_SEARCH_REQUEST};
};

const receivedSearch = search => {
  return {type: PILLAR_SEARCH_SUCCESS, search};
};

const searchFailed = error => {
  return {type: PILLAR_SEARCH_FAILED, error};
};

// get data about a single Saved Search
export const fetchSearch = (id) => {
  return (dispatch, getState) => {
    dispatch(requestSearch());

    const app = getState().app;

    fetch(`${app.pillarHost}/api/search/${id}`)
      .then(resp => resp.json())
      .then(search => {
        dispatch(receivedSearch(search));
      })
      .catch(error => {
        dispatch(searchFailed(error));
      });
  };
};

const requestSavedSearchForEdit = () => {
  return {type: PILLAR_SAVED_SEARCH_EDIT_REQUEST};
};

const receivedEditSearch = (search, filters, breakdown, specificBreakdown) => {
  return {type: PILLAR_EDIT_SEARCH_SUCCESS, search, filters, breakdown, specificBreakdown};
};

const searchEditFetchFailed = error => {
  return {type: PILLAR_EDIT_SEARCH_FAILED, error};
};

export const fetchSavedSearchForEdit = id => {
  return (dispatch, getState) => {
    const {app, filters} = getState();

    dispatch(requestSavedSearchForEdit(id));

    fetch(`${app.pillarHost}/api/search/${id}`)
      .then(resp => resp.json())
      .then(search => {

        const {breakdown, specificBreakdown, values} = search.filters;

        const updatedFilters = _.reduce(filters.editFilterList, (accum, key) => {
          const oldFilter = filters[key];
          const savedFilter = _.find(values, {name: oldFilter.name});
          if (savedFilter) {
            // this could probably be more succinct with destructuring, but I was in a hurry
            accum[key] = _.assign({}, oldFilter, _.pick(savedFilter, ['userMin', 'userMax', 'min', 'max']));
          }
          return accum;
        }, {});

        dispatch(receivedEditSearch(search, updatedFilters, breakdown, specificBreakdown));
      })
      .catch(error => {
        dispatch(searchEditFetchFailed(error));
      });
  };
};

// get a list of Saved Searches from Pillar
export const fetchSearches = () => {
  return (dispatch, getState) => {
    dispatch(requestSearches());

    const app = getState().app;

    fetch(app.pillarHost + '/api/searches')
      .then(resp => resp.json())
      .then(searches => {
        dispatch(receivedSearches(searches));
      })
      .catch(error => {
        dispatch(searchesFailed(error));
      });
  };
};

export const fetchSearchesIfNotFetched = () => {
  return (dispatch, getState) => {
    if (!getState().searches.loadingSearches) {
      return dispatch(fetchSearches());
    }
    return {
      type: 'NOOP'
    };
  };
};

export const requestQuerysetFailure = (err) => {
  return {
    type: QUERYSET_REQUEST_FAILURE,
    err
  };
};

export const receiveQueryset = (data, replace) => {
  return {
    type: QUERYSET_RECEIVED,
    data,
    replace,
    userCount: data.results[1].Docs[0].count
  };
};

// execute a saved query_set
export const fetchQueryset = (querysetName, page = 0, replace = false) => {
  /* xenia_package */
  return (dispatch) => {

    dispatch(requestQueryset(querysetName, page));

    xenia()
      .limit(20)
      .skip(20 * page)
      .exec(querysetName)
      .then(queryset => dispatch(receiveQueryset(queryset, replace)))
      .catch(err => dispatch(requestQuerysetFailure(err)));
  };
};

export const executeCustomQueryset = queryset => {
  return {
    type: 'EXECUTE_CUSTOM_QUERYSET',
    queryset
  };
};


export const createQuery = (query) => {
  return {
    type: CREATE_QUERY,
    query
  };
};

/* xenia_package */
export const makeQueryFromState = (type, page = 0, replace = false, editMode = false) => {
  const pageSize = 20;

  return (dispatch, getState) => {
    // make a query from the current state
    const fs = getState().filters;
    const app = getState().app;
    const filterList = editMode ? fs.editFilterList : fs.filterList;
    const filters = filterList.map(key => fs[key]);
    const x = xenia({
      name: 'user_search_' + Math.random().toString().slice(-10),
      desc: 'user search currently. this is going to be more dynamic in the future'
    });

    const addMatches = x => {
      let breakdown = editMode ? fs.breakdownEdit : fs.breakdown;
      let specificBreakdown = editMode ? fs.specificBreakdownEdit : fs.specificBreakdown;

      // filter by breakdown if needed
      if (-1 === ['author', 'section'].indexOf(breakdown) || specificBreakdown === '') {
        breakdown = 'all';
      } else {
        x.match({[`statistics.comments.${breakdown}.${specificBreakdown}`]: { $exists: true }});
      }

      filters.forEach(filter => {
        let dbField;
        // get the name of the mongo db field we want to $match on.
        if (breakdown !== 'all' && specificBreakdown !== '') {
          dbField = _.template(filter.template)({dimension: `${breakdown}.${specificBreakdown}`});
        } else { // all
          dbField = _.template(filter.template)({dimension: 'all'});
        }

        // Only create match statements for non-defaults
        // user min and user max are stored for UX purposes.
        // filter.userMax and filter.max COULD be different values, but be equivalent in the UI (visually)
        // filter.min and filter.max change when the ranges are populated from the server
        const clampedUserMin = clamp(filter.userMin, filter.min, filter.max);
        const clampedUserMax = clamp(filter.userMax, filter.min, filter.max);

        // convert everything to numbers since equivalent Dates are not equal
        // this will break if a string literal is ever a filter value since NaN !== NaN
        if (+filter.min !== +clampedUserMin) {
          let searchMin;
          if (_.isDate(clampedUserMin)) {
            searchMin = `#date:${clampedUserMin.toISOString()}`;
          } else if (filter.type === 'intDateProximity') {
            searchMin = `#time:${-clampedUserMin*24}h`;
          } else {
            searchMin = clampedUserMin;
          }

          x.match({[dbField]: {$gte: searchMin}});
        }

        if (+filter.max !== +clampedUserMax) {
          let searchMax;
          if (_.isDate(clampedUserMax)) {
            searchMin = `#date:${clampedUserMax.toISOString()}`;
          } else if (filter.type === 'intDateProximity') {
            searchMax = `#time:${-clampedUserMax*24}h`;
          } else {
            searchMax = clampedUserMax;
          }
          x.match({[dbField]: {$lte: searchMax}});
        }
      });

      return x;
    };

    addMatches(x.addQuery());
    if(fs.sortBy) {
      const breakdown = editMode ? fs.breakdownEdit : fs.breakdown;
      const specificBreakdown = editMode ? fs.specificBreakdownEdit : fs.specificBreakdown;
      const { sortBy } = fs;
      const field = _.template(sortBy[0])
        ({dimension: `${breakdown}${specificBreakdown ? `.${specificBreakdown}` : ''}`});
      x.sort([field, sortBy[1]]);
    }
    x.skip(page * pageSize).limit(pageSize)
      .include(['name', 'avatar', 'statistics.comments']);

    // get the counts
    addMatches(x.addQuery()).group({_id: null, count: {$sum: 1}});
    doMakeQueryFromStateAsync(x, dispatch, app, replace);
  };
};

export const saveQueryFromState = (queryName, desc, tag) => {

  return (dispatch, getState) => {
    // make a query from the current state
    const state = getState();

    dispatch({type: PILLAR_SEARCH_SAVE_INIT, query: state.searches.activeQuery});

    console.log('about to doPutQuery');
    doPutQuery(dispatch, state, queryName, desc, tag);
  };
};

// prepare the active query to be saved to xenia
const createQueryForSave = (query, name, desc) => {
  const q = _.cloneDeep(query);

  // inject $limt and $skip commands before saving
  q.queries[0].commands.forEach((command) => {
    if (typeof command.$skip !== 'undefined') {
      command.$skip = '#number:skip';
    } else if (typeof command.$limit !== 'undefined') {
      command.$limit = '#number:limit';
    }
  });

  const lastMatchIndex = _.findLastIndex(q.queries[0].commands, command => _.has(command, '$match'));

  if (lastMatchIndex !== -1) {
    const sortCommand = { $sort: { '#string:sort': -1 } };
    q.queries[0].commands.splice(lastMatchIndex + 1, 0, sortCommand);
  }

  q.name = name;
  q.desc = desc;

  return q;
};

// create the body of request to save a Search to Pillar
const prepSearch = (filters, query, name, desc, tag, breakdown, specificBreakdown) => {

  let values = _.compact(_.map(filters, f => {
    // this will return the ENTIRE filter if only the min OR max was changed.
    // is this the behavior we want?
    if (f.min !== f.userMin || f.max !== f.userMax) {
      return f;
    } else {
      return null;
    }
  }));

  return {
    name, // the human-readable user-entered name
    description: desc, // user-entered string
    query: query.name, // the name of the xenia query
    tag, // unique name of live-tag
    filters: {
      values,
      breakdown,
      specificBreakdown
    }
  };
};

/*

this method saves the active query to xenia, then saves the resulting query_set
to pillar with some other metadata to form a "Search"

the filters object only stores non-default values and the dimension breakdowns

*/
const doPutQuery = (dispatch, state, name, desc, tag) => {

  const {breakdown, specificBreakdown} = state.filters;
  const query = createQueryForSave(state.searches.activeQuery, name, desc);

  xenia(query)
    .saveQuery()
    .then(() => { // if response.status < 400
      dispatch({type: QUERYSET_SAVE_SUCCESS, name: query.name});

      const filters = state.filters.filterList.map(key => state.filters[key]);
      const body = prepSearch(filters, query, name, desc, tag, breakdown, specificBreakdown);

      fetch(`${state.app.pillarHost}/api/search`, {method: 'POST', body: JSON.stringify(body)})
        .then(resp => resp.json())
        .then(search => {
          // do something with savedSearch?
          dispatch({type: PILLAR_SEARCH_SAVE_SUCCESS, search});
        })
        .catch(error => {
          dispatch({type: PILLAR_SEARCH_SAVE_FAILED, error});
        });

    }).catch(error => {
      dispatch({type: QUERYSET_SAVE_FAILED, error});
    });
};
/* xenia_package */
const doMakeQueryFromStateAsync = _.debounce((query, dispatch, app, replace)=>{
  dispatch(requestQueryset());

  dispatch(createQuery(query._data));

  query.exec()
    .then(json => dispatch(receiveQueryset(json, replace)))
    .catch(() => {});
}, 1000);

export const updateSearch = staleSearch => {
  // build query from state
  // update search in xenia? or create a new one
  // update in pillar

  return (dispatch, getState) => {
    const {app, searches, filters} = getState();
    const {name, description, tag} = staleSearch;
    const {breakdownEdit, specificBreakdownEdit} = filters;

    const query = createQueryForSave(searches.activeQuery, name, description);

    dispatch({type: PILLAR_SAVED_SEARCH_UPDATE, query});

    xenia(query).saveQuery().then(() => {
      dispatch({type: QUERYSET_SAVE_SUCCESS, name: query.name});

      const editFilters = filters.editFilterList.map(key => {
        console.log('updateSearch key', key);
        console.log('updateSearch filters', filters);
        return filters[key];
      });
      const body = prepSearch(editFilters, query, name, description, tag, breakdownEdit, specificBreakdownEdit);

      fetch(`${app.pillarHost}/api/search`, {method: 'PUT', body: JSON.stringify(body)})
        .then(resp => resp.json())
        .then(search => {
          // do something with savedSearch?
          dispatch({type: PILLAR_SEARCH_UPDATE_SUCCESS, search});
        })
        .catch(error => {
          dispatch({type: PILLAR_SEARCH_UPDATE_FAILED, error});
        });
    });

    console.log('updateSearch', searches.activeQuery);
  };
};

export const deleteSearch = search => {
  return (dispatch, getState) => {
    const app = getState().app;
    const searches = getState().searches;

    dispatch({type: PILLAR_SEARCH_DELETE_INIT, search});

    xenia().deleteQuery(search.query).then(data => {
      console.info('query_set deleted from xenia', data);
      return fetch(`${app.pillarHost}/api/search/${search.id}`, {method: 'DELETE'});
    })
    .then(resp => {
      console.info('search deleted from pillar', resp);
      const newSearches = searches.searches.concat();
      // splice out deleted search
      newSearches.splice(_.indexOf(_.map(newSearches, 'id'), search.id), 1);

      dispatch({type: PILLAR_SEARCH_DELETED, search, newSearches});
    })
    .catch(error => {
      console.error('failed to delete search', error);
      console.error(error.stack);
      dispatch({type: PILLAR_SEARCH_DELETE_FAILURE, error});
    });
  };
};

export const fetchInitialData = () => dispatch => {
  // Get initial data for the filters
  dispatch(fetchSections());
  dispatch(fetchAuthors());
  dispatch(populateDistributionStore());

  // Get user list
  dispatch(makeQueryFromState('user', 0, true));
};

export const clearUserList = () => {
  return {type: CLEAR_USER_LIST};
};

export const clearRecentSavedSearch = () => {
  return {type: CLEAR_RECENT_SAVED_SEARCH};
};