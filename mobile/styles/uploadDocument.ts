import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const uploadDocumentStyles = StyleSheet.create({
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
    flex: 1,
  },

  /* Upload box */
  uploadBox: {
    backgroundColor: Colors.cardBg,
    borderRadius: 20,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },

  lines: {
    marginTop: 12,
    alignItems: 'center',
  },

  line: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    marginBottom: 4,
    borderRadius: 2,
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
