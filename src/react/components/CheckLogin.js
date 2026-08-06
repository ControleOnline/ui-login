import React, {useState, useCallback, useEffect, useRef} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useStore} from '@store';
import {isPublicRoute} from '@controleonline/ui-login/src/react/router/publicRoutes';
import {
  getRedirectParams,
  normalizeRedirectParams,
  resolveRedirectRoute,
  getDefaultPostLoginRoute,
} from '../utils/redirectParams';

const CheckLogin = ({}) => {
  const navigation = useNavigation();
  const authStore = useStore('auth');
  const authGetters = authStore.getters;
  const authActions = authStore.actions;
  const {isLogged, sessionChecked} = authGetters;
  const [currentRoute, setCurrentRoute] = useState(null);
  const currentRouteName = currentRoute?.name || '';
  const navigatingRef = useRef(false);

  const getPostLoginRoute = useCallback(
    () => getDefaultPostLoginRoute(navigation),
    [navigation],
  );

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
          routes: [{name: 'SignInPage'}],
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
