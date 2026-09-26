import React from 'react';
import { View, Text, StyleSheet, Button, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>FoodGrade</Text>
      <Text style={styles.subtitle}>Know what&apos;s inside your food.</Text>

      <Text style={styles.disclaimer}>
        Note: FoodGrade analyzes ingredients and nutrition against standard criteria. This is not an official FSSAI rating.
      </Text>

      <View style={styles.buttonContainer}>
        <Text style={styles.actionDesc}>Lookup existing product info:</Text>
        <Button
          title="Scan Barcode"
          onPress={() => router.push('/scanner')}
        />

        <View style={{ height: 24 }} />

        <Text style={styles.actionDesc}>Read ingredient/nutrition text from package:</Text>
        <Button
          title="Scan Food Label (OCR)"
          onPress={() => router.push('/ocr')}
        />

        <View style={{ height: 40 }} />
        <Button
          title="History"
          onPress={() => router.push('/history')}
          color="#555"
        />
      </View>

      {/* Privacy notice — required for app store compliance */}
      <View style={styles.privacyBox}>
        <Text style={styles.privacyTitle}>Data &amp; Privacy</Text>
        <Text style={styles.privacyText}>
          • Barcode scans query the Open Food Facts public database (world.openfoodfacts.org).
        </Text>
        <Text style={styles.privacyText}>
          • Label images are sent to our secure cloud OCR service for text extraction. Images are processed transiently and are not stored by the server.
        </Text>
        <Text style={styles.privacyText}>
          • Your scan history is stored only on this device. Nothing is uploaded automatically.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    marginBottom: 20,
  },
  disclaimer: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginHorizontal: 30,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  actionDesc: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    width: 250,
  },
  privacyBox: {
    marginTop: 40,
    marginHorizontal: 20,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    lineHeight: 18,
  },
});
