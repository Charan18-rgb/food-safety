import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, ActivityIndicator, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { clientService } from '../services/client';
import { ScanHistoryRecord } from '@foodgrade/client-services';

export default function ResultScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [record, setRecord] = useState<ScanHistoryRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadResult() {
      if (!id) return;
      try {
        const historyRecord = await clientService.getScanById(id);
        setRecord(historyRecord);
      } catch (err) {
        if (__DEV__) console.error('[ResultScreen] Failed to load scan record:', (err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    loadResult();
  }, [id]);

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  }

  if (!record) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Result not found.</Text>
        <Button title="Go Back" onPress={() => router.back()} />
      </View>
    );
  }

  const { productInput, analysisResult } = record;

  const matchedRules = [...analysisResult.positives, ...analysisResult.warnings];

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <Text style={styles.title}>{productInput.productName || 'Unknown Product'}</Text>
      <Text style={styles.brand}>{productInput.brand || 'Unknown Brand'}</Text>

      <View style={styles.scoreBox}>
        <Text style={styles.scoreLabel}>FoodGrade</Text>
        <Text style={styles.grade}>{analysisResult.grade}</Text>
        <Text style={styles.scoreText}>Score: {analysisResult.score} / 100</Text>
        <Text style={styles.confidence}>
          Confidence: {analysisResult.confidence?.level 
            ? analysisResult.confidence.level.charAt(0).toUpperCase() + analysisResult.confidence.level.slice(1) 
            : 'Not available'}
        </Text>
        <Text style={styles.source}>
          {productInput.provenance?.sourceType === 'label_ocr' 
            ? 'Source: Extracted from label' 
            : productInput.provenance?.sourceType 
              ? 'Source: Found by barcode' 
              : 'Source: Not available'}
        </Text>
      </View>

      <View style={styles.factorsBox}>
        <Text style={styles.factorsTitle}>Key Factors:</Text>
        {matchedRules.map((rule, idx) => (
          <View key={idx} style={styles.factorItemContainer}>
            <Text style={styles.factorTitle}>
              {rule.impact === 'positive' ? '✅' : '⚠️'} {rule.title} ({rule.pointsDelta > 0 ? '+' : ''}{rule.pointsDelta} pts)
            </Text>
            <Text style={styles.factorDesc}>{rule.description}</Text>
          </View>
        ))}
        {matchedRules.length === 0 && (
          <Text style={styles.factorDesc}>No significant rules matched.</Text>
        )}
      </View>

      <View style={styles.dataBox}>
        <Text style={styles.factorsTitle}>Ingredients:</Text>
        <Text style={styles.dataText}>
          {productInput.parsedIngredients?.map(i => i.canonicalName || i.rawText).join(', ') || 'None found'}
        </Text>
        
        <Text style={[styles.factorsTitle, { marginTop: 15 }]}>Additives:</Text>
        <Text style={styles.dataText}>
          {productInput.detectedAdditives?.map(a => {
            const code = a.insCode.replace(/^ins\s*/i, '');
            return `INS ${code}`;
          }).join(', ') || 'None found'}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title="Scan Another" onPress={() => router.replace('/scanner')} />
        <Button title="Home" onPress={() => router.dismissAll()} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scroll: {
    padding: 20,
    width: '100%',
  },
  image: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '100%',
    flexWrap: 'wrap',
  },
  brand: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
    width: '100%',
    flexWrap: 'wrap',
  },
  scoreBox: {
    padding: 20,
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    width: '100%',
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    width: '100%',
  },
  grade: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginVertical: 10,
    textAlign: 'center',
    width: '100%',
  },
  scoreText: {
    fontSize: 18,
    textAlign: 'center',
    width: '100%',
  },
  confidence: {
    fontSize: 14,
    color: '#555',
    marginTop: 5,
    textAlign: 'center',
    width: '100%',
  },
  source: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
    textAlign: 'center',
    width: '100%',
  },
  factorsBox: {
    width: '100%',
    marginBottom: 30,
  },
  factorsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  factorItemContainer: {
    marginBottom: 12,
    backgroundColor: '#fafafa',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
  },
  factorTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  factorDesc: {
    fontSize: 14,
    color: '#555',
  },
  dataBox: {
    width: '100%',
    marginBottom: 30,
    padding: 15,
    backgroundColor: '#fff',
    borderColor: '#e0e0e0',
    borderWidth: 1,
    borderRadius: 8,
  },
  dataText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    gap: 15,
  }
});
