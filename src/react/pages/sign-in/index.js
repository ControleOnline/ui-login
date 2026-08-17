/*
 * Auth / Sign-in entry module. See AGENTS.md for full contract.
 */

import React, {useState, useCallback, useEffect, useMemo} from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import {useFocusEffect, useRoute} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import {useStore} from '@store';
import {api} from '@controleonline/ui-common/src/api';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';
import {resolveFileImageUrl} from '@controleonline/ui-common/src/react/utils/fileUrl';
import {resolveCompanyGoogleOauthClientId} from '@controleonline/ui-common/src/utils/oauth';

const OAUTH_DISCORD_CLIENT_ID_CONFIG_KEY = 'OAUTH_DISCORD_CLIENT_ID';

const resolveCompanyDiscordOauthClientId = company => {
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
import DefaultFile from '@controleonline/ui-default/src/react/components/files/DefaultFile';

import {createStyles, resolveSignInTheme} from './index.styles';
import {
  normalizeRedirectParams,
  getSignInPostLoginRoute,
} from '../../utils/redirectParams';
import {
  loadGoogleOauthApi,
  requestGoogleAccessToken,
  getGoogleSignInErrorMessage,
} from '../../utils/googleOauth';

const DISCORD_OAUTH_AUTHORIZE_URL = 'https://discord.com/api/oauth2/authorize';
const DISCORD_OAUTH_SCOPE = 'identify email';
const DISCORD_OAUTH_POPUP_NAME = 'discord-oauth-popup';
const DISCORD_OAUTH_MESSAGE_TYPE = 'controleonline-discord-oauth';

const getDiscordRedirectUri = () => {
  if (typeof window === 'undefined') {
    return '';
  }
  // Static callback path on the same origin; hash fragment carries the token.
  return `${window.location.origin}/oauth/discord/callback`;
};

const parseDiscordHashParams = hash => {
  const normalizedHash = String(hash || '').replace(/^#/, '');
  if (!normalizedHash) {
    return {};
  }
  return Object.fromEntries(new URLSearchParams(normalizedHash).entries());
};

const requestDiscordAccessToken = clientId => {
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

const resolveDiscordOauthErrorMessage = error => {
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


export default function SignIn({navigation}) {
  const route = useRoute();
  const {showSuccess, showError} = useMessage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);
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
  const peopleActions = peopleStore.actions;
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
  const discordClientId = useMemo(
    () =>
      resolveCompanyDiscordOauthClientId(defaultCompany) ||
      resolveCompanyDiscordOauthClientId(currentCompany),
    [currentCompany, defaultCompany],
  );
  const canUseGoogleLogin = Platform.OS === 'web' && !!googleClientId;
  const canUseDiscordLogin = Platform.OS === 'web' && !!discordClientId;
  const canUseOauthLogin = canUseGoogleLogin || canUseDiscordLogin;
  const iconFile = brandCompany?.icon || null;
  const logoFile = brandCompany?.logo || null;
  const backgroundFile = brandCompany?.theme?.background || null;

  useEffect(() => {
    setLogoLoadError(false);
  }, [logoFile]);

  useEffect(() => {
    console.log('sign-in branding urls', {
      icon: resolveFileImageUrl(iconFile, {company: brandCompany}),
      logo: resolveFileImageUrl(logoFile, {company: brandCompany}),
      background: resolveFileImageUrl(backgroundFile, {company: brandCompany}),
    });
  }, [backgroundFile, brandCompany, iconFile, logoFile]);

  useFocusEffect(
    useCallback(() => {
      peopleActions.defaultCompany().catch(() => {});
    }, [peopleActions]),
  );

  useEffect(() => {
    if (!canUseGoogleLogin) {
      return;
    }

    loadGoogleOauthApi().catch(() => {});
  }, [canUseGoogleLogin, googleClientId]);

  useFocusEffect(
    useCallback(() => {
      if (actions.isLogged()) {
        const postLoginRoute = getSignInPostLoginRoute(navigation, route);
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
    }, [actions, navigation, route, redirectParams]),
  );

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim())
      newErrors.username =
        global.t?.t('auth', 'label', 'Email é obrigatório') ||
        'Email é obrigatório';
    if (!password.trim())
      newErrors.password =
        global.t?.t('auth', 'label', 'Senha é obrigatória') ||
        'Senha é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await actions.signIn({username, password});
      const postLoginRoute = getSignInPostLoginRoute(navigation, route);
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
      showError(
        error.message ||
          global.t?.t(
            'auth',
            'label',
            'Credenciais inválidas. Tente novamente.',
          ) ||
          'Credenciais inválidas. Tente novamente.',
      );
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

      const postLoginRoute = getSignInPostLoginRoute(navigation, route);
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

  const handleDiscordSignIn = async () => {
    if (!discordClientId) {
      showError('Login com Discord nao configurado para esta empresa.');
      return;
    }

    setIsDiscordLoading(true);
    setErrors({});

    try {
      const accessToken = await requestDiscordAccessToken(discordClientId);
      await actions.dSignIn({access_token: accessToken});

      const postLoginRoute = getPostLoginRoute(navigation, route);
      goToPostLoginRoute(navigation, postLoginRoute, redirectParams);
    } catch (error) {
      showError(resolveDiscordOauthErrorMessage(error));
    } finally {
      setIsDiscordLoading(false);
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

      showSuccess(
        'Se o login existir, o link de recuperação será enviado para o e-mail informado.',
        {
          duration: 4000,
        },
      );
      setRecoveryLogin('');
      setForgotPasswordVisible(false);
    } catch (error) {
      showError(
        error?.message || 'Não foi possível enviar o link de recuperação.',
      );
    } finally {
      setIsRecovering(false);
    }
  };

  const closeForgotPasswordModal = () => {
    setForgotPasswordVisible(false);
  };

  const content = (
    <SafeAreaView style={styles.container}>
      {backgroundFile ? (
        <DefaultFile
          file={backgroundFile}
          company={brandCompany}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      ) : null}
      <View style={styles.backgroundOverlay} pointerEvents="none" />
      <StatusBar
        barStyle="dark-content"
        backgroundColor={theme.pageBackground}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}>
        <View style={styles.centerBlock}>
          <View style={styles.header}>
            {logoFile && !logoLoadError ? (
              <Animatable.View
                animation="fadeInDown"
                delay={200}
                style={styles.logoContainer}>
                <DefaultFile
                  file={logoFile}
                  company={brandCompany}
                  style={styles.logo}
                  resizeMode="contain"
                  onError={() => setLogoLoadError(true)}
                />
              </Animatable.View>
            ) : null}

            <Animatable.Text
              animation="fadeIn"
              delay={400}
              style={styles.subtitle}>
              {global.t?.t(
                'auth',
                'label',
                'Entre com suas credenciais para acessar',
              ) || 'Entre com suas credenciais para acessar'}
            </Animatable.Text>
          </View>

          <Animatable.View animation="fadeInUp" delay={600} style={styles.form}>
            <View
              style={[
                styles.inputContainer,
                errors.username && styles.inputError,
              ]}>
              <Icon
                name="mail"
                size={20}
                color={theme.inputIcon}
                style={styles.inputIcon}
              />
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

            <View
              style={[
                styles.inputContainer,
                errors.password && styles.inputError,
              ]}>
              <Icon
                name="lock"
                size={20}
                color={theme.inputIcon}
                style={styles.inputIcon}
              />
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
              disabled={isLoading || isGoogleLoading || isDiscordLoading}>
              {isLoading ? (
                <ActivityIndicator color={theme.buttonText} />
              ) : (
                <Text style={styles.loginButtonText}>
                  {global.t?.t('auth', 'label', 'Entrar') || 'Entrar'}
                </Text>
              )}
            </TouchableOpacity>

            {canUseOauthLogin && (
              <>
                <View style={styles.oauthDivider}>
                  <View style={styles.oauthDividerLine} />
                  <Text style={styles.oauthDividerText}>
                    {global.t?.t('login', 'message', 'or') || 'ou'}
                  </Text>
                  <View style={styles.oauthDividerLine} />
                </View>

                {canUseGoogleLogin && (
                  <TouchableOpacity
                    style={[
                      styles.googleButton,
                      (isLoading || isGoogleLoading || isDiscordLoading) &&
                        styles.googleButtonDisabled,
                    ]}
                    onPress={handleGoogleSignIn}
                    disabled={isLoading || isGoogleLoading || isDiscordLoading}>
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
                )}

                {canUseDiscordLogin && (
                  <TouchableOpacity
                    style={[
                      styles.googleButton,
                      canUseGoogleLogin && styles.oauthButtonSpacing,
                      (isLoading || isGoogleLoading || isDiscordLoading) &&
                        styles.googleButtonDisabled,
                    ]}
                    onPress={handleDiscordSignIn}
                    disabled={isLoading || isGoogleLoading || isDiscordLoading}>
                    {isDiscordLoading ? (
                      <ActivityIndicator color={theme.buttonTextSecondary} />
                    ) : (
                      <>
                        <View style={styles.googleButtonBadge}>
                          <Text style={styles.googleButtonBadgeText}>D</Text>
                        </View>
                        <Text style={styles.googleButtonText}>
                          {global.t?.t('login', 'message', 'with_discord') ||
                            'Entrar com Discord'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}
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
                {global.t?.t('auth', 'label', 'forgotPassword') ||
                  'Esqueci minha senha'}
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
                      {global.t?.t('auth', 'label', 'recoverPassword') ||
                        'Recuperar senha'}
                    </Text>

                    <TouchableOpacity
                      style={styles.recoveryModalCloseButton}
                      onPress={closeForgotPasswordModal}
                      accessibilityRole="button"
                      accessibilityLabel="Fechar recuperar senha">
                      <Icon name="x" size={22} color={theme.modalCloseIcon} />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.recoveryModalDescription}>
                    {global.t?.t(
                      'auth',
                      'message',
                      'recoverPasswordDescription',
                    ) ||
                      'Informe seu e-mail para receber o link de recuperação de senha.'}
                  </Text>

                  <TextInput
                    placeholder={
                      global.t?.t('auth', 'label', 'E-mail') || 'E-mail'
                    }
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
                        {global.t?.t('auth', 'label', 'recoverPassword') ||
                          'Recuperar senha'}
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
