/*
 * Discord OAuth implicit callback page.
 * Reads access_token from the URL hash and posts it to window.opener.
 */
import React, {useEffect, useState} from 'react';
import {View, Text, ActivityIndicator, Platform, StyleSheet} from 'react-native';

const DISCORD_OAUTH_MESSAGE_TYPE = 'controleonline-discord-oauth';

const parseHashParams = hash => {
  const normalized = String(hash || '').replace(/^#/, '');
  if (!normalized) {
    return {};
  }
  return Object.fromEntries(new URLSearchParams(normalized).entries());
};

export default function OauthDiscordCallback() {
  const [message, setMessage] = useState('Concluindo autenticacao Discord...');

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      setMessage('Callback Discord disponivel apenas na web.');
      return;
    }

    const params = parseHashParams(window.location.hash);
    const payload = {
      type: DISCORD_OAUTH_MESSAGE_TYPE,
    };

    if (params.access_token) {
      payload.access_token = params.access_token;
      setMessage('Autenticacao concluida. Voce pode fechar esta janela.');
    } else {
      payload.error =
        params.error_description || params.error || 'discord-access-token-missing';
      setMessage('Falha na autenticacao Discord.');
    }

    try {
      if (window.opener && !window.opener.closed) {
        window.opener.postMessage(payload, window.location.origin);
      }
    } catch (error) {
      setMessage(
        error?.message || 'Nao foi possivel comunicar com a janela principal.',
      );
    }

    // Clear sensitive hash from the address bar.
    try {
      window.history.replaceState(
        {},
        document.title,
        window.location.pathname + window.location.search,
      );
    } catch {}
  }, []);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0b0d12',
  },
  text: {
    marginTop: 16,
    color: '#e8eaed',
    fontSize: 14,
    textAlign: 'center',
  },
});
