import * as actions from './actions';
import * as getters from './getters';
import mutations from './mutations';
export default {
  namespaced: true,
  state: {
    user: {},
    isLoading: false,
    isLoggedIn: false,
    error: '',

    created: null,
    indexRoute: 'HomeIndex',
  },
  actions,
  getters,
  mutations,
};
