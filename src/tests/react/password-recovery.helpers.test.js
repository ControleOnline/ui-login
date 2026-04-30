const test = require('node:test')
const assert = require('node:assert/strict')

const {
  RECOVERY_LINK_DURATION_MINUTES,
  buildRecoveryRequestSuccessMessage,
  normalizeRecoveryLogin,
  validateRecoveryRequestLogin,
  validateResetPasswordPayload,
} = require('../../react/pages/password-recovery/helpers')

test('normalizes the recovery login before sending the request', () => {
  assert.equal(
    normalizeRecoveryLogin('  USER@Example.COM  '),
    'user@example.com',
  )
})

test('rejects blank and invalid recovery e-mails', () => {
  assert.equal(
    validateRecoveryRequestLogin(''),
    'Informe seu login para recuperar a senha.',
  )
  assert.equal(
    validateRecoveryRequestLogin('not-an-email'),
    'Informe um e-mail valido para receber o link.',
  )
  assert.equal(validateRecoveryRequestLogin('user@example.com'), '')
})

test('mentions the 15-minute window in the recovery success message', () => {
  assert.equal(
    buildRecoveryRequestSuccessMessage(),
    `Se o login existir, o link de recuperacao sera enviado para o e-mail informado. O acesso expira em ${RECOVERY_LINK_DURATION_MINUTES} minutos.`,
  )
})

test('validates the reset-password payload with link and password rules', () => {
  assert.deepEqual(
    validateResetPasswordPayload({
      hash: '',
      lost: '',
      password: '123',
      confirmPassword: '456',
    }),
    {
      recovery: 'O link de recuperacao esta incompleto ou expirou.',
      password: 'A senha precisa ter pelo menos 6 caracteres.',
      confirmPassword: 'As senhas informadas nao coincidem.',
    },
  )

  assert.deepEqual(
    validateResetPasswordPayload({
      hash: 'hash',
      lost: 'lost',
      password: '123456',
      confirmPassword: '123456',
    }),
    {},
  )
})
