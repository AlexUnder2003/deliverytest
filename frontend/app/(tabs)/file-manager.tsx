// app/file-manager.tsx

import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function FileManagerScreen() {
  const router = useRouter();
  // Destructure returnTo, returnId and initial files JSON
  const { returnTo, returnId, files: filesParam } = useLocalSearchParams<{
    returnTo?: string;
    returnId?: string;
    files?: string;
  }>();

  // Initialize files state from filesParam
  const [files, setFiles] = useState<Array<{ uri: string; name: string }>>(() => {
    if (filesParam) {
      try {
        return JSON.parse(filesParam as string);
      } catch {
        console.warn('Не удалось распарсить filesParam');
      }
    }
    return [];
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // Launch document picker
  const addDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!res.canceled) {
        if (Array.isArray(res.assets) && res.assets.length > 0) {
          res.assets.forEach(asset => {
            const name = asset.name ?? asset.uri.split('/').pop()!;
            setFiles(prev => [...prev, { uri: asset.uri, name }]);
          });
        } else if (res.uri) {
          const name = res.name ?? res.uri.split('/').pop()!;
          setFiles(prev => [...prev, { uri: res.uri, name }]);
        }
      }
    } catch (e) {
      console.warn('Picker error', e);
      Alert.alert('Ошибка', 'Не удалось выбрать документ.');
    }
  };

  const deleteFile = (idx: number) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    if (editingIndex === idx) setEditingIndex(null);
  };

  const startEditing = (idx: number, name: string) => {
    setEditingIndex(idx);
    setEditingName(name);
  };

  const saveEdit = (idx: number) => {
    setFiles(prev =>
      prev.map((f, i) => (i === idx ? { ...f, name: editingName } : f))
    );
    setEditingIndex(null);
  };

  const cancelEdit = () => setEditingIndex(null);

  // Return to previous screen with updated files
  const goBackWithFiles = () => {
    const target = returnTo || '/(tabs)/create'; // Изменено с '/' на '/(tabs)/create'
    const params: Record<string, string> = {};
    params.files = JSON.stringify(files);
    if (returnId) params.id = returnId;

    // Navigate back using replace to avoid stacking
    router.replace({
      pathname: target,
      params,
    });
  };

  return (
    <View style={styles.container}>
      {/* Done button */}
      <TouchableOpacity style={styles.doneBtn} onPress={goBackWithFiles}>
        <Ionicons name="checkmark" size={24} color="#fff" />
        <Text style={styles.doneText}>Готово</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.list} style={styles.scroll}>
        {files.map((file, idx) => (
          <View key={idx} style={styles.item}>
            {editingIndex === idx ? (
              <> 
                <TextInput
                  style={styles.input}
                  value={editingName}
                  onChangeText={setEditingName}
                />
                <TouchableOpacity onPress={() => saveEdit(idx)} style={styles.actionBtn}>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#4CAF50" />
                </TouchableOpacity>
                <TouchableOpacity onPress={cancelEdit} style={styles.actionBtn}>
                  <Ionicons name="close-circle-outline" size={24} color="#F44336" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.fileInfo}
                  onPress={() =>
                    router.push({
                      pathname: '/file-preview',
                      params: { uri: file.uri, name: file.name },
                    })
                  }
                >
                  <Ionicons
                    name={
                      file.name.toLowerCase().endsWith('.pdf')
                        ? 'document-text-outline'
                        : 'attach-outline'
                    }
                    size={20}
                    color="#fff"
                    style={styles.icon}
                  />
                  <Text style={styles.name}>{file.name}</Text>
                </TouchableOpacity>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => startEditing(idx, file.name)} style={styles.actionBtn}>
                    <Ionicons name="create-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteFile(idx)} style={styles.actionBtn}>
                    <Ionicons name="trash-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        ))}

        {/* Add document button */}
        <TouchableOpacity style={styles.addBtn} onPress={addDocument}>
          <Ionicons name="add-circle-outline" size={24} color="#fff" />
          <Text style={styles.addBtnText}>Выбрать документ</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23262B',
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  doneText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
  scroll: { flex: 1 },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2C3036',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  fileInfo: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  icon: { marginRight: 12 },
  name: { color: '#fff', fontSize: 16, flexShrink: 1 },
  actions: { flexDirection: 'row', marginLeft: 8 },
  actionBtn: { marginLeft: 12 },
  input: {
    flex: 1,
    color: '#fff',
    borderBottomWidth: 1,
    borderColor: '#555',
    marginRight: 8,
    fontSize: 16,
  },
  addBtn: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18805B',
    padding: 12,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
  },
});
