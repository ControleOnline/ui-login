import { api } from "@controleonline/ui-common/src/api";
import * as types from "./mutation_types";

const clearStoredSession = (commit) => {
  localStorage.removeItem("session");
  commit(types.LOGIN_SET_USER, null);
  commit(types.LOGIN_SET_IS_LOGGED, false);
};

const parseStoredSession = () => {
  const sessionString = localStorage.getItem("session");
  if (!sessionString) return null;

  try {
    const session = JSON.parse(sessionString) || null;
    return session && typeof session === "object" ? session : null;
  } catch {
    localStorage.removeItem("session");
    return null;
  }
};

const normalizeStatusResponse = response =>
  response?.response?.data ?? response?.data ?? response ?? null;

const fetchPeopleStatus = peopleId => api.fetch(`people/${peopleId}`, {});

export const signIn = ({ commit }, values) => {
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
      logIn({ commit }, data);

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

export const getUserStatus = ({ commit }, _values) => {
  if (!localStorage.getItem("session")) return;

  let session = JSON.parse(localStorage.getItem("session")) || {};

  fetchPeopleStatus(session.people).then((response) => {
    commit("SET_PEOPLE_STATUS", normalizeStatusResponse(response));
  }).catch(() => {});
};

export const restoreSession = async ({ commit }) => {
  commit(types.LOGIN_SET_SESSION_CHECKED, false);

  const session = parseStoredSession();
  const hasValidShape =
    !!session?.id &&
    !!session?.people &&
    !!session?.api_key &&
    (session.active === 1 || session.active === true);

  if (!hasValidShape) {
    clearStoredSession(commit);
    commit(types.LOGIN_SET_SESSION_CHECKED, true);
    return null;
  }

  try {
    await fetchPeopleStatus(session.people);
    commit(types.LOGIN_SET_USER, session);
    commit(types.LOGIN_SET_IS_LOGGED, true);
    return session;
  } catch {
    clearStoredSession(commit);
    return null;
  } finally {
    commit(types.LOGIN_SET_SESSION_CHECKED, true);
  }
};

export const gSignIn = ({ commit }, values) => {
  commit(types.LOGIN_SET_ERROR, "");
  commit(types.LOGIN_SET_ISLOADING, true);

  return api
    .fetch("oauth/google/return", { method: "POST", params: values })
    .then((response) => {
      const user =
        response?.response?.data ?? response?.data ?? response ?? null;

      if (!user || user.error) {
        throw new Error(user?.error || "Credenciais inválidas");
      }

      if ((user.active !== 1 && user.active !== true) || !user.api_key) {
        throw new Error("Credenciais inválidas");
      }

      logIn({ commit }, user);
      return user;
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
        const sessionData = data.response?.data ?? null;

        if (data.response.success === true && sessionData) {
          logIn({ commit }, sessionData);
        }

        return data.response;
      }
      return null;
    })
    .finally(() => {
      commit(types.LOGIN_SET_ISLOADING, false);
    });
};

export const logIn = ({ commit }, user = null) => {
  localStorage.setItem("session", JSON.stringify(user));
  commit(types.LOGIN_SET_USER, user);
  commit(types.LOGIN_SET_IS_LOGGED, user?.active ? true : false);
  commit(types.LOGIN_SET_SESSION_CHECKED, true);
};

export const isLogged = ({ state }) => {
  let user = getLoggedUser({ state });
  return user?.active ? true : false;
};

export const getLoggedUser = ({ state }) => {
  return state?.user;
};

export const logOut = ({ commit }) => {
  let clearManagerPushTokenPromise = null;

  if (typeof global.clearManagerPushTokenOnLogout === 'function') {
    try {
      clearManagerPushTokenPromise = global.clearManagerPushTokenOnLogout();
    } catch (error) {
      console.warn('Failed to clear manager push token on logout', error);
    }
  }

  commit(types.LOGIN_SET_USER, null);
  commit(types.LOGIN_SET_IS_LOGGED, false);
  commit(types.LOGIN_SET_SESSION_CHECKED, true);

  if (clearManagerPushTokenPromise?.finally) {
    clearManagerPushTokenPromise.finally(() => {
      localStorage.clear();
    });
    return;
  }

  localStorage.clear();
};

export const setIndexRoute = ({ commit }, indexRoute) => {
  commit(types.LOGIN_SET_INDEX_ROUTE, indexRoute);
};
