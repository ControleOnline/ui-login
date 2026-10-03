import {StyleSheet} from 'react-native'

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F8FAFC',
    flex: 1,
  },
  page: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderRadius: 16,
    borderWidth: 1,
    maxWidth: 520,
    padding: 28,
    width: '100%',
  },
  eyebrow: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  title: {
    color: '#0F172A',
    fontSize: 27,
    fontWeight: '700',
    marginBottom: 12,
  },
  body: {
    color: '#334155',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 18,
  },
  detail: {
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    marginBottom: 18,
    padding: 14,
  },
  detailLabel: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailText: {
    color: '#0F172A',
    fontSize: 15,
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    alignItems: 'center',
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 16,
  },
  approve: {
    backgroundColor: '#166534',
  },
  deny: {
    backgroundColor: '#E2E8F0',
  },
  approveText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  denyText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  status: {
    color: '#475569',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 16,
  },
})

export default styles
