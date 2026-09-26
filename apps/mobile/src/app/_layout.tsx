import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'FoodGrade', headerShown: false }} />
      <Stack.Screen name="scanner" options={{ title: 'Scan Barcode', presentation: 'fullScreenModal', headerShown: false }} />
      <Stack.Screen name="result" options={{ title: 'Analysis Result', headerBackVisible: false }} />
    </Stack>
  );
}
