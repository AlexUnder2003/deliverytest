// app/(tabs)/[id]/view.tsx
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, usePathname, useRouter } from 'expo-router';
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

import {
  deliveryApi,
  Delivery,
  StatusOption as DeliveryStatus,
  TransportModel,
  StatusOption as TechStatus,
} from '@/services/api';
import CourierSheet   from '@/components/bottom-sheets/CourierSheet';
import StatusSheet    from '@/components/bottom-sheets/StatusSheet';
import TextInputSheet from '@/components/bottom-sheets/TextInputSheet';

/* ──────────────────────────────── */

const Divider = () => <View style={styles.divider} />;

/* ──────────────────────────────── */

export default function ViewDeliveryScreen() {
  const router      = useRouter();
  const returnPath  = usePathname() || '/(tabs)/create';

  const {
    id,
    distance:  qDistance,
    serviceId: qServiceId,
    packagingId: qPackagingId,
  } = useLocalSearchParams<{
    id:          string;
    distance?:   string;
    serviceId?:  string;
    packagingId?:string;
  }>();

  /* ─── справочники ─── */
  const [loadingRefs,   setLoadingRefs]   = useState(true);
  const [transportModels, setTransportModels] = useState<TransportModel[]>([]);
  const [statusOptions,   setStatusOptions]   = useState<DeliveryStatus[]>([]);
  const [techOptions,     setTechOptions]     = useState<TechStatus[]>([]);

  /* ─── данные доставки ─── */
  const [delivery,  setDelivery]  = useState<Delivery | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  /* ─── редактируемое состояние ─── */
  const [selectedModel, setSelectedModel] = useState('');
  const [modelName,     setModelName]     = useState('');
  const [number,        setNumber]        = useState('');
  const [dispatchDate,  setDispatchDate]  = useState(new Date());
  const [dispatchTime,  setDispatchTime]  = useState(new Date());
  const [deliveryDate,  setDeliveryDate]  = useState(new Date());
  const [deliveryTime,  setDeliveryTime]  = useState(new Date());
  const [distance,      setDistance]      = useState('');

  /* service / packaging — храним и PK, и название */
  const [serviceId,      setServiceId]      = useState<number | null>(null);
  const [serviceTitle,   setServiceTitle]   = useState('');
  const [packagingId,    setPackagingId]    = useState<number | null>(null);
  const [packagingTitle, setPackagingTitle] = useState('');

  const [status,        setStatus]        = useState<DeliveryStatus>({ key: '', label: '', color: '' });
  const [tech,          setTech]          = useState<TechStatus>({ key: '', label: '', color: '' });
  const [collectorName, setCollectorName] = useState('');
  const [comment,       setComment]       = useState('');

  /* ─── bottom-sheets ─── */
  const [courierSheetOpen, setCourierSheetOpen] = useState(false);
  const [statusSheetOpen,  setStatusSheetOpen]  = useState(false);
  const [techSheetOpen,    setTechSheetOpen]    = useState(false);
  const [fioSheetOpen,     setFioSheetOpen]     = useState(false);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);

  /* ───────── справочники ───────── */
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
      } finally {
        setLoadingRefs(false);
      }
    })();
  }, []);

  /* ───────── загрузка доставки ───────── */
  useEffect(() => {
    if (!id) return;
    deliveryApi.getDeliveryById(id).then(setDelivery);
  }, [id]);

  /* ───────── перенос в state ───────── */
  useEffect(() => {
    if (!delivery) return;

    const modelObj = transportModels.find(m => m.name === delivery.model);
    setSelectedModel(modelObj?.key ?? '');
    setModelName(delivery.model);
    setNumber(delivery.number);
    setDispatchDate(new Date(delivery.dispatchDate));
    setDispatchTime(new Date(`${delivery.dispatchDate}T${delivery.dispatchTime}`));
    setDeliveryDate(new Date(delivery.deliveryDate));
    setDeliveryTime(new Date(`${delivery.deliveryDate}T${delivery.deliveryTime}`));
    setDistance(delivery.distance);

    /* service / packaging (backend присылает вложенный объект) */
    // @ts-ignore — тип Delivery.service = string|object
    setServiceId(delivery.service?.id ?? null);
    setServiceTitle(
      typeof delivery.service === 'string'
        ? delivery.service
        : delivery.service?.name ?? '',
    );
    // @ts-ignore
    setPackagingId(delivery.packaging?.id ?? null);
    setPackagingTitle(
      typeof delivery.packaging === 'string'
        ? delivery.packaging
        : delivery.packaging?.name ?? '',
    );

    setStatus(delivery.status);
    setTech(delivery.tech);
    setCollectorName(delivery.collectorName);
    setComment(delivery.comment);
  }, [delivery, transportModels]);

  /* ─── overrides из query-params ─── */
  useEffect(() => {
    if (qDistance)    setDistance(qDistance);
    if (qServiceId)   setServiceId(Number(qServiceId));
    if (qPackagingId) setPackagingId(Number(qPackagingId));
  }, [qDistance, qServiceId, qPackagingId]);

  /* ─── helpers ─── */
  const transitLabel = () => {
    const start = new Date(
      dispatchDate.getFullYear(), dispatchDate.getMonth(), dispatchDate.getDate(),
      dispatchTime.getHours(),    dispatchTime.getMinutes(),
    );
    const end   = new Date(
      deliveryDate.getFullYear(), deliveryDate.getMonth(), deliveryDate.getDate(),
      deliveryTime.getHours(),    deliveryTime.getMinutes(),
    );
    const mins  = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    return `${Math.floor(mins / 60)}ч ${mins % 60}м`;
  };

  /* ───────── Сохранить ───────── */
  const onSave = async () => {
    if (!id) return;

    if (!status.key)  return Alert.alert('Выберите статус доставки');
    if (!tech.key)    return Alert.alert('Укажите тех. исправность');

    const payload: Record<string, unknown> = {
      /* transport */
      ...(selectedModel && { transport_model: Number(selectedModel) }),
      transport_number: number,
      /* даты / время */
      dispatch_datetime: new Date(
        dispatchDate.getFullYear(), dispatchDate.getMonth(), dispatchDate.getDate(),
        dispatchTime.getHours(),    dispatchTime.getMinutes(),
      ).toISOString(),
      delivery_datetime: new Date(
        deliveryDate.getFullYear(), deliveryDate.getMonth(), deliveryDate.getDate(),
        deliveryTime.getHours(),    deliveryTime.getMinutes(),
      ).toISOString(),
      distance,
      /* справочники с сервера */
      ...(serviceId   != null && { service:   serviceId }),
      ...(packagingId != null && { packaging: packagingId }),
      /* статус + тех. состояние — отправляем как пришли */
      status:              status.key,
      technical_condition: tech.key,
      /* остальное */
      collector: collectorName,
      comment,
    };

    const ok = await deliveryApi.updateDelivery(id, payload);
    ok ? Alert.alert('Сохранено') : Alert.alert('Ошибка', 'Не удалось сохранить');
    if (ok) setIsEditing(false);
  };

  /* ───────── Провести ───────── */
  const onFinish = async () => {
    if (!id) return;
  
    const ok = await deliveryApi.updateDelivery(id, { finished: true });   // ← только это
    ok ? Alert.alert('Проведено') : Alert.alert('Ошибка', 'Не удалось провести');
    if (ok) router.back();
  };

  /* ───────── Удалить ───────── */
  const onDelete = async () => {
    if (!id) return;
    const ok = await deliveryApi.deleteDelivery(id);
    ok
      ? (Alert.alert('Удалено'), router.back())
      : Alert.alert('Ошибка', 'Не удалось удалить');
  };

  /* ───────── UI ───────── */
  if (loadingRefs || !delivery) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#B2D0FF" />
        <Text style={styles.loadingText}>Загрузка…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ───── Header ───── */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>№{id}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ───── Courier ───── */}
        <Text style={styles.sectionLabel}>КУРЬЕР</Text>
        {isEditing ? (
          <TouchableOpacity
            style={styles.row}
            onPress={() => setCourierSheetOpen(true)}
          >
            <Ionicons
              name="cart-outline"
              size={20}
              color="#fff"
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>
              {modelName}, №{number}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.row}>
            <Ionicons
              name="cart-outline"
              size={20}
              color="#fff"
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>
              {delivery.model}, №{delivery.number}
            </Text>
          </View>
        )}
        <Divider />

        {/* ───── Transit time ───── */}
        <TouchableOpacity
          style={styles.row}
          disabled={!isEditing}
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
          <Ionicons
            name="time-outline"
            size={20}
            color="#fff"
            style={styles.rowIcon}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Время в пути</Text>
            <Text style={styles.rowSubValue}>
              Отправка: {dispatchDate.toLocaleDateString()}{' '}
              {dispatchTime.toLocaleTimeString().slice(0, 5)}
              {'\n'}Доставка: {deliveryDate.toLocaleDateString()}{' '}
              {deliveryTime.toLocaleTimeString().slice(0, 5)}
            </Text>
          </View>
          {isEditing ? (
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          ) : (
            <Text style={styles.rowValue}>{transitLabel()}</Text>
          )}
        </TouchableOpacity>
        <Divider />

        {/* ───── Distance ───── */}
        <TouchableOpacity
          style={styles.row}
          disabled={!isEditing}
          onPress={() =>
            router.push({
              pathname: '/distance',
              params: { distance, returnTo: returnPath, returnId: id },
            })
          }
        >
          <Ionicons
            name="location-outline"
            size={20}
            color="#fff"
            style={styles.rowIcon}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.rowLabel}>Дистанция</Text>
            <Text style={styles.rowSubValue}>Откуда{'\n'}Куда</Text>
          </View>
          <Text style={styles.rowValue}>{distance}</Text>
          {isEditing && <Ionicons name="chevron-forward" size={18} color="#fff" />}
        </TouchableOpacity>
        <Divider />

        {/* ───── Media file (имя) ───── */}
        <View style={styles.row}>
          <Ionicons
            name="document-attach-outline"
            size={20}
            color="#fff"
            style={styles.rowIcon}
          />
          <Text style={styles.rowLabel}>{delivery.mediaFile}</Text>
        </View>
        <Divider />

        {/* ───── Service ───── */}
        <Text style={styles.sectionLabel}>УСЛУГА</Text>
        <TouchableOpacity
          style={styles.row}
          disabled={!isEditing}
          onPress={() =>
            router.push({
              pathname: '/services-menu',
              params: {
                id,
                returnTo: returnPath,
                service: serviceTitle,
                serviceId,
              },
            })
          }
        >
          <Ionicons
            name="apps-outline"
            size={20}
            color="#fff"
            style={styles.rowIcon}
          />
          <Text style={styles.rowLabel}>
            {serviceTitle || 'Не указана'}
          </Text>
          {isEditing && <Ionicons name="chevron-forward" size={18} color="#fff" />}
        </TouchableOpacity>
        <Divider />

        {/* ───── Status ───── */}
        {isEditing ? (
          <TouchableOpacity
            style={styles.row}
            onPress={() => setStatusSheetOpen(true)}
          >
            <Ionicons
              name="reload-outline"
              size={20}
              color="#fff"
              style={styles.rowIcon}
            />
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
            <Ionicons
              name="reload-outline"
              size={20}
              color="#fff"
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>Статус доставки</Text>
            <View style={styles.rowContent}>
              <View
                style={[styles.pill, { backgroundColor: delivery.status.color }]}
              >
                <Text style={styles.pillText}>{delivery.status.label}</Text>
              </View>
            </View>
          </View>
        )}
        <Divider />

        {/* ───── Packaging ───── */}
        <TouchableOpacity
          style={styles.row}
          disabled={!isEditing}
          onPress={() =>
            router.push({
              pathname: '/packaging',
              params: {
                id,
                returnTo: returnPath,
                packaging: packagingTitle,
                packagingId,
              },
            })
          }
        >
          <Ionicons
            name="cube-outline"
            size={20}
            color="#fff"
            style={styles.rowIcon}
          />
          <Text style={styles.rowLabel}>
            {packagingTitle || 'Не указана'}
          </Text>
          {isEditing && <Ionicons name="chevron-forward" size={18} color="#fff" />}
        </TouchableOpacity>
        <Divider />

        {/* ───── Tech condition ───── */}
        {isEditing ? (
          <TouchableOpacity
            style={styles.row}
            onPress={() => setTechSheetOpen(true)}
          >
            <Ionicons
              name="settings-outline"
              size={20}
              color="#fff"
              style={styles.rowIcon}
            />
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
            <Ionicons
              name="settings-outline"
              size={20}
              color="#fff"
              style={styles.rowIcon}
            />
            <Text style={styles.rowLabel}>Тех. исправность</Text>
            <View style={styles.rowContent}>
              <View
                style={[styles.pill, { backgroundColor: delivery.tech.color }]}
              >
                <Text style={styles.pillText}>{delivery.tech.label}</Text>
              </View>
            </View>
          </View>
        )}
        <Divider />

        {/* ───── Collector ───── */}
        <Text style={styles.sectionLabel}>СБОРЩИК</Text>
        <TouchableOpacity
          style={styles.row}
          disabled={!isEditing}
          onPress={() => isEditing && setFioSheetOpen(true)}
        >
          <Ionicons
            name="person-outline"
            size={20}
            color="#fff"
            style={styles.rowIcon}
          />
          <Text style={styles.rowLabel}>
            {collectorName || 'Не указан'}
          </Text>
          {isEditing && <Ionicons name="chevron-forward" size={18} color="#fff" />}
        </TouchableOpacity>
        <Divider />

        {/* ───── Comment ───── */}
        <TouchableOpacity
          style={styles.row}
          disabled={!isEditing}
          onPress={() => isEditing && setCommentSheetOpen(true)}
        >
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color="#fff"
            style={styles.rowIcon}
          />
          <Text style={styles.rowLabel}>
            {comment || 'Комментарий отсутствует'}
          </Text>
          {isEditing && <Ionicons name="chevron-forward" size={18} color="#fff" />}
        </TouchableOpacity>
        <Divider />
      </ScrollView>

      {/* ───── Footer ───── */}
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
          <View style={styles.footerButtons}>
            <TouchableOpacity style={styles.postBtn} onPress={onFinish}>
              <Text style={styles.btnText}>Провести</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.btnText}>Редактировать</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* ───── bottom-sheets ───── */}
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

/* ───────────── стили ───────────── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#23262B',
               paddingTop: Platform.OS === 'ios' ? 44 : 24 },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#fff', marginTop: 8 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
               paddingHorizontal: 16, marginBottom: 12 },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  scrollContent: { paddingBottom: 160 },
  divider: { height: 1, backgroundColor: '#2C3036', marginHorizontal: 16 },

  sectionLabel: { color: '#B2B2B2', fontSize: 13, marginTop: 12, marginBottom: 4,
                  fontWeight: 'bold', letterSpacing: 1, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16,
         marginHorizontal: 16, marginVertical: 4, backgroundColor: '#23262B',
         borderRadius: 12 },
  rowIcon: { marginRight: 12 },
  rowLabel: { color: '#fff', flex: 1 },
  rowSubValue: { color: '#B2B2B2', fontSize: 13 },
  rowValue: { color: '#fff', fontWeight: 'bold' },
  rowContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  pill: { borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 },
  pillText: { color: '#fff', fontSize: 14, fontWeight: 'bold' },

  footer: { position: 'absolute', left: 0, right: 0, bottom: 80, padding: 16,
            backgroundColor: '#23262B' },
  footerButtons: { flexDirection: 'row' },

  actionBtn: { flex: 1, backgroundColor: '#18805B', paddingVertical: 12,
               borderRadius: 8, marginLeft: 6, alignItems: 'center' },
  postBtn:   { flex: 1, backgroundColor: '#006EED', paddingVertical: 12,
               borderRadius: 8, marginRight: 6, alignItems: 'center' },
  deleteBtn: { flex: 1, backgroundColor: '#D32F2F', paddingVertical: 12,
               borderRadius: 8, marginRight: 6, alignItems: 'center' },
  saveBtn:   { flex: 1, backgroundColor: '#18805B', paddingVertical: 12,
               borderRadius: 8, marginLeft: 6, alignItems: 'center' },

  btnText: { color: '#fff', fontWeight: 'bold' },
});
