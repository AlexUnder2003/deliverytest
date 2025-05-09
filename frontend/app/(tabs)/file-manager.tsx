// app/file-manager.tsx

import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useRouter } from 'expo-router';
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
  const [files, setFiles] = useState<Array<{ uri: string; name: string }>>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  // Добавление документа из файловой системы
  const addDocument = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      // Подробное логирование для отладки
      console.log('DocumentPicker результат:', JSON.stringify(res));

      // Проверка для новой версии API (массив assets)
      if (res.type === 'success' && Array.isArray(res.assets) && res.assets.length > 0) {
        const asset = res.assets[0];
        console.log('Выбран документ:', asset.name, asset.uri);
        setFiles(prev => [...prev, { uri: asset.uri, name: asset.name }]);
      } 
      // Проверка для старой версии API (без массива assets)
      else if (res.type === 'success' && res.uri) {
        console.log('Выбран документ (старый API):', res.name, res.uri);
        setFiles(prev => [...prev, { uri: res.uri, name: res.name || 'Документ' }]);
      } 
      else if (res.type === 'cancel') {
        console.log('Выбор документа отменен пользователем');
      } 
      else {
        console.warn('Неизвестный результат DocumentPicker:', res);
        Alert.alert('Ошибка', 'Не удалось выбрать документ.');
      }
    } catch (e) {
      console.warn('Ошибка при выборе документа:', e);
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

  const cancelEdit = () => {
    setEditingIndex(null);
  };

  return (
    <View style={styles.container}>
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
                  <TouchableOpacity
                    onPress={() => startEditing(idx, file.name)}
                    style={styles.actionBtn}
                  >
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

        {/* Кнопка выбора документа */}
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