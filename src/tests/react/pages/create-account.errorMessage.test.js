const {describe, expect, it} = global;

const {
  resolveCreateAccountErrorMessage,
} = require('../../../../react/pages/create-account/errorMessage');

describe('resolveCreateAccountErrorMessage', () => {
  it('surfaces duplicate field messages from constraint violations', () => {
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

    expect(message).toBe(
      'CNPJ ja cadastrado.\nE-mail ja cadastrado.\nTelefone ja cadastrado.',
    );
  });

  it('falls back to readable direct messages when there are no violations', () => {
    expect(
      resolveCreateAccountErrorMessage({
        'hydra:description': 'Nao foi possivel concluir o cadastro.',
      }),
    ).toBe('Nao foi possivel concluir o cadastro.');
  });

  it('returns a default message when the payload has no usable details', () => {
    expect(resolveCreateAccountErrorMessage({})).toBe('Erro ao criar conta.');
  });
});
