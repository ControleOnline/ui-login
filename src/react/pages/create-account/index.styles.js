import {StyleSheet} from 'react-native';
import {resolveSignInTheme} from '../sign-in/index.styles';

export const createStyles = (theme = resolveSignInTheme()) =>
  StyleSheet.create({
    page: {
      flex: 1,
      backgroundColor: theme.pageBackground,
    },

    container: {
      flexGrow: 1,
      padding: 24,
      backgroundColor: theme.pageBackground,
    },

    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      backgroundColor: theme.pageBackground,
    },

    title: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 24,
      color: theme.textPrimary,
      textAlign: 'center',
    },

    subtitle: {
      textAlign: 'center',
      marginBottom: 30,
      color: theme.textSecondary,
    },

    section: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 20,
      marginBottom: 10,
      color: theme.textPrimary,
    },

    input: {
      backgroundColor: theme.inputBackground,
      color: theme.inputText,
      borderWidth: 1,
      borderColor: theme.inputFilledBorder,
      borderRadius: 10,
      paddingHorizontal: 16,
      height: 50,
      marginBottom: 12,
    },

    typeSelector: {
      flexDirection: 'row',
      marginBottom: 20,
    },

    typeButton: {
      flex: 1,
      padding: 12,
      backgroundColor: theme.buttonBackgroundSecondary,
      borderWidth: 1,
      borderColor: theme.buttonBorderSecondary,
      alignItems: 'center',
      borderRadius: 8,
      marginRight: 8,
    },

    typeButtonLast: {
      marginRight: 0,
    },

    typeButtonActive: {
      backgroundColor: theme.buttonBackground,
      borderColor: theme.buttonBackground,
    },

    typeText: {
      color: theme.buttonTextSecondary,
      fontWeight: '600',
    },

    typeTextActive: {
      color: theme.buttonText,
    },

    phoneRow: {
      flexDirection: 'row',
    },

    ddi: {
      width: 72,
      marginRight: 8,
    },

    ddd: {
      width: 76,
      marginRight: 8,
    },

    phone: {
      flex: 1,
    },

    button: {
      marginTop: 30,
      backgroundColor: theme.buttonBackground,
      borderWidth: 1,
      borderColor: theme.buttonBackground,
      height: 54,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },

    buttonText: {
      color: theme.buttonText,
      fontSize: 16,
      fontWeight: '700',
    },

    qrText: {
      marginTop: 20,
      textAlign: 'center',
      color: theme.textSecondary,
    },
  });

const styles = createStyles(resolveSignInTheme());

export default styles;
