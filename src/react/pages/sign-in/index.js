import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  Image,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import { useStore } from '@store';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';
import {buildAssetUrl} from '@controleonline/../../src/styles/branding';

import { colors } from '@controleonline/../../src/styles/colors';

const { height } = Dimensions.get('window');

const getPostLoginRoute = navigation => {
  const routeNames = navigation?.getState?.()?.routeNames || [];
  if (routeNames.includes('HomePage')) return 'HomePage';
  if (routeNames.includes('CrmIndex')) return 'CrmIndex';
  if (routeNames.includes('SalesOrdersIndex')) return 'SalesOrdersIndex';
  return routeNames.find(name => name !== 'SignInPage') || null;
};

export default function SignIn({ navigation }) {
  const {showError} = useMessage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [logoLoadError, setLogoLoadError] = useState(false);
  const authStore = useStore('auth');
  const actions = authStore.actions;
  const peopleStore = useStore('people');
  const peopleGetters = peopleStore.getters;
  const {defaultCompany, currentCompany} = peopleGetters;

  const brandCompany = useMemo(() => {
    if (defaultCompany?.id) {
      return defaultCompany;
    }
    if (currentCompany?.id) {
      return currentCompany;
    }
    return {};
  }, [defaultCompany?.id, currentCompany?.id]);

  const fallbackLogo = require('../../../../../../../src/assets/logo.png');
  const logoUrl = buildAssetUrl(brandCompany?.logo);
  const backgroundUrl = buildAssetUrl(
    brandCompany?.theme?.background || brandCompany?.background,
  );

  useEffect(() => {
    setLogoLoadError(false);
  }, [logoUrl]);

  useFocusEffect(
    useCallback(() => {
      if (actions.isLogged()) {
        const postLoginRoute = getPostLoginRoute(navigation);
        if (postLoginRoute) {
          navigation.reset({
            index: 0,
            routes: [{name: postLoginRoute}],
          });
        }
      }
    }, [actions, navigation]),
  );

  const validateForm = () => {
    const newErrors = {};
    if (!username.trim()) newErrors.username = global.t?.t('loginPage', 'label', 'Email é obrigatório') || 'Email é obrigatório';
    if (!password.trim()) newErrors.password = global.t?.t('loginPage', 'label', 'Senha é obrigatória') || 'Senha é obrigatória';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) return;
    setIsLoading(true);
    setErrors({});
    try {
      await actions.signIn({ username, password });
      const postLoginRoute = getPostLoginRoute(navigation);
      if (postLoginRoute) {
        navigation.reset({
          index: 0,
          routes: [{name: postLoginRoute}],
        });
      }
    } catch (error) {
      showError(error.message || global.t?.t('loginPage', 'label', 'Credenciais inválidas. Tente novamente.') || 'Credenciais inválidas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const content = (
    <SafeAreaView
      style={[styles.container, backgroundUrl ? styles.containerTransparent : null]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}>
        <View style={styles.centerBlock}>
          <View style={styles.header}>
            <Animatable.View animation="fadeInDown" delay={200} style={styles.logoContainer}>
              <Image
                source={
                  logoUrl && !logoLoadError
                    ? {uri: logoUrl}
                    : fallbackLogo
                }
                style={styles.logo}
                resizeMode="contain"
                onError={() => setLogoLoadError(true)}
              />
            </Animatable.View>

            <Animatable.Text animation="fadeIn" delay={400} style={styles.subtitle}>
              {global.t?.t('loginPage', 'label', 'Entre com suas credenciais para acessar') || 'Entre com suas credenciais para acessar'}
            </Animatable.Text>
          </View>

          <Animatable.View animation="fadeInUp" delay={600} style={styles.form}>
            <View style={[styles.inputContainer, errors.username && styles.inputError]}>
              <Icon name="mail" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                placeholder={global.t?.t('loginPage', 'label', 'Email') || 'Email'}
                placeholderTextColor="#94A3B8"
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={[styles.inputContainer, errors.password && styles.inputError]}>
              <Icon name="lock" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                placeholder={global.t?.t('loginPage', 'label', 'Senha') || 'Senha'}
                placeholderTextColor="#94A3B8"
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                <Icon name={showPassword ? 'eye' : 'eye-off'} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={handleSignIn}
              disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.loginButtonText}>
                  {global.t?.t('loginPage', 'label', 'Entrar') || 'Entrar'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.createAccountButton}
              onPress={() => navigation.navigate('CreateAccount')}>
              <Text style={styles.createAccountText}>
                {global.t?.t('loginPage', 'label', 'Criar conta') || 'Criar conta'}
              </Text>
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
        style={styles.container}
        resizeMode="cover">
        <View style={styles.backgroundOverlay}>{content}</View>
      </ImageBackground>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  centerBlock: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    alignSelf: 'center',
    maxWidth: 420,
    paddingBottom: height * 0.02,
  },
  backgroundOverlay: {
    flex: 1,
    backgroundColor: 'rgba(248, 250, 252, 0.45)',
  },
  containerTransparent: {
    backgroundColor: 'transparent',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
    flexDirection: 'row',
  },
  logo: {
    width: 300,
    height: 100,
    marginRight: 10,
  },
  subtitle: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 10px rgba(99, 102, 241, 0.3)',
      },
    }),
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  createAccountButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  createAccountText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
});