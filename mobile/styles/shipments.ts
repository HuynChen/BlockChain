import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const shipmentsStyles = StyleSheet.create({
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
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
  },

  /* List */
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  shipmentItem: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.borderColor,
  },

  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },

  itemSub: {
    fontSize: 12,
    color: Colors.subText,
    marginTop: 4,
  },

  statusText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },

  /* Bottom Bar */
  bottomBar: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: Colors.white,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.borderColor,
    elevation: 6,
  },

  activeTab: {
    backgroundColor: Colors.primary,
    padding: 10,
    borderRadius: 12,
  },
});
