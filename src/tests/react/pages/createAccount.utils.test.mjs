const assert = (cond, msg) => {
  if (!cond) throw new Error(msg || 'assertion failed');
};

global.tt = (...args) => args[args.length - 1];

const {
  buildCreateAccountErrorFeedback,
  isDuplicateAccountError,
  isEmailDuplicateError,
  resolveApiErrorMessage,
} = await import('../../../react/pages/create-account/utils.js');

// ---- isDuplicateAccountError ----
assert(isDuplicateAccountError('This account already exists') === true);
assert(isDuplicateAccountError('This user already exists') === true);
assert(isDuplicateAccountError('Usuario ja cadastrado') === true);
assert(isDuplicateAccountError('Usuário já cadastrado') === true);
assert(isDuplicateAccountError('CNPJ ja cadastrado.') === true);
assert(isDuplicateAccountError('Erro ao criar conta') === false);

// ---- isEmailDuplicateError ----
assert(isEmailDuplicateError('This account already exists') === true);
assert(isEmailDuplicateError('E-mail ja cadastrado.') === true);
assert(isEmailDuplicateError('CNPJ ja cadastrado.') === false);
assert(isEmailDuplicateError('Telefone ja cadastrado.') === false);
assert(
  isEmailDuplicateError('CNPJ ja cadastrado.\nE-mail ja cadastrado.') === true,
);

// ---- resolveApiErrorMessage: hydra / plain ----
assert(
  resolveApiErrorMessage({'hydra:description': 'Conta duplicada'}) ===
    'Conta duplicada',
);
assert(resolveApiErrorMessage({message: 'Falha generica'}) === 'Falha generica');
assert(resolveApiErrorMessage({error: 'Erro vindo da api'}) === 'Erro vindo da api');
assert(resolveApiErrorMessage({}) === 'Erro ao criar conta');
assert(resolveApiErrorMessage(null) === 'Erro ao criar conta');
assert(resolveApiErrorMessage('  texto direto  ') === 'texto direto');

// ---- resolveApiErrorMessage: ConstraintViolationList duplicates ----
const multi = resolveApiErrorMessage({
  violations: [
    {
      propertyPath: 'company.document',
      message: 'This value is already used.',
    },
    {
      propertyPath: 'people.email',
      message: 'This account already exists.',
    },
    {
      propertyPath: 'phone.phone',
      message: 'Already registered.',
    },
  ],
});
assert(
  multi ===
    'CNPJ ja cadastrado.\nE-mail ja cadastrado.\nTelefone ja cadastrado.',
  `unexpected multi: ${multi}`,
);

const cnpjOnly = resolveApiErrorMessage({
  body: {
    violations: [
      {propertyPath: 'company.document', message: 'This value is already used.'},
    ],
  },
});
assert(cnpjOnly === 'CNPJ ja cadastrado.', `unexpected cnpjOnly: ${cnpjOnly}`);

const phoneOnly = resolveApiErrorMessage({
  response: {
    data: {
      violations: [
        {propertyPath: 'people.phone', message: 'Already registered.'},
      ],
    },
  },
});
assert(
  phoneOnly === 'Telefone ja cadastrado.',
  `unexpected phoneOnly: ${phoneOnly}`,
);

// ---- buildCreateAccountErrorFeedback ----
const feedback = buildCreateAccountErrorFeedback({
  message: 'This account already exists',
  email: 'User@Example.COM',
});
assert(feedback.type === 'duplicate-account');
assert(feedback.params.openForgotPassword === true);
assert(feedback.params.recoveryLogin === 'user@example.com');
assert(typeof feedback.title === 'string' && feedback.title.length > 0);
assert(typeof feedback.message === 'string' && feedback.message.length > 0);

const cnpjFeedback = buildCreateAccountErrorFeedback({
  message: 'CNPJ ja cadastrado.',
  email: 'a@b.com',
});
assert(cnpjFeedback.type === 'error', 'CNPJ duplicate must not open recovery dialog');
assert(cnpjFeedback.message === 'CNPJ ja cadastrado.');

const generic = buildCreateAccountErrorFeedback({
  message: 'Falha inesperada',
  email: 'a@b.com',
});
assert(generic.type === 'error');
assert(generic.message === 'Falha inesperada');

console.log('createAccount.utils.test.mjs: all assertions passed');

const {resolveCreateAccountCatchFeedback} = await import(
  '../../../react/pages/create-account/utils.js'
);

const catchCnpj = resolveCreateAccountCatchFeedback(
  {
    body: {
      violations: [
        {propertyPath: 'company.document', message: 'This value is already used.'},
      ],
    },
    message: 'This value is already used.',
  },
  {email: 'a@b.com', mapPasswordErrorMessage: m => m},
);
assert(catchCnpj.type === 'error');
assert(catchCnpj.message === 'CNPJ ja cadastrado.');

const catchEmail = resolveCreateAccountCatchFeedback(
  {
    body: {
      violations: [
        {propertyPath: 'people.email', message: 'This account already exists.'},
      ],
    },
  },
  {email: 'User@X.COM', mapPasswordErrorMessage: m => m},
);
assert(catchEmail.type === 'duplicate-account');
assert(catchEmail.params.recoveryLogin === 'user@x.com');

console.log('createAccount.utils.test.mjs: catch helper assertions passed');
