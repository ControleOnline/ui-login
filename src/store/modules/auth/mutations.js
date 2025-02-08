import { LocalStorage } from "quasar";
import * as types from "./mutation_types";

export default {
  [types.LOGIN_SET_USER](state, user) {
    if (!user) {
      LocalStorage.remove("session");
      state.isLoggedIn = false;
    } else {
      LocalStorage.set("session", user);
      state.isLoggedIn = true;
    }
    state.user = user;
  },

  [types.SET_PEOPLE_STATUS](state, peopleStatus) {
    state.peopleStatus = peopleStatus;
    state.isLoading = peopleStatus || false;
  },

  [types.LOGIN_SET_ERROR](state, error) {
    state.error = error;
  },

  [types.LOGIN_SET_ISLOADING](state, isLoading = true) {
    state.isLoading = isLoading;
  },

  [types.LOGIN_SET_VIOLATIONS](state, violations) {
    state.violations = violations;
  },

  [types.LOGIN_SET_INDEX_ROUTE](state, indexRoute) {
    state.indexRoute = indexRoute;
  },
};
