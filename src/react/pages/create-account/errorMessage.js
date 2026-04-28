const FALLBACK_MESSAGE = 'Erro ao criar conta.';

const DUPLICATE_FIELD_LABELS = [
  {patterns: ['company.document', 'company_document', 'cnpj'], label: 'CNPJ'},
  {patterns: ['people.email', 'email'], label: 'E-mail'},
  {
    patterns: ['people.phone', 'phone.ddd', 'phone.phone', 'phone', 'telefone'],
    label: 'Telefone',
  },
  {patterns: ['people.user', 'user', 'username'], label: 'Usuario'},
  {patterns: ['people.document', 'cpf'], label: 'CPF'},
];

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
    value['hydra:description'] ||
    value['hydra:title'];

  const nestedMessages = [...toMessageList(directMessage)];

  if (nestedMessages.length > 0) {
    return nestedMessages;
  }

  return [];
};

const normalizeText = value => String(value || '').trim();

const resolveDuplicateFieldLabel = propertyPath => {
  const normalizedPath = normalizeText(propertyPath).toLowerCase();

  if (!normalizedPath) return null;

  const match = DUPLICATE_FIELD_LABELS.find(({patterns}) =>
    patterns.some(pattern => normalizedPath.includes(pattern)),
  );

  return match?.label || null;
};

const isDuplicateMessage = message =>
  /(already exists|already used|already registered|ja cadastrad|duplicate|unique)/i.test(
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

export const resolveCreateAccountErrorMessage = payload => {
  if (!payload) return FALLBACK_MESSAGE;

  const violations = Array.isArray(payload?.violations)
    ? payload.violations.map(formatViolation)
    : [];

  const directMessages = toMessageList(payload).map(normalizeText);

  const messages = deduplicateMessages([...violations, ...directMessages]).filter(
    message => message !== FALLBACK_MESSAGE,
  );

  if (messages.length === 0) {
    return FALLBACK_MESSAGE;
  }

  return messages.join('\n');
};
