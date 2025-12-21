import React from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { uploadDocumentStyles as styles } from '../../styles/uploadDocument';

export default function UploadDocumentScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>UPLOAD DOCUMENT</Text>

        <View style={{ width: 50 }} />
      </View>

      <View style={styles.content}>
        {/* Upload placeholder */}
        <View style={styles.uploadBox}>
          <Ionicons
            name="document-text-outline"
            size={60}
            color="#999"
          />

          <View style={styles.lines}>
            <View style={styles.line} />
            <View style={styles.line} />
          </View>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.back()} // tạm thời
        >
          <Text style={styles.primaryButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
