import { LocalStorage } from "quasar";
import * as actions from "./actions";
import * as getters from "./getters";
import mutations from "./mutations";

export default {
  namespaced: true,
  state: {
 item:{},
items:[],
    user: LocalStorage.getItem("session") || {},
    isLoading: false,
    error: "",
    violations: null,
    created: null,
    isLoggedIn: false,
    indexRoute: "HomeIndex",
  },
  actions,
  getters,
  mutations,
};
