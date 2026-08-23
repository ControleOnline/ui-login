/**
 * Canonical recovery-copy for the public password recovery flow.
 * Backend sends a temporary recovery link by email (not an activated password).
 */

const RECOVERY_SUCCESS_MESSAGE =
  'Se o login existir, enviaremos um link temporário de recuperação para o e-mail informado.';

const RECOVERY_MODAL_SUBTITLE =
  'Informe o e-mail do login para receber um link temporário de recuperação.';

const resolveTranslation = value => {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim();
};

const getRecoverySuccessMessage = translator =>
  resolveTranslation(
    translator?.('auth', 'label', RECOVERY_SUCCESS_MESSAGE),
  ) || RECOVERY_SUCCESS_MESSAGE;

const getRecoveryModalSubtitle = translator =>
  resolveTranslation(
    translator?.('auth', 'label', RECOVERY_MODAL_SUBTITLE),
  ) || RECOVERY_MODAL_SUBTITLE;

module.exports = {
  RECOVERY_MODAL_SUBTITLE,
  RECOVERY_SUCCESS_MESSAGE,
  getRecoveryModalSubtitle,
  getRecoverySuccessMessage,
};
