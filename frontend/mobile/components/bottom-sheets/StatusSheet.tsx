import { Ionicons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import React, { useCallback, useMemo, useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type StatusOption = {
  key: string;
  label: string;
  color: string;
};

type StatusSheetProps = {
  title: string;
  options: StatusOption[];
  selectedOption: StatusOption;
  onSelect: (option: StatusOption) => void;
  isOpen: boolean;
  onClose: () => void;
};

const StatusSheet = ({
  title,
  options,
  selectedOption,
  onSelect,
  isOpen,
  onClose,
}: StatusSheetProps) => {
  const sheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['30%'] as const, []);
  const sheetIndex = isOpen ? 0 : -1;

  const handleSelect = useCallback((option: StatusOption) => {
    onSelect(option);
    onClose();
  }, [onSelect, onClose]);

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
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <TouchableOpacity>
            <Ionicons name="search" size={18} color="#888" />
          </TouchableOpacity>
        </View>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            style={styles.statusOption}
            onPress={() => handleSelect(opt)}
          >
            <View style={[styles.badgeSmall, { backgroundColor: opt.color }]} />
            <Text style={[styles.statusLabel, opt.key === selectedOption.key && styles.statusSelected]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetContent: { flex: 1, padding: 16 },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sheetTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statusOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  statusLabel: { color: '#fff', flex: 1, fontSize: 16 },
  statusSelected: { fontWeight: 'bold' },
  badgeSmall: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
});

export default StatusSheet;