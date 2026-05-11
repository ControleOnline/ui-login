const {describe, expect, it} = global

const {
  PUBLIC_ROUTES,
  isPublicRoute,
} = require('../../../react/router/publicRoutes')

describe('ui-login public routes', () => {
  it('keeps the reset password page public without authentication', () => {
    expect(PUBLIC_ROUTES.has('ResetPasswordPage')).toBe(true)
    expect(isPublicRoute('ResetPasswordPage')).toBe(true)
    expect(isPublicRoute('HomePage')).toBe(false)
  })
})
