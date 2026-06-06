import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../styles/colors';

export default function ModeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mode</Text>
      <Text style={styles.subtitle}>Скоро добавлю, ждите обновлений</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 24,
    color: colors.primary,
    fontFamily: 'ShantellSans-Regular',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 10,
    fontFamily: 'ShantellSans-Regular',
  },
});