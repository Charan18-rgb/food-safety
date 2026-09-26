import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, AppState } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { clientService } from '../services/client';
import { normalizeBarcode } from '@foodgrade/client-services';

export default function ScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const router = useRouter();

  // Debounce ref to prevent duplicate scanning
  const lastScannedTime = useRef(0);
  const lastScannedCode = useRef('');

  // Cancellation: one controller per in-flight lookup. Aborted on unmount or back-press.
  const abortControllerRef = useRef<AbortController | null>(null);
  // Mount guard: prevents stale async results from touching state after unmount.
  const mountedRef = useRef(true);

  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    mountedRef.current = true;

    const appStateSub = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });

    return () => {
      // Abort any in-flight network request when the screen unmounts (Back pressed)
      mountedRef.current = false;
      abortControllerRef.current?.abort();
      abortControllerRef.current = null;
      appStateSub.remove();
    };
  }, []);

  if (!permission) {
    return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (appState !== 'active') return;
    const now = Date.now();
    // 2-second cooldown for the same barcode to prevent spam
    if (scanned || analyzing || (lastScannedCode.current === data && now - lastScannedTime.current < 2000)) {
      return;
    }

    lastScannedCode.current = data;
    lastScannedTime.current = now;
    setScanned(true);
    setAnalyzing(true);

    // Create a fresh AbortController for this scan; abort any previous in-flight request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const { signal } = controller;

    try {
      const normalized = normalizeBarcode(data, true);
      const result = await clientService.lookupBarcodeAndAnalyze(normalized, signal);

      // If aborted before we got here, do not navigate or update state
      if (signal.aborted || !mountedRef.current) return;

      if (!result) {
        if (mountedRef.current) {
          Alert.alert('Not Found', 'Product not found in database.', [
            { text: 'Scan Label with OCR', onPress: () => router.replace('/ocr') },
            { text: 'Scan Again', onPress: () => setScanned(false) }
          ]);
        }
      } else if (result.productInput.provenance?.observationMode === 'fallback') {
        if (mountedRef.current) {
          const name = result.productInput.productName || 'This product';
          Alert.alert('Identity Found', `${name} was found, but ingredients and nutrition data are missing.`, [
            { text: 'Scan Label with OCR', onPress: () => router.replace('/ocr') },
            { text: 'Cancel', onPress: () => setScanned(false), style: 'cancel' }
          ]);
        }
      } else {
        if (mountedRef.current) {
          router.replace(`/result?id=${result.scanRecord.id}`);
        }
      }
    } catch (error: any) {
      // AbortError means user left the screen — do nothing, no alert, no navigation
      if (error.name === 'AbortError') return;
      if (!mountedRef.current) return;

      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('network') || msg.includes('timeout') || msg.includes('fetch')) {
        Alert.alert('Network Error', 'Unable to reach the product database. Please check your internet connection.', [
          { text: 'Retry', onPress: () => setScanned(false) },
          { text: 'Cancel', onPress: () => router.back(), style: 'cancel' }
        ]);
      } else {
        Alert.alert('Analysis Failed', error.message || 'An unexpected error occurred.', [
          { text: 'Scan Again', onPress: () => setScanned(false) },
          { text: 'Cancel', onPress: () => router.back(), style: 'cancel' }
        ]);
      }
    } finally {
      if (mountedRef.current) setAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      {appState === 'active' ? (
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"]
          }}
          onBarcodeScanned={scanned || analyzing ? undefined : handleBarcodeScanned}
        >
          <View style={styles.overlay}>
            {analyzing ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Analyzing product...</Text>
              </View>
            ) : (
              <View style={styles.scanFrame} />
            )}
          </View>
        </CameraView>
      ) : (
        <View style={styles.camera} />
      )}
      <Button title="Cancel" onPress={() => {
        abortControllerRef.current?.abort();
        router.back();
      }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    width: 250,
    height: 150,
    borderWidth: 2,
    borderColor: '#0f0',
    backgroundColor: 'transparent',
  },
  text: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingBox: {
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
  }
});
