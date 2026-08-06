/**
 * Shared redirect-param sanitization for post-login / logout navigation.
 * Keeps CheckLogin and SignInPage free of duplicated blacklist logic and
 * prevents residual query noise (e.g. store=auth) from looping the user
 * back to SignInPage after a successful login.
 */

// Keys that must never be forwarded as post-login route params.
const REDIRECT_PARAM_BLACKLIST = new Set([
  'showBottomCart',
  'redirectRoute',
  'redirectParams',
  'store',
]);

// Profile redirects after logout/login are unreliable and caused a loop on
// /sign-in-page?redirectRoute=ProfilePage. Prefer the app home instead.
const SKIP_POST_LOGIN_REDIRECTS = new Set([
  'ProfilePage',
  'ShopProfilePage',
  'ShopProfileLegacyPage',
]);

export const sanitizeParamObject = params => {
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return undefined;
  }

  const cleaned = Object.entries(params).reduce((acc, [key, value]) => {
    if (!REDIRECT_PARAM_BLACKLIST.has(key) && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {});

  return Object.keys(cleaned).length > 0 ? cleaned : undefined;
};

export const getRedirectParams = route => {
  const cleaned = sanitizeParamObject(route?.params);
  return cleaned ? JSON.stringify(cleaned) : undefined;
};

export const normalizeRedirectParams = redirectParams => {
  if (!redirectParams) {
    return undefined;
  }

  if (typeof redirectParams === 'string') {
    try {
      const parsedParams = JSON.parse(redirectParams);
      return sanitizeParamObject(parsedParams);
    } catch {
      return undefined;
    }
  }

  return sanitizeParamObject(redirectParams);
};

export const resolveRedirectRoute = (routeNames, redirectRoute) => {
  if (!redirectRoute || redirectRoute === 'SignInPage') {
    return null;
  }

  if (SKIP_POST_LOGIN_REDIRECTS.has(redirectRoute)) {
    return null;
  }

  if (routeNames.includes(redirectRoute)) {
    return redirectRoute;
  }

  const redirectAliases = {
    ProfilePage: 'ShopProfilePage',
    ShopProfileLegacyPage: 'ShopProfilePage',
  };
  const aliasedRoute = redirectAliases[redirectRoute];

  if (
    aliasedRoute &&
    !SKIP_POST_LOGIN_REDIRECTS.has(aliasedRoute) &&
    routeNames.includes(aliasedRoute)
  ) {
    return aliasedRoute;
  }

  return null;
};

export const getDefaultPostLoginRoute = navigation => {
  const routeNames = navigation?.getState?.()?.routeNames || [];
  if (routeNames.includes('HomePage')) return 'HomePage';
  if (routeNames.includes('CrmIndex')) return 'CrmIndex';
  if (routeNames.includes('OrderHistoryPage')) return 'OrderHistoryPage';
  if (routeNames.includes('ShopIndex')) return 'ShopIndex';
  return (
    routeNames.find(
      name => name !== 'SignInPage' && !SKIP_POST_LOGIN_REDIRECTS.has(name),
    ) || null
  );
};

export {REDIRECT_PARAM_BLACKLIST, SKIP_POST_LOGIN_REDIRECTS};

export const getSignInPostLoginRoute = (navigation, route) => {
  const routeNames = navigation?.getState?.()?.routeNames || [];
  const resolvedRedirectRoute = resolveRedirectRoute(
    routeNames,
    route?.params?.redirectRoute,
  );

  if (resolvedRedirectRoute) {
    return resolvedRedirectRoute;
  }

  return getDefaultPostLoginRoute(navigation);
};
