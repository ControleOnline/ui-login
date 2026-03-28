import React, {useState, useCallback} from 'react';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import {useStore} from '@store';

const CheckLogin = ({}) => {
  const navigation = useNavigation();
  const authStore = useStore('auth');
  const authGetters = authStore.getters;
  const authActions = authStore.actions;
  const {isLogged} = authGetters;
  const [currentRoute, setCurrentRoute] = useState(null);

  const getPostLoginRoute = useCallback(() => {
    const routeNames = navigation?.getState?.()?.routeNames || [];
    if (routeNames.includes('HomePage')) return 'HomePage';
    if (routeNames.includes('CrmIndex')) return 'CrmIndex';
    if (routeNames.includes('SalesOrdersIndex')) return 'SalesOrdersIndex';
    return routeNames.find(name => name !== 'SignInPage') || null;
  }, [navigation]);
  useFocusEffect(
    useCallback(() => {
      try {
        const sessionData = localStorage.getItem('session');
        if (sessionData) {
          const session = JSON.parse(sessionData);
          // Only login if session has valid user data and is active
          if (session && session.id && session.active === 1) {
            authActions.logIn(session);
          } else {
            // Clear invalid session
            localStorage.removeItem('session');
            authActions.logIn(null);
          }
        } else {
          authActions.logIn(null);
        }
      } catch (error) {
        console.error('Error parsing session:', error);
        localStorage.removeItem('session');
        authActions.logIn(null);
      }
    }, []),
  );

  useFocusEffect(
    useCallback(() => {
      if (!navigation) return;
      setCurrentRoute(navigation.getCurrentRoute()?.name);
    }, [navigation]),
  );

  useFocusEffect(
    useCallback(() => {
      if (!currentRoute) return;
      if (!isLogged && currentRoute != 'SignInPage')
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
    }, [isLogged, currentRoute, getPostLoginRoute]),
  );

  return null;
};

export default CheckLogin;
