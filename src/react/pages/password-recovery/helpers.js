const RECOVERY_LINK_DURATION_MINUTES = 15

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const normalizeRecoveryLogin = value =>
  String(value || '')
    .trim()
    .toLowerCase()

const validateRecoveryRequestLogin = value => {
  const login = normalizeRecoveryLogin(value)

  if (!login) {
    return 'Informe seu login para recuperar a senha.'
  }

  if (!EMAIL_PATTERN.test(login)) {
    return 'Informe um e-mail valido para receber o link.'
  }

  return ''
}

const buildRecoveryRequestSuccessMessage = () =>
  `Se o login existir, o link de recuperacao sera enviado para o e-mail informado. O acesso expira em ${RECOVERY_LINK_DURATION_MINUTES} minutos.`

const validateResetPasswordPayload = ({
  confirmPassword,
  hash,
  lost,
  password,
}) => {
  const nextErrors = {}

  if (!hash || !lost) {
    nextErrors.recovery = 'O link de recuperacao esta incompleto ou expirou.'
  }

  if (!String(password || '').trim()) {
    nextErrors.password = 'Informe a nova senha.'
  } else if (String(password).trim().length < 6) {
    nextErrors.password = 'A senha precisa ter pelo menos 6 caracteres.'
  }

  if (!String(confirmPassword || '').trim()) {
    nextErrors.confirmPassword = 'Confirme a nova senha.'
  } else if (confirmPassword !== password) {
    nextErrors.confirmPassword = 'As senhas informadas nao coincidem.'
  }

  return nextErrors
}

module.exports = {
  RECOVERY_LINK_DURATION_MINUTES,
  buildRecoveryRequestSuccessMessage,
  normalizeRecoveryLogin,
  validateRecoveryRequestLogin,
  validateResetPasswordPayload,
}
