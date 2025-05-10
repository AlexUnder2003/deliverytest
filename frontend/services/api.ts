import axios from 'axios';
import { Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

// Константы
export const API_URL = 'http://localhost:8000';

// Создаем экземпляр axios с базовым URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Типы
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

export type DeliveryListItem = {
  id: string;
  time: string;
  distance: string;
  fragile: boolean;
  package: string;
  toClient: boolean;
  statuses: string[];
};

// Типы для статусов и технических состояний
export type StatusOption = {
  key: string;
  label: string;
  color: string;
};

export type TransportModel = {
  id: number;
  key: string;
  name: string;
};

// Константы для статусов (используются как запасные данные)
export const STATUS_OPTIONS = [
  { key: 'waiting', label: 'В ожидании', color: '#A06A1B' },
  { key: 'delivered', label: 'Доставлен', color: '#1B7F4C' },
] as const;

export const TECH_OPTIONS = [
  { key: 'ok', label: 'Исправно', color: '#18805B' },
  { key: 'faulty', label: 'Неисправно', color: '#D32F2F' },
  { key: 'repair', label: 'На ремонте', color: '#D98D2B' },
] as const;

// Вспомогательные функции для преобразования данных
export function getStatusByName(name: string) {
  switch (name) {
    case 'Доставлен':
      return STATUS_OPTIONS[1];
    case 'В ожидании':
    default:
      return STATUS_OPTIONS[0];
  }
}

export function getTechStatusByName(name: string) {
  switch (name) {
    case 'Неисправно':
      return TECH_OPTIONS[1];
    case 'На ремонте':
      return TECH_OPTIONS[2];
    case 'Исправно':
    default:
      return TECH_OPTIONS[0];
  }
}

// Типы для справочников
export type ServiceItem = {
  id: number;
  key: string;
  title: string;
  subtitle?: string;
  withButton?: boolean;
};

export type PackagingItem = {
  id: number;
  key: string;
  title: string;
};

// API-запросы
export const deliveryApi = {
  // Загрузка файла на сервер
  async uploadFile(fileUri: string, fileName: string): Promise<string> {
    try {
      // Проверяем существование файла
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        throw new Error('Файл не существует');
      }

      // Создаем FormData для отправки файла
      const formData = new FormData();
      formData.append('file', {
        uri: fileUri,
        name: fileName,
        type: 'application/octet-stream', // Можно определить тип по расширению
      } as any);

      // Отправляем файл на сервер
      const response = await axios.post(`${API_URL}/upload-file/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Возвращаем URL загруженного файла
      return response.data.file_url;
    } catch (error) {
      console.error('Ошибка при загрузке файла:', error);
      throw new Error('Не удалось загрузить файл. Пожалуйста, попробуйте позже.');
    }
  },

  // Создание доставки с файлами
  async createDeliveryWithFiles(deliveryData: any, files: Array<{ uri: string; name: string }>): Promise<any> {
    try {
      // Если есть файлы, загружаем их сначала
      let attachmentsUrl = null;
      
      if (files && files.length > 0) {
        // Для простоты берем только первый файл (можно модифицировать для поддержки нескольких)
        const file = files[0];
        attachmentsUrl = await this.uploadFile(file.uri, file.name);
      }
      
      // Добавляем URL файла к данным доставки
      const dataToSend = {
        ...deliveryData,
        attachments: attachmentsUrl,
      };
      
      // Отправляем данные доставки
      const response = await api.post('/deliveries/', dataToSend);
      return response.data;
    } catch (error) {
      console.error('Ошибка при создании доставки с файлами:', error);
      throw new Error('Не удалось создать доставку. Пожалуйста, попробуйте позже.');
    }
  },

  // Получение списка доставок
  async getDeliveries(): Promise<DeliveryListItem[]> {
    try {
      const response = await api.get('/deliveries/');
      
      // Преобразование данных из API в формат, используемый в приложении
      return response.data.map((item: any) => {
        // Расчет времени в пути
        const dispatchDateTime = new Date(item.dispatch_datetime);
        const deliveryDateTime = new Date(item.delivery_datetime);
        const diffMinutes = Math.max(0, Math.round((deliveryDateTime.getTime() - dispatchDateTime.getTime()) / 60000));
        const timeInTransit = `${Math.floor(diffMinutes / 60)}ч ${diffMinutes % 60}м`;
        
        return {
          id: item.id.toString(),
          time: timeInTransit,
          distance: item.distance || '2 км',
          fragile: item.cargo_type?.name === 'Хрупкий груз',
          package: item.packaging?.name || 'Пакет до 1 кг',
          toClient: item.services && item.services.some((s: any) => s.name === 'До клиента'),
          statuses: [
            item.status?.name || 'В ожидании',
            item.technical_condition?.name || 'Исправно'
          ],
        };
      });
    } catch (error) {
      console.error('Ошибка при загрузке доставок:', error);
      throw new Error('Не удалось загрузить данные. Пожалуйста, попробуйте позже.');
    }
  },

  // Получение доставки по ID
  async getDeliveryById(id: string): Promise<Delivery> {
    try {
      const response = await api.get(`/deliveries/${id}/`);
      const data = response.data;
      
      // Преобразуем данные из формата API в формат, используемый в компоненте
      // Извлекаем дату и время из полей datetime
      const dispatchDateTime = new Date(data.dispatch_datetime);
      const deliveryDateTime = new Date(data.delivery_datetime);
      
      // Получаем статус доставки
      const deliveryStatus = getStatusByName(data.status?.name || 'В ожидании');
      
      // Получаем техническое состояние
      const techStatus = getTechStatusByName(data.technical_condition?.name || 'Исправно');
      
      return {
        model: data.transport_model?.number || 'Неизвестно',
        number: data.transport_number || '',
        dispatchDate: dispatchDateTime.toISOString().slice(0, 10),
        dispatchTime: `${dispatchDateTime.getHours().toString().padStart(2, '0')}:${dispatchDateTime.getMinutes().toString().padStart(2, '0')}`,
        deliveryDate: deliveryDateTime.toISOString().slice(0, 10),
        deliveryTime: `${deliveryDateTime.getHours().toString().padStart(2, '0')}:${deliveryDateTime.getMinutes().toString().padStart(2, '0')}`,
        distance: data.distance || '',
        mediaFile: data.attachments ? data.attachments.split('/').pop() || 'файл.pdf' : 'Нет файла',
        service: data.services && data.services.length > 0 ? data.services[0].name : '',
        fragile: data.cargo_type?.name === 'Хрупкий груз',
        status: deliveryStatus,
        packaging: data.packaging?.name || '',
        tech: techStatus,
        collectorName: data.collector || '',
        comment: data.comment || '',
      };
    } catch (error) {
      console.error('Ошибка при загрузке доставки:', error);
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

  // Удаление доставки
  async deleteDelivery(id: string): Promise<boolean> {
    try {
      await api.delete(`/deliveries/${id}/`);
      return true;
    } catch (error) {
      console.error('Ошибка при удалении доставки:', error);
      return false;
    }
  },

  // Обновление доставки
  async updateDelivery(id: string, data: any): Promise<boolean> {
    try {
      // Подготовка данных для отправки на сервер
      const apiData: any = { ...data };
      
      // Если нужно обновить статус доставки
      if (data.status_key) {
        // Получаем ID статуса по ключу
        const statusResponse = await api.get('/delivery-statuses/');
        if (statusResponse.status === 200) {
          const statuses = statusResponse.data;
          const statusObj = statuses.find((s: any) => 
            s.name === (data.status_key === 'delivered' ? 'Доставлен' : 'В ожидании')
          );
          if (statusObj) {
            apiData.status_id = statusObj.id;
          }
          delete apiData.status_key;
        }
      }
      
      // Если нужно обновить техническое состояние
      if (data.tech_key) {
        // Получаем ID тех. состояния по ключу
        const techResponse = await api.get('/tech-statuses/');
        if (techResponse.status === 200) {
          const techStatuses = techResponse.data;
          let techName = 'Исправно';
          if (data.tech_key === 'faulty') techName = 'Неисправно';
          if (data.tech_key === 'repair') techName = 'На ремонте';
          
          const techObj = techStatuses.find((t: any) => t.name === techName);
          if (techObj) {
            apiData.technical_condition_id = techObj.id;
          }
          delete apiData.tech_key;
        }
      }
      
      await api.patch(`/deliveries/${id}/`, apiData);
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении доставки:', error);
      return false;
    }
  },

  // Получение списка моделей транспорта
  async getTransportModels(): Promise<TransportModel[]> {
    try {
      const response = await api.get('/transport-models/');
      return response.data.map((item: any) => ({
        id: item.id,
        key: item.id.toString(),
        name: item.number || 'Модель без номера',
      }));
    } catch (error) {
      console.error('Ошибка при загрузке моделей транспорта:', error);
      // Возвращаем запасные данные в случае ошибки
      return [
        { id: 1, key: 'dx-100', name: 'DX-100' },
        { id: 2, key: 'dx-200', name: 'DX-200' },
        { id: 3, key: 'rx-300', name: 'RX-300' },
      ];
    }
  },

  // Получение статусов доставки
  async getDeliveryStatuses(): Promise<StatusOption[]> {
    try {
      const response = await api.get('/delivery-statuses/');
      return response.data.map((item: any) => ({
        key: item.key || item.id.toString(),
        label: item.name,
        color: item.color || '#A06A1B',
      }));
    } catch (error) {
      console.error('Ошибка при загрузке статусов доставки:', error);
      // Возвращаем запасные данные в случае ошибки
      return [...STATUS_OPTIONS];
    }
  },

  // Получение технических состояний
  async getTechStatuses(): Promise<StatusOption[]> {
    try {
      const response = await api.get('/tech-statuses/');
      return response.data.map((item: any) => ({
        key: item.key || item.id.toString(),
        label: item.name,
        color: item.color || '#18805B',
      }));
    } catch (error) {
      console.error('Ошибка при загрузке технических состояний:', error);
      // Возвращаем запасные данные в случае ошибки
      return [...TECH_OPTIONS];
    }
  },

  // Создание доставки
  async createDelivery(data: any): Promise<boolean> {
    try {
      await api.post('/deliveries/', data);
      return true;
    } catch (error) {
      console.error('Ошибка при создании доставки:', error);
      return false;
    }
  },

  // Получение списка услуг
  async getServices(): Promise<ServiceItem[]> {
    try {
      const response = await api.get('/services/');
      
      // Преобразование данных из API в формат, используемый в приложении
      return response.data.map((item: any) => ({
        id: item.id,
        key: `service-${item.id}`,
        title: item.name,
        subtitle: '8 позиций', // Можно заменить на реальные данные, если они доступны
      }));
    } catch (error) {
      console.error('Ошибка при загрузке услуг:', error);
      throw new Error('Не удалось загрузить список услуг. Пожалуйста, попробуйте позже.');
    }
  },

  // Получение списка типов упаковки
  async getPackagingTypes(): Promise<PackagingItem[]> {
    try {
      const response = await api.get('/packaging-types/');
      
      // Преобразование данных из API в формат, используемый в приложении
      return response.data.map((item: any) => ({
        id: item.id,
        key: `packaging-${item.id}`,
        title: item.name,
      }));
    } catch (error) {
      console.error('Ошибка при загрузке типов упаковки:', error);
      throw new Error('Не удалось загрузить типы упаковки. Пожалуйста, попробуйте позже.');
    }
  }
};

export default api;