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
      setCurrentRoute(navigation.getCurrentRoute()?.name);
    }, [navigation]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!sessionChecked || !currentRoute) return;
      if (!isLogged && !isPublicRoute(currentRoute))
        navigation.reset({
          index: 0,
          routes: [{name: 'SignInPage'}],
        });
      else if (isLogged && currentRoute == 'SignInPage') {
        const postLoginRoute = getPostLoginRoute();
        if (!postLoginRoute) return;
        navigation.reset({
          index: 0,
          routes: [{name: postLoginRoute}],
        });
      }
    }, [isLogged, currentRoute, getPostLoginRoute, sessionChecked]),
  );

  return null;
};

export default CheckLogin;
