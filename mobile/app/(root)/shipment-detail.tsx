import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { shipmentDetailStyles as styles } from '../../styles/shipmentDetail';
import { Colors } from '@/constants/Colors';

export default function ShipmentDetailScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SHIPMENT DETAIL</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Info Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Shipment ID</Text>
            <Text style={styles.value}>12345</Text>
          </View>
          
          <View style={styles.row}>
            <Text style={styles.label}>Product Name</Text>
            <Text style={styles.value}>Sample Product</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Quantity</Text>
            <Text style={styles.value}>100</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Manufacture Date</Text>
            <Text style={styles.value}>Feb 15, 2024</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>In Transit</Text>
          </View>
        </View>

        {/* Timeline (Giả lập UI) */}
        <View style={styles.timelineContainer}>
          <View style={styles.timelineHeader}>
             <Text style={styles.timelineText}>Created</Text>
             <Text style={styles.timelineText}>In Transit</Text>
             <Text style={styles.timelineText}>In Transit</Text>
          </View>
          {/* Line and Dots */}
          <View style={styles.timelineVisual}>
            <View style={[styles.dot, styles.activeDot]} />
            <View style={[styles.line, styles.activeLine]} />
            <View style={[styles.dot, styles.activeDot]} />
            <View style={styles.line} />
            <View style={styles.dot} />
          </View>
          <View style={styles.timelineDates}>
             <Text style={styles.dateText}>Feb 15{"\n"}10:00 AM</Text>
             <Text style={styles.dateText}>Feb 15{"\n"}11:30 AM</Text>
             <Text style={styles.dateText}>Feb 16{"\n"}...</Text>
          </View>
        </View>

        {/* Button */}
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={() => router.push('/(root)/update-status')}
        >
          <Text style={styles.primaryButtonText}>Update Status</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
