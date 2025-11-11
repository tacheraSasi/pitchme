import MetronomeControls from "@/components/metronome-controls";
import { TapTempo } from "@/components/tap-tempo";
import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Note, NOTES } from "@/constants/notes";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useGetSong, useUpdateSong } from "@/stores/songsStore";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { alert } from "yooo-native";

const GENRES = [
  "Pop",
  "Rock",
  "Hip Hop",
  "R&B",
  "Country",
  "Folk",
  "Jazz",
  "Blues",
  "Electronic",
  "Classical",
  "Reggae",
  "Punk",
  "Metal",
  "Indie",
  "Alternative",
];

const TIME_SIGNATURES = [
  "4/4",
  "3/4",
  "2/4",
  "6/8",
  "9/8",
  "12/8",
  "5/4",
  "7/8",
];

export default function EditSong() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const getSong = useGetSong();
  const updateSong = useUpdateSong();
  const styles = getStyles(colorScheme ?? "light");

  const song = getSong(id!);

  const [formData, setFormData] = useState({
    title: "",
    key: Note.C as Note,
    bpm: 120,
    timeSignature: "4/4",
    description: "",
    inspiration: "",
    lyrics: "",
    genre: "",
    tags: "",
    isCompleted: false,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (song) {
      setFormData({
        title: song.title,
        key: song.key,
        bpm: song.bpm,
        timeSignature: song.timeSignature,
        description: song.description,
        inspiration: song.inspiration,
        lyrics: song.lyrics || "",
        genre: song.genre || "",
        tags: song.tags.join(", "),
        isCompleted: song.isCompleted,
      });
    }
  }, [song]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      alert.dialog("Error", "Please enter a song title");
      return;
    }

    if (formData.bpm < 40 || formData.bpm > 200) {
      alert.dialog("Error", "BPM must be between 40 and 200");
      return;
    }

    setIsLoading(true);
    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      await updateSong(id!, {
        title: formData.title.trim(),
        key: formData.key,
        bpm: formData.bpm,
        timeSignature: formData.timeSignature,
        description: formData.description.trim(),
        inspiration: formData.inspiration.trim(),
        lyrics: formData.lyrics.trim(),
        genre: formData.genre || undefined,
        tags: tagsArray,
        isCompleted: formData.isCompleted,
      });

      router.back();
    } catch (error) {
      console.error("Error updating song:", error);
      alert.dialog("Error", "Failed to update song. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!song) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons
                name="arrow-back"
                size={24}
                color={Colors[colorScheme ?? "light"].text}
              />
            </Pressable>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              Song Not Found
            </ThemedText>
          </View>

          <View style={styles.errorContainer}>
            <Ionicons
              name="musical-notes-outline"
              size={80}
              color={Colors[colorScheme ?? "light"].icon}
            />
            <ThemedText style={styles.errorText}>
              This song could not be found.
            </ThemedText>
          </View>
        </SafeAreaView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons
              name="arrow-back"
              size={24}
              color={Colors[colorScheme ?? "light"].text}
            />
          </Pressable>
          <ThemedText type="subtitle" style={styles.headerTitle}>
            Edit Song
          </ThemedText>
          <Pressable
            onPress={handleSave}
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            disabled={isLoading}
          >
            <ThemedText style={styles.saveButtonText}>
              {isLoading ? "Saving..." : "Save"}
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Song Title */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Song Title *</ThemedText>
            <TextInput
              style={styles.textInput}
              value={formData.title}
              onChangeText={(text) => handleInputChange("title", text)}
              placeholder="Enter song title..."
              placeholderTextColor={Colors[colorScheme ?? "light"].icon}
              maxLength={100}
            />
          </View>

          {/* Musical Properties */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>
              Musical Properties
            </ThemedText>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <ThemedText style={styles.inputLabel}>Key</ThemedText>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.key}
                    onValueChange={(value: Note) =>
                      handleInputChange("key", value)
                    }
                    style={styles.picker}
                    dropdownIconColor={Colors[colorScheme ?? "light"].text}
                  >
                    {NOTES.map((note) => (
                      <Picker.Item key={note} label={note} value={note} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.halfWidth}>
                <ThemedText style={styles.inputLabel}>BPM</ThemedText>
                <TextInput
                  style={styles.textInput}
                  value={formData.bpm.toString()}
                  onChangeText={(text) => {
                    const bpm = parseInt(text) || 120;
                    handleInputChange("bpm", Math.max(40, Math.min(200, bpm)));
                  }}
                  placeholder="120"
                  placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                  keyboardType="numeric"
                  maxLength={3}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={styles.halfWidth}>
                <ThemedText style={styles.inputLabel}>
                  Time Signature
                </ThemedText>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.timeSignature}
                    onValueChange={(value: string) =>
                      handleInputChange("timeSignature", value)
                    }
                    style={styles.picker}
                    dropdownIconColor={Colors[colorScheme ?? "light"].text}
                  >
                    {TIME_SIGNATURES.map((sig) => (
                      <Picker.Item key={sig} label={sig} value={sig} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View style={styles.halfWidth}>
                <ThemedText style={styles.inputLabel}>Genre</ThemedText>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.genre}
                    onValueChange={(value: string) =>
                      handleInputChange("genre", value)
                    }
                    style={styles.picker}
                    dropdownIconColor={Colors[colorScheme ?? "light"].text}
                  >
                    <Picker.Item label="Select genre..." value="" />
                    {GENRES.map((genre) => (
                      <Picker.Item key={genre} label={genre} value={genre} />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </View>

          {/* Tap Tempo */}
          <TapTempo
            onBpmChange={(bpm) => handleInputChange("bpm", bpm)}
            currentBpm={formData.bpm}
          />

          {/* Metronome */}
          <MetronomeControls
            bpm={formData.bpm}
            timeSignature={formData.timeSignature}
            onBpmChange={(bpm) => handleInputChange("bpm", bpm)}
          />

          {/* Description */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Description</ThemedText>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.description}
              onChangeText={(text) => handleInputChange("description", text)}
              placeholder="Describe your song..."
              placeholderTextColor={Colors[colorScheme ?? "light"].icon}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          {/* Inspiration */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>
              Inspiration & Ideas
            </ThemedText>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.inspiration}
              onChangeText={(text) => handleInputChange("inspiration", text)}
              placeholder="What inspired this song? What story do you want to tell?"
              placeholderTextColor={Colors[colorScheme ?? "light"].icon}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={500}
            />
          </View>

          {/* Lyrics */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Lyrics</ThemedText>
            <TextInput
              style={[styles.textInput, styles.textArea]}
              value={formData.lyrics}
              onChangeText={(text) => handleInputChange("lyrics", text)}
              placeholder="Write your lyrics here..."
              placeholderTextColor={Colors[colorScheme ?? "light"].icon}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={2000}
            />
          </View>

          {/* Tags */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionLabel}>Tags</ThemedText>
            <TextInput
              style={styles.textInput}
              value={formData.tags}
              onChangeText={(text) => handleInputChange("tags", text)}
              placeholder="upbeat, summer, love (comma separated)"
              placeholderTextColor={Colors[colorScheme ?? "light"].icon}
              maxLength={200}
            />
            <ThemedText style={styles.helperText}>
              Separate tags with commas to help organize your songs
            </ThemedText>
          </View>

          {/* Status */}
          <View style={styles.section}>
            <Pressable
              style={styles.checkboxRow}
              onPress={() =>
                handleInputChange("isCompleted", !formData.isCompleted)
              }
            >
              <View
                style={[
                  styles.checkbox,
                  formData.isCompleted && styles.checkboxChecked,
                ]}
              >
                {formData.isCompleted && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={colorScheme === "dark" ? "#000" : "#fff"}
                  />
                )}
              </View>
              <ThemedText style={styles.checkboxLabel}>
                Mark as completed
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const getStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: Colors[colorScheme].borderColor,
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      fontSize: 18,
      fontWeight: "600",
      color: Colors[colorScheme].text,
    },
    saveButton: {
      backgroundColor: Colors[colorScheme].tint,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    saveButtonDisabled: {
      opacity: 0.5,
    },
    saveButtonText: {
      color: colorScheme === "dark" ? "#000" : "#fff",
      fontWeight: "600",
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
    },
    section: {
      marginBottom: 24,
    },
    sectionLabel: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 12,
      color: Colors[colorScheme].text,
    },
    inputLabel: {
      fontSize: 14,
      fontWeight: "500",
      marginBottom: 8,
      color: Colors[colorScheme].text,
    },
    textInput: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: Colors[colorScheme].text,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
    },
    textArea: {
      height: 100,
    },
    row: {
      flexDirection: "row",
      gap: 12,
      marginBottom: 16,
    },
    halfWidth: {
      flex: 1,
    },
    pickerContainer: {
      borderWidth: 1,
      borderColor: Colors[colorScheme].borderColor,
      borderRadius: 12,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      overflow: "hidden",
    },
    picker: {
      color: Colors[colorScheme].text,
      backgroundColor: "transparent",
    },
    helperText: {
      fontSize: 12,
      color: Colors[colorScheme].icon,
      marginTop: 4,
      opacity: 0.7,
    },
    checkboxRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    checkbox: {
      width: 24,
      height: 24,
      borderWidth: 2,
      borderColor: Colors[colorScheme].tint,
      borderRadius: 6,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxChecked: {
      backgroundColor: Colors[colorScheme].tint,
    },
    checkboxLabel: {
      fontSize: 16,
      color: Colors[colorScheme].text,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 32,
    },
    errorText: {
      textAlign: "center",
      color: Colors[colorScheme].icon,
      marginTop: 16,
      fontSize: 16,
    },
  });
