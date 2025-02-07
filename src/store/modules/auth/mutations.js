import { LocalStorage } from "quasar";
import * as types from "./mutation_types";

export default {
  [types.LOGIN_SET_USER](state, payload) {
    let user = payload?.user || payload;

    if (!user) {
      LocalStorage.remove("session");
      state.isLoggedIn = false;
    } else {
      LocalStorage.set("session", user);
      state.isLoggedIn = true;
    }
    if (!payload?.user) Object.assign(state, { user });
    return { ...state, user: user };
  },

  [types.SET_PEOPLE_STATUS](state, payload) {
    if (!payload?.peopleStatus) Object.assign(state, { peopleStatus: payload });
    return { ...state, isLoading: payload.peopleStatus || payload };
  },

  [types.LOGIN_SET_ERROR](state, payload) {
    if (!payload?.error) Object.assign(state, { payload });
    return { ...state, error: payload.error || payload };
  },

  [types.LOGIN_SET_ISLOADING](state, payload = true) {
    if (!payload?.isLoading) Object.assign(state, { payload });
    return { ...state, isLoading: payload.isLoading || payload };
  },

  [types.LOGIN_SET_VIOLATIONS](state, payload) {
    if (!payload?.violations) Object.assign(state, { violations: payload });
    return { ...state, violations: payload.violations || payload };
  },

  [types.LOGIN_SET_INDEX_ROUTE](state, payload) {
    if (!payload?.indexRoute) Object.assign(state, { indexRoute: payload });
    return { ...state, indexRoute: state.indexRoute || payload };
  },
};
