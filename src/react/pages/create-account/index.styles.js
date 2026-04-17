import { StyleSheet } from 'react-native';
import { colors } from '@controleonline/../../src/styles/colors';

const styles = StyleSheet.create({

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
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 8,
  },

  typeButtonActive: {
    backgroundColor: colors.primary,
  },

  typeText: {
    color: '#000',
    fontWeight: '600',
  },

  phoneRow: {
    flexDirection: 'row',
  },

  ddi: {
    flex: 1,
    marginRight: 8,
  },

  ddd: {
    flex: 1,
    marginRight: 8,
  },

  phone: {
    flex: 3,
  },

  button: {
    marginTop: 30,
    backgroundColor: colors.primary,
    height: 54,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  qrText: {
    marginTop: 20,
    textAlign: 'center',
  },

});

export default styles;
