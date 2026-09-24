import React from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

/**
 * Forgot-password modal for SignIn. Keeps recovery UI out of the main page file.
 */
export default function SignInForgotPasswordModal({
  visible,
  onClose,
  recoveryLogin,
  setRecoveryLogin,
  onSubmit,
  isRecovering,
  styles,
  theme,
}) {
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
            onPress={onSubmit}
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
