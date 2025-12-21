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
import { notificationsStyles as styles } from '../../styles/notifications';

export default function NotificationsScreen() {
  // Dummy Data
  const notificationsData = [
    { id: '1', title: 'Notification Title', message: 'Notification message' },
    { id: '2', title: 'Notification Title', message: 'Notification message' },
    { id: '3', title: 'Notification Title', message: 'Notification message' },
    { id: '4', title: 'Notification Title', message: 'Notification message' },
  ];

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.notiItem}>
      <View style={styles.iconBox}>
        <View style={styles.squareIcon} />
      </View>

      <View>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.itemMsg}>{item.message}</Text>
      </View>
    </View>
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

        <Text style={styles.headerTitle}>NOTIFICATIONS</Text>

        {/* Spacer */}
        <View style={{ width: 24 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <TouchableOpacity>
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>

        <FlatList
          data={notificationsData}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
