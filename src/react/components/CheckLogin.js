import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {getStore} from '@store';

const CheckLogin = () => {
  const navigation = useNavigation();
  const {getters: authGetters, actions: authActions} = getStore('auth');
  const {user, isLogged} = authGetters;

  useEffect(() => {
    if (!authActions.isLogged())
      navigation.reset({
        index: 0,
        routes: [{name: 'SignInPage'}],
      });
  }, [isLogged, user]);

  return <></>;
};

export default CheckLogin;
