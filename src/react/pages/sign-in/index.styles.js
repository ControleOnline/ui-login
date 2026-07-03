import {Dimensions, Platform, StyleSheet} from 'react-native';
import {withOpacity} from '@controleonline/../../src/styles/branding';

const {height} = Dimensions.get('window');

const firstThemeValue = (themeColors = {}, keys = []) => {
  for (const key of keys) {
    const value = themeColors[key];
    if (value !== undefined && value !== null && value !== '') {
      return value;
    }
  }

  return undefined;
};

export const resolveSignInTheme = (themeColors = {}) => {
  const background = firstThemeValue(themeColors, [
    'background',
    'bg-light',
    'q-bg-light',
    'bg-headers-light',
    'q-bg-headers-light',
  ]);
  const text = firstThemeValue(themeColors, [
    'textPrimary',
    'text',
    'text-primary',
    'q-text-primary',
    'text-headers-light',
    'q-text-headers-light',
  ]);
  const textSecondary = firstThemeValue(themeColors, [
    'textSecondary',
    'text-secondary',
    'q-text-secondary',
    'text-headers-light',
    'q-text-headers-light',
  ]);
  const primary = firstThemeValue(themeColors, [
    'primary',
    'q-primary',
    'btn-primary',
    'q-btn-primary',
    'header-primary',
    'q-header-primary',
  ]);
  const secondary = firstThemeValue(themeColors, [
    'secondary',
    'q-secondary',
  ]);
  const border = firstThemeValue(themeColors, [
    'border',
    'bg-even-light',
    'q-bg-even-light',
  ]);

  return {
    ...themeColors,
    background,
    text,
    textSecondary,
    primary,
    secondary,
    border,
    containerTransparentBackground: themeColors.containerTransparentBackground,
    overlayBackground: themeColors.overlayBackground,
    inputBackground: themeColors.inputBackground,
    inputFilledBorder: themeColors.inputFilledBorder,
    inputErrorBorder: themeColors.inputErrorBorder,
    inputErrorBackground: themeColors.inputErrorBackground,
    inputText: themeColors.inputText,
    inputPlaceholderText: themeColors.inputPlaceholderText,
    inputIcon: themeColors.inputIcon,
    buttonBackground: themeColors.buttonBackground,
    buttonShadow: themeColors.buttonShadow,
    buttonText: themeColors.buttonText,
    dividerBackground: themeColors.dividerBackground,
    dividerText: themeColors.dividerText,
    buttonBackgroundSecondary: themeColors.buttonBackgroundSecondary,
    buttonBorderSecondary: themeColors.buttonBorderSecondary,
    buttonDisabledOpacity: Number(themeColors.buttonDisabledOpacity),
    buttonDisabledText: themeColors.buttonDisabledText,
    buttonIconSecondary: themeColors.buttonIconSecondary,
    buttonTextSecondary: themeColors.buttonTextSecondary,
    linkText: themeColors.linkText,
    modalOverlay: themeColors.modalOverlay,
    modalBackground: themeColors.modalBackground,
    modalHeaderText: themeColors.modalHeaderText,
    modalCloseIcon: themeColors.modalCloseIcon,
    headerText: themeColors.headerText,
    loadingSpinner: themeColors.loadingSpinner,
    inputBorder: themeColors.inputBorder,
  };
};

export const createStyles = (theme = resolveSignInTheme()) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
    },
    centerBlock: {
      flex: 1,
      justifyContent: 'center',
      width: '100%',
      alignSelf: 'center',
      maxWidth: 420,
      paddingBottom: height * 0.02,
    },
    backgroundOverlay: {
      flex: 1,
      backgroundColor: theme.overlayBackground,
    },
    containerTransparent: {
      backgroundColor: theme.containerTransparentBackground,
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 16,
      flexDirection: 'row',
    },
    logo: {
      width: 300,
      height: 100,
      marginRight: 10,
    },
    subtitle: {
      fontSize: 15,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    form: {
      width: '100%',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.inputBackground,
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 56,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.inputFilledBorder,
    },
    inputError: {
      borderColor: theme.inputErrorBorder,
      backgroundColor: theme.inputErrorBackground,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.inputText,
    },
    forgotPasswordButton: {
      marginTop: 10,
      alignItems: 'center',
    },
    forgotPasswordText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.linkText,
    },
    loginButton: {
      backgroundColor: theme.buttonBackground,
      borderRadius: 12,
      height: 56,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 4,
      ...Platform.select({
        ios: {
          shadowColor: theme.buttonShadow,
          shadowOffset: {width: 0, height: 4},
          shadowOpacity: 0.3,
          shadowRadius: 10,
        },
        android: {
          elevation: 4,
        },
        web: {
          boxShadow: `0px 4px 10px ${withOpacity(theme.buttonShadow, 0.3)}`,
        },
      }),
    },
    loginButtonText: {
      color: theme.buttonText,
      fontSize: 16,
      fontWeight: '700',
    },
    oauthDivider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 18,
      marginBottom: 14,
    },
    oauthDividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: theme.dividerBackground,
    },
    oauthDividerText: {
      marginHorizontal: 12,
      fontSize: 13,
      fontWeight: '600',
      color: theme.dividerText,
      textTransform: 'uppercase',
    },
    googleButton: {
      height: 56,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.buttonBorderSecondary,
      backgroundColor: theme.buttonBackgroundSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      paddingHorizontal: 16,
    },
    googleButtonDisabled: {
      opacity: theme.buttonDisabledOpacity,
    },
    googleButtonBadge: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.buttonBackgroundSecondary,
      borderWidth: 1,
      borderColor: theme.buttonBorderSecondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    googleButtonBadgeText: {
      fontSize: 16,
      fontWeight: '800',
      color: theme.buttonIconSecondary,
    },
    googleButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.buttonTextSecondary,
    },
    createAccountButton: {
      marginTop: 18,
      alignItems: 'center',
    },
    createAccountText: {
      fontSize: 15,
      fontWeight: '600',
      color: theme.linkText,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.modalOverlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    recoveryModalContent: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.modalBackground,
      borderRadius: 16,
      padding: 20,
    },
    recoveryModalHeader: {
      minHeight: 36,
      justifyContent: 'center',
      marginBottom: 16,
    },
    recoveryModalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.modalHeaderText,
      textAlign: 'center',
      paddingHorizontal: 40,
    },
    recoveryModalCloseButton: {
      position: 'absolute',
      right: -8,
      top: -6,
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    recoveryInput: {
      borderWidth: 1,
      borderColor: theme.inputBorder,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.inputText,
      backgroundColor: theme.inputBackground,
      marginBottom: 12,
    },
  });

const styles = createStyles(resolveSignInTheme());

export default styles;
