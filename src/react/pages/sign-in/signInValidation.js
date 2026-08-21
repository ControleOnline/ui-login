export function validateSignInForm(username, password) {
  const newErrors = {};
  if (!username.trim())
    newErrors.username =
      global.t?.t('auth', 'label', 'Email é obrigatório') ||
      'Email é obrigatório';
  if (!password.trim())
    newErrors.password =
      global.t?.t('auth', 'label', 'Senha é obrigatória') ||
      'Senha é obrigatória';
  return newErrors;
}
