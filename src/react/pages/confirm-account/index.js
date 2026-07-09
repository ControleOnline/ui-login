import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import * as Animatable from 'react-native-animatable';
import {useStore} from '@store';
import {api} from '@controleonline/ui-common/src/api';
import {useMessage} from '@controleonline/ui-common/src/react/components/MessageService';
import DefaultFile from '@controleonline/ui-default/src/react/components/files/DefaultFile';
import {createStyles, resolveSignInTheme} from '../sign-in/index.styles';

const getRouteParam = value => {
  if (Array.isArray(value)) {
    return String(value[0] || '').trim();
  }

  return String(value || '').trim();
};

export default function ConfirmAccountPage({navigation, route}) {
  const {showError, showSuccess} = useMessage();
  const [status, setStatus] = useState('pending');
  const [feedback, setFeedback] = useState(
    'Estamos confirmando o seu cadastro.',
  );
  const [logoLoadError, setLogoLoadError] = useState(false);
  const submittedRef = useRef(false);
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

  const verificationHash = useMemo(
    () => getRouteParam(route?.params?.hash),
    [route?.params?.hash],
  );
  const verificationToken = useMemo(
    () => getRouteParam(route?.params?.token),
    [route?.params?.token],
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

  useEffect(() => {
    if (submittedRef.current) {
      return;
    }

    submittedRef.current = true;

    if (!verificationHash || !verificationToken) {
      const message = 'O link de confirmação está incompleto ou inválido.';
      setStatus('error');
      setFeedback(message);
      showError(message);
      return;
    }

    let cancelled = false;

    const confirmAccount = async () => {
      try {
        const response = await api.fetch('/account_verifications', {
          method: 'POST',
          body: {
            hash: verificationHash,
            token: verificationToken,
          },
        });

        const message =
          response?.message ||
          'Cadastro confirmado com sucesso. Você já pode entrar.';

        if (cancelled) {
          return;
        }

        setStatus('success');
        setFeedback(message);
        showSuccess(message);
      } catch (error) {
        const message =
          error?.message || 'Não foi possível confirmar o cadastro agora.';

        if (cancelled) {
          return;
        }

        setStatus('error');
        setFeedback(message);
        showError(message);
      }
    };

    confirmAccount();

    return () => {
      cancelled = true;
    };
  }, [showError, showSuccess, verificationHash, verificationToken]);

  const goToSignIn = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'SignInPage'}],
    });
  };

  const content = (
    <SafeAreaView style={signInStyles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={signInTheme.background}
      />

      <View style={signInStyles.content}>
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
              Confirmação de cadastro
            </Animatable.Text>

            <Animatable.Text
              animation="fadeIn"
              delay={450}
              style={signInStyles.subtitle}>
              {feedback}
            </Animatable.Text>
          </View>

          <Animatable.View
            animation="fadeInUp"
            delay={550}
            style={styles.panel}>
            {status === 'pending' ? (
              <ActivityIndicator
                size="large"
                color={signInTheme.loadingSpinner}
              />
            ) : null}

            <Text style={styles.helperText}>
              {status === 'success'
                ? 'Sua conta foi ativada. Você já pode entrar normalmente.'
                : status === 'error'
                  ? 'Revise o link recebido por e-mail ou solicite um novo cadastro.'
                  : 'Aguarde enquanto validamos o seu link de confirmação.'}
            </Text>

            <TouchableOpacity
              style={signInStyles.loginButton}
              onPress={goToSignIn}>
              <Text style={signInStyles.loginButtonText}>Ir para o login</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </View>
    </SafeAreaView>
  );

  return content;
}

const createPageStyles = theme =>
  StyleSheet.create({
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: theme.headerText,
      textAlign: 'center',
    },
    panel: {
      gap: 18,
    },
    helperText: {
      fontSize: 15,
      lineHeight: 22,
      color: theme.textSecondary,
      textAlign: 'center',
    },
  });
