import React, {useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
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
import {buildAssetUrl} from '@controleonline/../../src/styles/branding';
import {colors} from '@controleonline/../../src/styles/colors';
import signInStyles from '../sign-in/index.styles';

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
  const peopleGetters = peopleStore.getters;
  const {defaultCompany, currentCompany} = peopleGetters;

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

  const fallbackLogo = require('../../../../../../../src/assets/logo.png');
  const logoUrl = buildAssetUrl(brandCompany?.logo);
  const backgroundUrl = buildAssetUrl(
    brandCompany?.theme?.background || brandCompany?.background,
  );

  useEffect(() => {
    setLogoLoadError(false);
  }, [logoUrl]);

  const validateForm = () => {
    const nextErrors = {};

    if (!recoveryHash || !recoveryLost) {
      nextErrors.recovery =
        'O link de recuperacao esta incompleto ou expirou.';
    }

    if (!password.trim()) {
      nextErrors.password = 'Informe a nova senha.';
    } else if (password.trim().length < 6) {
      nextErrors.password = 'A senha precisa ter pelo menos 6 caracteres.';
    }

    if (!confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Confirme a nova senha.';
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = 'As senhas informadas nao coincidem.';
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

      showSuccess('Senha redefinida com sucesso. Voce ja pode entrar novamente.');
      setTimeout(goToSignIn, 1200);
    } catch (error) {
      showError(
        error?.message || 'Nao foi possivel redefinir a senha agora.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <SafeAreaView
      style={[
        signInStyles.container,
        backgroundUrl ? signInStyles.containerTransparent : null,
      ]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={signInStyles.content}>
        <View style={signInStyles.centerBlock}>
          <View style={signInStyles.header}>
            <Animatable.View
              animation="fadeInDown"
              delay={200}
              style={signInStyles.logoContainer}>
              <Image
                source={logoUrl && !logoLoadError ? {uri: logoUrl} : fallbackLogo}
                style={signInStyles.logo}
                resizeMode="contain"
                onError={() => setLogoLoadError(true)}
              />
            </Animatable.View>

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
              Use o link temporario enviado por e-mail para concluir a recuperacao.
            </Animatable.Text>
          </View>

          <Animatable.View animation="fadeInUp" delay={550} style={signInStyles.form}>
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
                color={colors.textSecondary}
                style={signInStyles.inputIcon}
              />
              <TextInput
                placeholder="Nova senha"
                placeholderTextColor="#94A3B8"
                style={signInStyles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(prev => !prev)}>
                <Icon
                  name={showPassword ? 'eye' : 'eye-off'}
                  size={20}
                  color={colors.textSecondary}
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
                color={colors.textSecondary}
                style={signInStyles.inputIcon}
              />
              <TextInput
                placeholder="Confirmar nova senha"
                placeholderTextColor="#94A3B8"
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
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
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
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={signInStyles.loginButtonText}>Salvar nova senha</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={signInStyles.forgotPasswordButton}
              onPress={goToSignIn}>
              <Text style={signInStyles.forgotPasswordText}>Voltar para o login</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  if (backgroundUrl) {
    return (
      <ImageBackground
        source={{uri: backgroundUrl}}
        style={signInStyles.container}
        resizeMode="cover">
        <View style={signInStyles.backgroundOverlay}>{content}</View>
      </ImageBackground>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 10,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
});
