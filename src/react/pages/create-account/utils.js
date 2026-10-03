export const tt = (...args) =>
  global?.tt?.(...args) ??
  global?.t?.tt?.(...args) ??
  global?.t?.t?.(...args) ??
  '';

const FALLBACK_MESSAGE = 'Erro ao criar conta';

const DUPLICATE_FIELD_LABELS = [
  {patterns: ['company.document', 'company_document', 'cnpj'], label: 'CNPJ'},
  {patterns: ['people.email', 'email'], label: 'E-mail'},
  {
    patterns: ['people.phone', 'phone.ddd', 'phone.phone', 'phone', 'telefone'],
    label: 'Telefone',
  },
  {patterns: ['people.user', 'user', 'username'], label: 'Usuario'},
  {patterns: ['people.document', 'cpf', 'document'], label: 'CPF'},
];

const normalizeText = value => String(value || '').trim();

const toMessageList = value => {
  if (!value) return [];
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) {
    return value.flatMap(item => toMessageList(item));
  }

  const directMessage =
    value.message ||
    value.description ||
    value.error ||
    value.title ||
    value.detail ||
    value['hydra:description'] ||
    value['hydra:title'];

  const nested = toMessageList(directMessage);
  if (nested.length > 0) {
    return nested;
  }

  return [];
};

const resolveDuplicateFieldLabel = propertyPath => {
  const normalizedPath = normalizeText(propertyPath).toLowerCase();
  if (!normalizedPath) return null;

  const match = DUPLICATE_FIELD_LABELS.find(({patterns}) =>
    patterns.some(pattern => normalizedPath.includes(pattern)),
  );

  return match?.label || null;
};

const isDuplicateMessage = message =>
  /(already exists|already used|already registered|ja cadastrad|já cadastrad|duplicate|unique)/i.test(
    normalizeText(message),
  );

const formatViolation = violation => {
  if (!violation) return '';

  if (typeof violation === 'string') {
    return normalizeText(violation);
  }

  const propertyPath = normalizeText(violation.propertyPath);
  const message = normalizeText(
    violation.message ||
      violation.description ||
      violation.error ||
      violation.title ||
      violation.detail ||
      violation['hydra:description'],
  );

  if (!message) {
    return '';
  }

  if (isDuplicateMessage(message)) {
    const duplicateField = resolveDuplicateFieldLabel(propertyPath);
    if (duplicateField) {
      return `${duplicateField} ja cadastrado.`;
    }
  }

  const fieldLabel = resolveDuplicateFieldLabel(propertyPath);
  if (fieldLabel && !message.toLowerCase().startsWith(fieldLabel.toLowerCase())) {
    return `${fieldLabel}: ${message}`;
  }

  return message;
};

const deduplicateMessages = messages =>
  [...new Set(messages.map(normalizeText).filter(Boolean))];

/**
 * Resolve human-readable error message from create-account API payloads
 * (ConstraintViolationList, hydra errors, plain message objects, Error instances).
 */
export const resolveApiErrorMessage = payload => {
  if (payload === undefined || payload === null) {
    return tt('auth', 'label', FALLBACK_MESSAGE);
  }

  if (typeof payload === 'string') {
    const text = payload.trim();
    return text || tt('auth', 'label', FALLBACK_MESSAGE);
  }

  // Prefer structured violations (API Platform ConstraintViolationList)
  const violations = Array.isArray(payload?.violations)
    ? payload.violations.map(formatViolation)
    : [];

  const directMessages = toMessageList(payload).map(normalizeText);

  // Also walk nested body / response.data shapes commonly thrown by fetch layer
  if (payload?.body && typeof payload.body === 'object') {
    if (Array.isArray(payload.body.violations)) {
      violations.push(...payload.body.violations.map(formatViolation));
    }
    directMessages.push(...toMessageList(payload.body).map(normalizeText));
  }

  if (payload?.response?.data && typeof payload.response.data === 'object') {
    if (Array.isArray(payload.response.data.violations)) {
      violations.push(...payload.response.data.violations.map(formatViolation));
    }
    directMessages.push(
      ...toMessageList(payload.response.data).map(normalizeText),
    );
  }

  const messages = deduplicateMessages([...violations, ...directMessages]).filter(
    message => message !== FALLBACK_MESSAGE,
  );

  if (messages.length === 0) {
    return tt('auth', 'label', FALLBACK_MESSAGE);
  }

  return messages.join('\n');
};

export const isDuplicateAccountError = message =>
  /this account already exists|this user already exists|already exists|ja cadastrad|já cadastrad|usuario já|usuário já|e-mail ja cadastrado|email ja cadastrado/i.test(
    String(message || ''),
  );

/**
 * True when the resolved message is specifically about e-mail (not CNPJ/phone/CPF).
 * Used to decide whether to offer password recovery dialog.
 */
export const isEmailDuplicateError = message => {
  const text = String(message || '');
  if (!isDuplicateAccountError(text)) {
    return false;
  }
  // Field-specific non-email duplicates should not open recovery dialog
  if (/(CNPJ|Telefone|CPF|Usuario)\s+ja cadastrado/i.test(text)) {
    // If message ALSO mentions e-mail, still treat as multi-field; recovery still useful
    if (/E-mail\s+ja cadastrado/i.test(text) || /email/i.test(text)) {
      return true;
    }
    return false;
  }
  return true;
};

export const buildCreateAccountErrorFeedback = ({message, email}) => {
  if (isEmailDuplicateError(message)) {
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
    message: message || tt('auth', 'label', FALLBACK_MESSAGE),
  };
};

/**
 * Resolve create-account catch feedback from thrown API/fetch errors.
 * Prefers structured body (violations) so CNPJ/e-mail/telefone get friendly labels.
 */
export const resolveCreateAccountCatchFeedback = (
  error,
  {email, mapPasswordErrorMessage: mapPwd} = {},
) => {
  const mapFn = typeof mapPwd === 'function' ? mapPwd : msg => msg;
  const structured =
    resolveApiErrorMessage(error?.body || error?.response?.data || error || {}) ||
    resolveApiErrorMessage(error?.message || '');
  const rawMessage =
    mapFn(structured) || mapFn(error?.message || '') || structured;
  return buildCreateAccountErrorFeedback({
    message: rawMessage,
    email,
  });
};
