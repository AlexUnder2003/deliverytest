import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AlsoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Страница "Еще"</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#181C20',
  },
  title: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
});
