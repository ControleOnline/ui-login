import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Image,
  ImageBackground,
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
import {buildAssetUrl} from '@controleonline/../../src/styles/branding';
import {colors} from '@controleonline/../../src/styles/colors';
import signInStyles from '../sign-in/index.styles';

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
  const peopleGetters = peopleStore.getters;
  const {defaultCompany, currentCompany} = peopleGetters;

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

  const fallbackLogo = require('../../../../../../../src/assets/logo.png');
  const logoUrl = buildAssetUrl(brandCompany?.logo);
  const backgroundUrl = buildAssetUrl(
    brandCompany?.theme?.background || brandCompany?.background,
  );

  useEffect(() => {
    setLogoLoadError(false);
  }, [logoUrl]);

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
    <SafeAreaView
      style={[
        signInStyles.container,
        backgroundUrl ? signInStyles.containerTransparent : null,
      ]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.background} />

      <View style={signInStyles.content}>
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
              Confirmação de cadastro
            </Animatable.Text>

            <Animatable.Text
              animation="fadeIn"
              delay={450}
              style={signInStyles.subtitle}>
              {feedback}
            </Animatable.Text>
          </View>

          <Animatable.View animation="fadeInUp" delay={550} style={styles.panel}>
            {status === 'pending' ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : null}

            <Text style={styles.helperText}>
              {status === 'success'
                ? 'Sua conta foi ativada. Você já pode entrar normalmente.'
                : status === 'error'
                  ? 'Revise o link recebido por e-mail ou solicite um novo cadastro.'
                  : 'Aguarde enquanto validamos o seu link de confirmação.'}
            </Text>

            <TouchableOpacity style={signInStyles.button} onPress={goToSignIn}>
              <Text style={signInStyles.buttonText}>Ir para o login</Text>
            </TouchableOpacity>
          </Animatable.View>
        </View>
      </View>
    </SafeAreaView>
  );

  if (backgroundUrl) {
    return (
      <ImageBackground
        source={{uri: backgroundUrl}}
        style={signInStyles.background}
        imageStyle={signInStyles.backgroundImage}>
        <View style={signInStyles.overlay} />
        {content}
      </ImageBackground>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
  },
  panel: {
    gap: 18,
  },
  helperText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
