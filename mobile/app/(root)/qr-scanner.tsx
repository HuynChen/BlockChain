import React from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { qrScannerStyles as styles } from '../../styles/qrScanner';

export default function QRScannerScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons
            name="chevron-back"
            size={24}
            color={Colors.primary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>QR Scanner</Text>

        <View style={{ width: 24 }} />
      </View>

      {/* Scanner content */}
      <View style={styles.scannerContent}>
        <View style={styles.qrPlaceholder}>
          <Image
            source={{
              uri: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data',
            }}
            style={{ width: 150, height: 150 }}
          />
        </View>

        <Text style={styles.scanText}>Scan QR Code</Text>
      </View>

      {/* Footer */}
      <View style={styles.footerButtonContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.back()}
        >
          <Text style={styles.primaryButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
