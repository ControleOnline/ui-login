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
 * React #185 (maximum update depth) was observed specifically on the
 * logout → login path:
 * - navigation "state" listeners fed a new route.params object identity every
 *   tick into React state, re-running the redirect effect;
 * - clearing the navigation lock on requestAnimationFrame while still on
 *   SignInPage allowed reset() to re-enter in a tight loop;
 * - residual redirectRoute=ProfilePage after logout bounced post-login.
 *
 * Strategy: keep params in a ref (not state), one-shot redirect keys, hold the
 * lock until the route actually leaves the source screen, and always land on
 * Home after an intentional (preferClean) logout.
 */
const CheckLogin = ({}) => {
  const navigation = useNavigation();
  const authStore = useStore('auth');
  const authGetters = authStore.getters;
  const authActions = authStore.actions;
  const {isLogged, sessionChecked} = authGetters;
  const [currentRouteName, setCurrentRouteName] = useState('');
  const routeParamsRef = useRef(null);
  const navigatingRef = useRef(false);
  const lastRedirectKeyRef = useRef('');
  // Set when CheckLogin consumes preferCleanSignIn (intentional logout).
  const forceHomeAfterLoginRef = useRef(false);

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
    // Params live in a ref so identity churn does not re-trigger effects.
    routeParamsRef.current = route?.params ?? null;
    setCurrentRouteName(prev => (prev === nextName ? prev : nextName));
  }, [navigation]);

  useEffect(() => {
    updateCurrentRoute();
    return navigation?.addListener?.('state', updateCurrentRoute);
  }, [navigation, updateCurrentRoute]);

  // Release the lock only after the route actually left the source screen.
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

  // Logout while still on SignIn must allow a future post-login redirect.
  useEffect(() => {
    if (!isLogged) {
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

      if (preferClean) {
        forceHomeAfterLoginRef.current = true;
      }

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
          params: routeParamsRef.current,
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
      const forceHome = forceHomeAfterLoginRef.current;
      const resolvedRedirectRoute = forceHome
        ? null
        : resolveRedirectRoute(
            routeNames,
            routeParamsRef.current?.redirectRoute,
          );
      const postLoginRoute =
        resolvedRedirectRoute || getPostLoginRoute() || 'HomePage';

      const redirectKey = `SignInPage|logged|${postLoginRoute}`;
      if (lastRedirectKeyRef.current === redirectKey) {
        return;
      }

      const nextParams = forceHome
        ? undefined
        : normalizeRedirectParams(routeParamsRef.current?.redirectParams);

      navigatingRef.current = true;
      lastRedirectKeyRef.current = redirectKey;
      forceHomeAfterLoginRef.current = false;

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
    sessionChecked,
  ]);

  return null;
};

export default CheckLogin;
