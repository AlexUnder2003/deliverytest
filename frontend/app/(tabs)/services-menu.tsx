// app/services-menu.tsx

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

const SERVICES = [
  { key: 'to-client', title: 'До клиента', subtitle: '8 позиций' },
  { key: 'between-stores', title: 'Перемещение между складами', subtitle: '8 позиций' },
  { key: 'individual', title: 'Физ.лицо', subtitle: '8 items' },
  { key: 'legal', title: 'Юр.лицо', subtitle: '8 позиции' },
  { key: 'documents', title: 'Документы', subtitle: '8 позиции' },
  { key: 'medical', title: 'Мед.товары', subtitle: '8 позиции' },
  { key: 'special', title: 'Особые товары', subtitle: '8 позиции' },
  { key: 'other', title: 'Другое', subtitle: '8 позиции' },
  { key: 'temp-mode', title: 'Температурный режим', subtitle: '', withButton: true },
  { key: 'fragile', title: 'Хрупкий груз', subtitle: '', withButton: true },
];

const numColumns = 2;
const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 16 * 3) / numColumns;

export default function ServicesMenuScreen() {
  const router = useRouter();
  type Params = {
    returnTo?: string;     // куда вернуться
    id?: string;           // если редактируем существующую запись
    [key: string]: string; // остальные query-параметры
  };
  
  const params = useLocalSearchParams<Params>();

  const onSelect = (item: typeof SERVICES[0]) => {
    const { returnTo, id, ...rest } = params;
  
    router.replace({
      pathname: returnTo ?? '/(tabs)/create', // запасной вариант
      params: {
        ...rest,
        service: item.title,      // выбранная услуга
        ...(id ? { id } : {}),
      },
    });
  };

  const renderItem = ({ item }: { item: typeof SERVICES[0] }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onSelect(item)}
    >
      <Text style={styles.title}>{item.title}</Text>
      {item.subtitle ? (
        <Text style={styles.subtitle}>{item.subtitle}</Text>
      ) : null}
      {item.withButton ? (
        <View style={styles.button}>
          <Text style={styles.buttonText}>Добавить</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Выбор услуги</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={SERVICES}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23262B',
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  card: {
    width: ITEM_WIDTH,
    backgroundColor: '#2C3036',
    borderRadius: 8,
    padding: 12,
    justifyContent: 'space-between',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    color: '#AAA',
    fontSize: 12,
    marginBottom: 8,
  },
  button: {
    marginTop: 12,
    backgroundColor: '#35363B',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
  },
});
