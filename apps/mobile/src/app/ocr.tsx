import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, Alert, TextInput, ScrollView, AppState } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { visionPipeline, analyzeOCRTextAndSave } from '../services/vision';
import { OCREvidence } from '@foodgrade/vision';

export default function OCRScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [capturing, setCapturing] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCREvidence | null>(null);
  const [editedText, setEditedText] = useState('');

  const cameraRef = useRef<CameraView>(null);
  const router = useRouter();

  // Cancellation: aborted on unmount (back press) or on a new capture attempt
  const abortControllerRef = useRef<AbortController | null>(null);
  // Mount guard: prevents stale async callbacks from touching state after unmount
  const mountedRef = useRef(true);

  const [appState, setAppState] = useState(AppState.currentState);

  useEffect(() => {
    mountedRef.current = true;

    const appStateSub = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });

    return () => {
      // Abort any in-flight OCR or analysis request when the screen unmounts
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
        <Text style={styles.text}>We need your permission to show the camera for label scanning</Text>
        <Button onPress={requestPermission} title="Grant Permission" />
      </View>
    );
  }

  const handleCapture = async () => {
    if (!cameraRef.current || capturing || appState !== 'active') return;

    // Abort any previous in-flight OCR request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const { signal } = controller;

    setCapturing(true);
    let capturedUri = '';
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (!photo || !photo.base64) {
        throw new Error('Failed to capture image');
      }

      if (photo.uri) {
        capturedUri = photo.uri;
      }

      if (signal.aborted || !mountedRef.current) return;

      if (mountedRef.current) setAnalyzing(true);

      // Use the vision pipeline to extract text — pass the signal so the fetch can be cancelled
      const evidence = await visionPipeline.extractOCREvidence(
        `data:image/jpeg;base64,${photo.base64}`,
        { signal }
      );

      if (signal.aborted || !mountedRef.current) return;

      if (!evidence.rawText || evidence.rawText.trim().length === 0) {
        if (mountedRef.current) {
          Alert.alert('Empty Result', 'No text could be extracted from this label. Please try again with better lighting.');
        }
      } else {
        if (mountedRef.current) {
          setOcrResult(evidence);
          setEditedText(evidence.rawText);
        }
      }
    } catch (error: any) {
      // AbortError: user left the screen — silently discard
      if (error.name === 'AbortError' || error.name === 'VisionCancelledError') return;
      if (!mountedRef.current) return;

      const msg = error.message?.toLowerCase() || '';
      if (msg.includes('network') || msg.includes('timeout') || msg.includes('fetch')) {
        Alert.alert('Network Error', 'Unable to reach the OCR service. Please check your internet connection.');
      } else {
        Alert.alert('OCR Failed', error.message || 'Failed to extract text from image');
      }
    } finally {
      if (capturedUri) {
        try {
          await FileSystem.deleteAsync(capturedUri, { idempotent: true });
        } catch (_e) {
          // Non-critical cleanup failure
        }
      }
      if (mountedRef.current) {
        setCapturing(false);
        setAnalyzing(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!ocrResult || !editedText.trim()) return;

    if (editedText.trim().length < 10) {
      Alert.alert('INSUFFICIENT DATA', 'The text is too short to be a valid food label. Please provide more details or retake the image.');
      return;
    }

    if (!editedText.toLowerCase().includes('ingredient') && !editedText.toLowerCase().includes('nutrition') && !editedText.toLowerCase().includes('energy')) {
      Alert.alert(
        'PARTIAL DATA WARNING',
        'We could not confidently find ingredients or nutrition information in this text. The analysis might be incomplete. Do you want to proceed?',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Analyze Anyway', onPress: executeAnalysis }
        ]
      );
      return;
    }

    executeAnalysis();
  };

  const executeAnalysis = async () => {
    if (!ocrResult) return;

    // Abort any previous in-flight request and create a fresh controller
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const { signal } = controller;

    if (mountedRef.current) setAnalyzing(true);
    try {
      const result = await analyzeOCRTextAndSave(editedText, ocrResult, signal);

      // Guard: do not navigate if aborted or unmounted
      if (signal.aborted || !mountedRef.current) return;

      router.replace(`/result?id=${result.scanRecord.id}`);
    } catch (error: any) {
      // AbortError: user left — silently discard
      if (error.name === 'AbortError') return;
      if (!mountedRef.current) return;

      Alert.alert('Analysis Error', error.message || 'Failed to analyze parsed text');
    } finally {
      if (mountedRef.current) setAnalyzing(false);
    }
  };

  const resetScanner = () => {
    // Abort any in-flight request when user retakes
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setOcrResult(null);
    setEditedText('');
  };

  if (ocrResult) {
    return (
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Review Extracted Text</Text>
        <Text style={styles.subtitle}>You can manually correct any OCR errors below before analyzing.</Text>

        <TextInput
          style={styles.textInput}
          multiline
          value={editedText}
          onChangeText={setEditedText}
        />

        <View style={styles.buttonRow}>
          <Button title="Retake Image" onPress={resetScanner} color="#f44336" />
          <Button title="Analyze" onPress={handleAnalyze} disabled={analyzing} />
        </View>

        {analyzing && <ActivityIndicator size="large" style={{ marginTop: 20 }} />}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {appState === 'active' ? (
        <CameraView
          ref={cameraRef}
          style={styles.camera}
          facing="back"
        >
          <View style={styles.overlay}>
            {capturing || analyzing ? (
              <View style={styles.loadingBox}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>
                  {capturing ? 'Capturing...' : 'Extracting text...'}
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.instructionsContainer}>
                  <Text style={styles.instructionText}>Frame the Ingredients &amp; Nutrition Label</Text>
                  <Text style={styles.instructionSubtext}>• Keep the label flat</Text>
                  <Text style={styles.instructionSubtext}>• Use good lighting</Text>
                  <Text style={styles.instructionSubtext}>• Keep text in focus</Text>
                </View>
                <View style={styles.scanFrame} />
              </>
            )}
          </View>
        </CameraView>
      ) : (
        <View style={styles.camera} />
      )}

      <View style={styles.footer}>
        <Button title="Capture Label" onPress={handleCapture} disabled={capturing || analyzing} />
        <View style={{ height: 10 }} />
        <Button title="Cancel" onPress={() => {
          abortControllerRef.current?.abort();
          router.back();
        }} color="#666" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContainer: {
    padding: 20,
    flexGrow: 1,
    backgroundColor: '#fff',
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
    width: 300,
    height: 400,
    borderWidth: 2,
    borderColor: '#0f0',
    backgroundColor: 'transparent',
  },
  instructionsContainer: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  instructionText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  instructionSubtext: {
    color: '#ddd',
    fontSize: 14,
    marginBottom: 4,
    textAlign: 'center',
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
  },
  footer: {
    padding: 20,
    backgroundColor: '#000',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 40,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    minHeight: 200,
    textAlignVertical: 'top',
    fontSize: 16,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  }
});
