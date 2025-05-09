// app/services-menu.tsx

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { deliveryApi, ServiceItem } from '@/services/api';

// Резервные данные на случай ошибки загрузки
const FALLBACK_SERVICES = [
  { id: 1, key: 'to-client', title: 'До клиента', subtitle: '8 позиций' },
  { id: 2, key: 'between-stores', title: 'Перемещение между складами', subtitle: '8 позиций' },
];

const numColumns = 2;
const { width } = Dimensions.get('window');
const ITEM_WIDTH = (width - 16 * 3) / numColumns;

export default function ServicesMenuScreen() {
  const router = useRouter();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  type Params = {
    returnTo?: string;     // куда вернуться
    id?: string;           // если редактируем существующую запись
    [key: string]: string; // остальные query-параметры
  };
  
  const params = useLocalSearchParams<Params>();

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchServices();
  }, []);

  // Функция для загрузки услуг из API
  const fetchServices = async () => {
    try {
      setLoading(true);
      const data = await deliveryApi.getServices();
      setServices(data);
      setError(null);
    } catch (err) {
      console.error('Ошибка при загрузке услуг:', err);
      setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
      setServices(FALLBACK_SERVICES);
    } finally {
      setLoading(false);
    }
  };

  const onSelect = (item: ServiceItem) => {
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

  // Обработчик нажатия кнопки "назад"
  const handleGoBack = () => {
    // Отладочный вывод для проверки параметров
    console.log('Параметры при возврате:', JSON.stringify(params));
    
    // Проверяем наличие параметра returnTo
    if (params.returnTo) {
      // Сохраняем все параметры, кроме returnTo
      const { returnTo, ...restParams } = params;
      
      router.replace({
        pathname: returnTo,
        params: restParams,
      });
    } else {
      // Если параметр returnTo отсутствует, явно указываем путь возврата
      router.replace('/(tabs)/create');
    }
  };

  const renderItem = ({ item }: { item: ServiceItem }) => (
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
        <TouchableOpacity onPress={handleGoBack}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Выбор услуги</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B2D0FF" />
          <Text style={styles.loadingText}>Загрузка услуг...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchServices}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderItem}
          keyExtractor={(item) => item.key}
          numColumns={numColumns}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={fetchServices}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: '#ff6b6b',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#35363B',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  retryButtonText: {
    color: '#fff',
  },
});
