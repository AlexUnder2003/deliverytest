// app/transit-time.tsx

import DateTimePicker from '@react-native-community/datetimepicker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

export default function TransitTimeScreen() {
  const router = useRouter();
  const {
    dispatchDate: dDate,
    dispatchTime: dTime,
    deliveryDate: vDate,
    deliveryTime: vTime,
    returnTo,
    id,
  } = useLocalSearchParams<{
    dispatchDate: string;
    dispatchTime: string;
    deliveryDate: string;
    deliveryTime: string;
    returnTo?: string;
    id?: string;
  }>();

  // Преобразуем из ISO в Date
  const [dispatchDate, setDispatchDate] = useState(new Date(dDate));
  const [dispatchTime, setDispatchTime] = useState(new Date(dTime));
  const [deliveryDate, setDeliveryDate] = useState(new Date(vDate));
  const [deliveryTime, setDeliveryTime] = useState(new Date(vTime));

  const [pickerConfig, setPickerConfig] = useState<{
    mode: 'date' | 'time';
    type: 'dispatch' | 'delivery';
    field: 'date' | 'time';
  } | null>(null);

  const openPicker = (
    type: 'dispatch' | 'delivery',
    field: 'date' | 'time',
    mode: 'date' | 'time'
  ) => setPickerConfig({ type, field, mode });

  const onPickerChange = (_: any, date?: Date) => {
    if (!date || !pickerConfig) return setPickerConfig(null);
    const { type, field } = pickerConfig;
    if (type === 'dispatch') {
      field === 'date'
        ? setDispatchDate(date)
        : setDispatchTime(date);
    } else {
      field === 'date'
        ? setDeliveryDate(date)
        : setDeliveryTime(date);
    }
    setPickerConfig(null);
  };

  const diffMin = () => {
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
    const mins = Math.round((end.getTime() - start.getTime()) / 60000);
    return mins > 0 ? mins : 0;
  };

  const onSave = () => {
    router.replace({
      // куда вернуться: либо явный returnTo, либо форма создания
      pathname: returnTo ?? '/(tabs)/create',
      params: {
        dispatchDate: dispatchDate.toISOString(),
        dispatchTime: dispatchTime.toISOString(),
        deliveryDate: deliveryDate.toISOString(),
        deliveryTime: deliveryTime.toISOString(),
        // id передавать не нужно: если вы редактируете,
        // он уже встроен в самом pathname '/(tabs)/123'
      },
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Отправка</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => openPicker('dispatch','date','date')}>
          <Text style={styles.pickerText}>
            {dispatchDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openPicker('dispatch','time','time')}>
          <Text style={styles.pickerText}>
            {dispatchTime.toLocaleTimeString()}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Доставка</Text>
      <View style={styles.row}>
        <TouchableOpacity onPress={() => openPicker('delivery','date','date')}>
          <Text style={styles.pickerText}>
            {deliveryDate.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openPicker('delivery','time','time')}>
          <Text style={styles.pickerText}>
            {deliveryTime.toLocaleTimeString()}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>
        В пути: {Math.floor(diffMin() / 60)}ч {diffMin() % 60}м
      </Text>

      <TouchableOpacity style={styles.button} onPress={onSave}>
        <Text style={styles.buttonText}>Сохранить</Text>
      </TouchableOpacity>

      {pickerConfig && (
        <DateTimePicker
          value={
            pickerConfig.field === 'date'
              ? pickerConfig.type === 'dispatch'
                ? dispatchDate
                : deliveryDate
              : pickerConfig.type === 'dispatch'
              ? dispatchTime
              : deliveryTime
          }
          mode={pickerConfig.mode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onPickerChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { flex:1, backgroundColor:'#23262B', padding:20 },
  title:      { color:'#fff', fontSize:18, fontWeight:'bold', marginTop:12 },
  row:        { flexDirection:'row', justifyContent:'space-between', marginVertical:12 },
  pickerText: { color:'#fff', borderWidth:1, borderColor:'#35363B', borderRadius:8, padding:12, minWidth:100, textAlign:'center' },
  button:     { backgroundColor:'#18805B', borderRadius:8, padding:14, marginTop:24, alignItems:'center' },
  buttonText: { color:'#fff', fontSize:16, fontWeight:'bold' },
});
