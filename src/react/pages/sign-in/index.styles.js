import {Dimensions, Platform, StyleSheet} from 'react-native';
import {colors} from '@controleonline/../../src/styles/colors';
import {
  resolveThemePalette,
  withOpacity,
} from '@controleonline/../../src/styles/branding';

const {height} = Dimensions.get('window');

export const resolveSignInTheme = (themeColors = {}) => {
  const palette = resolveThemePalette(themeColors, colors);

  return {
    ...palette,
    containerTransparentBackground:
      themeColors.containerTransparentBackground || 'transparent',
    overlayBackground:
      themeColors.overlayBackground || 'rgba(248, 250, 252, 0.45)',
    inputBackground: themeColors.inputBackground || '#F1F5F9',
    inputFilledBorder: themeColors.inputFilledBorder || 'transparent',
    inputErrorBorder: themeColors.inputErrorBorder || '#C10015',
    inputErrorBackground: themeColors.inputErrorBackground || '#FEF2F2',
    inputText: themeColors.inputText || '#0F172A',
    inputPlaceholderText: themeColors.inputPlaceholderText || '#94A3B8',
    inputIcon: themeColors.inputIcon || '#64748B',
    buttonBackground: themeColors.buttonBackground || palette.primary,
    buttonShadow: themeColors.buttonShadow || '#6366F1',
    buttonText: themeColors.buttonText || '#fff',
    dividerBackground: themeColors.dividerBackground || '#CBD5E1',
    dividerText: themeColors.dividerText || '#64748B',
    buttonBackgroundSecondary:
      themeColors.buttonBackgroundSecondary || '#FFFFFF',
    buttonBorderSecondary: themeColors.buttonBorderSecondary || '#CBD5E1',
    buttonDisabledOpacity: Number(themeColors.buttonDisabledOpacity ?? 0.7),
    buttonDisabledText: themeColors.buttonDisabledText || '#000',
    buttonIconSecondary: themeColors.buttonIconSecondary || '#EA4335',
    buttonTextSecondary: themeColors.buttonTextSecondary || '#0F172A',
    linkText: themeColors.linkText || palette.primary,
    modalOverlay: themeColors.modalOverlay || 'rgba(15, 23, 42, 0.45)',
    modalBackground: themeColors.modalBackground || '#fff',
    modalHeaderText: themeColors.modalHeaderText || '#0F172A',
    modalCloseIcon: themeColors.modalCloseIcon || '#64748B',
    headerText: themeColors.headerText || '#0F172A',
    loadingSpinner: themeColors.loadingSpinner || palette.primary,
    inputBorder: themeColors.inputBorder || '#E2E8F0',
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
