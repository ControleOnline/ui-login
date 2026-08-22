import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/Feather';
import {useStore} from '@store';
import {api} from '@controleonline/ui-common/src/api';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';
import DefaultFile from '@controleonline/ui-default/src/react/components/files/DefaultFile';
import {createStyles, resolveSignInTheme} from '../sign-in/index.styles';
import {
  PASSWORD_HELP_LINES,
  PASSWORD_MIN_LENGTH,
  PASSWORD_MSG_MIN_LENGTH,
  mapPasswordErrorMessage,
  validatePasswordClient,
} from '@controleonline/ui-common/src/react/utils/passwordPolicy';

const getRouteParam = value => {
  if (Array.isArray(value)) {
    return String(value[0] || '').trim();
  }

  return String(value || '').trim();
};

export default function ResetPasswordPage({navigation, route}) {
  const {showError, showSuccess} = useMessage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [logoLoadError, setLogoLoadError] = useState(false);
  const peopleStore = useStore('people');
  const themeStore = useStore('theme');
  const peopleGetters = peopleStore.getters;
  const themeGetters = themeStore?.getters || {};
  const {defaultCompany, currentCompany} = peopleGetters;
  const {colors: themeColors} = themeGetters;
  const signInTheme = useMemo(
    () => resolveSignInTheme(themeColors),
    [themeColors],
  );
  const signInStyles = useMemo(() => createStyles(signInTheme), [signInTheme]);
  const styles = useMemo(() => createPageStyles(signInTheme), [signInTheme]);

  const recoveryHash = useMemo(
    () => getRouteParam(route?.params?.hash),
    [route?.params?.hash],
  );
  const recoveryLost = useMemo(
    () => getRouteParam(route?.params?.lost),
    [route?.params?.lost],
  );

  const brandCompany = useMemo(() => {
    if (defaultCompany?.id) {
      return defaultCompany;
    }

    if (currentCompany?.id) {
      return currentCompany;
    }

    return {};
  }, [currentCompany, defaultCompany]);

  useEffect(() => {
    setLogoLoadError(false);
  }, [brandCompany?.logo]);

    const validateForm = () => {
    const nextErrors = {};

    if (!recoveryHash || !recoveryLost) {
      nextErrors.recovery = 'O link de recuperação está incompleto ou expirou.';
    }

    const passwordError = validatePasswordClient(password, confirmPassword);
    if (passwordError) {
      if (passwordError.includes('confirmação') || passwordError.includes('iguais')) {
        nextErrors.confirmPassword = passwordError;
      } else {
        nextErrors.password = passwordError;
      }
    } else if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Confirme a nova senha.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const goToSignIn = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'SignInPage'}],
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await api.fetch('/recovery_accesses', {
        method: 'POST',
        body: {
          hash: recoveryHash,
          lost: recoveryLost,
          password,
          confirm: confirmPassword,
        },
      });

      showSuccess(
        'Senha redefinida com sucesso. Você já pode entrar novamente.',
      );
      setTimeout(goToSignIn, 1200);
    } catch (error) {
      showError(
        mapPasswordErrorMessage(
          error?.message || 'Não foi possível redefinir a senha agora.',
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <SafeAreaView style={signInStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={signInTheme.pageBackground}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={signInStyles.content}>
        <View style={signInStyles.centerBlock}>
          <View style={signInStyles.header}>
            {brandCompany?.logo && !logoLoadError ? (
              <Animatable.View
                animation="fadeInDown"
                delay={200}
                style={signInStyles.logoContainer}>
                <DefaultFile
                  file={brandCompany?.logo}
                  company={brandCompany}
                  style={signInStyles.logo}
                  resizeMode="contain"
                  onError={() => setLogoLoadError(true)}
                />
              </Animatable.View>
            ) : null}

            <Animatable.Text
              animation="fadeIn"
              delay={350}
              style={styles.title}>
              Defina sua nova senha
            </Animatable.Text>

            <Animatable.Text
              animation="fadeIn"
              delay={450}
              style={signInStyles.subtitle}>
              Use o link temporario enviado por e-mail para concluir a
              recuperacao.
            </Animatable.Text>
          </View>

          <Animatable.View
            animation="fadeInUp"
            delay={550}
            style={signInStyles.form}>
            {errors.recovery ? (
              <Text style={styles.errorText}>{errors.recovery}</Text>
            ) : null}

            <View
              style={[
                signInStyles.inputContainer,
                errors.password && signInStyles.inputError,
              ]}>
              <Icon
                name="lock"
                size={20}
                color={signInTheme.inputIcon}
                style={signInStyles.inputIcon}
              />
              <TextInput
                placeholder="Nova senha"
                placeholderTextColor={signInTheme.inputPlaceholderText}
                style={signInStyles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                <Icon
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={signInTheme.inputIcon}
                />
              </TouchableOpacity>
            </View>

            <View
              style={[
                signInStyles.inputContainer,
                errors.confirmPassword && signInStyles.inputError,
              ]}>
              <Icon
                name="shield"
                size={20}
                color={signInTheme.inputIcon}
                style={signInStyles.inputIcon}
              />
              <TextInput
                placeholder="Confirmar nova senha"
                placeholderTextColor={signInTheme.inputPlaceholderText}
                style={signInStyles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(prev => !prev)}>
                <Icon
                  name={showConfirmPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={signInTheme.inputIcon}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.helpBox}>
              <Text style={styles.helpTitle}>Requisitos da senha</Text>
              {PASSWORD_HELP_LINES.map(line => (
                <Text key={line} style={styles.helpLine}>
                  • {line}
                </Text>
              ))}
            </View>
            {(errors.password || errors.confirmPassword) && (
              <Text style={styles.errorText}>
                {errors.password || errors.confirmPassword}
              </Text>
            )}

            <TouchableOpacity
              style={signInStyles.loginButton}
              onPress={handleSubmit}
              disabled={isSubmitting || !recoveryHash || !recoveryLost}>
              {isSubmitting ? (
                <ActivityIndicator color={signInTheme.buttonText} />
              ) : (
                <Text style={signInStyles.loginButtonText}>
                  Salvar nova senha
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={signInStyles.forgotPasswordButton}
              onPress={goToSignIn}>
              <Text style={signInStyles.forgotPasswordText}>
                Voltar para o login
              </Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  return content;
}

const createPageStyles = theme =>
  StyleSheet.create({
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: theme.textPrimary,
      textAlign: 'center',
      marginBottom: 10,
    },
    helpBox: {
      marginBottom: 12,
      padding: 12,
      borderRadius: 8,
      backgroundColor: theme.inputBackground || '#F8FAFC',
      borderWidth: 1,
      borderColor: theme.inputBorder || '#E2E8F0',
    },
    helpTitle: {
      fontSize: 13,
      fontWeight: '600',
      color: theme.labelText || '#334155',
      marginBottom: 4,
    },
    helpLine: {
      fontSize: 12,
      color: theme.mutedText || '#64748B',
      lineHeight: 18,
    },
    errorText: {
      color: theme.inputErrorText,
      fontSize: 14,
      marginBottom: 12,
      textAlign: 'center',
    },
  });
// TODO(store-first): quando este arquivo for mexido, mover a leitura para stores, remover api.fetch e evitar repassar dados em objetos quando o store ja resolver isso.
