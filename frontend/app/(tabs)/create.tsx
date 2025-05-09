// app/(tabs)/create.tsx

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';

import CourierSheet from '@/components/bottom-sheets/CourierSheet';
import StatusSheet from '@/components/bottom-sheets/StatusSheet';
import TextInputSheet from '@/components/bottom-sheets/TextInputSheet';
import { Alert } from 'react-native';
import { deliveryApi, StatusOption, TransportModel } from '@/services/api';

const Divider = () => <View style={styles.divider} />;

// Запасные данные на случай ошибки загрузки
const FALLBACK_STATUS_OPTIONS = [
  { key: 'waiting', label: 'В ожидании', color: '#A06A1B' },
  { key: 'delivered', label: 'Доставлен', color: '#1B7F4C' },
];

const FALLBACK_TECH_OPTIONS = [
  { key: 'ok', label: 'Исправно', color: '#18805B' },
  { key: 'faulty', label: 'Неисправно', color: '#D32F2F' },
  { key: 'repair', label: 'На ремонте', color: '#D98D2B' },
];

export default function CreateDeliveryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    dispatchDate?: string;
    dispatchTime?: string;
    deliveryDate?: string;
    deliveryTime?: string;
    id?: string;
    distance?: string;
    service?: string;
    packaging?: string;
  }>();

  // Состояния для загрузки данных
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Справочники
  const [transportModels, setTransportModels] = useState<TransportModel[]>([]);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>(FALLBACK_STATUS_OPTIONS);
  const [techOptions, setTechOptions] = useState<StatusOption[]>(FALLBACK_TECH_OPTIONS);

  // Courier
  const [selectedModel, setSelectedModel] = useState('');
  const [selectedModelName, setSelectedModelName] = useState('Выберите модель');
  const [number, setNumber] = useState('');
  const [courierSheetOpen, setCourierSheetOpen] = useState(false);

  // Transit-time
  const [dispatchDate, setDispatchDate] = useState(new Date());
  const [dispatchTime, setDispatchTime] = useState(new Date());
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [deliveryTime, setDeliveryTime] = useState(new Date());
  const [distance, setDistance] = useState('2 км');

  // Delivery status sheet
  const [status, setStatus] = useState<StatusOption>(FALLBACK_STATUS_OPTIONS[0]);
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);

  // Tech condition sheet
  const [tech, setTech] = useState<StatusOption>(FALLBACK_TECH_OPTIONS[0]);
  const [techSheetOpen, setTechSheetOpen] = useState(false);

  // FIO sheet
  const [fio, setFio] = useState('');
  const [fioSheetOpen, setFioSheetOpen] = useState(false);

  // Comment sheet
  const [comment, setComment] = useState('');
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);

  // Загрузка справочников при монтировании компонента
  useEffect(() => {
    fetchReferenceData();
  }, []);

  // Функция для загрузки всех справочников
  const fetchReferenceData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Загружаем все справочники параллельно
      const [models, statuses, techStatuses] = await Promise.all([
        deliveryApi.getTransportModels(),
        deliveryApi.getDeliveryStatuses(),
        deliveryApi.getTechStatuses(),
      ]);
      
      setTransportModels(models);
      setStatusOptions(statuses);
      setTechOptions(techStatuses);
      
      // Устанавливаем начальные значения из загруженных данных
      if (models.length > 0) {
        setSelectedModel(models[0].key);
        setSelectedModelName(models[0].name);
      }
      
      if (statuses.length > 0) {
        setStatus(statuses[0]);
      }
      
      if (techStatuses.length > 0) {
        setTech(techStatuses[0]);
      }
      
    } catch (err) {
      console.error('Ошибка при загрузке справочников:', err);
      setError('Не удалось загрузить справочные данные. Используются значения по умолчанию.');
    } finally {
      setLoading(false);
    }
  };

  // Init from params (для дат/времени)
  useEffect(() => {
    if (params.dispatchDate) setDispatchDate(new Date(params.dispatchDate));
    if (params.dispatchTime) setDispatchTime(new Date(params.dispatchTime));
    if (params.deliveryDate) setDeliveryDate(new Date(params.deliveryDate));
    if (params.deliveryTime) setDeliveryTime(new Date(params.deliveryTime));
  }, [params]);

  useEffect(() => {
    if (params.distance) setDistance(params.distance);
  }, [params.distance]);

  // Calculate transit
  const renderTransit = () => {
    const start = new Date(
      dispatchDate.getFullYear(),
      dispatchDate.getMonth(),
      dispatchDate.getDate(),
      dispatchTime.getHours(),
      dispatchTime.getMinutes()
    );
    const end = new Date(
      deliveryDate.getFullYear(),
      deliveryDate.getMonth(),
      deliveryDate.getDate(),
      deliveryTime.getHours(),
      deliveryTime.getMinutes()
    );
    const diff = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    return `${Math.floor(diff / 60)}ч ${diff % 60}м`;
  };

  // Обработчик выбора модели транспорта
  const handleModelSelect = (modelKey: string) => {
    setSelectedModel(modelKey);
    const selectedModelObj = transportModels.find(model => model.key === modelKey);
    if (selectedModelObj) {
      setSelectedModelName(selectedModelObj.name);
    }
  };

  // Функция для создания доставки
  const handleCreateDelivery = async () => {
    // Проверка обязательных полей
    if (!selectedModel || !number) {
      Alert.alert('Ошибка', 'Пожалуйста, выберите модель и номер курьера');
      return;
    }

    // Преобразуем даты в формат API
    const dispatchDateTime = new Date(
      dispatchDate.getFullYear(), 
      dispatchDate.getMonth(), 
      dispatchDate.getDate(),
      dispatchTime.getHours(), 
      dispatchTime.getMinutes()
    ).toISOString();
    
    const deliveryDateTime = new Date(
      deliveryDate.getFullYear(), 
      deliveryDate.getMonth(), 
      deliveryDate.getDate(),
      deliveryTime.getHours(), 
      deliveryTime.getMinutes()
    ).toISOString();

    // Находим ID модели транспорта
    const modelObj = transportModels.find(model => model.key === selectedModel);
    if (!modelObj) {
      Alert.alert('Ошибка', 'Не удалось определить ID модели транспорта');
      return;
    }

    // Находим ID статуса доставки
    const statusObj = statusOptions.find(s => s.key === status.key);
    if (!statusObj) {
      Alert.alert('Ошибка', 'Не удалось определить ID статуса доставки');
      return;
    }

    // Находим ID технического состояния
    const techObj = techOptions.find(t => t.key === tech.key);
    if (!techObj) {
      Alert.alert('Ошибка', 'Не удалось определить ID технического состояния');
      return;
    }

    // Подготовка данных для отправки
    const deliveryData = {
      transport_model_id: parseInt(modelObj.key), // Преобразуем в число, если key - это строка с числом
      transport_number: number,
      dispatch_datetime: dispatchDateTime,
      delivery_datetime: deliveryDateTime,
      distance: distance,
      service: params.service || '',
      packaging: params.packaging || '',
      status_id: parseInt(statusObj.key), // Преобразуем в число, если key - это строка с числом
      technical_condition_id: parseInt(techObj.key), // Преобразуем в число, если key - это строка с числом
      collector: fio,
      comment: comment
    };

    try {
      // Отображаем индикатор загрузки
      Alert.alert('Создание доставки', 'Пожалуйста, подождите...');
      
      // Отправляем данные на сервер
      const success = await deliveryApi.createDelivery(deliveryData);
      
      if (success) {
        Alert.alert('Успешно', 'Доставка успешно создана', [
          { 
            text: 'OK', 
            onPress: () => router.replace('/(tabs)/') 
          }
        ]);
      } else {
        Alert.alert('Ошибка', 'Не удалось создать доставку. Пожалуйста, попробуйте еще раз.');
      }
    } catch (error) {
      console.error('Ошибка при создании доставки:', error);
      Alert.alert('Ошибка', 'Произошла ошибка при создании доставки');
    }
  };

  // Если данные загружаются, показываем индикатор загрузки
  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#B2D0FF" />
        <Text style={styles.loadingText}>Загрузка данных...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={fetchReferenceData}>
            <Text style={styles.retryText}>Повторить</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>Новая доставка</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Courier */}
        <Text style={styles.sectionLabel}>КУРЬЕР</Text>
        <TouchableOpacity style={styles.row} onPress={() => setCourierSheetOpen(true)}>
          <Ionicons name="cart-outline" size={20} color="#fff" style={styles.rowIcon} />
          <Text style={styles.rowLabel}>
            {selectedModel ? `${selectedModelName}, №${number || 'не указан'}` : 'Выберите модель и номер'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* Transit Time */}
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            router.push({
              pathname: '/transit-time',
              params: {
                dispatchDate: dispatchDate.toISOString(),
                dispatchTime: dispatchTime.toISOString(),
                deliveryDate: deliveryDate.toISOString(),
                deliveryTime: deliveryTime.toISOString(),
              },
            })
          }
        >
          <Ionicons name="time-outline" size={20} color="#fff" style={styles.rowIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Время в пути</Text>
            <Text style={styles.rowSubValue}>
              Отправка: {dispatchDate.toLocaleDateString()}{' '}
              {String(dispatchTime.getHours()).padStart(2, '0')}:
              {String(dispatchTime.getMinutes()).padStart(2, '0')}
              {'\n'}Доставка: {deliveryDate.toLocaleDateString()}{' '}
              {String(deliveryTime.getHours()).padStart(2, '0')}:
              {String(deliveryTime.getMinutes()).padStart(2, '0')}
            </Text>
          </View>
          <Text style={styles.rowValue}>{renderTransit()}</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* Distance */}
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            router.push({
              pathname: '/distance',
              params: {
                distance,           // текущее значение, чтобы пользователь видел его в поле
                returnTo: 'create', // куда вернуться после «Применить»
              },
            })
          }
        >
          <Ionicons name="location-outline" size={20} color="#fff" style={styles.rowIcon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Дистанция</Text>
            <Text style={styles.rowSubValue}>Откуда{'\n'}Куда</Text>
          </View>
          <Text style={styles.rowValue}>{distance}</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* Files */}
        <TouchableOpacity
          style={styles.row}
          onPress={() => router.push('/file-manager')}
        >
          <Ionicons name="document-attach-outline" size={20} color="#fff" style={styles.rowIcon} />
          <Text style={styles.rowLabel}>Файлы</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* Service */}
        <Text style={styles.sectionLabel}>СТАТУС</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            router.push({
              pathname: '/services-menu',
              params: {
                returnTo: router.pathname,        // ← '/(tabs)/create'
                ...(params.id ? { id: params.id } : {}),
                // если нужно сохранить уже выбранный service при повторном открытии
                ...(params.service ? { service: params.service } : {}),
              },
            })
          }
        >
          <Ionicons name="apps-outline" size={20} color="#fff" style={styles.rowIcon} />
          <Text style={styles.rowLabel}>{params.service ?? 'Выбрать услугу'}</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* Delivery Status */}
        <TouchableOpacity style={styles.row} onPress={() => setStatusSheetOpen(true)}>
          <Ionicons name="reload-outline" size={20} color="#fff" style={styles.rowIcon} />
          <Text style={styles.rowLabel}>Статус доставки</Text>
          <View style={styles.rowContent}>
            <View style={[styles.pill, { backgroundColor: status.color }]}>
              <Text style={styles.pillText}>{status.label}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* Packaging */}
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            router.push({
              pathname: '/packaging',
              params: {
                returnTo: router.pathname,            // ← '/(tabs)/create'
                ...(params.id ? { id: params.id } : {}),
                ...(params.packaging ? { packaging: params.packaging } : {}),
              },
            })
          }
        >
          <Ionicons name="cube-outline" size={20} color="#fff" style={styles.rowIcon} />
          <Text style={styles.rowLabel}>{params.packaging ?? 'Выбрать упаковку'}</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* Tech Condition */}
        <TouchableOpacity style={styles.row} onPress={() => setTechSheetOpen(true)}>
          <Ionicons name="settings-outline" size={20} color="#fff" style={styles.rowIcon} />
          <Text style={styles.rowLabel}>Техническое состояние</Text>
          <View style={styles.rowContent}>
            <View style={[styles.pill, { backgroundColor: tech.color }]}>
              <Text style={styles.pillText}>{tech.label}</Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* FIO */}
        <Text style={styles.sectionLabel}>СБОРЩИК</Text>
        <TouchableOpacity style={styles.row} onPress={() => setFioSheetOpen(true)}>
          <Ionicons name="person-outline" size={20} color="#fff" style={styles.rowIcon} />
          <Text style={styles.rowLabel}>{fio || 'Выбрать ФИО'}</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* Comment */}
        <TouchableOpacity style={styles.row} onPress={() => setCommentSheetOpen(true)}>
          <Ionicons name="chatbubble-outline" size={20} color="#fff" style={styles.rowIcon} />
          <Text style={styles.rowLabel}>{comment || 'Добавить комментарий'}</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />
      </ScrollView>

      {/* Fixed Create Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.createBtnModal}
          onPress={handleCreateDelivery}
        >
          <Text style={styles.createBtnTextModal}>Создать доставку</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Sheets */}
      <StatusSheet
        title="Статус доставки"
        options={statusOptions}
        selectedOption={status}
        onSelect={setStatus}
        isOpen={statusSheetOpen}
        onClose={() => setStatusSheetOpen(false)}
      />

      <StatusSheet
        title="Тех. исправность"
        options={techOptions}
        selectedOption={tech}
        onSelect={setTech}
        isOpen={techSheetOpen}
        onClose={() => setTechSheetOpen(false)}
      />

      <CourierSheet
        models={transportModels}
        selectedModel={selectedModel}
        number={number}
        onModelChange={handleModelSelect}
        onNumberChange={setNumber}
        isOpen={courierSheetOpen}
        onClose={() => setCourierSheetOpen(false)}
      />

      <TextInputSheet
        title="Выберите ФИО"
        value={fio}
        onValueChange={setFio}
        isOpen={fioSheetOpen}
        onClose={() => setFioSheetOpen(false)}
        placeholder="Введите ФИО"
      />

      <TextInputSheet
        title="Комментарий"
        value={comment}
        onValueChange={setComment}
        isOpen={commentSheetOpen}
        onClose={() => setCommentSheetOpen(false)}
        placeholder="Введите комментарий"
        multiline={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  badgeSmall: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  rowContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  pill: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  container: { flex: 1, backgroundColor: '#23262B', paddingTop: Platform.OS === 'ios' ? 44 : 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingHorizontal: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  sectionLabel: { color: '#B2B2B2', fontSize: 13, marginTop: 12, marginBottom: 4, fontWeight: 'bold', letterSpacing: 1, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#23262B', borderRadius: 12, padding: 16, marginHorizontal: 16, marginVertical: 4 },
  rowIcon: { marginRight: 12 },
  rowLabel: { color: '#fff', flex: 1 },
  rowValue: { color: '#fff', fontWeight: 'bold', marginRight: 8 },
  rowSubValue: { color: '#B2B2B2', fontSize: 13 },

  divider: { height: 1, backgroundColor: '#2C3036', marginHorizontal: 16 },
  createBtnModal: { backgroundColor: '#18805B', borderRadius: 16, paddingVertical: 14, alignItems: 'center', margin: 16 },
  createBtnTextModal: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scrollContent: {
    paddingBottom: 160, // отступ снизу, чтобы контент не упирался в кнопку
  },
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 40,
    backgroundColor: '#23262B', padding: 16,
  },
});