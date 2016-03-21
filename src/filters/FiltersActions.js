import _ from 'lodash';
import {authXenia} from 'auth/AuthActions';

export const REQUEST_SECTIONS = 'REQUEST_SECTIONS';
export const RECEIVE_SECTIONS = 'RECEIVE_SECTIONS';
export const REQUEST_AUTHORS = 'REQUEST_AUTHORS';
export const RECEIVE_AUTHORS = 'RECEIVE_AUTHORS';

export const DATA_CONFIG_LOADED = 'DATA_CONFIG_LOADED';

export const FILTER_CHANGED = 'FILTER_CHANGED';

export const SET_BREAKDOWN = 'SET_BREAKDOWN';
export const SET_SPECIFIC_BREAKDOWN = 'SET_SPECIFIC_BREAKDOWN';

export const RECEIVE_FILTER_RANGES = 'RECEIVE_FILTER_RANGES';

export const requestSections = () => {
  return {
    type: REQUEST_SECTIONS
  };
};

export const receiveSections = (data) => {
  return {
    type: RECEIVE_SECTIONS,
    data
  };
};

export const fetchSections = () => {
  return (dispatch) => {
    dispatch(requestSections());

    /* xenia_package */
    fetch(window.xeniaHost + '/1.0/exec/dimension_section_list', authXenia())
      .then(response => response.json())
      .then(json => dispatch(receiveSections(json)))
      .catch(err => {
        console.log('oh no. failed to get section list', err);
      });
  };
};

export const requestAuthors = () => {
  return { type: REQUEST_AUTHORS };
};

export const receiveAuthors = (data) => {
  return {
    type: RECEIVE_AUTHORS,
    data
  };
};

export const fetchAuthors = () => {
  return dispatch => {
    dispatch(requestAuthors());

    /* xenia_package */
    fetch(window.xeniaHost + '/1.0/exec/dimension_author_list', authXenia())
      .then(response => response.json())
      .then(json => dispatch(receiveAuthors(json)))
      .catch(err => {
        console.log('you failed to get the authors list!', err);
      });
  };
};

export const setBreakdown = (breakdown) => {
  return {
    type: SET_BREAKDOWN,
    breakdown
  };
};

export const setSpecificBreakdown = (specificBreakdown) => {
  return (dispatch, getState) => {
    let counter = getState().filters.counter;
    counter++;
    dispatch({
      type: SET_SPECIFIC_BREAKDOWN,
      specificBreakdown: specificBreakdown,
      counter
    });
  };
};

const parseFilterRanges = (ranges) => {

  const newFilters = _.reduce(ranges, (accum, value, aggKey) => {
    let [key, field] = aggKey.split('_');

    if (field === 'id' || value === null) return accum;

    console.log('key', key);

    // we might have already updated the old filter with the min value
    // retrieve it from the accumulator in progress instead of the state
    let newFilter = _.has(accum, key) ? accum[key] : {};
    newFilter[field] = value; // where field is {min|max}
    accum[key] = newFilter;

    // on the first pass, go ahead and force a change on userMin and userMax
    if (field === 'min' && _.isNull(newFilter.userMin)) {
      newFilter.userMin = value;
    } else if (field === 'max' && _.isNull(newFilter.userMax)) {
      newFilter.userMax = value;
    }

    return accum;
  }, {});

  console.log('ranges', ranges);
  console.log('newFilters', newFilters);

  return _.map(newFilters, (filter, key) => {
    return {[key]: filter};
  });
};

/* xenia_package */
export const getFilterRanges = () => {

  return (dispatch, getState) => {
    let filterState = getState().filters;
    let $group = filterState.filterList.reduce((accum, key) => {

      console.log('fetching filter ranges', key);

      let dimension;
      if (filterState.breakdown === 'author') {
        dimension = 'author.' + filterState.specificBreakdown;
      } else if (filterState.breakdown === 'section') {
        dimension = 'section.' + filterState.specificBreakdown;
      } else { // all
        dimension = 'all';
      }
      const field = '$' + _.template(filterState[key].template)({dimension});

      // if you change this naming convention
      // you must update the RECEIVE_FILTER_RANGES in reducers/filters.js
      accum[key + '_min'] = {
        $min: field
      };

      accum[key + '_max'] = {
        $max: field
      };

      return accum;
    }, {_id: null});

    let query = {
      name: 'ranges',
      desc: 'min and max values for arbitrary filters',
      pre_script: '',
      pst_script: '',
      params: [],
      queries: [
        {
          name: 'ranges',
          type: 'pipeline',
          collection: 'user_statistics',
          commands: [ { $group } ],
          return: true
        }
      ],
      enabled: true
    };

    dispatch({type: 'REQUEST_FILTER_RANGES'});

    const url = window.xeniaHost + '/1.0/exec';

    var init = authXenia('POST');
    init.body = JSON.stringify(query);

    fetch(url, init)
      .then(res => res.json())
      .then(data => {
        const doc = data.results[0].Docs[0];
        dispatch({type: RECEIVE_FILTER_RANGES, data: parseFilterRanges(doc)});
      }).catch(err => {
        console.log(err);
      });
  };
};

export const filterChanged = (fieldName, data) => {
  return (dispatch, getState) => {
    let counter = getState().filters.counter;
    counter++;

    dispatch({
      type: FILTER_CHANGED,
      fieldName,
      data,
      counter
    });
  };
};
