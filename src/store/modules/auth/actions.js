import { api } from "@controleonline/ui-common/src/api";
import * as types from "./mutation_types";

export const signIn = ({ commit, state }, values) => {
  commit(types.LOGIN_SET_ERROR, "");
  commit(types.LOGIN_SET_ISLOADING);

  return api
    .fetch("token", { method: "POST", body: values })
    .then((data) => {
      
      // AleMac // 26/11/2025
      // validação REAL da resposta da API
      if (!data || data.error) {
        throw new Error(data.error || "Credenciais inválidas");
      }
      if (data.active !== 1 || !data.api_key) {
        throw new Error("Credenciais inválidas");
      }

      // só loga se passou em todas as validações
      logIn({ commit, state }, data);
      return data;
    })
    .catch((e) => {
      commit(types.LOGIN_SET_ERROR, e.message);
      throw e;
    })
    .finally(() => {
      commit(types.LOGIN_SET_ISLOADING, false);
    });
};

export const getUserStatus = ({ commit }, values) => {
  if (!localStorage.getItem("session")) return;

  let session = JSON.parse(localStorage.getItem("session")) || {};

  api.fetch(`people/${session.people}/status`, {}).then((response) => {
    commit("SET_PEOPLE_STATUS", response.response.data);
  });
};

export const gSignIn = ({ commit }, values) => {
  commit(types.LOGIN_SET_ERROR, "");
  commit(types.LOGIN_SET_ISLOADING, true);

  return api
    .fetch("oauth/google/return", { method: "POST", params: values })
    .then((response) => {
      logIn({ commit, state }, response.response.data);
      return response;
    })
    .catch((e) => {
      commit(types.LOGIN_SET_ERROR, e.message);
      throw e;
    })
    .finally(() => {
      commit(types.LOGIN_SET_ISLOADING, false);
    });
};

export const signUp = ({ commit }, values) => {
  commit(types.LOGIN_SET_ERROR, "");
  commit(types.LOGIN_SET_ISLOADING);

  return api
    .fetch("users/create-account", { method: "POST", body: values })
    .then((response) => {
      commit(types.LOGIN_SET_ISLOADING, false);
      return response;
    })
    .then((data) => {
      if (data.response) {
        if (data.response.success === true)
          logIn({ commit, state }, response.response.data);
        return data.response;
      }
      return null;
    })
    .finally(() => {
      commit(types.LOGIN_SET_ISLOADING, false);
    });
};

export const logIn = ({ commit, state }, user = null) => {
  localStorage.setItem("session", JSON.stringify(user));
  commit(types.LOGIN_SET_USER, user);
  commit(types.LOGIN_SET_IS_LOGGED, user?.active ? true : false);
};

export const isLogged = ({ commit, state }) => {
  let user = getLoggedUser({ commit, state });
  return user?.active ? true : false;
};

export const getLoggedUser = ({ commit, state }) => {
  return state?.user;
};

export const logOut = ({ commit }) => {
  
  // AleMac // 26/11/2025
  // para fazer o logout corretamente
  localStorage.removeItem("session");

  commit(types.LOGIN_SET_USER, null);
  commit(types.LOGIN_SET_IS_LOGGED, false);
  // localStorage.clear();

};

export const setIndexRoute = ({ commit }, indexRoute) => {
  commit(types.LOGIN_SET_INDEX_ROUTE, indexRoute);
};
