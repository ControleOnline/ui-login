const assert = (cond, msg) => {
  if (!cond) throw new Error(msg || 'assertion failed');
};

global.tt = (...args) => args[args.length - 1];

const {
  buildCreateAccountErrorFeedback,
  isDuplicateAccountError,
  resolveApiErrorMessage,
} = await import('../../../react/pages/create-account/utils.js');

assert(isDuplicateAccountError('This account already exists') === true);
assert(isDuplicateAccountError('This user already exists') === true);
assert(isDuplicateAccountError('Usuario ja cadastrado') === true);
assert(isDuplicateAccountError('Usuário já cadastrado') === true);
assert(isDuplicateAccountError('Erro ao criar conta') === false);

assert(
  resolveApiErrorMessage({'hydra:description': 'Conta duplicada'}) ===
    'Conta duplicada',
);
assert(resolveApiErrorMessage({message: 'Falha generica'}) === 'Falha generica');
assert(resolveApiErrorMessage({error: 'Erro vindo da api'}) === 'Erro vindo da api');
assert(resolveApiErrorMessage({}) === 'Erro ao criar conta');

const feedback = buildCreateAccountErrorFeedback({
  message: 'This account already exists',
  email: 'User@Example.COM',
});
assert(feedback.type === 'duplicate-account');
assert(feedback.params.openForgotPassword === true);
assert(feedback.params.recoveryLogin === 'user@example.com');
assert(typeof feedback.title === 'string' && feedback.title.length > 0);
assert(typeof feedback.message === 'string' && feedback.message.length > 0);

const generic = buildCreateAccountErrorFeedback({
  message: 'Falha inesperada',
  email: 'a@b.com',
});
assert(generic.type === 'error');
assert(generic.message === 'Falha inesperada');

console.log('createAccount.utils.test.mjs: all assertions passed');
