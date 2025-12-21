import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const updateStatusStyles = StyleSheet.create({
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
    marginTop: 30,
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },

  cancelText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },

  content: {
    padding: 20,
  },

  /* Info Card */
  card: {
    backgroundColor: Colors.cardBg,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },

  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.subText,
    marginBottom: 6,
  },

  cardValue: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },

  /* Selector */
  inputGroup: {
    marginBottom: 30,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },

  selectInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    borderRadius: 10,
    padding: 15,
  },

  selectText: {
    fontSize: 14,
    color: Colors.subText,
  },

  /* Button */
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },

  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
