/* Auth / Sign-in entry. */

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

import DefaultFile from '@controleonline/ui-default/src/react/components/files/DefaultFile';

import {createStyles, resolveSignInTheme} from './index.styles';
import SignInForgotPasswordModal from './SignInForgotPasswordModal';
const {getRecoverySuccessMessage} = require('./recoveryMessages');
import {validateSignInForm} from './signInValidation';
import {
  normalizeRedirectParams,
  getSignInPostLoginRoute,
} from '../../utils/redirectParams';
import {
  loadGoogleOauthApi,
  requestGoogleAccessToken,
  getGoogleSignInErrorMessage,
} from '../../utils/googleOauth';
import {
  requestDiscordAccessToken,
  resolveDiscordOauthErrorMessage,
  resolveCompanyDiscordOauthClientId,
} from '../../utils/discordOauth';

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
    const newErrors = validateSignInForm(username, password);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await actions.signIn({username, password});
      const postLoginRoute =
        getSignInPostLoginRoute(navigation, route) || 'HomePage';
      navigation.reset({
        index: 0,
        routes: [
          {
            name: postLoginRoute,
            ...(redirectParams ? {params: redirectParams} : {}),
          },
        ],
      });
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
      showError('Login com Google não configurado para esta empresa.');
      return;
    }

    setIsGoogleLoading(true);
    setErrors({});

    try {
      const accessToken = await requestGoogleAccessToken(googleClientId);
      await actions.gSignIn({access_token: accessToken});

      const postLoginRoute =
        getSignInPostLoginRoute(navigation, route) || 'HomePage';
      navigation.reset({
        index: 0,
        routes: [
          {
            name: postLoginRoute,
            ...(redirectParams ? {params: redirectParams} : {}),
          },
        ],
      });
    } catch (error) {
      showError(resolveGoogleOauthErrorMessage(error));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleDiscordSignIn = async () => {
    if (!discordClientId) {
      showError('Login com Discord não configurado para esta empresa.');
      return;
    }

    setIsDiscordLoading(true);
    setErrors({});

    try {
      const accessToken = await requestDiscordAccessToken(discordClientId);
      await actions.dSignIn({access_token: accessToken});

      const postLoginRoute =
        getSignInPostLoginRoute(navigation, route) || 'HomePage';
      navigation.reset({
        index: 0,
        routes: [
          {
            name: postLoginRoute,
            ...(redirectParams ? {params: redirectParams} : {}),
          },
        ],
      });
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

      showSuccess(getRecoverySuccessMessage(global.t?.t), {
        duration: 4000,
      });
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

            <SignInForgotPasswordModal
              visible={forgotPasswordVisible}
              onClose={closeForgotPasswordModal}
              recoveryLogin={recoveryLogin}
              setRecoveryLogin={setRecoveryLogin}
              onSubmit={handleRecoverPassword}
              isRecovering={isRecovering}
              styles={styles}
              theme={theme}
            />
          </Animatable.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  return content;
}
