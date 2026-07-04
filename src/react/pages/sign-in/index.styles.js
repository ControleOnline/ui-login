import {Dimensions, Platform, StyleSheet} from 'react-native';
import {withOpacity} from '@controleonline/../../src/styles/branding';

const {height} = Dimensions.get('window');

export const resolveSignInTheme = (themeColors = {}) => {
  return {
    ...themeColors,
    pageBackground: themeColors.pageBackground,
    textPrimary: themeColors.textPrimary,
    textSecondary: themeColors.textSecondary,
    surface: themeColors.surface,
    overlayBackground: themeColors.overlayBackground,
    containerTransparentBackground: themeColors.containerTransparentBackground,
    inputBackground: themeColors.inputBackground,
    inputBorder: themeColors.inputBorder,
    inputFilledBorder: themeColors.inputFilledBorder,
    inputErrorBorder: themeColors.inputErrorBorder,
    inputErrorBackground: themeColors.inputErrorBackground,
    inputErrorText: themeColors.inputErrorText,
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
    modalBorder: themeColors.modalBorder,
    modalHeaderText: themeColors.modalHeaderText,
    modalText: themeColors.modalText,
    modalCloseIcon: themeColors.modalCloseIcon,
    modalShadow: themeColors.modalShadow,
  };
};

export const createStyles = (theme = resolveSignInTheme()) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.pageBackground,
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
      borderWidth: 1,
      borderColor: theme.modalBorder,
      borderRadius: 16,
      padding: 20,
      ...Platform.select({
        ios: {
          shadowColor: theme.modalShadow,
          shadowOffset: {width: 0, height: 10},
          shadowOpacity: 0.22,
          shadowRadius: 18,
        },
        android: {
          elevation: 8,
        },
        web: {
          boxShadow: `0px 14px 28px ${withOpacity(theme.modalShadow, 0.22)}`,
        },
      }),
    },
    recoveryModalHeader: {
      minHeight: 32,
      justifyContent: 'center',
      marginBottom: 12,
    },
    recoveryModalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.modalHeaderText,
      textAlign: 'center',
      paddingHorizontal: 40,
    },
    recoveryModalDescription: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.modalText,
      textAlign: 'center',
      marginBottom: 16,
    },
    recoveryModalCloseButton: {
      position: 'absolute',
      right: 0,
      top: -4,
      width: 36,
      height: 36,
      borderRadius: 18,
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
