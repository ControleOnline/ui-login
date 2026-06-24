const {describe, expect, it} = global

jest.mock('@env', () => ({
  env: {
    APP_TYPE: 'SHOP',
  },
}))

const {
  PUBLIC_ROUTES,
  isPublicRoute,
} = require('../../../react/router/publicRoutes')

describe('ui-login public routes', () => {
  it('keeps shop screens renderable without authentication', () => {
    expect(PUBLIC_ROUTES.has('ConfirmAccountPage')).toBe(true)
    expect(isPublicRoute('ConfirmAccountPage')).toBe(true)
    expect(PUBLIC_ROUTES.has('ResetPasswordPage')).toBe(true)
    expect(isPublicRoute('ResetPasswordPage')).toBe(true)
    expect(isPublicRoute('ShopIndex')).toBe(true)
    expect(isPublicRoute('ShopProductPage')).toBe(true)
    expect(isPublicRoute('ShopLoyaltyPage')).toBe(true)
    expect(isPublicRoute('ShopCheckoutPage')).toBe(true)
    expect(isPublicRoute('ShopOrdersPage')).toBe(true)
    expect(isPublicRoute('ShopProfilePage')).toBe(true)
    expect(isPublicRoute('HomePage')).toBe(true)
  })
})
