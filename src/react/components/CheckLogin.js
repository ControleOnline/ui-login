import React, {useState, useCallback, useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import {isPublicRoute} from '@controleonline/ui-login/src/react/router/publicRoutes';

const getRedirectParams = route => {
  const routeParams = route?.params;

  if (!routeParams || typeof routeParams !== 'object') {
    return undefined;
  }

  const redirectParams = Object.entries(routeParams).reduce(
    (params, [key, value]) => {
      if (key !== 'showBottomCart' && value !== undefined) {
        params[key] = value;
      }

      return params;
    },
    {},
  );

  return Object.keys(redirectParams).length > 0
    ? JSON.stringify(redirectParams)
    : undefined;
};

const normalizeRedirectParams = redirectParams => {
  if (!redirectParams) {
    return undefined;
  }

  if (typeof redirectParams === 'string') {
    try {
      const parsedParams = JSON.parse(redirectParams);

      return parsedParams && typeof parsedParams === 'object'
        ? parsedParams
        : undefined;
    } catch {
      return undefined;
    }
  }

  return typeof redirectParams === 'object' ? redirectParams : undefined;
};

const resolveRedirectRoute = (routeNames, redirectRoute) => {
  if (!redirectRoute || redirectRoute === 'SignInPage') {
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

  if (aliasedRoute && routeNames.includes(aliasedRoute)) {
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

  const getPostLoginRoute = useCallback(() => {
    const routeNames = navigation?.getState?.()?.routeNames || [];
    if (routeNames.includes('HomePage')) return 'HomePage';
    if (routeNames.includes('CrmIndex')) return 'CrmIndex';
    if (routeNames.includes('OrderHistoryPage')) return 'OrderHistoryPage';
    if (routeNames.includes('ShopIndex')) return 'ShopIndex';
    return routeNames.find(name => name !== 'SignInPage') || null;
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
    if (!isLogged && !isPublicRoute(currentRouteName)) {
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
    } else if (isLogged && currentRouteName == 'SignInPage') {
      const routeNames = navigation?.getState?.()?.routeNames || [];
      const resolvedRedirectRoute = resolveRedirectRoute(
        routeNames,
        currentRoute?.params?.redirectRoute,
      );
      const postLoginRoute =
        resolvedRedirectRoute || getPostLoginRoute();
      if (!postLoginRoute) return;
      navigation.reset({
        index: 0,
        routes: [
          {
            name: postLoginRoute,
            params: normalizeRedirectParams(currentRoute?.params?.redirectParams),
          },
        ],
      });
    }
  }, [
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
