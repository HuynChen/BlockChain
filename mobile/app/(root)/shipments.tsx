import React from 'react';
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { shipmentsStyles as styles } from '../../styles/shipments';

export default function ShipmentsScreen() {
  const shipmentsData = [
    { id: '1', name: 'Shipment Name', code: 'ID 1123456', status: 'arrow' },
    { id: '2', name: 'Shipment Name', code: 'ID 1123456', status: 'In Transit' },
    { id: '3', name: 'Shipment Name', code: 'ID 1123456', status: 'Delivered' },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.shipmentItem}
      onPress={() => router.push('/(root)/shipment-detail')}
    >
      <View>
        <Text style={styles.itemTitle}>{item.name}</Text>
        <Text style={styles.itemSub}>{item.code}</Text>
      </View>

      {item.status === 'arrow' ? (
        <Ionicons
          name="chevron-forward"
          size={20}
          color={Colors.subText}
        />
      ) : (
        <Text style={styles.statusText}>{item.status}</Text>
      )}
    </TouchableOpacity>
  );

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

        <Text style={styles.headerTitle}>Shipments</Text>

        <TouchableOpacity
          onPress={() => router.push('/(root)/create-shipment')}
        >
          <Ionicons
            name="add"
            size={26}
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* List */}
      <FlatList
        data={shipmentsData}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />

      {/* Bottom Navigation */}
      <View style={styles.bottomBar}>
        <Ionicons name="home" size={24} color={Colors.subText} />

        <View style={styles.activeTab}>
          <Ionicons name="list" size={24} color={Colors.white} />
        </View>

        <TouchableOpacity onPress={() => router.push('/(root)/profile')}>
          <Ionicons name="person" size={24} color={Colors.subText} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
