export const PUBLIC_ROUTES = new Set([
  'SignInPage',
  'CreateAccount',
  'ResetPasswordPage',
])

export const isPublicRoute = routeName => PUBLIC_ROUTES.has(routeName)
