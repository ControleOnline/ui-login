/*
 * Contract imported from AGENTS.md
 * ## Escopo
 * - Modulo de autenticacao e entrada do usuario.
 * - Cobre login, criacao de conta, validacao de sessao e fluxo inicial de acesso.
 *
 * ## Estado
 * - Este modulo tem implementacao ativa em `src/react` e deve constar em novos prompts.
 *
 * ## Quando usar
 * - Prompts sobre login, autenticacao, sessao, create account e guardas de acesso.
 */

﻿import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Text, TextInput, TouchableOpacity, View, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useStore } from '@store';
import { api } from '@controleonline/ui-common/src/api';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';
import {buildAssetUrl} from '@controleonline/../../src/styles/branding';
import {resolveCompanyGoogleOauthClientId} from '@controleonline/ui-common/src/utils/oauth';

import {createStyles, resolveSignInTheme} from './index.styles';

const getPostLoginRoute = (navigation, route) => {
  const redirectRoute = route?.params?.redirectRoute;
  if (redirectRoute && redirectRoute !== 'SignInPage') {
    return redirectRoute;
  }

  const routeNames = navigation?.getState?.()?.routeNames || [];
  if (routeNames.includes('HomePage')) return 'HomePage';
  if (routeNames.includes('CrmIndex')) return 'CrmIndex';
  if (routeNames.includes('OrderHistoryPage')) return 'OrderHistoryPage';
  return routeNames.find(name => name !== 'SignInPage') || null;
};

const normalizeRedirectParams = redirectParams => {
  if (!redirectParams) {
    return undefined;
  }

  if (typeof redirectParams === 'string') {
    try {
      const parsedParams = JSON.parse(redirectParams);

      return parsedParams && typeof parsedParams === 'object'
        ? parsedParams
        : undefined;
    } catch {
      return undefined;
    }
  }

  return typeof redirectParams === 'object' ? redirectParams : undefined;
};

const GOOGLE_OAUTH_SCRIPT_ID = 'google-oauth-client-script';
const GOOGLE_OAUTH_SCOPE = 'openid email profile';

let googleOauthScriptPromise = null;

const getGoogleOauthApi = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.google?.accounts?.oauth2 || null;
};

const loadGoogleOauthApi = () => {
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

const requestGoogleAccessToken = async clientId => {
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
      error_callback: oauthError => {
        reject(
          new Error(
            oauthError?.message ||
              oauthError?.type ||
              'google-oauth-request-failed',
          ),
        );
      },
    });

    tokenClient.requestAccessToken({prompt: 'select_account'});
  });
};

const resolveGoogleOauthErrorMessage = error => {
  const errorMessage = String(error?.message || '').trim().toLowerCase();

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

export default function SignIn({ navigation }) {
  const route = useRoute();
  const {showSuccess, showError} = useMessage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isRecovering, setIsRecovering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [logoLoadError, setLogoLoadError] = useState(false);
  const [forgotPasswordVisible, setForgotPasswordVisible] = useState(false);
  const [recoveryLogin, setRecoveryLogin] = useState('');
  const authStore = useStore('auth');
  const themeStore = useStore('theme');
  const actions = authStore.actions;
  const redirectParams = useMemo(
    () => normalizeRedirectParams(route?.params?.redirectParams),
    [route?.params?.redirectParams],
  );
  const peopleStore = useStore('people');
  const peopleGetters = peopleStore.getters;
  const themeGetters = themeStore?.getters || {};
  const {defaultCompany, currentCompany} = peopleGetters;
  const {colors: themeColors} = themeGetters;
  const theme = useMemo(() => resolveSignInTheme(themeColors), [themeColors]);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const brandCompany = useMemo(() => {
    if (defaultCompany?.id) {
      return defaultCompany;
    }
    if (currentCompany?.id) {
      return currentCompany;
    }
    return {};
  }, [currentCompany, defaultCompany]);

  const googleClientId = useMemo(
    () =>
      resolveCompanyGoogleOauthClientId(defaultCompany) ||
      resolveCompanyGoogleOauthClientId(currentCompany),
    [currentCompany, defaultCompany],
  );
  const canUseGoogleLogin = Platform.OS === 'web' && !!googleClientId;

  const logoUrl = buildAssetUrl(brandCompany?.logo);

  useEffect(() => {
    setLogoLoadError(false);
  }, [logoUrl]);

  useEffect(() => {
    if (!canUseGoogleLogin) {
      return;
    }

    loadGoogleOauthApi().catch(() => {});
  }, [canUseGoogleLogin, googleClientId]);

  useFocusEffect(
    useCallback(() => {
      if (actions.isLogged()) {
        const postLoginRoute = getPostLoginRoute(navigation, route);
        if (postLoginRoute) {
          navigation.reset({
            index: 0,
            routes: [
              {
                name: postLoginRoute,
                params: redirectParams,
              },
            ],
          });
        }
      }
    }, [actions, navigation, route]),
  );

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = global.t?.t('auth', 'label', 'Email é obrigatório') || 'Email é obrigatório';
    if (!password.trim()) newErrors.password = global.t?.t('auth', 'label', 'Senha é obrigatória') || 'Senha é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await actions.signIn({ username, password });
      const postLoginRoute = getPostLoginRoute(navigation, route);
      if (postLoginRoute) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: postLoginRoute,
              params: redirectParams,
            },
          ],
        });
      }
    } catch (error) {
      showError(error.message || global.t?.t('auth', 'label', 'Credenciais inválidas. Tente novamente.') || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!googleClientId) {
      showError('Login com Google nao configurado para esta empresa.');
      return;
    }

    setIsGoogleLoading(true);
    setErrors({});

    try {
      const accessToken = await requestGoogleAccessToken(googleClientId);
      await actions.gSignIn({access_token: accessToken});

      const postLoginRoute = getPostLoginRoute(navigation, route);
      if (postLoginRoute) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: postLoginRoute,
              params: redirectParams,
            },
          ],
        });
      }
    } catch (error) {
      showError(resolveGoogleOauthErrorMessage(error));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleRecoverPassword = async () => {
    const login = recoveryLogin.trim().toLowerCase();

    if (!login) {
      showError('Informe seu login para recuperar a senha.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login)) {
      showError('Informe um e-mail válido para receber o link.');
      return;
    }

    setIsRecovering(true);
    try {
      await api.fetch('/password_recoveries', {
        method: 'POST',
        body: {
          username: login,
          email: login,
        },
      });

      showSuccess('Se o login existir, o link de recuperação será enviado para o e-mail informado.', {
        duration: 4000,
      });
      setRecoveryLogin('');
      setForgotPasswordVisible(false);
    } catch (error) {
      showError(error?.message || 'Não foi possível enviar o link de recuperação.');
    } finally {
      setIsRecovering(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setForgotPasswordVisible(false);
  };

  const content = (
    <SafeAreaView
      style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}>
        <View style={styles.centerBlock}>
          <View style={styles.header}>
            {logoUrl && !logoLoadError ? (
              <Animatable.View animation="fadeInDown" delay={200} style={styles.logoContainer}>
                <Image
                  source={{uri: logoUrl}}
                  style={styles.logo}
                  resizeMode="contain"
                  onError={() => setLogoLoadError(true)}
                />
              </Animatable.View>
            ) : null}

            <Animatable.Text animation="fadeIn" delay={400} style={styles.subtitle}>
              {global.t?.t('auth', 'label', 'Entre com suas credenciais para acessar') || 'Entre com suas credenciais para acessar'}
            </Animatable.Text>
          </View>

          <Animatable.View animation="fadeInUp" delay={600} style={styles.form}>
            <View style={[styles.inputContainer, errors.username && styles.inputError]}>
              <Icon name="mail" size={20} color={theme.inputIcon} style={styles.inputIcon} />
              <TextInput
                placeholder={global.t?.t('auth', 'label', 'Email') || 'Email'}
                placeholderTextColor={theme.inputPlaceholderText}
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={[styles.inputContainer, errors.password && styles.inputError]}>
              <Icon name="lock" size={20} color={theme.inputIcon} style={styles.inputIcon} />
              <TextInput
                placeholder={global.t?.t('auth', 'label', 'Senha') || 'Senha'}
                placeholderTextColor={theme.inputPlaceholderText}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={theme.inputIcon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSignIn}
              disabled={isLoading || isGoogleLoading}>
              {isLoading ? (
                <ActivityIndicator color={theme.buttonText} />
              ) : (
                <Text style={styles.loginButtonText}>
                  {global.t?.t('auth', 'label', 'Entrar') || 'Entrar'}
                </Text>
              )}
            </TouchableOpacity>

            {canUseGoogleLogin && (
              <>
                <View style={styles.oauthDivider}>
                  <View style={styles.oauthDividerLine} />
                  <Text style={styles.oauthDividerText}>
                    {global.t?.t('login', 'message', 'or') || 'ou'}
                  </Text>
                  <View style={styles.oauthDividerLine} />
                </View>

                <TouchableOpacity
                  style={[
                    styles.googleButton,
                    (isLoading || isGoogleLoading) && styles.googleButtonDisabled,
                  ]}
                  onPress={handleGoogleSignIn}
                  disabled={isLoading || isGoogleLoading}>
                  {isGoogleLoading ? (
                    <ActivityIndicator color={theme.buttonTextSecondary} />
                  ) : (
                    <>
                      <View style={styles.googleButtonBadge}>
                        <Text style={styles.googleButtonBadgeText}>G</Text>
                      </View>
                      <Text style={styles.googleButtonText}>
                        {global.t?.t('login', 'message', 'with_google') ||
                          'Entrar com Google'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={() =>
                navigation.navigate('CreateAccount', {
                  redirectRoute: route?.params?.redirectRoute,
                  redirectParams,
                })
              }>
              <Text style={styles.createAccountText}>
                {global.t?.t('auth', 'label', 'createAccount') || 'Criar conta'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => setForgotPasswordVisible(true)}>
              <Text style={styles.forgotPasswordText}>
                {global.t?.t('auth', 'label', 'forgotPassword') || 'Esqueci minha senha'}
              </Text>
            </TouchableOpacity>

            <Modal
              visible={forgotPasswordVisible}
              transparent
              animationType="fade"
              onRequestClose={closeForgotPasswordModal}>
              <View style={styles.modalOverlay}>
                <View style={styles.recoveryModalContent}>
                  <View style={styles.recoveryModalHeader}>
                    <Text style={styles.recoveryModalTitle}>
                      {global.t?.t('auth', 'label', 'recoverPassword') || 'Recuperar senha'}
                    </Text>

                    <TouchableOpacity
                      style={styles.recoveryModalCloseButton}
                      onPress={closeForgotPasswordModal}
                      accessibilityRole="button"
                      accessibilityLabel="Fechar recuperar senha">
                      <Icon name="x" size={22} color={theme.modalCloseIcon} />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    placeholder={global.t?.t('auth', 'label', 'E-mail') || 'E-mail'}
                    placeholderTextColor={theme.inputPlaceholderText}
                    style={styles.recoveryInput}
                    value={recoveryLogin}
                    onChangeText={setRecoveryLogin}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="email-address"
                  />

                  <TouchableOpacity
                    style={styles.loginButton}
                    onPress={handleRecoverPassword}
                    disabled={isRecovering}>
                    {isRecovering ? (
                      <ActivityIndicator color={theme.buttonText} />
                    ) : (
                      <Text style={styles.loginButtonText}>
                        {global.t?.t('auth', 'label', 'recoverPassword') || 'Recuperar senha'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </Modal>

          </Animatable.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  return content;
}
// TODO(store-first): quando este arquivo for mexido, mover a leitura para stores, remover api.fetch e evitar repassar dados em objetos quando o store ja resolver isso.
