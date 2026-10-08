import { api } from "@controleonline/ui-common/src/api";
import * as types from "./mutation_types";

// Intentional logout must land on a clean SignInPage (no redirectRoute).
// CheckLogin races while still on the protected route and would otherwise
// build /sign-in-page?redirectRoute=ProfilePage and trap post-login.
let preferCleanSignIn = false;

export const consumePreferCleanSignIn = () => {
  const value = preferCleanSignIn;
  preferCleanSignIn = false;
  return value;
};

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


const resolveAuthErrorMessage = (payloadOrError, fallback = "Credenciais inválidas") => {
  if (!payloadOrError) return fallback;

  if (typeof payloadOrError === "string") {
    if (/desativado|disabled|USER_DISABLED/i.test(payloadOrError)) {
      return "Usuário desativado";
    }
    return payloadOrError || fallback;
  }

  const code = payloadOrError.code || payloadOrError?.response?.code;
  const error =
    payloadOrError.error ||
    payloadOrError.message ||
    payloadOrError?.response?.error ||
    payloadOrError?.response?.message;

  if (code === "USER_DISABLED" || /desativado|disabled/i.test(String(error || ""))) {
    return "Usuário desativado";
  }

  if (
    code === "TEMPORARY_PASSWORD_EXPIRED" ||
    /senha tempor[aá]ria expirada/i.test(String(error || ""))
  ) {
    return "Senha temporária expirada. Solicite uma nova recuperação de senha.";
  }

  return error || fallback;
};

export const signIn = ({ commit }, values) => {
  commit(types.LOGIN_SET_ERROR, "");
  commit(types.LOGIN_SET_ISLOADING);

  return api
    .fetch("token", { method: "POST", body: values })
    .then((data) => {
      if (!data || data.error) {
        throw new Error(resolveAuthErrorMessage(data, "Credenciais inválidas"));
      }
      if (data.active !== 1 || !data.api_key) {
        throw new Error(
          data.active === 0 || data.active === false
            ? "Usuário desativado"
            : "Credenciais inválidas"
        );
      }

      logIn({ commit }, data);

      return data;
    })
    .catch((e) => {
      const message = resolveAuthErrorMessage(e, e?.message || "Credenciais inválidas");
      commit(types.LOGIN_SET_ERROR, message);
      throw new Error(message);
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

      if (response?.response?.success === false) {
        throw new Error(
          resolveAuthErrorMessage(response.response, "Credenciais inválidas")
        );
      }

      if (!user || user.error) {
        throw new Error(resolveAuthErrorMessage(user, "Credenciais inválidas"));
      }

      if ((user.active !== 1 && user.active !== true) || !user.api_key) {
        throw new Error(
          user.active === 0 || user.active === false
            ? "Usuário desativado"
            : "Credenciais inválidas"
        );
      }

      logIn({ commit }, user);
      return user;
    })
    .catch((e) => {
      const message = resolveAuthErrorMessage(e, e?.message || "Credenciais inválidas");
      commit(types.LOGIN_SET_ERROR, message);
      throw new Error(message);
    })
    .finally(() => {
      commit(types.LOGIN_SET_ISLOADING, false);
    });
};

export const dSignIn = ({ commit }, values) => {
  commit(types.LOGIN_SET_ERROR, "");
  commit(types.LOGIN_SET_ISLOADING, true);

  return api
    .fetch("oauth/discord/return", { method: "POST", params: values })
    .then((response) => {
      const user =
        response?.response?.data ?? response?.data ?? response ?? null;

      if (response?.response?.success === false) {
        throw new Error(
          resolveAuthErrorMessage(response.response, "Credenciais inválidas")
        );
      }

      if (!user || user.error) {
        throw new Error(resolveAuthErrorMessage(user, "Credenciais inválidas"));
      }

      if ((user.active !== 1 && user.active !== true) || !user.api_key) {
        throw new Error(
          user.active === 0 || user.active === false
            ? "Usuário desativado"
            : "Credenciais inválidas"
        );
      }

      logIn({ commit }, user);
      return user;
    })
    .catch((e) => {
      const message = resolveAuthErrorMessage(e, e?.message || "Credenciais inválidas");
      commit(types.LOGIN_SET_ERROR, message);
      throw new Error(message);
    })
    .finally(() => {
      commit(types.LOGIN_SET_ISLOADING, false);
    });
};

export const signUp = ({ commit }, values) => {
  commit(types.LOGIN_SET_ERROR, "");
  commit(types.LOGIN_SET_ISLOADING);

  return api
    .fetch("create-account", { method: "POST", body: values })
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

      return data;
    })
    .finally(() => {
      commit(types.LOGIN_SET_ISLOADING, false);
    });
};

export const logIn = ({ commit }, user = null) => {
  preferCleanSignIn = false;
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
  preferCleanSignIn = true;

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
