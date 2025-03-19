import React, {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {getStore} from '@store';

const CheckLogin = () => {
  const navigation = useNavigation();
  const {getters: authGetters, actions: authActions} = getStore('auth');
  const {user, isLoggedIn} = authGetters;

  useEffect(() => {
    if (!isLoggedIn)
      navigation.reset({
        index: 0,
        routes: [{name: 'SignInPage'}],
      });
  }, [isLoggedIn]);

  return <></>;
};

export default CheckLogin;
