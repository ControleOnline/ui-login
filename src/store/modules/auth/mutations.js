import * as types from './mutation_types';

export default {
  [types.LOGIN_SET_USER](state, user) {
    if (!user) {
      localStorage.clear();
      state.user = user;
      state.isLogged = false;
    } else {
      localStorage.setItem('session', JSON.stringify(user));
      state.user = user;
      state.isLogged = true;
    }
    state.user = user || {};
    return 'user';
  },

  [types.SET_PEOPLE_STATUS](state, peopleStatus) {
    state.peopleStatus = peopleStatus;
    state.isLoading = peopleStatus || false;
    return 'peopleStatus';
  },

  [types.LOGIN_SET_ERROR](state, error) {
    state.error = error || '';
    return 'error';
  },

  [types.LOGIN_SET_ISLOADING](state, isLoading = true) {
    state.isLoading = isLoading || false;
    return 'isLoading';
  },

  [types.LOGIN_SET_VIOLATIONS](state, violations) {
    state.violations = violations || null;
    return 'violations';
  },

  [types.LOGIN_SET_INDEX_ROUTE](state, indexRoute) {
    state.indexRoute = indexRoute || 'HomeIndex';
    return 'indexRoute';
  },
  [types.LOGIN_SET_IS_LOGGED](state, isLogged) {
    state.isLogged = isLogged || false;
    return 'isLogged';
  },
};
