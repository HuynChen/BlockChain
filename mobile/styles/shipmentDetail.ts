import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const shipmentDetailStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background
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
  fontWeight: '700', // thay 'bold' → nhất quán
  color: Colors.text,
},

content: {
  padding: 20,
},

card: {
  backgroundColor: Colors.cardBg,
  borderRadius: 15,
  padding: 20,
  marginBottom: 30,
},

row: {
  marginBottom: 15,
},

label: {
  fontSize: 14,
  fontWeight: '700', // thay 'bold'
  color: Colors.text,
  marginBottom: 5,
},

value: {
  fontSize: 16,
  color: Colors.subText,
},

/* Timeline */
timelineContainer: {
  marginBottom: 30,
},

timelineHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginBottom: 10,
},

timelineText: {
  fontSize: 12,
  color: Colors.subText,
  width: '30%',
  textAlign: 'center',
  fontWeight: '500',
},

timelineVisual: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 20,
},

dot: {
  width: 12,
  height: 12,
  borderRadius: 6,
  backgroundColor: Colors.borderColor ?? '#CCC',
},

activeDot: {
  backgroundColor: Colors.primary,
},

line: {
  flex: 1,
  height: 2,
  backgroundColor: Colors.borderColor ?? '#CCC',
},

activeLine: {
  backgroundColor: Colors.primary,
},

timelineDates: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 10,
},

dateText: {
  fontSize: 10,
  color: Colors.subText,
  width: '30%',
  textAlign: 'center',
},

/* Button */
primaryButton: {
  backgroundColor: Colors.primary,
  paddingVertical: 15,
  borderRadius: 12, // thống nhất với UploadDocument
  alignItems: 'center',
},

primaryButtonText: {
  color: Colors.white,
  fontSize: 16,
  fontWeight: '600',
},
});
