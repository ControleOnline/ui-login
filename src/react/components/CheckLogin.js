import React, {useState, useCallback, useEffect, useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import {isPublicRoute} from '@controleonline/ui-login/src/react/router/publicRoutes';

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

const sanitizeParamObject = params => {
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

const getRedirectParams = route => {
  const cleaned = sanitizeParamObject(route?.params);
  return cleaned ? JSON.stringify(cleaned) : undefined;
};

const normalizeRedirectParams = redirectParams => {
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

const resolveRedirectRoute = (routeNames, redirectRoute) => {
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

const CheckLogin = ({}) => {
  const navigation = useNavigation();
  const authStore = useStore('auth');
  const authGetters = authStore.getters;
  const authActions = authStore.actions;
  const {isLogged, sessionChecked} = authGetters;
  const [currentRoute, setCurrentRoute] = useState(null);
  const currentRouteName = currentRoute?.name || '';
  const navigatingRef = useRef(false);

  const getPostLoginRoute = useCallback(() => {
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
  }, [navigation]);

  useEffect(() => {
    if (sessionChecked) {
      return;
    }

    authActions.restoreSession().catch(() => {
      authActions.logIn(null);
    });
  }, [authActions, sessionChecked]);

  const updateCurrentRoute = useCallback(() => {
    if (!navigation) return;
    setCurrentRoute(navigation.getCurrentRoute?.() || null);
  }, [navigation]);

  useEffect(() => {
    updateCurrentRoute();

    return navigation?.addListener?.('state', updateCurrentRoute);
  }, [navigation, updateCurrentRoute]);

  useEffect(() => {
    if (!sessionChecked || !currentRouteName) return;
    if (navigatingRef.current) return;

    if (!isLogged && !isPublicRoute(currentRouteName)) {
      const preferClean =
        typeof authActions.consumePreferCleanSignIn === 'function'
          ? authActions.consumePreferCleanSignIn()
          : false;

      navigatingRef.current = true;

      if (preferClean) {
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'SignInPage',
              params: {redirectRoute: 'HomePage'},
            },
          ],
        });
      } else {
        const redirectParams = getRedirectParams(currentRoute);

        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'SignInPage',
              params: {
                redirectRoute: currentRouteName,
                ...(redirectParams ? {redirectParams} : {}),
              },
            },
          ],
        });
      }

      requestAnimationFrame(() => {
        navigatingRef.current = false;
      });
      return;
    }

    if (isLogged && currentRouteName === 'SignInPage') {
      const routeNames = navigation?.getState?.()?.routeNames || [];
      const resolvedRedirectRoute = resolveRedirectRoute(
        routeNames,
        currentRoute?.params?.redirectRoute,
      );
      const postLoginRoute = resolvedRedirectRoute || getPostLoginRoute();

      // Authenticated user must never remain on SignInPage.
      if (!postLoginRoute) return;

      const nextParams = normalizeRedirectParams(
        currentRoute?.params?.redirectParams,
      );

      navigatingRef.current = true;
      navigation.reset({
        index: 0,
        routes: [
          {
            name: postLoginRoute,
            ...(nextParams ? {params: nextParams} : {}),
          },
        ],
      });
      requestAnimationFrame(() => {
        navigatingRef.current = false;
      });
    }
  }, [
    authActions,
    currentRoute,
    currentRouteName,
    getPostLoginRoute,
    isLogged,
    navigation,
    sessionChecked,
  ]);

  return null;
};

export default CheckLogin;
