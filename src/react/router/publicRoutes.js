import {env} from '@env'

export const PUBLIC_ROUTES = new Set([
  'SignInPage',
  'CreateAccount',
  'ResetPasswordPage',
  'ShopIndex',
  'ShopFranchiseLocatorPage',
  'ShopSearchPage',
  'ShopCategoryPage',
  'ShopProductPage',
  'ShopCartPage',
  'ShopDownloadPage',
])

export const isPublicRoute = routeName =>
  PUBLIC_ROUTES.has(routeName) ||
  (routeName === 'HomePage' && String(env.APP_TYPE || '').toUpperCase() === 'SHOP')
