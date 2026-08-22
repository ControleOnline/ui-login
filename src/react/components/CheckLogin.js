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

/**
 * Guards auth routes: restore session once, bounce unauthenticated users off
 * private screens, and leave SignInPage after a successful login.
 *
 * Redirects are intentionally one-shot per (routeName, isLogged) pair. Clearing
 * the guard on requestAnimationFrame while still on SignInPage caused React
 * #185 (maximum update depth) after sign-in because state listeners kept
 * re-firing navigation.reset in a tight loop.
 */
const CheckLogin = ({}) => {
  const navigation = useNavigation();
  const authStore = useStore('auth');
  const authGetters = authStore.getters;
  const authActions = authStore.actions;
  const {isLogged, sessionChecked} = authGetters;
  const [currentRouteName, setCurrentRouteName] = useState('');
  const [routeParams, setRouteParams] = useState(null);
  const navigatingRef = useRef(false);
  const lastRedirectKeyRef = useRef('');

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
    const route = navigation.getCurrentRoute?.() || null;
    const nextName = route?.name || '';
    setCurrentRouteName(prev => (prev === nextName ? prev : nextName));
    setRouteParams(route?.params ?? null);
  }, [navigation]);

  useEffect(() => {
    updateCurrentRoute();
    return navigation?.addListener?.('state', updateCurrentRoute);
  }, [navigation, updateCurrentRoute]);

  // Release the navigation lock once the route actually left the source screen.
  // Also clear the last redirect key so a later visit to SignIn can redirect again.
  useEffect(() => {
    const sourceName = lastRedirectKeyRef.current.split('|')[0] || '';
    if (!sourceName) {
      return;
    }
    if (currentRouteName && currentRouteName !== sourceName) {
      navigatingRef.current = false;
      lastRedirectKeyRef.current = '';
    }
  }, [currentRouteName]);

  useEffect(() => {
    if (!isLogged) {
      // Allow a future post-login redirect after logout.
      if (lastRedirectKeyRef.current.includes('|logged|')) {
        lastRedirectKeyRef.current = '';
        navigatingRef.current = false;
      }
    }
  }, [isLogged]);

  useEffect(() => {
    if (!sessionChecked || !currentRouteName) return;
    if (navigatingRef.current) return;

    if (!isLogged && !isPublicRoute(currentRouteName)) {
      const preferClean =
        typeof authActions.consumePreferCleanSignIn === 'function'
          ? authActions.consumePreferCleanSignIn()
          : false;

      const redirectKey = preferClean
        ? `${currentRouteName}|guest-clean`
        : `${currentRouteName}|guest-redirect`;

      if (lastRedirectKeyRef.current === redirectKey) {
        return;
      }

      navigatingRef.current = true;
      lastRedirectKeyRef.current = redirectKey;

      if (preferClean) {
        navigation.reset({
          index: 0,
          routes: [{name: 'SignInPage'}],
        });
      } else {
        const redirectParams = getRedirectParams({
          name: currentRouteName,
          params: routeParams,
        });

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
      return;
    }

    if (isLogged && currentRouteName === 'SignInPage') {
      const routeNames = navigation?.getState?.()?.routeNames || [];
      const resolvedRedirectRoute = resolveRedirectRoute(
        routeNames,
        routeParams?.redirectRoute,
      );
      const postLoginRoute =
        resolvedRedirectRoute || getPostLoginRoute() || 'HomePage';

      const redirectKey = `SignInPage|logged|${postLoginRoute}`;
      if (lastRedirectKeyRef.current === redirectKey) {
        return;
      }

      const nextParams = normalizeRedirectParams(routeParams?.redirectParams);

      navigatingRef.current = true;
      lastRedirectKeyRef.current = redirectKey;
      navigation.reset({
        index: 0,
        routes: [
          {
            name: postLoginRoute,
            ...(nextParams ? {params: nextParams} : {}),
          },
        ],
      });
    }
  }, [
    authActions,
    currentRouteName,
    getPostLoginRoute,
    isLogged,
    navigation,
    routeParams,
    sessionChecked,
  ]);

  return null;
};

export default CheckLogin;
