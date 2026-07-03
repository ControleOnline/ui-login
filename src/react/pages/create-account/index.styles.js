import {StyleSheet} from 'react-native';
import {resolveSignInTheme} from '../sign-in/index.styles';

export const createStyles = (theme = resolveSignInTheme()) =>
  StyleSheet.create({
    container: {
      padding: 24,
    },

    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
    },

    title: {
      fontSize: 28,
      fontWeight: '700',
      marginBottom: 24,
    },

    subtitle: {
      textAlign: 'center',
      marginBottom: 30,
    },

    section: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 20,
      marginBottom: 10,
    },

    input: {
      backgroundColor: theme.inputBackground,
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
      backgroundColor: theme.inputBorder,
      alignItems: 'center',
      borderRadius: 8,
      marginRight: 8,
    },

    typeButtonActive: {
      backgroundColor: theme.buttonBackground,
    },

    typeText: {
      color: theme.buttonDisabledText,
      fontWeight: '600',
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
    },
  });

const styles = createStyles(resolveSignInTheme());

export default styles;
