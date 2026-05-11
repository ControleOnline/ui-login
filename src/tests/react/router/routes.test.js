const {jest} = require('@jest/globals')

const {describe, expect, it} = global

jest.mock('@controleonline/ui-login/src/react/pages/sign-in', () => 'SignInPage')
jest.mock(
  '@controleonline/ui-login/src/react/pages/create-account',
  () => 'CreateAccount',
)
jest.mock(
  '@controleonline/ui-login/src/react/pages/reset-password',
  () => 'ResetPasswordPage',
)

const loginRoutes = require('../../../react/router/routes').default

describe('ui-login routes', () => {
  it('registers the reset password route used by recovery emails', () => {
    const route = loginRoutes.find(item => item.name === 'ResetPasswordPage')

    expect(route).toBeTruthy()
    expect(route.path).toBe('reset-password')
    expect(route.options).toEqual({headerShown: false})
  })
})
