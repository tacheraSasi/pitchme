import { ThemedText } from '@/components/themed/themed-text';
import { ThemedView } from '@/components/themed/themed-view';
import { BottomSheetView } from '@gorhom/bottom-sheet';
import React from 'react';
import { StyleSheet } from 'react-native';

const RecordingQualityBottomSheet = ({ bottomSheetRef }) => {
  return (
    <BottomSheetView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="subtitle">Select Recording Quality</ThemedText>
      </ThemedView>
      <ThemedView style={styles.optionsContainer}>
        <ThemedText style={styles.option}>Low Quality</ThemedText>
        <ThemedText style={styles.option}>Medium Quality</ThemedText>
        <ThemedText style={styles.option}>High Quality</ThemedText>
      </ThemedView>
    </BottomSheetView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  optionsContainer: {
    // Add styles for options container
  },
  option: {
    paddingVertical: 10,
    fontSize: 16,
  },
});

export default RecordingQualityBottomSheet;