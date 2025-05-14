/* deliveryApi.ts
 * Работает одинаково в Expo Web и iOS / Android
 */
import axios from 'axios';
import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';

/* ─────────────  КОНСТАНТЫ  ───────────── */
export const API_URL = 'http://80.242.56.74:80/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

/* ─────────────  ТИПЫ  ───────────── */
export type StatusOption   = { key: string; label: string; color: string };
export type TransportModel = { id: number; key: string; name: string };

export type Delivery = {
  model: string;
  number: string;
  dispatchDate: string;
  dispatchTime: string;
  deliveryDate: string;
  deliveryTime: string;
  distance: string;
  mediaFile: string;
  service: string;
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
  package: string;
  toClient: boolean;
  statuses: string[];
};

export type ServiceItem   = { id: number; key: string; title: string; subtitle?: string };
export type PackagingItem = { id: number; key: string; title: string };

/* ─────────────  ЗАПАСНЫЕ СПРАВОЧНИКИ  ───────────── */
export const STATUS_OPTIONS = [
  { key: 'waiting',   label: 'В ожидании', color: '#A06A1B' },
  { key: 'delivered', label: 'Доставлен',  color: '#1B7F4C' },
] as const;

export const TECH_OPTIONS = [
  { key: 'ok',     label: 'Исправно',   color: '#18805B' },
  { key: 'faulty', label: 'Неисправно', color: '#D32F2F' },
  { key: 'repair', label: 'На ремонте', color: '#D98D2B' },
] as const;

/* ─────────────  helpers  ───────────── */
export const getStatusByName = (n: string): StatusOption =>
  n === 'Доставлен' ? STATUS_OPTIONS[1] : STATUS_OPTIONS[0];

export const getTechStatusByName = (n: string): StatusOption => {
  switch (n) {
    case 'Неисправно': return TECH_OPTIONS[1];
    case 'На ремонте': return TECH_OPTIONS[2];
    default:           return TECH_OPTIONS[0];
  }
};

/* ─────────────  API  ───────────── */
export const deliveryApi = {
  /* 1. uploadFile — без изменений */
  async uploadFile(
    file: { uri?: string; file?: File; name: string; type?: string },
  ): Promise<string> {
    try {
      const formData = new FormData();
      if (Platform.OS === 'web') {
        if (file.file instanceof File) formData.append('file', file.file);
        else if (file.uri) {
          const blob = await (await fetch(file.uri)).blob();
          formData.append('file', new File(
            [blob], file.name, { type: file.type || blob.type || 'application/octet-stream' }
          ));
        }
      } else {
        if (!file.uri) throw new Error('uri обязателен');
        const fsInfo = await FileSystem.getInfoAsync(file.uri);
        if (!fsInfo.exists) throw new Error('Файл не существует');
        formData.append('file', {
          uri: file.uri, name: file.name, type: file.type ?? 'application/octet-stream',
        } as any);
      }
      const { data } = await axios.post(`${API_URL}/upload-file/`, formData);
      return data.file_url;
    } catch (err) {
      console.error('uploadFile:', err);
      throw new Error('Не удалось загрузить файл');
    }
  },

  /* 2. создание с файлами */
  async createDeliveryWithFiles(
    deliveryData: Record<string, any>,
    files: Array<{ uri?: string; file?: File; name: string; type?: string }>,
  ) {
    const formData = new FormData();

    Object.entries(deliveryData).forEach(([k, v]) => {
      if (v !== undefined && v !== null && typeof v !== 'object')
        formData.append(k, String(v));
    });

    for (const f of files ?? []) {
      if (Platform.OS === 'web') {
        if (f.file instanceof File) formData.append('attachments', f.file);
        else if (f.uri) {
          const blob = await (await fetch(f.uri)).blob();
          formData.append('attachments', new File([blob], f.name, {
            type: f.type || blob.type || 'application/octet-stream',
          }));
        }
      } else if (f.uri) {
        formData.append('attachments', {
          uri: f.uri, name: f.name, type: f.type ?? 'application/octet-stream',
        } as any);
      }
    }

    const { data } = await axios.post(`${API_URL}/deliveries/`, formData);
    return data;
  },

  /* 3. список доставок */
  async getDeliveries(): Promise<DeliveryListItem[]> {
    try {
      const { data } = await api.get('/deliveries/');
      return data.map((item: any) => {
        const diffMin =
          Math.max(0, (new Date(item.delivery_datetime).getTime() -
                       new Date(item.dispatch_datetime).getTime()) / 60000);
        return {
          id: String(item.id),
          time: `${Math.floor(diffMin / 60)}ч ${diffMin % 60}м`,
          distance: item.distance || '2 км',
          package:  item.packaging?.name || 'Пакет до 1 кг',
          toClient: item.service?.name === 'До клиента',
          statuses: [
            item.status?.name              || 'В ожидании',
            item.technical_condition?.name || 'Исправно',
          ],
        };
      });
    } catch (err) {
      console.error('getDeliveries:', err);
      throw new Error('Не удалось загрузить список доставок');
    }
  },

  /* 4. детальная доставка */
  async getDeliveryById(id: string): Promise<Delivery> {
    const { data } = await api.get(`/deliveries/${id}/`);
  
    const dispatch = new Date(data.dispatch_datetime);
    const delivery = new Date(data.delivery_datetime);
  
    /* ⬇️  главное: сразу формируем объект с key = id (строкой),
                   label = человеко-читаемое название,
                   color  = то, что пришло от бэка (либо дефолт) */
    const makeOpt = (o?: any): StatusOption => ({
      key:   String(o?.id ?? ''),
      label: o?.name  ?? '',
      color: o?.color ?? '#666',
    });
  
    return {
      model:  data.transport_model?.number || 'Неизвестно',
      number: data.transport_number       || '',
      dispatchDate: dispatch.toISOString().slice(0, 10),
      dispatchTime: dispatch.toTimeString().slice(0, 5),
      deliveryDate: delivery.toISOString().slice(0, 10),
      deliveryTime: delivery.toTimeString().slice(0, 5),
      distance:   data.distance || '',
      mediaFile:  data.attachments?.split('/').pop() || 'Нет файла',
      service:    data.service?.name      || '',
      status:     makeOpt(data.status),                 // ✔ key = id
      packaging:  data.packaging?.name    || '',
      tech:       makeOpt(data.technical_condition),    // ✔ key = id
      collectorName: data.collector || '',
      comment:    data.comment  || '',
    };
  },

  /* 5. delete */
  async deleteDelivery(id: string) {
    try { await api.delete(`/deliveries/${id}/`); return true; }
    catch (err) { console.error(err); return false; }
  },

  /* 6. PATCH /deliveries/{id}/ — обновляем статус или тех.сост. удобными ключами */
  async updateDelivery(id: string, data: any) {
    try {
      const apiData: Record<string, any> = { ...data };

      if (data.status_key) {
        const { data: list } = await api.get('/delivery-statuses/');
        const target = data.status_key === 'delivered' ? 'Доставлен' : 'В ожидании';
        const found = list.find((s: any) => s.name === target);
        if (found) apiData.status = found.id;
        delete apiData.status_key;
      }

      if (data.tech_key) {
        const { data: list } = await api.get('/tech-statuses/');
        const map: Record<string,string> = { faulty:'Неисправно', repair:'На ремонте', ok:'Исправно' };
        const found = list.find((t: any) => t.name === map[data.tech_key]);
        if (found) apiData.technical_condition = found.id;
        delete apiData.tech_key;
      }

      await api.patch(`/deliveries/${id}/`, apiData);
      return true;
    } catch (err) {
      console.error('updateDelivery:', err);
      return false;
    }
  },

  /* 7. справочники */
  async getTransportModels(): Promise<TransportModel[]> {
    try {
      const { data } = await api.get('/transport-models/');
      return data.map((i: any) => ({
        id: i.id, key: String(i.id), name: i.number || 'Без номера',
      }));
    } catch (err) {
      console.error(err);
      return [
        { id: 1, key: 'dx-100', name: 'DX-100' },
        { id: 2, key: 'dx-200', name: 'DX-200' },
      ];
    }
  },

  async getDeliveryStatuses(): Promise<StatusOption[]> {
    try {
      const { data } = await api.get('/delivery-statuses/');
      return data.map((i: any) => ({
        key: String(i.id), label: i.name, color: i.color ?? '#A06A1B',
      }));
    } catch {
      return [...STATUS_OPTIONS];
    }
  },

  async getTechStatuses(): Promise<StatusOption[]> {
    try {
      const { data } = await api.get('/tech-statuses/');
      return data.map((i: any) => ({
        key: String(i.id), label: i.name, color: i.color ?? '#18805B',
      }));
    } catch {
      return [...TECH_OPTIONS];
    }
  },

  /* createDelivery — теперь отправляем поля без суффикса _id */
  async createDelivery(data: Record<string, any>) {
    try { await api.post('/deliveries/', data); return true; }
    catch (err) { console.error('createDelivery:', err); return false; }
  },

  async getServices(): Promise<ServiceItem[]> {
    const { data } = await api.get('/services/');
    return data.map((i: any) => ({
      id: i.id, key: `service-${i.id}`, title: i.name, subtitle: '—',
    }));
  },

  async getPackagingTypes(): Promise<PackagingItem[]> {
    const { data } = await api.get('/packaging-types/');
    return data.map((i: any) => ({
      id: i.id, key: `packaging-${i.id}`, title: i.name,
    }));
  },
};

export default api;
