import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';

// Импортируем API
import { deliveryApi, DeliveryListItem } from '@/services/api';

// Цвета статусов
const statusColors: Record<string, string> = {
  'Проведен': '#1B7F4C',
  'Исправно': '#18805B',
  'В ожидании': '#A06A1B',
};

export default function DeliveriesScreen() {
  const router = useRouter();
  const [deliveries, setDeliveries] = useState<DeliveryListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Функция для загрузки доставок из API
  const fetchDeliveries = async () => {
    try {
      setLoading(true);
      const data = await deliveryApi.getDeliveries();
      setDeliveries(data);
    } catch (err) {
      console.error('Ошибка при загрузке доставок:', err);
      setError('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }: { item: DeliveryListItem }) => (
    <TouchableOpacity
      style={styles.item}
      activeOpacity={0.8}
      onPress={() => router.push(`/${item.id}`)}
    >
      <Text style={styles.cardNumber}>№{item.id}</Text>

      <View style={styles.cardRow}>
        <Ionicons name="time-outline" size={16} color="#B2B2B2" style={{ marginRight: 4 }} />
        <Text style={styles.cardInfo}>{item.time}</Text>

        <Ionicons name="car-outline" size={16} color="#B2B2B2" style={{ marginLeft: 12, marginRight: 4 }} />
        <Text style={styles.cardInfo}>{item.distance}</Text>

        {item.fragile && (
          <>
            <Ionicons name="cube-outline" size={16} color="#B2B2B2" style={{ marginLeft: 12, marginRight: 4 }} />
            <Text style={styles.cardInfo}>Хрупкий груз</Text>
          </>
        )}
      </View>

      <View style={styles.cardRow}>
        <Ionicons name="cube" size={16} color="#B2B2B2" style={{ marginRight: 4 }} />
        <Text style={styles.cardInfo}>{item.package}</Text>

        {item.toClient && (
          <>
            <Ionicons name="location-outline" size={16} color="#B2B2B2" style={{ marginLeft: 12, marginRight: 4 }} />
            <Text style={styles.cardInfo}>До клиента</Text>
          </>
        )}
      </View>

      <View style={styles.statusRow}>
        {item.statuses.map(status => (
          <View
            key={status}
            style={[styles.statusBtn, { backgroundColor: statusColors[status] || '#444' }]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Доставки</Text>
        <View style={styles.headerIcons}>
          <Ionicons name="filter" size={22} color="#fff" style={{ marginRight: 16 }} />
          <Ionicons name="search" size={22} color="#fff" />
        </View>
      </View>

      {/* Filters */}
      <View style={styles.filtersRow}>
        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="time-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.filterText}>Все время пути</Text>
          <Ionicons name="chevron-down" size={14} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.filterBtn}>
          <Ionicons name="car-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
          <Text style={styles.filterText}>Все дистанции</Text>
          <Ionicons name="chevron-down" size={14} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Состояние загрузки */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#B2D0FF" />
          <Text style={styles.loadingText}>Загрузка доставок...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchDeliveries}>
            <Text style={styles.retryButtonText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Deliveries List */
        <FlatList
          data={deliveries}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 120 }}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          refreshing={loading}
          onRefresh={fetchDeliveries}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/create')}>
        <Ionicons name="add" size={32} color="#22272B" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#22272B',
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filtersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#31363B',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
    marginRight: 4,
  },
  item: {
    paddingVertical: 12,
  },
  cardNumber: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardInfo: {
    color: '#B2B2B2',
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginRight: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#383C42',
    marginVertical: 6,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 90,
    backgroundColor: '#B2D0FF',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});
