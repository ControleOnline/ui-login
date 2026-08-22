export const tt = (...args) =>
  global?.tt?.(...args) ??
  global?.t?.tt?.(...args) ??
  global?.t?.t?.(...args) ??
  '';

export const resolveApiErrorMessage = payload =>
  payload?.['hydra:description'] ||
  payload?.message ||
  payload?.error ||
  payload?.['hydra:title'] ||
  tt('auth', 'label', 'Erro ao criar conta');

export const isDuplicateAccountError = message =>
  /this account already exists|this user already exists|already exists|ja cadastrad|já cadastrad|usuario já|usuário já/i.test(
    String(message || ''),
  );

export const buildCreateAccountErrorFeedback = ({message, email}) => {
  if (isDuplicateAccountError(message)) {
    return {
      type: 'duplicate-account',
      title: tt('auth', 'label', 'Não foi possível concluir o cadastro'),
      message: tt(
        'auth',
        'message',
        'Este e-mail já está cadastrado. Utilize a recuperação de senha para acessar sua conta.',
      ),
      params: {
        openForgotPassword: true,
        recoveryLogin: String(email || '').trim().toLowerCase(),
      },
    };
  }

  return {
    type: 'error',
    message: message || tt('auth', 'label', 'Erro ao criar conta'),
  };
};
