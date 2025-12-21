import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="shipments" />
      <Stack.Screen name="qr-scanner" />
      <Stack.Screen name="shipment-detail" />
      <Stack.Screen name="create-shipment" options={{ presentation: 'modal' }} />
      <Stack.Screen name="update-status" options={{ presentation: 'modal' }} />
      <Stack.Screen name="upload-document" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}