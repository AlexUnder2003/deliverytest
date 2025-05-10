/* deliveryApi.ts
 *
 * ⏩ Полностью переписанный модуль, который одинаково работает
 *    в браузере (Expo web / React Native for Web) и на iOS / Android.
 */

import axios from 'axios';
import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/* ─────────────────────────  КОНСТАНТЫ  ───────────────────────── */

export const API_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

/* ────────────────────────  ОБЩИЕ ТИПЫ  ──────────────────────── */

export type StatusOption = { key: string; label: string; color: string };
export type TransportModel = { id: number; key: string; name: string };

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
  status: StatusOption;
  packaging: string;
  tech: StatusOption;
  collectorName: string;
  comment: string;
};

export type DeliveryListItem = {
  id: string;
  time: string;
  distance: string;
  fragile: boolean;
  package: string;
  toClient: boolean;
  statuses: string[];
};

export type ServiceItem   = { id: number; key: string; title: string; subtitle?: string };
export type PackagingItem = { id: number; key: string; title: string };

/* ─────────────────────  ЗАПАСНЫЕ СПРАВОЧНИКИ  ────────────────── */

export const STATUS_OPTIONS = [
  { key: 'waiting',   label: 'В ожидании', color: '#A06A1B' },
  { key: 'delivered', label: 'Доставлен',  color: '#1B7F4C' },
] as const;

export const TECH_OPTIONS = [
  { key: 'ok',     label: 'Исправно',   color: '#18805B' },
  { key: 'faulty', label: 'Неисправно', color: '#D32F2F' },
  { key: 'repair', label: 'На ремонте', color: '#D98D2B' },
] as const;

/* ───────────────────────  ВСПОМОГАТЕЛЬНОЕ  ───────────────────── */

export function getStatusByName(name: string): StatusOption {
  switch (name) {
    case 'Доставлен':  return STATUS_OPTIONS[1];
    case 'В ожидании':
    default:           return STATUS_OPTIONS[0];
  }
}

export function getTechStatusByName(name: string): StatusOption {
  switch (name) {
    case 'Неисправно': return TECH_OPTIONS[1];
    case 'На ремонте': return TECH_OPTIONS[2];
    case 'Исправно':
    default:           return TECH_OPTIONS[0];
  }
}

/* ────────────────────  ГЛАВНЫЙ API-ОБЪЕКТ  ──────────────────── */

export const deliveryApi = {
  /* ----------  1. Загрузка одного файла  ---------- */
  async uploadFile(
    file: { uri?: string; file?: File; name: string; type?: string },
  ): Promise<string> {
    try {
      const formData = new FormData();

      if (Platform.OS === 'web') {
        /*  Web: кладём настоящий File/Blob  */
        if (file.file instanceof File) {
          formData.append('file', file.file);
        } else if (file.uri) {
          const res   = await fetch(file.uri);
          const blob  = await res.blob();
          const webFile = new File(
            [blob],
            file.name,
            { type: file.type || blob.type || 'application/octet-stream' },
          );
          formData.append('file', webFile);
        } else {
          throw new Error('Нет данных для загрузки');
        }
      } else {
        /*  iOS / Android: кладём «объект с uri»  */
        if (!file.uri) throw new Error('uri обязателен на нативной платформе');

        const fsInfo = await FileSystem.getInfoAsync(file.uri);
        if (!fsInfo.exists) throw new Error('Файл не существует');

        formData.append('file', {
          uri:  file.uri,
          name: file.name,
          type: file.type ?? 'application/octet-stream',
        } as any);
      }

      /*  Не трогаем Content-Type — axios сам проставит boundary  */
      const res = await axios.post(`${API_URL}/upload-file/`, formData);
      return res.data.file_url;
    } catch (err) {
      console.error('Ошибка при загрузке файла:', err);
      throw new Error('Не удалось загрузить файл. Пожалуйста, попробуйте позже.');
    }
  },

  /* ----------  2. Создание доставки с прикреплёнными файлами  ---------- */
  async createDeliveryWithFiles(
    deliveryData: Record<string, any>,
    files: Array<{ uri?: string; file?: File; name: string; type?: string }>,
  ) {
    const formData = new FormData();

    /* scalar-поля (без объектов/массивов) */
    Object.entries(deliveryData).forEach(([k, v]) => {
      if (v !== undefined && v !== null && typeof v !== 'object') {
        formData.append(k, String(v));
      }
    });

    /* файлы */
    for (const f of files ?? []) {
      if (Platform.OS === 'web') {
        if (f.file instanceof File) {
          formData.append('attachments', f.file);
        } else if (f.uri) {
          const res = await fetch(f.uri);
          const blob = await res.blob();
          const webFile = new File(
            [blob],
            f.name,
            { type: f.type || blob.type || 'application/octet-stream' },
          );
          formData.append('attachments', webFile);
        }
      } else {
        if (!f.uri) continue;
        formData.append('attachments', {
          uri:  f.uri,
          name: f.name,
          type: f.type ?? 'application/octet-stream',
        } as any);
      }
    }

    const res = await axios.post(`${API_URL}/deliveries/`, formData); // без headers
    return res.data;
  },

  /* ----------  3. Получение списка доставок  ---------- */
  async getDeliveries(): Promise<DeliveryListItem[]> {
    try {
      const res = await api.get('/deliveries/');
      return res.data.map((item: any) => {
        const start = new Date(item.dispatch_datetime);
        const end   = new Date(item.delivery_datetime);
        const diffM = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60000));
        const time  = `${Math.floor(diffM / 60)}ч ${diffM % 60}м`;

        return {
          id:        String(item.id),
          time,
          distance:  item.distance || '2 км',
          fragile:   item.cargo_type?.name === 'Хрупкий груз',
          package:   item.packaging?.name || 'Пакет до 1 кг',
          toClient:  item.services?.some((s: any) => s.name === 'До клиента') ?? false,
          statuses: [
            item.status?.name              || 'В ожидании',
            item.technical_condition?.name || 'Исправно',
          ],
        };
      });
    } catch (err) {
      console.error('Ошибка при загрузке доставок:', err);
      throw new Error('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
    }
  },

  /* ----------  4. Получение доставки по ID  ---------- */
  async getDeliveryById(id: string): Promise<Delivery> {
    try {
      const { data } = await api.get(`/deliveries/${id}/`);

      const dispatch = new Date(data.dispatch_datetime);
      const delivery = new Date(data.delivery_datetime);

      return {
        model:        data.transport_model?.number || 'Неизвестно',
        number:       data.transport_number        || '',
        dispatchDate: dispatch.toISOString().slice(0, 10),
        dispatchTime: dispatch.toTimeString().slice(0, 5),
        deliveryDate: delivery.toISOString().slice(0, 10),
        deliveryTime: delivery.toTimeString().slice(0, 5),
        distance:     data.distance                || '',
        mediaFile:    data.attachments?.split('/').pop() || 'Нет файла',
        service:      data.services?.[0]?.name     || '',
        fragile:      data.cargo_type?.name === 'Хрупкий груз',
        status:       getStatusByName(data.status?.name || 'В ожидании'),
        packaging:    data.packaging?.name         || '',
        tech:         getTechStatusByName(data.technical_condition?.name || 'Исправно'),
        collectorName:data.collector               || '',
        comment:      data.comment                 || '',
      };
    } catch (err) {
      console.error('Ошибка при загрузке доставки:', err);
      Alert.alert('Ошибка', 'Не удалось загрузить данные о доставке');
      return {
        model: 'Ошибка загрузки',
        number: '',
        dispatchDate: new Date().toISOString().slice(0, 10),
        dispatchTime: '00:00',
        deliveryDate: new Date().toISOString().slice(0, 10),
        deliveryTime: '00:00',
        distance: '',
        mediaFile: '',
        service: '',
        fragile: false,
        status: STATUS_OPTIONS[0],
        packaging: '',
        tech: TECH_OPTIONS[0],
        collectorName: '',
        comment: 'Ошибка загрузки данных',
      };
    }
  },

  /* ----------  5. Удаление доставки  ---------- */
  async deleteDelivery(id: string): Promise<boolean> {
    try { await api.delete(`/deliveries/${id}/`); return true; }
    catch (err) { console.error('Ошибка при удалении доставки:', err); return false; }
  },

  /* ----------  6. Обновление доставки  ---------- */
  async updateDelivery(id: string, data: any): Promise<boolean> {
    try {
      const apiData: Record<string, any> = { ...data };

      /* статус */
      if (data.status_key) {
        const { data: statuses } = await api.get('/delivery-statuses/');
        const name = data.status_key === 'delivered' ? 'Доставлен' : 'В ожидании';
        const sObj = statuses.find((s: any) => s.name === name);
        if (sObj) apiData.status_id = sObj.id;
        delete apiData.status_key;
      }

      /* тех. состояние */
      if (data.tech_key) {
        const { data: list } = await api.get('/tech-statuses/');
        const map: Record<string, string> = { faulty: 'Неисправно', repair: 'На ремонте', ok: 'Исправно' };
        const tObj = list.find((t: any) => t.name === map[data.tech_key] );
        if (tObj) apiData.technical_condition_id = tObj.id;
        delete apiData.tech_key;
      }

      await api.patch(`/deliveries/${id}/`, apiData);
      return true;
    } catch (err) {
      console.error('Ошибка при обновлении доставки:', err);
      return false;
    }
  },

  /* ----------  7. Справочники  ---------- */
  async getTransportModels(): Promise<TransportModel[]> {
    try {
      const { data } = await api.get('/transport-models/');
      return data.map((i: any) => ({
        id:  i.id,
        key: String(i.id),
        name:i.number || 'Модель без номера',
      }));
    } catch (err) {
      console.error('Ошибка при загрузке моделей транспорта:', err);
      return [
        { id: 1, key: 'dx-100', name: 'DX-100' },
        { id: 2, key: 'dx-200', name: 'DX-200' },
        { id: 3, key: 'rx-300', name: 'RX-300' },
      ];
    }
  },

  async getDeliveryStatuses(): Promise<StatusOption[]> {
    try {
      const { data } = await api.get('/delivery-statuses/');
      return data.map((i: any) => ({
        key:   i.key ?? String(i.id),
        label: i.name,
        color: i.color ?? '#A06A1B',
      }));
    } catch (err) {
      console.error('Ошибка при загрузке статусов доставки:', err);
      return [...STATUS_OPTIONS];
    }
  },

  async getTechStatuses(): Promise<StatusOption[]> {
    try {
      const { data } = await api.get('/tech-statuses/');
      return data.map((i: any) => ({
        key:   i.key ?? String(i.id),
        label: i.name,
        color: i.color ?? '#18805B',
      }));
    } catch (err) {
      console.error('Ошибка при загрузке технических состояний:', err);
      return [...TECH_OPTIONS];
    }
  },

  async createDelivery(data: Record<string, any>): Promise<boolean> {
    try { await api.post('/deliveries/', data); return true; }
    catch (err) { console.error('Ошибка при создании доставки:', err); return false; }
  },

  async getServices(): Promise<ServiceItem[]> {
    try {
      const { data } = await api.get('/services/');
      return data.map((i: any) => ({
        id: i.id,
        key:`service-${i.id}`,
        title: i.name,
        subtitle: '8 позиций', // ← при желании замените на реальные данные
      }));
    } catch (err) {
      console.error('Ошибка при загрузке услуг:', err);
      throw new Error('Не удалось загрузить список услуг. Пожалуйста, попробуйте позже.');
    }
  },

  async getPackagingTypes(): Promise<PackagingItem[]> {
    try {
      const { data } = await api.get('/packaging-types/');
      return data.map((i: any) => ({
        id: i.id,
        key:`packaging-${i.id}`,
        title: i.name,
      }));
    } catch (err) {
      console.error('Ошибка при загрузке типов упаковки:', err);
      throw new Error('Не удалось загрузить типы упаковки. Пожалуйста, попробуйте позже.');
    }
  },
};

export default api;
