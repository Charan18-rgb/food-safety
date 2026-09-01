import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FoodGrade } from '@foodgrade/shared-types';
import { defaultScoringEngine } from '@foodgrade/engine';
import { PARSER_PACKAGE_INITIALIZED } from '@foodgrade/parser';
import { defaultKnowledgeBase } from '@foodgrade/knowledge';
import { Colors } from '../theme/colors';

export default function HomeScreen() {
  const dummyGrade: FoodGrade = 'B';
  const engineExists = !!defaultScoringEngine;
  const parserWorks = !!PARSER_PACKAGE_INITIALIZED;
  const kbWorks = !!defaultKnowledgeBase;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FoodGrade</Text>
      <Text style={styles.subtitle}>Know what&apos;s inside your food.</Text>
      <View style={styles.debugBox}>
        <Text style={styles.hint}>Shared types: {dummyGrade}</Text>
        <Text style={styles.hint}>Engine resolved: {String(engineExists)}</Text>
        <Text style={styles.hint}>Parser resolved: {String(parserWorks)}</Text>
        <Text style={styles.hint}>Knowledge resolved: {String(kbWorks)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text,
    marginTop: 10,
  },
  debugBox: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#eee',
    borderRadius: 8,
  },
  hint: {
    fontSize: 12,
    color: '#333',
    marginVertical: 2,
  }
});

