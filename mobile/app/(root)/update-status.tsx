import React from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { updateStatusStyles as styles } from '../../styles/updateStatus';

export default function UpdateStatusScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>UPDATE STATUS</Text>

        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        {/* Info */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Shipment ID</Text>
          <Text style={styles.cardValue}>12345</Text>

          <View style={{ height: 15 }} />

          <Text style={styles.cardLabel}>Current Status</Text>
          <Text style={styles.cardValue}>In Transit</Text>
        </View>

        {/* Status selector */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Status</Text>

          <TouchableOpacity style={styles.selectInput}>
            <Text style={styles.selectText}>Select status</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Button */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.back()} // tạm thời
        >
          <Text style={styles.primaryButtonText}>Update</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
