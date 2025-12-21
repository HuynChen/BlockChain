import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const createShipmentStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 30,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },

  cancelText: {
    fontSize: 15,
    color: Colors.primary,
  },

  content: {
    padding: 20,
  },

  inputGroup: {
    marginBottom: 22,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },

  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
  },

  photoPlaceholder: {
    height: 150,
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderStyle: 'dashed',
    },

    photoText: {
    marginTop: 8,
    fontSize: 13,
    color: Colors.subText,
    },

  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
