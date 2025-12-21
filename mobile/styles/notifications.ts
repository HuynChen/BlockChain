import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const notificationsStyles = StyleSheet.create({
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

  /* Content */
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },

  clearText: {
    fontSize: 15,
    color: Colors.primary,
    marginBottom: 15,
    fontWeight: '500',
  },

  /* Notification Item */
  notiItem: {
    backgroundColor: Colors.cardBg,
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },

  iconBox: {
    marginRight: 15,
  },

  squareIcon: {
    width: 16,
    height: 16,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    opacity: 0.7,
  },

  itemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },

  itemMsg: {
    fontSize: 13,
    color: Colors.subText,
    marginTop: 4,
  },
});
