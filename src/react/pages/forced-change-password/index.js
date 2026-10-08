import React, {useMemo, useState} from 'react';
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
import {createStyles, resolveSignInTheme} from '../sign-in/index.styles';

/**
 * Forced password change after temporary-password login (app-community#68).
 * User must set a new password within 15 minutes; then is logged out to SignIn.
 */
export default function ForcedChangePasswordPage({navigation}) {
  const {showSuccess, showError} = useMessage();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const authStore = useStore('auth');
  const themeStore = useStore('theme');
  const actions = authStore.actions;
  const {user} = authStore.getters || {};
  const themeGetters = themeStore?.getters || {};
  const {colors: themeColors} = themeGetters;
  const theme = useMemo(() => resolveSignInTheme(themeColors), [themeColors]);
  const styles = useMemo(() => createStyles(theme), [theme]);
  const pageStyles = useMemo(() => createPageStyles(theme), [theme]);

  const deadlineLabel = useMemo(() => {
    const raw = user?.password_change_deadline;
    if (!raw) {
      return null;
    }
    try {
      const d = new Date(raw);
      if (Number.isNaN(d.getTime())) {
        return null;
      }
      return d.toLocaleString('pt-BR');
    } catch {
      return null;
    }
  }, [user?.password_change_deadline]);

  const validateForm = () => {
    const next = {};
    if (!password.trim()) {
      next.password = 'Informe a nova senha.';
    } else if (password.trim().length < 6) {
      next.password = 'A senha precisa ter pelo menos 6 caracteres.';
    }
    if (!confirmPassword.trim()) {
      next.confirmPassword = 'Confirme a nova senha.';
    } else if (confirmPassword !== password) {
      next.confirmPassword = 'As senhas informadas não coincidem.';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const logoutToSignIn = async () => {
    try {
      await actions?.logOut?.();
    } catch {
      // ignore logout errors; still land on SignIn
    }
    navigation.reset({
      index: 0,
      routes: [{name: 'SignInPage'}],
    });
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    const userId = user?.user_id || user?.id;
    if (!userId) {
      showError('Sessão inválida. Faça login novamente com a senha temporária.');
      await logoutToSignIn();
      return;
    }

    setIsSubmitting(true);
    setErrors({});
    try {
      await api.fetch(`/users/${userId}/change-password`, {
        method: 'POST',
        body: {password: password.trim()},
      });
      showSuccess(
        'Senha alterada com sucesso. Faça login com a nova senha.',
        {duration: 4000},
      );
      await logoutToSignIn();
    } catch (error) {
      const message =
        error?.message ||
        error?.error ||
        'Não foi possível alterar a senha. Tente novamente.';
      if (/tempor[aá]ria expirada|TEMPORARY_PASSWORD_EXPIRED/i.test(String(message))) {
        showError(
          'Senha temporária expirada. Solicite uma nova recuperação de senha.',
        );
        await logoutToSignIn();
        return;
      }
      showError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        style={{flex: 1}}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Animatable.View animation="fadeInUp" duration={400} style={styles.form}>
          <Text style={styles.title}>Troca obrigatória de senha</Text>
          <Text style={pageStyles.description}>
            Você entrou com uma senha temporária. Defina uma nova senha agora
            {deadlineLabel ? ` (válida até ${deadlineLabel})` : ' (prazo de 15 minutos)'}.
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Nova senha"
              placeholderTextColor={theme.inputPlaceholderText}
              style={[styles.input, errors.password && styles.inputError]}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Icon
                name={showPassword ? 'eye' : 'eye-off'}
                size={20}
                color={theme.inputIcon}
              />
            </TouchableOpacity>
          </View>
          {errors.password ? (
            <Text style={styles.errorText}>{errors.password}</Text>
          ) : null}

          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Confirmar nova senha"
              placeholderTextColor={theme.inputPlaceholderText}
              style={[styles.input, errors.confirmPassword && styles.inputError]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              <Icon
                name={showConfirmPassword ? 'eye' : 'eye-off'}
                size={20}
                color={theme.inputIcon}
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword ? (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          ) : null}

          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleSubmit}
            disabled={isSubmitting}>
            {isSubmitting ? (
              <ActivityIndicator color={theme.buttonText} />
            ) : (
              <Text style={styles.loginButtonText}>Salvar nova senha</Text>
            )}
          </TouchableOpacity>
        </Animatable.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createPageStyles = theme =>
  StyleSheet.create({
    description: {
      color: theme.secondaryText || theme.inputPlaceholderText || '#64748b',
      fontSize: 14,
      lineHeight: 20,
      marginBottom: 16,
    },
  });
