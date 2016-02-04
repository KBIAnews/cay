import * as types from '../actions';

const initialState = {
  loading: false,
  loadingPipeline: false,
  pipesLoaded: false,
  pipelines: [],
  users: []
};

const pipelines = (state = initialState, action) => {

  switch (action.type) {
  case types.PIPELINE_SELECTED:
    return state;

  case types.PIPELINES_REQUEST:
    return Object.assign({}, state, {loading: true});

  case types.PIPELINE_REQUEST:
    return Object.assign({}, state, {loadingPipeline: true}); // query one pipeline?

  case types.PIPELINES_REQUEST_FAILURE:
    return Object.assign({}, state, {loading: false, showTheError: 'failed to load pipelines from server'});

  case types.PIPELINE_REQUEST_FAILURE:
    return Object.assign({}, state, {loadingPipeline: false, showTheError: 'failed to load ' + action.pipelineName});

  case types.PIPELINES_RECEIVED:
    return Object.assign({}, state,
      {
        loading: false,
        // this probably isn't the final way to do this.
        // queries will eventually be length > 1
        pipelines: action.pipelines.filter(pipe => pipe.queries[0].collection === 'user')
      }
    );

  // query_set executed. receive a list of users.
  case types.PIPELINE_RECEIVED:

    return Object.assign({}, state, { loadingPipeline: false, users: action.data.results[0].Docs});

  default:
    // console.log('no reducer matches:', action.type);
    return state;
  }
};

export default pipelines;
