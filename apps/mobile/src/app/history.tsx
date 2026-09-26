import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { clientService } from '../services/client';
import { ScanHistoryRecord } from '@foodgrade/client-services';

export default function HistoryScreen() {
  const [history, setHistory] = useState<ScanHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const loadHistory = async () => {
      try {
        const records = await clientService.getHistory();
        if (mounted) {
          setHistory(records.sort((a, b) => b.timestamp - a.timestamp));
        }
      } catch (_err) {
        if (mounted) Alert.alert('Error', 'Failed to load history.');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadHistory();
    return () => { mounted = false; };
  }, []);

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this record?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive',
        onPress: async () => {
          try {
            await clientService.deleteScan(id);
            setHistory(prev => prev.filter(item => item.id !== id));
          } catch (_err) {
            Alert.alert('Error', 'Failed to delete record.');
          }
        }
      }
    ]);
  };

  const handleClear = () => {
    Alert.alert('Clear History', 'Are you sure you want to delete all history? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Clear All', 
        style: 'destructive',
        onPress: async () => {
          try {
            await clientService.clearHistory();
            setHistory([]);
          } catch (_err) {
            Alert.alert('Error', 'Failed to clear history.');
          }
        }
      }
    ]);
  };

  if (loading) {
    return <View style={styles.container}><ActivityIndicator size="large" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        <TouchableOpacity onPress={handleClear}>
          <Text style={styles.clearBtn}>Clear All</Text>
        </TouchableOpacity>
      </View>

      {history.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No history found.</Text>
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card}
              onPress={() => router.push(`/result?id=${item.id}`)}
            >
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.productName}>{item.productInput.productName || 'Unknown Product'}</Text>
                  <Text style={styles.brandName}>{item.productInput.brand || 'Unknown Brand'}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.gradeText}>{item.analysisResult.grade}</Text>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={{ marginTop: 8 }}>
                    <Text style={{ color: 'red', fontSize: 12 }}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.cardFooter}>
                <Text style={styles.metaText}>Score: {item.analysisResult.score}/100</Text>
                <Text style={styles.metaText}>
                  {item.productInput.provenance.sourceType === 'label_ocr' ? 'OCR' : 'Barcode'}
                </Text>
                <Text style={styles.metaText}>
                  {new Date(item.timestamp).toLocaleDateString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  clearBtn: {
    color: '#d32f2f',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  gradeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginLeft: 10,
  },
  brandName: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
  metaText: {
    fontSize: 12,
    color: '#888',
  }
});
