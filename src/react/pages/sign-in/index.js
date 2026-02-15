import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
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
import Icon from 'react-native-vector-icons/MaterialIcons';
import { env } from '@env';

import { useStore } from '@store';

export default function SignIn({ navigation }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const authStore = useStore('auth');
  const actions = authStore.actions;
  const peopleStore = useStore('people');
  const peopleGetters = peopleStore.getters;
  const { defaultCompany } = peopleGetters;

  const APP_TYPE = (env?.APP_TYPE || '').toLowerCase();
  const LOGO =
    {
      checkout: require('../../../../../../../src/assets/checkout/logo 512x512 r.png'),
      crm: require('../../../../../../../src/assets/crm/logo 512x512 r.png'),
      delivery: require('../../../../../../../src/assets/delivery/logo 512x512 r.png'),
      manager: require('../../../../../../../src/assets/manager/logo 512x512 r.png'),
      menu: require('../../../../../../../src/assets/menu/logo 512x512 r.png'),
      pos: require('../../../../../../../src/assets/pos/logo 512x512 r.png'),
      ppc: require('../../../../../../../src/assets/ppc/logo 512x512 r.png'),
    }[APP_TYPE];

  const backgroundUrl = defaultCompany?.theme?.background
    ? `https://${defaultCompany.theme.background.domain}${defaultCompany.theme.background.url}`
    : null;

  const themeColors = defaultCompany?.theme?.colors || {};
  const primaryColor = themeColors.primary || '#1B5587';
  useFocusEffect(
    useCallback(() => {
      if (actions.isLogged()) {
        navigation.navigate('HomePage');
      }
    }, [actions, navigation]),
  );

  const validateForm = () => {
    const newErrors = {};

    if (!username.trim()) {
      newErrors.username = 'Usuário é obrigatório';
    }

    if (!password.trim()) {
      newErrors.password = 'Senha é obrigatória';
    } else if (password.length < 6) {
      newErrors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      await actions.signIn({
        username: username,
        password: password,
      });
      navigation.navigate('HomePage');
    } catch (error) {
      console.log(error.message);
      Alert.alert(
        'Erro no Login',
        error.message || 'Credenciais inválidas. Tente novamente.',
        [{ text: 'OK' }],
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderConteudo = () => (
    <View style={styles.overlay}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}>
          <View style={styles.backgroundDecoration} />
          <View style={styles.backgroundDecoration2} />

          <Animatable.View
            animation="bounceIn"
            delay={300}
            style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Image source={LOGO} style={styles.logoImage} resizeMode="contain" />
            </View>
          </Animatable.View>
          <Animatable.View
            animation="fadeInUp"
            delay={700}
            style={styles.loginCard}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Usuário</Text>
              <TextInput
                placeholderTextColor="#999"
                style={[
                  styles.textInput,
                  errors.username && styles.textInputError,
                ]}
                placeholder="Digite seu usuário ou email"
                value={username}
                onChangeText={text => {
                  setUsername(text);
                  if (errors.username) {
                    setErrors(prev => ({ ...prev, username: null }));
                  }
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
              {errors.username && (
                <Animatable.Text animation="shake" style={styles.errorText}>
                  {errors.username}
                </Animatable.Text>
              )}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Senha</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  placeholderTextColor="#999"
                  style={[
                    styles.textInput,
                    styles.passwordInput,
                    errors.password && styles.textInputError,
                  ]}
                  placeholder="Digite sua senha"
                  value={password}
                  secureTextEntry={!showPassword}
                  onChangeText={text => {
                    setPassword(text);
                    if (errors.password) {
                      setErrors(prev => ({ ...prev, password: null }));
                    }
                  }}
                  returnKeyType="done"
                  onSubmitEditing={handleSignIn}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}>
                  <Icon
                    name={showPassword ? 'visibility' : 'visibility-off'}
                    size={20}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
              {errors.password && (
                <Animatable.Text animation="shake" style={styles.errorText}>
                  {errors.password}
                </Animatable.Text>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.loginButton,
                { backgroundColor: primaryColor },
                isLoading && styles.loginButtonDisabled,
              ]}
              onPress={handleSignIn}
              disabled={isLoading}>
              <View style={styles.loginButtonContent}>
                {isLoading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Text style={styles.loginButtonText}>Entrar</Text>
                    <Icon name="arrow-forward" size={20} color="#FFFFFF" />
                  </>
                )}
              </View>
            </TouchableOpacity>
          </Animatable.View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={primaryColor} />
      {backgroundUrl ? (
        <ImageBackground
          source={backgroundUrl ? { uri: backgroundUrl } : null}
          style={[styles.container, { backgroundColor: primaryColor }]}
          resizeMode="cover">
          {renderConteudo()}
        </ImageBackground>
      ) : (
        <View style={[styles.container, { backgroundColor: primaryColor }]}>
          {renderConteudo()}
        </View>
      )}
    </>
  );
}

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Overlay semi-transparente para melhor legibilidade
  },
  backgroundDecoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  backgroundDecoration2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  safeArea: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  logoContainer: {
    alignItems: 'center',
    marginTop: height * 0.08,
    marginBottom: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoImage: {
    width: 100,
    height: 100,
  },

  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },

  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 30,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 15,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#111827',
    fontWeight: '400',
  },
  textInputError: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },

  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 14,
    padding: 4,
  },

  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },

  loginButton: {
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 16,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  loginButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  loginButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },

  forgotPasswordButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  forgotPasswordText: {
    color: '#1B5587',
    fontSize: 15,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },

  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 20,
  },
  footerText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
});
