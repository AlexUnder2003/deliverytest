import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Image,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { WebView } from 'react-native-webview';

export default function FilePreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    uri: string;
    name?: string;
  }>();

  const uri = params.uri!;
  const [name, setName] = useState(params.name ?? '');

  // Определяем тип по расширению
  const ext = name.split('.').pop()?.toLowerCase();
  const isImage = ['jpg', 'jpeg', 'png', 'gif'].includes(ext || '');
  const isPdf = ext === 'pdf';

  // Сохранение: возвращаем назад имя и uri
  const onSave = () => {
    router.back({ uri, name });
  };

  return (
    <View style={styles.container}>
      {/* Хедер */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Предпросмотр файла</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Контент */}
      <View style={styles.preview}>
        {isImage ? (
          <Image source={{ uri }} style={styles.image} resizeMode="contain" />
        ) : isPdf ? (
          <WebView
            source={{ uri: Platform.OS === 'ios' ? uri : `file://${uri}` }}
            style={styles.webview}
          />
        ) : (
          <View style={styles.unknown}>
            <Ionicons name="document-text-outline" size={64} color="#888" />
            <Text style={styles.unknownText}>Невозможно отобразить</Text>
          </View>
        )}
      </View>

      {/* Редактирование имени */}
      <View style={styles.footer}>
        <Text style={styles.label}>Название файла</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Введите имя"
            placeholderTextColor="#999"
          />
          {name.length > 0 && (
            <TouchableOpacity onPress={() => setName('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
          <Text style={styles.saveBtnText}>Сохранить</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '600' },

  preview: { flex: 1, backgroundColor: '#000' },
  image: { flex: 1, width: '100%' },
  webview: { flex: 1 },
  unknown: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  unknownText: { marginTop: 8, color: '#888' },

  footer: { padding: 16, backgroundColor: '#f9f9f9' },
  label: { fontSize: 14, color: '#666', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
  input: { flex: 1, height: 40, fontSize: 16, color: '#333' },
  saveBtn: {
    marginTop: 16,
    backgroundColor: '#18805B',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});