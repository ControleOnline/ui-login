const {describe, expect, it} = global

const {
  PUBLIC_ROUTES,
  isPublicRoute,
} = require('../../../react/router/publicRoutes')

describe('ui-login public routes', () => {
  it('keeps only the public shop entry points available without authentication', () => {
    expect(PUBLIC_ROUTES.has('ResetPasswordPage')).toBe(true)
    expect(isPublicRoute('ResetPasswordPage')).toBe(true)
    expect(isPublicRoute('ShopIndex')).toBe(true)
    expect(isPublicRoute('ShopProductPage')).toBe(true)
    expect(isPublicRoute('ShopLoyaltyPage')).toBe(false)
    expect(isPublicRoute('HomePage')).toBe(true)
  })
})
