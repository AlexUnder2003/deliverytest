// app/(tabs)/[id]/view.tsx

import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';

import {
  deliveryApi,
  Delivery,
  StatusOption as DeliveryStatus,
  TransportModel,
  StatusOption as TechStatus,
} from '@/services/api';
import StatusSheet from '@/components/bottom-sheets/StatusSheet';
import TextInputSheet from '@/components/bottom-sheets/TextInputSheet';
import CourierSheet from '@/components/bottom-sheets/CourierSheet';

const Divider = () => <View style={styles.divider} />;

export default function ViewDeliveryScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const returnPath = pathname || '/(tabs)/create';
  const {
    id,
    distance: qDistance,
    service: qService,
    packaging: qPackaging,
  } = useLocalSearchParams<{ id: string; distance?: string; service?: string; packaging?: string }>();

  // Reference data
  const [loadingRefs, setLoadingRefs] = useState(true);
  const [transportModels, setTransportModels] = useState<TransportModel[]>([]);
  const [statusOptions, setStatusOptions] = useState<DeliveryStatus[]>([]);
  const [techOptions, setTechOptions] = useState<TechStatus[]>([]);

  // Delivery data
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Editable fields
  const [selectedModel, setSelectedModel] = useState('');
  const [modelName, setModelName] = useState('');
  const [number, setNumber] = useState('');
  const [dispatchDate, setDispatchDate] = useState(new Date());
  const [dispatchTime, setDispatchTime] = useState(new Date());
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [deliveryTime, setDeliveryTime] = useState(new Date());
  const [distance, setDistance] = useState('');
  const [service, setService] = useState('');
  const [packaging, setPackaging] = useState('');
  const [status, setStatus] = useState<DeliveryStatus>({ key: '', label: '', color: '' });
  const [tech, setTech] = useState<TechStatus>({ key: '', label: '', color: '' });
  const [collectorName, setCollectorName] = useState('');
  const [comment, setComment] = useState('');

  // Bottom sheets
  const [courierSheetOpen, setCourierSheetOpen] = useState(false);
  const [statusSheetOpen, setStatusSheetOpen] = useState(false);
  const [techSheetOpen, setTechSheetOpen] = useState(false);
  const [fioSheetOpen, setFioSheetOpen] = useState(false);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);

  // Load reference data
  useEffect(() => {
    (async () => {
      try {
        const [models, statuses, techs] = await Promise.all([
          deliveryApi.getTransportModels(),
          deliveryApi.getDeliveryStatuses(),
          deliveryApi.getTechStatuses(),
        ]);
        setTransportModels(models);
        setStatusOptions(statuses);
        setTechOptions(techs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRefs(false);
      }
    })();
  }, []);

  // Load delivery
  useEffect(() => {
    if (!id) return;
    deliveryApi.getDeliveryById(id).then(setDelivery);
  }, [id]);

  // Initialize fields when delivery arrives
  useEffect(() => {
    if (!delivery) return;
    // Find model key by name
    const modelObj = transportModels.find(m => m.name === delivery.model);
    setSelectedModel(modelObj?.key ?? '');
    setModelName(delivery.model);
    setNumber(delivery.number);
    setDispatchDate(new Date(delivery.dispatchDate));
    setDispatchTime(new Date(`${delivery.dispatchDate}T${delivery.dispatchTime}`));
    setDeliveryDate(new Date(delivery.deliveryDate));
    setDeliveryTime(new Date(`${delivery.deliveryDate}T${delivery.deliveryTime}`));
    setDistance(delivery.distance);
    setService(delivery.service);
    setPackaging(delivery.packaging);
    setStatus(delivery.status);
    setTech(delivery.tech);
    setCollectorName(delivery.collectorName);
    setComment(delivery.comment);
    
    // Инициализация файлов, если они есть в доставке
    if (delivery.files) {
      try {
        setAttachedFiles(JSON.parse(delivery.files));
      } catch (e) {
        console.warn('Не удалось распарсить файлы доставки', e);
        setAttachedFiles([]);
      }
    }
  }, [delivery, transportModels]);

  // Apply query params overrides
  useEffect(() => {
    if (qDistance) setDistance(qDistance);
    if (qService) setService(qService);
    if (qPackaging) setPackaging(qPackaging);
  }, [qDistance, qService, qPackaging]);

  const transitLabel = () => {
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
    const mins = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    return `${Math.floor(mins / 60)}ч ${mins % 60}м`;
  };

  const onSave = async () => {
    if (!delivery || !id) return;

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

    const data = {
      transport_number: number,
      dispatch_datetime: dispatchDateTime,
      delivery_datetime: deliveryDateTime,
      distance,
      service,
      packaging,
      status_key: status.key,
      tech_key: tech.key,
      collector: collectorName,
      comment,
      files: JSON.stringify(attachedFiles), // Добавляем файлы в данные для сохранения
    };

    const success = await deliveryApi.updateDelivery(id, data);
    if (success) {
      setDelivery({
        ...delivery,
        model: modelName,
        number,
        dispatchDate: dispatchDate.toISOString().slice(0, 10),
        dispatchTime: `${dispatchTime.getHours().toString().padStart(2, '0')}:${dispatchTime
          .getMinutes()
          .toString()
          .padStart(2, '0')}`,
        deliveryDate: deliveryDate.toISOString().slice(0, 10),
        deliveryTime: `${deliveryTime.getHours().toString().padStart(2, '0')}:${deliveryTime
          .getMinutes()
          .toString()
          .padStart(2, '0')}`,
        distance,
        service,
        packaging,
        status,
        tech,
        collectorName,
        comment,
      });
      setIsEditing(false);
      Alert.alert('Успешно', 'Данные доставки обновлены');
    } else {
      Alert.alert('Ошибка', 'Не удалось обновить данные доставки');
    }
  };

  const onDelete = async () => {
    if (!id) return;
    const success = await deliveryApi.deleteDelivery(id);
    if (success) {
      Alert.alert('Успешно', 'Доставка удалена');
      router.back();
    } else {
      Alert.alert('Ошибка', 'Не удалось удалить доставку');
    }
  };

  if (loadingRefs || !delivery) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#B2D0FF" />
        <Text style={styles.loadingText}>Загрузка...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>#{id}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Courier */}
        <Text style={styles.sectionLabel}>КУРЬЕР</Text>
        {isEditing ? (
          <TouchableOpacity style={styles.row} onPress={() => setCourierSheetOpen(true)}>
            <Ionicons name="cart-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>
              {modelName}, №{number}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.row}>
            <Ionicons name="cart-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>
              {delivery.model}, №{delivery.number}
            </Text>
          </View>
        )}
        <Divider />

        {/* Transit Time */}
        {isEditing ? (
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
                  returnTo: returnPath,
                  id,
                },
              })
            }
          >
            <Ionicons name="time-outline" size={20} color="#fff" style={styles.rowIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Время в пути</Text>
              <Text style={styles.rowSubValue}>
                Отправка: {dispatchDate.toLocaleDateString()} {dispatchTime.toLocaleTimeString().slice(0, 5)}
                {'\n'}Доставка: {deliveryDate.toLocaleDateString()} {deliveryTime.toLocaleTimeString().slice(0, 5)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.row}>
            <Ionicons name="time-outline" size={20} color="#fff" style={styles.rowIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.rowLabel}>Время в пути</Text>
              <Text style={styles.rowSubValue}>
                Отправка: {delivery.dispatchDate} {delivery.dispatchTime}
                {'\n'}Доставка: {delivery.deliveryDate} {delivery.deliveryTime}
              </Text>
            </View>
            <Text style={styles.rowValue}>{transitLabel()}</Text>
          </View>
        )}
        <Divider />

        {/* Distance */}
        {isEditing ? (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              router.push({
                pathname: '/distance',
                params: { distance, returnTo: returnPath, returnId: id },
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
        ) : (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Дистанция</Text>
            <Text style={styles.rowValue}>{delivery.distance}</Text>
          </View>
        )}
        <Divider />

        {/* Media File */}
        <TouchableOpacity style={styles.row} onPress={() => {/* TODO: open PDF */}}>
          <Ionicons name="document-attach-outline" size={20} color="#fff" style={styles.rowIcon} />
          <Text style={styles.rowLabel}>{delivery.mediaFile}</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* Service */}
        <Text style={styles.sectionLabel}>СТАТУС</Text>
        {isEditing ? (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              router.push({ pathname: '/services-menu', params: { id, returnTo: returnPath } })
            }
          >
            <Ionicons name="apps-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{service || 'Выбрать услугу'}</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.row}>
            <Ionicons name="apps-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{delivery.service}</Text>
          </View>
        )}
        <Divider />

        {/* Delivery Status */}
        {isEditing ? (
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
        ) : (
          <View style={styles.row}>
            <Ionicons name="reload-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Статус доставки</Text>
            <View style={styles.rowContent}>
              <View style={[styles.pill, { backgroundColor: delivery.status.color }]}>
                <Text style={styles.pillText}>{delivery.status.label}</Text>
              </View>
            </View>
          </View>
        )}
        <Divider />

        {/* Packaging */}
        {isEditing ? (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              router.push({ pathname: '/packaging', params: { id, returnTo: returnPath } })
            }
          >
            <Ionicons name="cube-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{packaging || 'Выбрать упаковку'}</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.row}>
            <Ionicons name="cube-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{delivery.packaging}</Text>
          </View>
        )}
        <Divider />

        {/* Tech Condition */}
        {isEditing ? (
          <TouchableOpacity style={styles.row} onPress={() => setTechSheetOpen(true)}>
            <Ionicons name="settings-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Тех. исправность</Text>
            <View style={styles.rowContent}>
              <View style={[styles.pill, { backgroundColor: tech.color }]}>
                <Text style={styles.pillText}>{tech.label}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.row}>
            <Ionicons name="settings-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Тех. исправность</Text>
            <View style={styles.rowContent}>
              <View style={[styles.pill, { backgroundColor: delivery.tech.color }]}>
                <Text style={styles.pillText}>{delivery.tech.label}</Text>
              </View>
            </View>
          </View>
        )}
        <Divider />

        {/* Collector */}
        <Text style={styles.sectionLabel}>СБОРЩИК</Text>
        {isEditing ? (
          <TouchableOpacity style={styles.row} onPress={() => setFioSheetOpen(true)}>
            <Ionicons name="person-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{collectorName || 'Выбрать ФИО'}</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.row}>
            <Ionicons name="person-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{delivery.collectorName}</Text>
          </View>
        )}
        <Divider />

        {/* Comment */}
        {isEditing ? (
          <TouchableOpacity style={styles.row} onPress={() => setCommentSheetOpen(true)}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{comment || 'Добавить комментарий'}</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.row}>
            <Ionicons name="chatbubble-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{delivery.comment || 'Комментарий отсутствует'}</Text>
          </View>
        )}
        <Divider />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        {isEditing ? (
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
              <Text style={styles.btnText}>Удалить</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveBtn} onPress={onSave}>
              <Text style={styles.btnText}>Сохранить</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.actionBtn} onPress={() => setIsEditing(true)}>
            <Text style={styles.actionBtnText}>Редактировать</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Sheets */}
      <CourierSheet
        models={transportModels}
        selectedModel={selectedModel}
        number={number}
        onModelChange={key => {
          setSelectedModel(key);
          const m = transportModels.find(x => x.key === key);
          if (m) setModelName(m.name);
        }}
        onNumberChange={setNumber}
        isOpen={courierSheetOpen}
        onClose={() => setCourierSheetOpen(false)}
      />

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

      <TextInputSheet
        title="ФИО сборщика"
        value={collectorName}
        onValueChange={setCollectorName}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23262B',
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 8 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { paddingBottom: 160 },
  divider: { height: 1, backgroundColor: '#2C3036', marginHorizontal: 16 },
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
    padding: 16,
    marginHorizontal: 16,
    backgroundColor: '#23262B',
    borderRadius: 12,
    marginVertical: 4,
  },
  rowIcon: { marginRight: 12 },
  rowLabel: { color: '#fff', flex: 1 },
  rowSubValue: { color: '#B2B2B2', fontSize: 13 },
  rowValue: { color: '#fff', fontWeight: 'bold' },
  rowContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  pill: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 80,
    padding: 16,
    backgroundColor: '#23262B',
  },
  actionBtn: {
    backgroundColor: '#18805B',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  actionBtnText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  footerButtons: { flexDirection: 'row', padding: 16 },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#D32F2F',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#18805B',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: '#fff', fontWeight: 'bold' },
});
