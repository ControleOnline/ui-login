import { Dimensions, Platform, StyleSheet } from 'react-native';
import { colors } from '@controleonline/../../src/styles/colors';

const { height } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    backgroundColor: 'rgba(248, 250, 252, 0.45)',
  },
  containerTransparent: {
    backgroundColor: 'transparent',
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
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#0F172A',
  },
  forgotPasswordButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0px 4px 10px rgba(99, 102, 241, 0.3)',
      },
    }),
  },
  loginButtonText: {
    color: '#fff',
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
    backgroundColor: '#CBD5E1',
  },
  oauthDividerText: {
    marginHorizontal: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  googleButton: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
  },
  googleButtonDisabled: {
    opacity: 0.7,
  },
  googleButtonBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  googleButtonBadgeText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EA4335',
  },
  googleButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  createAccountButton: {
    marginTop: 18,
    alignItems: 'center',
  },
  createAccountText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  recoveryModalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
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
    color: '#0F172A',
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
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    marginBottom: 12,
  },
});

export default styles;
