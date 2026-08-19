import {Platform} from 'react-native';

const GOOGLE_OAUTH_SCRIPT_ID = 'google-oauth-client-script';
const GOOGLE_OAUTH_SCOPE = 'openid email profile';

let googleOauthScriptPromise = null;

const getGoogleOauthApi = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.google?.accounts?.oauth2 || null;
};

export const loadGoogleOauthApi = () => {
  if (Platform.OS !== 'web') {
    return Promise.reject(new Error('google-oauth-web-only'));
  }

  const existingApi = getGoogleOauthApi();
  if (existingApi) {
    return Promise.resolve(existingApi);
  }

  if (!googleOauthScriptPromise) {
    googleOauthScriptPromise = new Promise((resolve, reject) => {
      if (typeof document === 'undefined') {
        reject(new Error('google-oauth-document-unavailable'));
        return;
      }

      const handleLoad = () => {
        const oauthApi = getGoogleOauthApi();

        if (!oauthApi) {
          reject(new Error('google-oauth-unavailable'));
          return;
        }

        resolve(oauthApi);
      };

      const handleError = () => {
        reject(new Error('google-oauth-load-failed'));
      };

      const existingScript = document.getElementById(GOOGLE_OAUTH_SCRIPT_ID);
      if (existingScript) {
        existingScript.addEventListener('load', handleLoad, {once: true});
        existingScript.addEventListener('error', handleError, {once: true});
        return;
      }

      const script = document.createElement('script');
      script.id = GOOGLE_OAUTH_SCRIPT_ID;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = handleLoad;
      script.onerror = handleError;
      document.head.appendChild(script);
    }).catch(error => {
      googleOauthScriptPromise = null;
      throw error;
    });
  }

  return googleOauthScriptPromise;
};

export const requestGoogleAccessToken = async clientId => {
  const oauthApi = await loadGoogleOauthApi();

  return new Promise((resolve, reject) => {
    const tokenClient = oauthApi.initTokenClient({
      client_id: clientId,
      scope: GOOGLE_OAUTH_SCOPE,
      callback: tokenResponse => {
        if (tokenResponse?.error) {
          reject(
            new Error(tokenResponse.error_description || tokenResponse.error),
          );
          return;
        }

        if (!tokenResponse?.access_token) {
          reject(new Error('google-access-token-missing'));
          return;
        }

        resolve(tokenResponse.access_token);
      },
      error_callback: error => {
        reject(error || new Error('google-oauth-error'));
      },
    });

    tokenClient.requestAccessToken();
  });
};

export const getGoogleSignInErrorMessage = error => {
  const errorMessage = String(error?.message || error || '')
    .trim()
    .toLowerCase();

  if (errorMessage === 'popup_closed') {
    return 'A janela do Google foi fechada antes da autenticacao.';
  }

  if (
    errorMessage === 'google-oauth-load-failed' ||
    errorMessage === 'google-oauth-unavailable'
  ) {
    return 'Nao foi possivel carregar a autenticacao do Google.';
  }

  if (errorMessage === 'google-access-token-missing') {
    return 'O Google nao retornou um token de acesso valido.';
  }

  return error?.message || 'Nao foi possivel entrar com Google.';
};
