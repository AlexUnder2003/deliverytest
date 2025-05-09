import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import {
  useLocalSearchParams,
  usePathname,
  useRouter,
} from 'expo-router';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

/* ──────────────────────────────────────
   Константы
   ────────────────────────────────────── */
const STATUS_OPTIONS = [
  { key: 'waiting', label: 'В ожидании', color: '#A06A1B' },
  { key: 'delivered', label: 'Доставлен', color: '#1B7F4C' },
] as const;

const TECH_OPTIONS = [
  { key: 'ok', label: 'Исправно', color: '#18805B' },
  { key: 'faulty', label: 'Неисправно', color: '#D32F2F' },
  { key: 'repair', label: 'На ремонте', color: '#D98D2B' },
] as const;

const Divider = () => <View style={styles.divider} />;

/* ──────────────────────────────────────
   Типы
   ────────────────────────────────────── */
export type Delivery = {
  model: string;
  number: string;
  dispatchDate: string; // yyyy-mm-dd
  dispatchTime: string; // HH:mm
  deliveryDate: string; // yyyy-mm-dd
  deliveryTime: string; // HH:mm
  distance: string;
  mediaFile: string;
  service: string;
  fragile: boolean;
  status: { key: string; label: string; color: string };
  packaging: string;
  tech: { key: string; label: string; color: string };
  collectorName: string;
  comment: string;
};

/* ──────────────────────────────────────
   Mock-API (замените реальным fetch)
   ────────────────────────────────────── */
async function fetchDeliveryById(id: string): Promise<Delivery> {
  return {
    model: 'DX-100',
    number: '123',
    dispatchDate: '2025-05-08',
    dispatchTime: '12:09',
    deliveryDate: '2025-05-08',
    deliveryTime: '20:09',
    distance: '2 км',
    mediaFile: 'отчет.pdf',
    service: 'До клиента',
    fragile: true,
    status: { key: 'waiting', label: 'В ожидании', color: '#A06A1B' },
    packaging: 'Пакет до 1 кг',
    tech: { key: 'ok', label: 'Исправно', color: '#18805B' },
    collectorName: 'Александр Иванов',
    comment: '',
  };
}

/* ──────────────────────────────────────
   Компонент
   ────────────────────────────────────── */
export default function ViewDeliveryScreen() {
  /* роутинг-хуки */
  const router     = useRouter();
  const pathname   = usePathname();                // '/(tabs)/123'
  const returnPath = pathname || '/(tabs)/create'; // запасной

  /* query-параметры */
  const {
    id,
    distance:  qDistance,
    service:   qService,
    packaging: qPackaging,
  } = useLocalSearchParams<{
    id: string;
    distance?: string;
    service?: string;
    packaging?: string;
  }>();

  /* основное состояние */
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  /* editable-поля */
  const [model,         setModel]         = useState('');
  const [number,        setNumber]        = useState('');
  const [dispatchDate,  setDispatchDate]  = useState(new Date());
  const [dispatchTime,  setDispatchTime]  = useState(new Date());
  const [deliveryDate,  setDeliveryDate]  = useState(new Date());
  const [deliveryTime,  setDeliveryTime]  = useState(new Date());
  const [distance,      setDistance]      = useState('');
  const [service,       setService]       = useState('');
  const [fragile,       setFragile]       = useState(false);
  const [status,        setStatus]        = useState<typeof STATUS_OPTIONS[number]>(STATUS_OPTIONS[0]);
  const [packaging,     setPackaging]     = useState('');
  const [tech,          setTech]          = useState<typeof TECH_OPTIONS[number]>(TECH_OPTIONS[0]);
  const [collectorName, setCollectorName] = useState('');
  const [comment,       setComment]       = useState('');

  /* bottom-sheet refs / индексы */
  const statusRef   = useRef<BottomSheet>(null);
  const techRef     = useRef<BottomSheet>(null);
  const modelRef    = useRef<BottomSheet>(null);
  const fioRef      = useRef<BottomSheet>(null);
  const commentRef  = useRef<BottomSheet>(null);

  const snap30 = useMemo(() => ['30%'] as const, []);
  const snap40 = useMemo(() => ['40%'] as const, []);
  const snap50 = useMemo(() => ['50%'] as const, []);

  const [statusIdx,  setStatusIdx]  = useState(-1);
  const [techIdx,    setTechIdx]    = useState(-1);
  const [modelIdx,   setModelIdx]   = useState(-1);
  const [fioIdx,     setFioIdx]     = useState(-1);
  const [commentIdx, setCommentIdx] = useState(-1);

  /* helpers для открытия/закрытия */
  const openStatus  = useCallback(() => setStatusIdx(0), []);
  const closeStatus = useCallback(() => setStatusIdx(-1), []);
  const openTech    = useCallback(() => setTechIdx(0), []);
  const closeTech   = useCallback(() => setTechIdx(-1), []);
  const openModel   = useCallback(() => setModelIdx(0), []);
  const closeModel  = useCallback(() => setModelIdx(-1), []);
  const openFio     = useCallback(() => setFioIdx(0), []);
  const closeFio    = useCallback(() => setFioIdx(-1), []);
  const openComment = useCallback(() => setCommentIdx(0), []);
  const closeComment= useCallback(() => setCommentIdx(-1), []);

  const onDelete = () => {
  // Implement the logic to delete the delivery
  console.log(`Deleting delivery with ID: ${id}`);
  // You might want to navigate back or update the state after deletion
  router.back();
};

  /* ───────────────────────────
     Эффекты
     ─────────────────────────── */
  /* получаем доставку */
  useEffect(() => {
    if (!id) return;
    fetchDeliveryById(id).then(setDelivery);
  }, [id]);

  /* применяем query-параметры из подэкранов */
  useEffect(() => {
    if (qDistance)  setDistance(qDistance);
    if (qService)   setService(qService);
    if (qPackaging) setPackaging(qPackaging);
  }, [qDistance, qService, qPackaging]);

  /* когда прилетела доставка — заполняем editable-поля */
  useEffect(() => {
    if (!delivery) return;
    setModel(delivery.model);
    setNumber(delivery.number);
    setDispatchDate(new Date(delivery.dispatchDate));
    setDispatchTime(new Date(`${delivery.dispatchDate}T${delivery.dispatchTime}`));
    setDeliveryDate(new Date(delivery.deliveryDate));
    setDeliveryTime(new Date(`${delivery.deliveryDate}T${delivery.deliveryTime}`));
    setDistance(delivery.distance);
    setService(delivery.service);
    setFragile(delivery.fragile);
    setStatus(delivery.status);
    setPackaging(delivery.packaging);
    setTech(delivery.tech);
    setCollectorName(delivery.collectorName);
    setComment(delivery.comment);
  }, [delivery]);

  /* ───────────────────────────
     Вспомогательные функции
     ─────────────────────────── */
  const transitLabel = () => {
    const start = new Date(
      dispatchDate.getFullYear(), dispatchDate.getMonth(), dispatchDate.getDate(),
      dispatchTime.getHours(),    dispatchTime.getMinutes()
    );
    const end = new Date(
      deliveryDate.getFullYear(), deliveryDate.getMonth(), deliveryDate.getDate(),
      deliveryTime.getHours(),    deliveryTime.getMinutes()
    );
    const mins = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
    return `${Math.floor(mins / 60)}ч ${mins % 60}м`;
  };

  const onSave = () => {
    if (!delivery) return;
    setDelivery({
      ...delivery,
      model,
      number,
      dispatchDate : dispatchDate.toISOString().slice(0, 10),
      dispatchTime : `${dispatchTime.getHours().toString().padStart(2, '0')}:${dispatchTime.getMinutes().toString().padStart(2, '0')}`,
      deliveryDate : deliveryDate.toISOString().slice(0, 10),
      deliveryTime : `${deliveryTime.getHours().toString().padStart(2, '0')}:${deliveryTime.getMinutes().toString().padStart(2, '0')}`,
      distance,
      service,
      fragile,
      status,
      packaging,
      tech,
      collectorName,
      comment,
    });
    setIsEditing(false);
  };
  

  /* ───────────────────────────
     Рендер
     ─────────────────────────── */
  if (!delivery) {
    return (
      <View style={styles.loading}>
        <Text style={{ color: '#fff' }}>Загрузка…</Text>
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

      {/* Content */}
      <Text style={styles.sectionLabel}>КУРЬЕР</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Модель + номер */}
        {isEditing ? (
          <TouchableOpacity style={styles.row} onPress={openModel}>
            <Ionicons name="duplicate-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{model}, №{number}</Text>
            <Ionicons name="chevron-forward" size={18} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View style={styles.row}>
            <Ionicons name="duplicate-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>{delivery.model}, №{delivery.number}</Text>
          </View>
        )}
        <Divider />

        {/* Время в пути */}
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
                  returnTo:     returnPath,
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

        {/* Дистанция */}
        {isEditing ? (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              router.push({
                pathname: '/distance',
                params: {
                  distance,
                  returnTo: returnPath,
                  returnId: id,
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
        ) : (
          <View style={styles.row}>
            <Ionicons name="location-outline" size={20} color="#fff" style={styles.rowIcon} />
            <Text style={styles.rowLabel}>Дистанция</Text>
            <Text style={styles.rowValue}>{delivery.distance}</Text>
          </View>
        )}
        <Divider />

        {/* Файл-медиа */}
        <TouchableOpacity style={styles.row} onPress={() => {/* TODO: открыть PDF */}}>
          <Ionicons name="document-attach-outline" size={20} color="#fff" style={styles.rowIcon} />
          <Text style={styles.rowLabel}>{delivery.mediaFile}</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* Услуга */}
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

        

        {/* Статус */}
        {isEditing ? (
          <TouchableOpacity style={styles.row} onPress={openStatus}>
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

        {/* Упаковка */}
        {isEditing ? (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              router.push({ pathname: '/packaging', params: { returnTo: returnPath, id } })
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

        {/* Тех. состояние */}
        {isEditing ? (
          <TouchableOpacity style={styles.row} onPress={openTech}>
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


        {/* Сборщик */}
        <Text style={styles.sectionLabel}>СБОРЩИК</Text>
        {isEditing ? (
          <TouchableOpacity style={styles.row} onPress={openFio}>
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

        {/* Комментарий */}
        {isEditing ? (
          <TouchableOpacity style={styles.row} onPress={openComment}>
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

      {/* Кнопка */}
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
            <Text style={styles.actionBtnText}>Распровести</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ───────── BottomSheets ───────── */}
      {/* Статус */}
      <BottomSheet
        ref={statusRef}
        index={statusIdx}
        snapPoints={snap30}
        onChange={setStatusIdx}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#23262B' }}
        handleIndicatorStyle={{ backgroundColor: '#444' }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Статус доставки</Text>
          {STATUS_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={styles.statusOption}
              onPress={() => { setStatus(opt); closeStatus(); }}
            >
              <View style={[styles.badgeSmall, { backgroundColor: opt.color }]} />
              <Text style={[styles.statusLabel, opt.key === status.key && styles.statusSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </BottomSheetView>
      </BottomSheet>

      {/* Тех. состояние */}
      <BottomSheet
        ref={techRef}
        index={techIdx}
        snapPoints={snap30}
        onChange={setTechIdx}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#23262B' }}
        handleIndicatorStyle={{ backgroundColor: '#444' }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Тех. исправность</Text>
          {TECH_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.key}
              style={styles.statusOption}
              onPress={() => { setTech(opt); closeTech(); }}
            >
              <View style={[styles.badgeSmall, { backgroundColor: opt.color }]} />
              <Text style={[styles.statusLabel, opt.key === tech.key && styles.statusSelected]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </BottomSheetView>
      </BottomSheet>

      {/* Модель + номер */}
      <BottomSheet
        ref={modelRef}
        index={modelIdx}
        snapPoints={snap50}
        onChange={setModelIdx}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#23262B' }}
        handleIndicatorStyle={{ backgroundColor: '#444' }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Выберите модель и номер</Text>
          <View style={styles.modelRow}>
            {['DX-100', 'EAT-2000', 'NOM-7', 'YUM-42'].map(m => (
              <TouchableOpacity
                key={m}
                style={[styles.modelButton, model === m && styles.modelButtonSelected]}
                onPress={() => setModel(m)}
              >
                <Text style={styles.modelText}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.label}>Номер</Text>
          <TextInput
            style={styles.input}
            value={number}
            onChangeText={setNumber}
            placeholder="Введите номер"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.button} onPress={closeModel}>
            <Text style={styles.buttonText}>Готово</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>

      {/* ФИО */}
      <BottomSheet
        ref={fioRef}
        index={fioIdx}
        snapPoints={snap30}
        onChange={setFioIdx}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#23262B' }}
        handleIndicatorStyle={{ backgroundColor: '#444' }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Выберите ФИО</Text>
          <TextInput
            style={styles.input}
            value={collectorName}
            onChangeText={setCollectorName}
            placeholder="Введите ФИО"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.button} onPress={closeFio}>
            <Text style={styles.buttonText}>Готово</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>

      {/* Комментарий */}
      <BottomSheet
        ref={commentRef}
        index={commentIdx}
        snapPoints={snap40}
        onChange={setCommentIdx}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#23262B' }}
        handleIndicatorStyle={{ backgroundColor: '#444' }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Комментарий</Text>
          <TextInput
            style={[styles.input, { height: 100 }]}
            value={comment}
            onChangeText={setComment}
            placeholder="Введите комментарий"
            placeholderTextColor="#888"
            multiline
          />
          <TouchableOpacity style={styles.button} onPress={closeComment}>
            <Text style={styles.buttonText}>Готово</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>
    </View>
  );
}

/* ──────────────────────────────────────
   Стили
   ────────────────────────────────────── */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#23262B',
    paddingTop: Platform.OS === 'ios' ? 44 : 24,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  scrollContent: { paddingBottom: 160 },
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

  sheetContent: { flex: 1, padding: 16 },
  sheetTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  statusOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  statusLabel: { color: '#fff', flex: 1, fontSize: 16 },
  statusSelected: { fontWeight: 'bold' },
  badgeSmall: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },

  modelRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  modelButton: {
    borderWidth: 1,
    borderColor: '#35363B',
    borderRadius: 8,
    padding: 6,
    margin: 4,
  },
  modelButtonSelected: { backgroundColor: '#35363B' },
  modelText: { color: '#fff' },
  label: { color: '#B2B2B2', marginBottom: 8 },
  input: {
    backgroundColor: '#35363B',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
    fontSize: 18,
    marginBottom: 16,
  },
  footerButtons: {
    flexDirection: 'row',
    padding: 16,
    // небольшой отступ между кнопками (RN ≥ 0.71 можно gap: 12)
  },

  footerButtons: {
    flexDirection: 'row',
    padding: 16,
    // RN ≥ 0.71 можно gap: 12,
    // на старых версиях используем margin у кнопок
  },

  deleteBtn: {
    flex: 1,               // ← ширина = 50 %
    backgroundColor: '#D32F2F',
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 6,        // «щель» между кнопками
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveBtn: {
    flex: 1,               // ← вторая половина
    backgroundColor: '#18805B',
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#18805B',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
