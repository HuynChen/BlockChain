import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const qrScannerStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  /* Header */
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 30
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },

  /* Content */
  scannerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  qrPlaceholder: {
    backgroundColor: Colors.cardBg,
    padding: 24,
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },

  scanText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.subText,
  },

  /* Footer */
  footerButtonContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
