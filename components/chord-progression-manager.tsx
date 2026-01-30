import { ThemedText } from "@/components/themed/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ChordProgression, useSongsStore } from "@/stores/songsStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { FlatList, Pressable, StyleSheet, TextInput, View } from "react-native";
import { alert } from "yooo-native";

interface ChordProgressionManagerProps {
  songId: string;
  progressions: ChordProgression[];
}

const COMMON_CHORDS = [
  // Original natural / white-key chords
  "C", "D", "E", "F", "G", "A", "B",
  "Cm", "Dm", "Em", "Fm", "Gm", "Am", "Bm",

  // 7ths you already have
  "C7", "D7", "E7", "F7", "G7", "A7", "B7",
  "Cmaj7", "Dmaj7", "Emaj7", "Fmaj7", "Gmaj7", "Amaj7", "Bmaj7",

  // ─────────────────────────────────────────────
  // Very common flat chords (highest priority)
  "Bb", "Eb", "Ab", "Db", "Gb",           // major flats
  "Bbm", "Ebm", "Abm", "Dbm", "Gbm",      // minor flats
  "Bb7", "Eb7", "Ab7", "Db7",             // dominant 7ths
  "Bbmaj7", "Ebmaj7", "Abmaj7",           // major 7ths (less common but nice)

  // Super frequent borrowed flats (as symbols)
  "bVII",  // often Bb in C, G in D, etc.
  "bVI",   // often Ab in C, F in D
  "bIII",  // often Eb in C, B in D
  "iv",    // Fm in C major songs

  // Some sharp chords (less frequent but useful)
  "C#", "D#", "F#", "G#", "A#",           // sharp majors
  "C#m", "D#m", "F#m", "G#m", "A#m",      // sharp minors
  "C#7", "F#7", "G#7",                    // sharp dominants
];

export default function ChordProgressionManager({
  songId,
  progressions,
}: ChordProgressionManagerProps) {
  const colorScheme = useColorScheme();
  const {
    addChordProgression,
    updateChordProgression,
    deleteChordProgression,
  } = useSongsStore();
  const styles = getStyles(colorScheme ?? "light");

  const [isAdding, setIsAdding] = useState(false);
  const [newProgression, setNewProgression] = useState({
    name: "",
    chords: [] as string[],
    bars: 4,
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleAddChord = (chord: string) => {
    if (newProgression.chords.length < 8) {
      setNewProgression((prev) => ({
        ...prev,
        chords: [...prev.chords, chord],
      }));
    }
  };

  const handleRemoveChord = (index: number) => {
    setNewProgression((prev) => ({
      ...prev,
      chords: prev.chords.filter((_, i) => i !== index),
    }));
  };

  const handleSaveProgression = async () => {
    if (!newProgression.name.trim()) {
      alert.dialog("Error", "Please enter a name for the progression");
      return;
    }

    if (newProgression.chords.length === 0) {
      alert.dialog("Error", "Please add at least one chord");
      return;
    }

    try {
      if (editingId) {
        await updateChordProgression(songId, editingId, newProgression);
        setEditingId(null);
      } else {
        await addChordProgression(songId, newProgression);
      }

      setNewProgression({ name: "", chords: [], bars: 4 });
      setIsAdding(false);
    } catch (error) {
      console.error("Error saving progression:", error);
      alert.dialog("Error", "Failed to save chord progression");
    }
  };

  const handleEditProgression = (progression: ChordProgression) => {
    setNewProgression({
      name: progression.name,
      chords: [...progression.chords],
      bars: progression.bars,
    });
    setEditingId(progression.id);
    setIsAdding(true);
  };

  const handleDeleteProgression = (progressionId: string) => {
    alert.dialog(
      "Delete Progression",
      "Are you sure you want to delete this chord progression?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteChordProgression(songId, progressionId),
        },
      ]
    );
  };

  const renderProgressionItem = ({ item }: { item: ChordProgression }) => (
    <View style={styles.progressionItem}>
      <View style={styles.progressionHeader}>
        <ThemedText style={styles.progressionName}>{item.name}</ThemedText>
        <View style={styles.progressionActions}>
          <Pressable
            onPress={() => handleEditProgression(item)}
            style={styles.editButton}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color={Colors[colorScheme ?? "light"].tint}
            />
          </Pressable>
          <Pressable
            onPress={() => handleDeleteProgression(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color={Colors[colorScheme ?? "light"].icon}
            />
          </Pressable>
        </View>
      </View>
      <View style={styles.chordsContainer}>
        {item.chords.map((chord, index) => (
          <View key={index} style={styles.chordBadge}>
            <ThemedText style={styles.chordText}>{chord}</ThemedText>
          </View>
        ))}
      </View>
      <ThemedText style={styles.barsText}>{item.bars} bars</ThemedText>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <ThemedText style={styles.sectionTitle}>Chord Progressions</ThemedText>
        <Pressable
          onPress={() => setIsAdding(!isAdding)}
          style={styles.addButton}
        >
          <Ionicons
            name={isAdding ? "close" : "add"}
            size={20}
            color={colorScheme === "dark" ? "#000" : "#fff"}
          />
          <ThemedText style={styles.addButtonText}>
            {isAdding ? "Cancel" : "Add"}
          </ThemedText>
        </Pressable>
      </View>

      {isAdding && (
        <View style={styles.addForm}>
          <TextInput
            style={styles.nameInput}
            value={newProgression.name}
            onChangeText={(text) =>
              setNewProgression((prev) => ({ ...prev, name: text }))
            }
            placeholder="Progression name (e.g., Verse, Chorus)"
            placeholderTextColor={Colors[colorScheme ?? "light"].icon}
            maxLength={50}
          />

          <View style={styles.barsRow}>
            <ThemedText style={styles.barsLabel}>Bars:</ThemedText>
            <TextInput
              style={styles.barsInput}
              value={newProgression.bars.toString()}
              onChangeText={(text) => {
                const bars = parseInt(text) || 4;
                setNewProgression((prev) => ({
                  ...prev,
                  bars: Math.max(1, Math.min(16, bars)),
                }));
              }}
              keyboardType="numeric"
              maxLength={2}
            />
          </View>

          <ThemedText style={styles.chordsLabel}>Selected Chords:</ThemedText>
          <View style={styles.selectedChords}>
            {newProgression.chords.map((chord, index) => (
              <Pressable
                key={index}
                onPress={() => handleRemoveChord(index)}
                style={styles.selectedChord}
              >
                <ThemedText style={styles.selectedChordText}>
                  {chord}
                </ThemedText>
                <Ionicons
                  name="close"
                  size={14}
                  color={Colors[colorScheme ?? "light"].tint}
                />
              </Pressable>
            ))}
            {newProgression.chords.length === 0 && (
              <ThemedText style={styles.emptyMessage}>
                Tap chords below to add them
              </ThemedText>
            )}
          </View>

          <ThemedText style={styles.chordsLabel}>Available Chords:</ThemedText>
          <View style={styles.chordPalette}>
            {COMMON_CHORDS.map((chord) => (
              <Pressable
                key={chord}
                onPress={() => handleAddChord(chord)}
                style={[
                  styles.chordOption,
                  newProgression.chords.length >= 8 &&
                    styles.chordOptionDisabled,
                ]}
                disabled={newProgression.chords.length >= 8}
              >
                <ThemedText style={styles.chordOptionText}>{chord}</ThemedText>
              </Pressable>
            ))}
          </View>

          <Pressable onPress={handleSaveProgression} style={styles.saveButton}>
            <ThemedText style={styles.saveButtonText}>
              {editingId ? "Update Progression" : "Save Progression"}
            </ThemedText>
          </Pressable>
        </View>
      )}

      <FlatList
        data={progressions}
        keyExtractor={(item) => item.id}
        renderItem={renderProgressionItem}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="musical-notes-outline"
              size={48}
              color={Colors[colorScheme ?? "light"].icon}
            />
            <ThemedText style={styles.emptyText}>
              No chord progressions yet. Add some to structure your song!
            </ThemedText>
          </View>
        }
      />
    </View>
  );
}

const getStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      marginVertical: 20,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: Colors[colorScheme].tint,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 12,
    },
    addButtonText: {
      fontSize: 14,
      fontWeight: "600",
      color: colorScheme === "dark" ? "#000" : "#fff",
    },
    addForm: {
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
    },
    nameInput: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
      borderRadius: 8,
      padding: 12,
      fontSize: 16,
      color: Colors[colorScheme].text,
      backgroundColor: colorScheme === "dark" ? "#333" : "#fff",
      marginBottom: 12,
    },
    barsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
      gap: 12,
    },
    barsLabel: {
      fontSize: 16,
      fontWeight: "500",
      color: Colors[colorScheme].text,
    },
    barsInput: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
      borderRadius: 8,
      padding: 8,
      fontSize: 16,
      color: Colors[colorScheme].text,
      backgroundColor: colorScheme === "dark" ? "#333" : "#fff",
      width: 60,
      textAlign: "center",
    },
    chordsLabel: {
      fontSize: 14,
      fontWeight: "500",
      color: Colors[colorScheme].text,
      marginBottom: 8,
    },
    selectedChords: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
      minHeight: 40,
      alignItems: "center",
    },
    selectedChord: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      backgroundColor: Colors[colorScheme].tint + "20",
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
    },
    selectedChordText: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].tint,
    },
    emptyMessage: {
      fontSize: 14,
      color: Colors[colorScheme].icon,
      opacity: 0.7,
      fontStyle: "italic",
    },
    chordPalette: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 16,
    },
    chordOption: {
      backgroundColor: Colors[colorScheme].borderColor,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    chordOptionDisabled: {
      opacity: 0.5,
    },
    chordOptionText: {
      fontSize: 14,
      fontWeight: "500",
      color: Colors[colorScheme].text,
    },
    saveButton: {
      backgroundColor: Colors[colorScheme].tint,
      paddingVertical: 12,
      borderRadius: 8,
      alignItems: "center",
    },
    saveButtonText: {
      fontSize: 16,
      fontWeight: "600",
      color: colorScheme === "dark" ? "#000" : "#fff",
    },
    progressionItem: {
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
    },
    progressionHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    progressionName: {
      fontSize: 16,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      flex: 1,
    },
    progressionActions: {
      flexDirection: "row",
      gap: 8,
    },
    editButton: {
      padding: 4,
    },
    deleteButton: {
      padding: 4,
    },
    chordsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      marginBottom: 8,
    },
    chordBadge: {
      backgroundColor: Colors[colorScheme].tint + "20",
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    chordText: {
      fontSize: 14,
      fontWeight: "600",
      color: Colors[colorScheme].tint,
    },
    barsText: {
      fontSize: 12,
      color: Colors[colorScheme].icon,
      opacity: 0.7,
    },
    emptyState: {
      alignItems: "center",
      paddingVertical: 32,
    },
    emptyText: {
      textAlign: "center",
      color: Colors[colorScheme].icon,
      marginTop: 12,
      lineHeight: 20,
    },
  });
