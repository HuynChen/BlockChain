import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const loginStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  loginContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  loginTitle: {
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 40,
    color: Colors.text,
  },

  inputContainer: {
    marginBottom: 18,
  },

  inputLabel: {
    fontSize: 13,
    color: Colors.subText,
    marginBottom: 6,
  },

  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 15,
    fontSize: 16,
    color: Colors.text,
  },

  primaryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 15,
  },

  primaryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },

  forgotPassword: {
    textAlign: 'center',
    color: Colors.subText,
    fontSize: 14,
  },
});
