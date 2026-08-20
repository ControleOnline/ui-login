import React, {useState} from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import {api} from '@controleonline/ui-common/src/api';

export default function SignInForgotPasswordModal({
  visible,
  onClose,
  styles,
  theme,
  showSuccess,
  showError,
}) {
  const [recoveryLogin, setRecoveryLogin] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);

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
      onClose();
    } catch (error) {
      showError(
        error?.message || 'Não foi possível enviar o link de recuperação.',
      );
    } finally {
      setIsRecovering(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.recoveryModalContent}>
          <View style={styles.recoveryModalHeader}>
            <Text style={styles.recoveryModalTitle}>
              {global.t?.t('auth', 'label', 'recoverPassword') ||
                'Recuperar senha'}
            </Text>

            <TouchableOpacity
              style={styles.recoveryModalCloseButton}
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel="Fechar recuperar senha">
              <Icon name="x" size={22} color={theme.modalCloseIcon} />
            </TouchableOpacity>
          </View>

          <Text style={styles.recoveryModalDescription}>
            {global.t?.t('auth', 'message', 'recoverPasswordDescription') ||
              'Informe seu e-mail para receber o link de recuperação de senha.'}
          </Text>

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
                {global.t?.t('auth', 'label', 'recoverPassword') ||
                  'Recuperar senha'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
