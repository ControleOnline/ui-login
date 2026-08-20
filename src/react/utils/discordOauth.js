/*
 * Discord OAuth helpers for web sign-in.
 */
import {Platform} from 'react-native';

const DISCORD_OAUTH_AUTHORIZE_URL = 'https://discord.com/api/oauth2/authorize';
const DISCORD_OAUTH_SCOPE = 'identify email';
const DISCORD_OAUTH_POPUP_NAME = 'discord-oauth-popup';
export const DISCORD_OAUTH_MESSAGE_TYPE = 'controleonline-discord-oauth';

export const getDiscordRedirectUri = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  // Static callback path on the same origin; hash fragment carries the token.
  return `${window.location.origin}/oauth/discord/callback`;
};

export const parseDiscordHashParams = hash => {
  const normalizedHash = String(hash || '').replace(/^#/, '');
  if (!normalizedHash) {
    return {};
  }
  return Object.fromEntries(new URLSearchParams(normalizedHash).entries());
};

export const requestDiscordAccessToken = clientId => {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return Promise.reject(new Error('discord-oauth-web-only'));
  }

  const redirectUri = getDiscordRedirectUri();
  if (!redirectUri) {
    return Promise.reject(new Error('discord-redirect-uri-missing'));
  }

  const authUrl = new URL(DISCORD_OAUTH_AUTHORIZE_URL);
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('response_type', 'token');
  authUrl.searchParams.set('scope', DISCORD_OAUTH_SCOPE);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('prompt', 'none');

  return new Promise((resolve, reject) => {
    const width = 520;
    const height = 700;
    const left = window.screenX + Math.max(0, (window.outerWidth - width) / 2);
    const top = window.screenY + Math.max(0, (window.outerHeight - height) / 2);
    const features = `width=${width},height=${height},left=${left},top=${top},menubar=no,toolbar=no,status=no,resizable=yes,scrollbars=yes`;

    const popup = window.open(authUrl.toString(), DISCORD_OAUTH_POPUP_NAME, features);
    if (!popup) {
      reject(new Error('discord-popup-blocked'));
      return;
    }

    let settled = false;
    const settle = (fn, value) => {
      if (settled) {
        return;
      }
      settled = true;
      window.removeEventListener('message', onMessage);
      clearInterval(pollTimer);
      clearTimeout(timeoutTimer);
      try {
        popup.close();
      } catch {}
      fn(value);
    };

    const onMessage = event => {
      if (event.origin !== window.location.origin) {
        return;
      }
      const payload = event.data;
      if (!payload || payload.type !== DISCORD_OAUTH_MESSAGE_TYPE) {
        return;
      }
      if (payload.error) {
        settle(reject, new Error(payload.error));
        return;
      }
      if (!payload.access_token) {
        settle(reject, new Error('discord-access-token-missing'));
        return;
      }
      settle(resolve, payload.access_token);
    };

    window.addEventListener('message', onMessage);

    // Fallback: poll popup location hash when same-origin redirect lands.
    const pollTimer = setInterval(() => {
      try {
        if (popup.closed) {
          settle(reject, new Error('popup_closed'));
          return;
        }
        const popupUrl = popup.location.href;
        if (!popupUrl || popupUrl === 'about:blank') {
          return;
        }
        if (!popupUrl.startsWith(window.location.origin)) {
          return;
        }
        const hashParams = parseDiscordHashParams(popup.location.hash);
        if (hashParams.access_token) {
          settle(resolve, hashParams.access_token);
          return;
        }
        if (hashParams.error) {
          settle(
            reject,
            new Error(hashParams.error_description || hashParams.error),
          );
        }
      } catch {
        // Cross-origin while still on discord.com — ignore until redirect.
      }
    }, 400);

    const timeoutTimer = setTimeout(() => {
      settle(reject, new Error('discord-oauth-timeout'));
    }, 120000);
  });
};

export const resolveDiscordOauthErrorMessage = error => {
  const errorMessage = String(error?.message || '')
    .trim()
    .toLowerCase();

  if (errorMessage === 'popup_closed') {
    return 'A janela do Discord foi fechada antes da autenticacao.';
  }
  if (errorMessage === 'discord-popup-blocked') {
    return 'O navegador bloqueou a janela de autenticacao do Discord.';
  }
  if (errorMessage === 'discord-oauth-web-only') {
    return 'Login com Discord disponivel apenas na versao web.';
  }
  if (errorMessage === 'discord-access-token-missing') {
    return 'O Discord nao retornou um token de acesso valido.';
  }
  if (errorMessage === 'discord-oauth-timeout') {
    return 'Tempo esgotado ao autenticar com Discord.';
  }
  return error?.message || 'Nao foi possivel entrar com Discord.';
};

const OAUTH_DISCORD_CLIENT_ID_CONFIG_KEY = 'OAUTH_DISCORD_CLIENT_ID';

export const resolveCompanyDiscordOauthClientId = company => {
  const configs = company?.configs;
  if (!configs || typeof configs !== 'object' || Array.isArray(configs)) {
    return '';
  }
  const raw = configs[OAUTH_DISCORD_CLIENT_ID_CONFIG_KEY];
  if (raw === null || raw === undefined) {
    return '';
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed) {
      return '';
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (typeof parsed === 'string') {
        return parsed.trim();
      }
    } catch {}
    return trimmed;
  }
  return String(raw).trim();
};
