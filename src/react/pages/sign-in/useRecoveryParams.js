import {useEffect} from 'react';

/**
 * Opens the forgot-password modal when SignIn is reached with recovery params
 * (e.g. after duplicate-account feedback on create-account).
 */
export function useRecoveryParams({
  navigation,
  route,
  setRecoveryLogin,
  setForgotPasswordVisible,
}) {
  useEffect(() => {
    const recoveryLoginParam = String(route?.params?.recoveryLogin || '').trim();
    const shouldOpen = !!route?.params?.openForgotPassword;
    if (!shouldOpen && !recoveryLoginParam) {
      return;
    }
    if (recoveryLoginParam) {
      setRecoveryLogin(recoveryLoginParam);
    }
    if (shouldOpen) {
      setForgotPasswordVisible(true);
    }
    navigation?.setParams?.({
      openForgotPassword: undefined,
      recoveryLogin: undefined,
    });
  }, [
    navigation,
    route?.params?.openForgotPassword,
    route?.params?.recoveryLogin,
    setForgotPasswordVisible,
    setRecoveryLogin,
  ]);
}
