import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { loginStyles as styles } from '../../styles/login';

export default function LoginScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.loginContent}>
        <Text style={styles.loginTitle}>LOGIN</Text>

        {/* Email */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Password</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
          />
        </View>

        {/* Login */}
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => router.push('/(root)/shipments')}
        >
          <Text style={styles.primaryButtonText}>Log In</Text>
        </TouchableOpacity>

        {/* Forgot password */}
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>
            Forgot password?
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
