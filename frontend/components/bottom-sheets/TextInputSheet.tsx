import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useMemo, useRef } from 'react';
import { StyleSheet, Text, TextInput } from 'react-native';

type TextInputSheetProps = {
  title: string;
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
  placeholder?: string;
  multiline?: boolean;
  height?: number;
};

const TextInputSheet = ({
  title,
  value,
  onValueChange,
  isOpen,
  onClose,
  placeholder = '',
  multiline = false,
  height,
}: TextInputSheetProps) => {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => [multiline ? '40%' : '30%'] as const, [multiline]);
  const sheetIndex = isOpen ? 0 : -1;

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
        <Text style={styles.sheetTitle}>{title}</Text>
        <TextInput
          style={[styles.input, height ? { height } : multiline ? { height: 100 } : {}]}
          value={value}
          onChangeText={onValueChange}
          placeholder={placeholder}
          placeholderTextColor="#888"
          multiline={multiline}
        />
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetContent: { flex: 1, padding: 16 },
  sheetTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  input: { backgroundColor: '#35363B', color: '#fff', borderRadius: 8, padding: 10, fontSize: 18, marginBottom: 16 },
});

export default TextInputSheet;