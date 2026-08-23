const assert = require('node:assert/strict');
const test = require('node:test');

const {
  RECOVERY_MODAL_SUBTITLE,
  RECOVERY_SUCCESS_MESSAGE,
  getRecoveryModalSubtitle,
  getRecoverySuccessMessage,
} = require('../../../react/pages/sign-in/recoveryMessages');

test('returns the recovery success copy when no translator is available', () => {
  assert.equal(getRecoverySuccessMessage(), RECOVERY_SUCCESS_MESSAGE);
});

test('returns the recovery modal subtitle when no translator is available', () => {
  assert.equal(getRecoveryModalSubtitle(), RECOVERY_MODAL_SUBTITLE);
});

test('lets the translator override the success copy', () => {
  const translator = (...args) => {
    assert.deepEqual(args, ['auth', 'label', RECOVERY_SUCCESS_MESSAGE]);
    return 'Mensagem traduzida';
  };

  assert.equal(getRecoverySuccessMessage(translator), 'Mensagem traduzida');
});

test('falls back when the translator returns an empty value', () => {
  assert.equal(getRecoveryModalSubtitle(() => '   '), RECOVERY_MODAL_SUBTITLE);
});

test('copy states temporary recovery link (not immediate password)', () => {
  assert.match(RECOVERY_SUCCESS_MESSAGE, /link temporário de recuperação/i);
  assert.match(RECOVERY_MODAL_SUBTITLE, /link temporário de recuperação/i);
  assert.doesNotMatch(RECOVERY_SUCCESS_MESSAGE, /senha temporária/i);
  assert.doesNotMatch(RECOVERY_MODAL_SUBTITLE, /senha temporária/i);
});
