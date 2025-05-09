import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useMemo, useRef, useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TransportModel } from '@/services/api';

type CourierSheetProps = {
  models: TransportModel[];
  selectedModel: string;
  number: string;
  onModelChange: (model: string) => void;
  onNumberChange: (number: string) => void;
  isOpen: boolean;
  onClose: () => void;
};

const CourierSheet = ({
  models,
  selectedModel,
  number,
  onModelChange,
  onNumberChange,
  isOpen,
  onClose,
}: CourierSheetProps) => {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['50%'] as const, []);
  const sheetIndex = isOpen ? 0 : -1;
  
  // Локальные состояния для редактирования
  const [localModel, setLocalModel] = useState(selectedModel);
  const [localNumber, setLocalNumber] = useState(number);

  // Применить изменения и закрыть
  const handleApply = () => {
    onModelChange(localModel);
    onNumberChange(localNumber);
    onClose();
  };

  // Сбросить изменения и закрыть
  const handleCancel = () => {
    setLocalModel(selectedModel);
    setLocalNumber(number);
    onClose();
  };

  // Обновляем локальные состояния при изменении пропсов
  useEffect(() => {
    setLocalModel(selectedModel);
    setLocalNumber(number);
  }, [selectedModel, number]);

  return (
    <BottomSheet
      ref={sheetRef}
      index={sheetIndex}
      snapPoints={snapPoints}
      onChange={(index) => {
        if (index === -1) onClose();
      }}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: '#23262B' }}
      handleIndicatorStyle={{ backgroundColor: '#444' }}
    >
      <BottomSheetView style={styles.sheetContent}>
        <Text style={styles.sheetTitle}>Выберите модель и номер</Text>
        
        <View style={styles.modelRow}>
          {models.map((model) => (
            <TouchableOpacity
              key={model.key}
              style={[
                styles.modelButton, 
                localModel === model.key && styles.modelButtonSelected
              ]}
              onPress={() => setLocalModel(model.key)}
            >
              <Text style={styles.modelText}>{model.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <Text style={styles.label}>Номер</Text>
        <TextInput
          style={styles.input}
          value={localNumber}
          onChangeText={setLocalNumber}
          placeholder="Введите номер"
          placeholderTextColor="#888"
        />
        
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <Text style={styles.cancelButtonText}>Отмена</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
            <Text style={styles.applyButtonText}>Применить</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetContent: { 
    flex: 1, 
    padding: 16 
  },
  sheetTitle: { 
    color: '#fff', 
    fontSize: 18, 
    fontWeight: 'bold', 
    marginBottom: 16 
  },
  modelRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: 16 
  },
  modelButton: { 
    borderWidth: 1, 
    borderColor: '#35363B', 
    borderRadius: 8, 
    padding: 8, 
    margin: 4 
  },
  modelButtonSelected: { 
    backgroundColor: '#35363B' 
  },
  modelText: { 
    color: '#fff' 
  },
  label: { 
    color: '#B2B2B2', 
    marginBottom: 8 
  },
  input: { 
    backgroundColor: '#35363B', 
    color: '#fff', 
    borderRadius: 8, 
    padding: 10, 
    fontSize: 16, 
    marginBottom: 16 
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#35363B',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
  },
  applyButton: {
    flex: 1,
    backgroundColor: '#18805B',
    padding: 12,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#fff',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default CourierSheet;