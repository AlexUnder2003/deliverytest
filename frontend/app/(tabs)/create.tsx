// app/(tabs)/CreateDeliveryScreen.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import CourierSheet from '@/components/bottom-sheets/CourierSheet';
import StatusSheet from '@/components/bottom-sheets/StatusSheet';
import TextInputSheet from '@/components/bottom-sheets/TextInputSheet';
import { deliveryApi, StatusOption, TransportModel } from '@/services/api';

/* ─────────────  запасные данные ───────────── */

const FALLBACK_STATUS_OPTIONS = [
  { key: 'waiting', label: 'В ожидании', color: '#A06A1B' },
  { key: 'delivered', label: 'Доставлен', color: '#1B7F4C' },
];
const FALLBACK_TECH_OPTIONS = [
  { key: 'ok', label: 'Исправно', color: '#18805B' },
  { key: 'faulty', label: 'Неисправно', color: '#D32F2F' },
  { key: 'repair', label: 'На ремонте', color: '#D98D2B' },
];

const Divider = () => <View style={styles.divider} />;

/* ───────────────────────────────────────────── */

export default function CreateDeliveryScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    dispatchDate?: string;
    dispatchTime?: string;
    deliveryDate?: string;
    deliveryTime?: string;
    distance?: string;
    service?: string;
    serviceId?: string;
    packaging?: string;
    packagingId?: string;
    files?: string;
  }>();

  /* ─── state ─── */

  const [serviceTitle, setServiceTitle] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);

  const [packagingTitle, setPackagingTitle] = useState('');
  const [selectedPackagingId, setSelectedPackagingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [transportModels, setTransportModels] = useState<TransportModel[]>([]);
  const [statusOptions, setStatusOptions] = useState<StatusOption[]>(FALLBACK_STATUS_OPTIONS);
  const [techOptions, setTechOptions] = useState<StatusOption[]>(FALLBACK_TECH_OPTIONS);

  const [attachedFiles, setAttachedFiles] = useState<Array<{ uri: string; name: string }>>([]);

  const [selectedModel, setSelectedModel] = useState('');
  const [selectedModelName, setSelectedModelName] = useState('Выберите модель');
  const [number, setNumber] = useState('');
  const [courierSheetOpen, setCourierSheetOpen] = useState(false);

  const [dispatchDate, setDispatchDate] = useState(new Date());
  const [dispatchTime, setDispatchTime] = useState(new Date());
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [deliveryTime, setDeliveryTime] = useState(new Date());
  const [distance, setDistance] = useState('2 км');

  const [status, setStatus] = useState<StatusOption>(FALLBACK_STATUS_OPTIONS[0]);
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [tech, setTech] = useState<StatusOption>(FALLBACK_TECH_OPTIONS[0]);
  const [techSheetOpen, setTechSheetOpen] = useState(false);

  const [fio, setFio] = useState('');
  const [fioSheetOpen, setFioSheetOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);

  /* ─── справочники ─── */

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [models, statuses, techStatuses] = await Promise.all([
          deliveryApi.getTransportModels(),
          deliveryApi.getDeliveryStatuses(),
          deliveryApi.getTechStatuses(),
        ]);
        setTransportModels(models);
        setStatusOptions(statuses);
        setTechOptions(techStatuses);
        if (models.length) {
          setSelectedModel(models[0].key);
          setSelectedModelName(models[0].name);
        }
        if (statuses.length) setStatus(statuses[0]);
        if (techStatuses.length) setTech(techStatuses[0]);
      } catch (err) {
        console.error(err);
        setError('Не удалось загрузить справочные данные.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ─── query-params → state ─── */

  useEffect(() => {
    if (params.dispatchDate) setDispatchDate(new Date(params.dispatchDate));
    if (params.dispatchTime) setDispatchTime(new Date(params.dispatchTime));
    if (params.deliveryDate) setDeliveryDate(new Date(params.deliveryDate));
    if (params.deliveryTime) setDeliveryTime(new Date(params.deliveryTime));
    if (params.distance) setDistance(params.distance);

    if (params.service !== undefined) setServiceTitle(params.service);
    if (params.serviceId !== undefined) setSelectedServiceId(Number(params.serviceId));

    if (params.packaging !== undefined) setPackagingTitle(params.packaging);
    if (params.packagingId !== undefined) setSelectedPackagingId(Number(params.packagingId));

    if (params.files) {
      try {
        setAttachedFiles(JSON.parse(params.files));
      } catch {
        console.warn('Cannot parse files param');
      }
    }
  }, [params]);

  /* ─── helpers ─── */

  const renderTransit = () => {
    const start = new Date(
      dispatchDate.getFullYear(),
      dispatchDate.getMonth(),
      dispatchDate.getDate(),
      dispatchTime.getHours(),
      dispatchTime.getMinutes(),
    );
    const end = new Date(
      deliveryDate.getFullYear(),
      deliveryDate.getMonth(),
      deliveryDate.getDate(),
      deliveryTime.getHours(),
      deliveryTime.getMinutes(),
    );
    const diffMin = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    return `${Math.floor(diffMin / 60)}ч ${diffMin % 60}м`;
  };

  const handleModelSelect = (key: string) => {
    setSelectedModel(key);
    const model = transportModels.find(m => m.key === key);
    if (model) setSelectedModelName(model.name);
  };

  /* ─── create ─── */

  const handleCreateDelivery = async () => {
    if (!selectedModel || !number) {
      Alert.alert('Ошибка', 'Выберите модель и номер транспорта');
      return;
    }

    setLoading(true);
    try {
      const dispatchDateTime = new Date(
        dispatchDate.getFullYear(),
        dispatchDate.getMonth(),
        dispatchDate.getDate(),
        dispatchTime.getHours(),
        dispatchTime.getMinutes(),
      ).toISOString();

      const deliveryDateTime = new Date(
        deliveryDate.getFullYear(),
        deliveryDate.getMonth(),
        deliveryDate.getDate(),
        deliveryTime.getHours(),
        deliveryTime.getMinutes(),
      ).toISOString();

      const payload: Record<string, any> = {
        transport_model: Number(selectedModel),
        transport_number: number,
        dispatch_datetime: dispatchDateTime,
        delivery_datetime: deliveryDateTime,
        distance,
        status: Number(status.key),
        technical_condition: Number(tech.key),
        collector: fio,
        comment,
        ...(selectedServiceId != null && { service: selectedServiceId }),
        ...(selectedPackagingId != null && { packaging: selectedPackagingId }),
      };

      if (attachedFiles.length) {
        await deliveryApi.createDeliveryWithFiles(payload, attachedFiles);
      } else {
        await deliveryApi.createDelivery(payload);
      }

      // Показываем сообщение об успехе без кнопки OK и колбэка
      Alert.alert('Успех', 'Доставка создана');
      
      // Перенаправляем на главную страницу с параметром refresh
      router.replace({
        pathname: '/(tabs)/',
        params: { refresh: Date.now().toString() }
      });
    } catch (err) {
      console.error(err);
      Alert.alert('Ошибка', 'Не удалось создать доставку');
    } finally {
      setLoading(false);
    }
  };

  /* ─── UI ─── */

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#B2D0FF" />
        <Text style={styles.loadingText}>Загрузка…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => fetchReferenceData()}>
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
            {selectedModelName}, №{number || 'не указан'}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* Transit time */}
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
              {dispatchTime.getHours().toString().padStart(2, '0')}:
              {dispatchTime.getMinutes().toString().padStart(2, '0')}
              {'\n'}Доставка: {deliveryDate.toLocaleDateString()}{' '}
              {deliveryTime.getHours().toString().padStart(2, '0')}:
              {deliveryTime.getMinutes().toString().padStart(2, '0')}
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
              params: { distance, returnTo: 'create' },
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
          onPress={() =>
            router.push({
              pathname: '/file-manager',
              params: { returnTo: router.pathname, files: JSON.stringify(attachedFiles) },
            })
          }
        >
          <Ionicons name="document-attach-outline" size={20} color="#fff" style={styles.rowIcon} />
          <Text style={styles.rowLabel}>
            Файлы {attachedFiles.length ? `(${attachedFiles.length})` : ''}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* Service */}
        <Text style={styles.sectionLabel}>УСЛУГА</Text>
        <TouchableOpacity
          style={styles.row}
          onPress={() =>
            router.push({
              pathname: '/services-menu',
              params: {
                returnTo: router.pathname,
                service: serviceTitle,
                serviceId: selectedServiceId ?? undefined,
              },
            })
          }
        >
          <Ionicons name="apps-outline" size={20} color="#fff" style={styles.rowIcon} />
          <Text style={styles.rowLabel}>{serviceTitle || 'Выбрать услугу'}</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* Status */}
        <Text style={styles.sectionLabel}>СТАТУС</Text>
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
                returnTo: router.pathname,
                packaging: packagingTitle,
                packagingId: selectedPackagingId ?? undefined,
              },
            })
          }
        >
          <Ionicons name="cube-outline" size={20} color="#fff" style={styles.rowIcon} />
          <Text style={styles.rowLabel}>{packagingTitle || 'Выбрать упаковку'}</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* Tech condition */}
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

        {/* Collector */}
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

      {/* Create button */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.createBtnModal} onPress={handleCreateDelivery}>
          <Text style={styles.createBtnTextModal}>Создать доставку</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom sheets */}
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
        multiline
      />
    </View>
  );
}

/* ─────────────  стили ───────────── */

const styles = StyleSheet.create({
  badgeSmall: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  rowContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  pill: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  container: { flex: 1, backgroundColor: '#23262B', paddingTop: Platform.OS === 'ios' ? 44 : 24 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  sectionLabel: {
    color: '#B2B2B2',
    fontSize: 13,
    marginTop: 12,
    marginBottom: 4,
    fontWeight: 'bold',
    letterSpacing: 1,
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23262B',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 4,
  },
  rowIcon: { marginRight: 12 },
  rowLabel: { color: '#fff', flex: 1 },
  rowValue: { color: '#fff', fontWeight: 'bold', marginRight: 8 },
  rowSubValue: { color: '#B2B2B2', fontSize: 13 },

  divider: { height: 1, backgroundColor: '#2C3036', marginHorizontal: 16 },
  createBtnModal: { backgroundColor: '#18805B', borderRadius: 16, paddingVertical: 14, alignItems: 'center', margin: 16 },
  createBtnTextModal: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scrollContent: { paddingBottom: 160 },
  footer: { position: 'absolute', left: 0, right: 0, bottom: 40, backgroundColor: '#23262B', padding: 16 },

  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 12 },
  errorBanner: { backgroundColor: '#512020', padding: 12, margin: 16, borderRadius: 8 },
  errorText: { color: '#fff' },
  retryText: { color: '#B2D0FF', marginTop: 4, fontWeight: 'bold' },
});
