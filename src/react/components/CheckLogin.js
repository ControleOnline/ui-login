import React, {useEffect, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {getStore} from '@store';

const CheckLogin = ({}) => {
  const navigation = useNavigation();
  const {getters: authGetters, actions: authActions} = getStore('auth');
  const {user, isLogged} = authGetters;
  const [currentRoute, setCurrentRoute] = useState(null);

  useEffect(() => {
    let session = JSON.parse(localStorage.getItem('session')) || {};
    authActions.logIn(session);
  }, []);

  useEffect(() => {
    if (!navigation) return;
    setTimeout(() => {
      setCurrentRoute(navigation.getCurrentRoute()?.name);
    }, 100);
  }, [navigation]);

  useEffect(() => {
    if (!currentRoute) return;
    if (!isLogged && currentRoute != 'SignInPage')
      navigation.reset({
        index: 0,
        routes: [{name: 'SignInPage'}],
      });
    else if (isLogged && currentRoute == 'SignInPage')
      navigation.reset({
        index: 0,
        routes: [{name: 'HomePage'}],
      });
  }, [isLogged, currentRoute]);

  return null;
};

export default CheckLogin;
