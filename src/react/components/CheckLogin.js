import React, {useState, useCallback, useEffect} from 'react';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useStore} from '@store';
import {isPublicRoute} from '@controleonline/ui-login/src/react/router/publicRoutes';

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

  useFocusEffect(
    useCallback(() => {
      if (!navigation) return;
      setCurrentRoute(navigation.getCurrentRoute());
    }, [navigation]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!sessionChecked || !currentRouteName) return;
      if (!isLogged && !isPublicRoute(currentRouteName))
        navigation.reset({
          index: 0,
          routes: [
            {
              name: 'SignInPage',
              params: {
                redirectRoute: currentRouteName,
                redirectParams: currentRoute?.params || {},
              },
            },
          ],
        });
      else if (isLogged && currentRouteName == 'SignInPage') {
        const postLoginRoute =
          currentRoute?.params?.redirectRoute || getPostLoginRoute();
        if (!postLoginRoute) return;
        navigation.reset({
          index: 0,
          routes: [
            {
              name: postLoginRoute,
              params: currentRoute?.params?.redirectParams || undefined,
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
    ]),
  );

  return null;
};

export default CheckLogin;
