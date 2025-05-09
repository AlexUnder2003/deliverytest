import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type Params = {
  from?: string;
  to?: string;
  distance?: string;
  returnTo?: string;   // ← любой путь
  returnId?: string;   // нужен, если редактируем существующую доставку
};

export default function DistanceScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<Params>();

  const [from,      setFrom]      = useState(params.from      ?? '');
  const [to,        setTo]        = useState(params.to        ?? '');
  const [distance,  setDistance]  = useState(params.distance  ?? '');

  const onApply = () => {
    const targetPath = params.returnTo ?? '/(tabs)/create';   // fallback

    router.replace({
      pathname: targetPath,
      params: {
        ...(params.returnId ? { id: params.returnId } : {}),
        from,
        to,
        distance,        // ключ должен называться «distance»
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Адреса и координаты</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.sheet}>
        <View style={styles.field}>
          <Text style={styles.label}>Дистанция</Text>
          <TextInput
            style={styles.input}
            value={distance}
            onChangeText={setDistance}
            placeholder="например, 2 км"
            placeholderTextColor="#888"
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={onApply}>
          <Text style={styles.buttonText}>Применить</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ------------------- стили без изменений ------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#23262B' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    backgroundColor: '#23262B',
  },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  sheet: { padding: 16 },
  field: { marginBottom: 16 },
  label: { color: '#B2B2B2', marginBottom: 6, fontSize: 14 },
  input: {
    backgroundColor: '#35363B',
    color: '#fff',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#18805B',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
