// app/(tabs)/create.tsx

import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const Divider = () => <View style={styles.divider} />;

const STATUS_OPTIONS = [
  { key: 'waiting', label: 'В ожидании', color: '#A06A1B' },
  { key: 'delivered', label: 'Доставлен', color: '#1B7F4C' },
];

const TECH_OPTIONS = [
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
  }>();

  // Courier
  const [selectedModel, setSelectedModel] = useState('DX-100');
  const [number, setNumber] = useState('');

  // Transit-time
  const [dispatchDate, setDispatchDate] = useState(new Date());
  const [dispatchTime, setDispatchTime] = useState(new Date());
  const [deliveryDate, setDeliveryDate] = useState(new Date());
  const [deliveryTime, setDeliveryTime] = useState(new Date());
  const [distance, setDistance] = useState('2 км');

  // Delivery status sheet
  const [status, setStatus] = useState(STATUS_OPTIONS[0]);
  const statusRef = useRef<BottomSheet>(null);
  const snapStatus = useMemo(() => ['30%'] as const, []);
  const [statusIndex, setStatusIndex] = useState(-1);
  const openStatus = useCallback(() => setStatusIndex(0), []);
  const closeStatus = useCallback(() => setStatusIndex(-1), []);

  // Tech condition sheet
  const [tech, setTech] = useState(TECH_OPTIONS[0]);
  const techRef = useRef<BottomSheet>(null);
  const snapTech = useMemo(() => ['30%'] as const, []);
  const [techIndex, setTechIndex] = useState(-1);
  const openTech = useCallback(() => setTechIndex(0), []);
  const closeTech = useCallback(() => setTechIndex(-1), []);

  // Courier sheet
  const courierRef = useRef<BottomSheet>(null);
  const snapCourier = useMemo(() => ['50%'] as const, []);
  const [courierIndex, setCourierIndex] = useState(-1);
  const openCourier = useCallback(() => setCourierIndex(0), []);
  const closeCourier = useCallback(() => setCourierIndex(-1), []);

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

  // FIO sheet
  const [fio, setFio] = useState('');
  const fioRef = useRef<BottomSheet>(null);
  const snapFio = useMemo(() => ['30%'] as const, []);
  const [fioIndex, setFioIndex] = useState(-1);
  const openFio = useCallback(() => setFioIndex(0), []);
  const closeFio = useCallback(() => setFioIndex(-1), []);

  // Comment sheet
  const [comment, setComment] = useState('');
  const commentRef = useRef<BottomSheet>(null);
  const snapComment = useMemo(() => ['40%'] as const, []);
  const [commentIndex, setCommentIndex] = useState(-1);
  const openComment = useCallback(() => setCommentIndex(0), []);
  const closeComment = useCallback(() => setCommentIndex(-1), []);

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

  return (
    <View style={styles.container}>
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
        <TouchableOpacity style={styles.row} onPress={openCourier}>
          <Ionicons name="cart-outline" size={20} color="#fff" style={styles.rowIcon} />
          <Text style={styles.rowLabel}>{selectedModel}, №{number}</Text>
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
        <TouchableOpacity style={styles.row} onPress={openTech}>
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
        <TouchableOpacity style={styles.row} onPress={openFio}>
          <Ionicons name="person-outline" size={20} color="#fff" style={styles.rowIcon} />
          <Text style={styles.rowLabel}>{fio || 'Выбрать ФИО'}</Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" />
        </TouchableOpacity>
        <Divider />

        {/* Comment */}
        <TouchableOpacity style={styles.row} onPress={openComment}>
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
          onPress={() => {
            // TODO: отправка данных на сервер
          }}
        >
          <Text style={styles.createBtnTextModal}>Создать доставку</Text>
        </TouchableOpacity>
      </View>
      {/* Status Sheet */}
      <BottomSheet
        ref={statusRef}
        index={statusIndex}
        snapPoints={snapStatus}
        onChange={setStatusIndex}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#23262B' }}
        handleIndicatorStyle={{ backgroundColor: '#444' }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Статус доставки</Text>
            <TouchableOpacity>
              <Ionicons name="search" size={18} color="#888" />
            </TouchableOpacity>
          </View>
          {STATUS_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={styles.statusOption}
              onPress={() => { setStatus(opt); closeStatus(); }}
            >
              <View style={[styles.badgeSmall, { backgroundColor: opt.color }]} />
              <Text style={[styles.statusLabel, opt.key === status.key && styles.statusSelected]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </BottomSheetView>
      </BottomSheet>

      {/* Tech Sheet */}
      <BottomSheet
        ref={techRef}
        index={techIndex}
        snapPoints={snapTech}
        onChange={setTechIndex}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#23262B' }}
        handleIndicatorStyle={{ backgroundColor: '#444' }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Тех. исправность</Text>
            <TouchableOpacity>
              <Ionicons name="search" size={18} color="#888" />
            </TouchableOpacity>
          </View>
          {TECH_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={styles.statusOption}
              onPress={() => { setTech(opt); closeTech(); }}
            >
              <View style={[styles.badgeSmall, { backgroundColor: opt.color }]} />
              <Text style={[styles.statusLabel, opt.key === tech.key && styles.statusSelected]}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </BottomSheetView>
      </BottomSheet>

      {/* Courier Sheet */}
      <BottomSheet
        ref={courierRef}
        index={courierIndex}
        snapPoints={snapCourier}
        onChange={setCourierIndex}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#23262B' }}
        handleIndicatorStyle={{ backgroundColor: '#444' }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Выберите модель и номер</Text>
          <View style={styles.modelRow}>
            {['DX-100', 'EAT-2000', 'NOM-7', 'YUM-42'].map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.modelButton, selectedModel === m && styles.modelButtonSelected]}
                onPress={() => setSelectedModel(m)}
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
          <TouchableOpacity style={styles.button} onPress={closeCourier}>
            <Text style={styles.buttonText}>Готово</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>

      <BottomSheet
        ref={fioRef}
        index={fioIndex}
        snapPoints={snapFio}
        onChange={setFioIndex}
        enablePanDownToClose
        backgroundStyle={{ backgroundColor: '#23262B' }}
        handleIndicatorStyle={{ backgroundColor: '#444' }}
      >
        <BottomSheetView style={styles.sheetContent}>
          <Text style={styles.sheetTitle}>Выберите ФИО</Text>
          <TextInput
            style={styles.input}
            value={fio}
            onChangeText={setFio}
            placeholder="Введите ФИО"
            placeholderTextColor="#888"
          />
          <TouchableOpacity style={styles.button} onPress={closeFio}>
            <Text style={styles.buttonText}>Готово</Text>
          </TouchableOpacity>
        </BottomSheetView>
      </BottomSheet>

      {/* Comment Sheet */}
      <BottomSheet
        ref={commentRef}
        index={commentIndex}
        snapPoints={snapComment}
        onChange={setCommentIndex}
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
  sheetContent: { flex: 1, padding: 16 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sheetTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statusOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  statusLabel: { color: '#fff', flex: 1, fontSize: 16 },
  statusSelected: { fontWeight: 'bold' },
  footer: {
    position: 'absolute', left: 0, right: 0, bottom: 40,
    backgroundColor: '#23262B', padding: 16,
  },

  modelRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 16 },
  modelButton: { borderWidth: 1, borderColor: '#35363B', borderRadius: 8, padding: 6, margin: 4 },
  modelButtonSelected: { backgroundColor: '#35363B' },
  modelText: { color: '#fff' },
  label: { color: '#B2B2B2', marginBottom: 8 },
  input: { backgroundColor: '#35363B', color: '#fff', borderRadius: 8, padding: 10, fontSize: 18, marginBottom: 16 },
  button: { backgroundColor: '#18805B', borderRadius: 12, padding: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});