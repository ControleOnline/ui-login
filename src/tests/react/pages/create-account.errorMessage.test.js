const assert = require('node:assert/strict');
const test = require('node:test');

const {
  resolveCreateAccountErrorMessage,
} = require('../../../react/pages/create-account/errorMessage');

test('surfaces duplicate field messages from constraint violations', () => {
  const message = resolveCreateAccountErrorMessage({
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

  assert.equal(
    message,
    'CNPJ ja cadastrado.\nE-mail ja cadastrado.\nTelefone ja cadastrado.',
  );
});

test('falls back to readable direct messages when there are no violations', () => {
  assert.equal(
    resolveCreateAccountErrorMessage({
      'hydra:description': 'Nao foi possivel concluir o cadastro.',
    }),
    'Nao foi possivel concluir o cadastro.',
  );
});

test('returns a default message when the payload has no usable details', () => {
  assert.equal(resolveCreateAccountErrorMessage({}), 'Erro ao criar conta.');
});
