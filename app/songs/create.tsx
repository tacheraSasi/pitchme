import LyricsEditor from "@/components/lyrics-editor";
import MetronomeControls from "@/components/metronome-controls";
import ScreenLayout from "@/components/ScreenLayout";
import { TapTempo } from "@/components/tap-tempo";
import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { Note, NOTES } from "@/constants/notes";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/useHaptics";
import { useCreateSong, useSongsStore } from "@/stores/songsStore";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
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

// Song Templates with preset structures
interface SongTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  genre?: string;
  bpm: number;
  timeSignature: string;
  chordProgressions: { name: string; chords: string[]; bars: number }[];
  lyricsTemplate: string;
}

const SONG_TEMPLATES: SongTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start from scratch",
    icon: "document-outline",
    bpm: 120,
    timeSignature: "4/4",
    chordProgressions: [],
    lyricsTemplate: "",
  },
  {
    id: "verse-chorus",
    name: "Verse-Chorus",
    description: "Classic pop structure",
    icon: "musical-notes-outline",
    genre: "Pop",
    bpm: 120,
    timeSignature: "4/4",
    chordProgressions: [
      { name: "Verse", chords: ["C", "Am", "F", "G"], bars: 8 },
      { name: "Chorus", chords: ["F", "G", "C", "Am"], bars: 8 },
    ],
    lyricsTemplate: "[Verse 1]\n\n\n[Chorus]\n\n\n[Verse 2]\n\n\n[Chorus]\n\n\n[Outro]\n",
  },
  {
    id: "verse-chorus-bridge",
    name: "Verse-Chorus-Bridge",
    description: "Full song structure",
    icon: "git-branch-outline",
    genre: "Pop",
    bpm: 110,
    timeSignature: "4/4",
    chordProgressions: [
      { name: "Verse", chords: ["G", "Em", "C", "D"], bars: 8 },
      { name: "Chorus", chords: ["C", "D", "G", "Em"], bars: 8 },
      { name: "Bridge", chords: ["Am", "D", "G", "C"], bars: 4 },
    ],
    lyricsTemplate: "[Verse 1]\n\n\n[Chorus]\n\n\n[Verse 2]\n\n\n[Chorus]\n\n\n[Bridge]\n\n\n[Chorus]\n\n\n[Outro]\n",
  },
  {
    id: "ballad",
    name: "Ballad",
    description: "Slow emotional song",
    icon: "heart-outline",
    genre: "Pop",
    bpm: 70,
    timeSignature: "4/4",
    chordProgressions: [
      { name: "Intro", chords: ["Am", "F", "C", "G"], bars: 4 },
      { name: "Verse", chords: ["Am", "F", "C", "G"], bars: 8 },
      { name: "Chorus", chords: ["F", "Am", "G", "C"], bars: 8 },
    ],
    lyricsTemplate: "[Intro]\n\n[Verse 1]\n\n\n[Chorus]\n\n\n[Verse 2]\n\n\n[Chorus]\n\n\n[Bridge]\n\n\n[Chorus]\n",
  },
  {
    id: "blues",
    name: "12-Bar Blues",
    description: "Classic blues progression",
    icon: "radio-outline",
    genre: "Blues",
    bpm: 90,
    timeSignature: "4/4",
    chordProgressions: [
      { name: "12-Bar Blues", chords: ["A7", "A7", "A7", "A7", "D7", "D7", "A7", "A7", "E7", "D7", "A7", "E7"], bars: 12 },
    ],
    lyricsTemplate: "[Verse 1]\n\n\n[Verse 2]\n\n\n[Verse 3]\n\n\n[Turnaround]\n",
  },
  {
    id: "rock",
    name: "Rock Anthem",
    description: "High energy rock structure",
    icon: "flash-outline",
    genre: "Rock",
    bpm: 140,
    timeSignature: "4/4",
    chordProgressions: [
      { name: "Intro/Riff", chords: ["E5", "G5", "A5", "E5"], bars: 4 },
      { name: "Verse", chords: ["E5", "G5", "D5", "A5"], bars: 8 },
      { name: "Chorus", chords: ["A5", "D5", "E5", "G5"], bars: 8 },
    ],
    lyricsTemplate: "[Intro]\n\n[Verse 1]\n\n\n[Pre-Chorus]\n\n\n[Chorus]\n\n\n[Verse 2]\n\n\n[Pre-Chorus]\n\n\n[Chorus]\n\n\n[Solo/Bridge]\n\n\n[Chorus]\n\n\n[Outro]\n",
  },
  {
    id: "folk",
    name: "Folk Song",
    description: "Acoustic storytelling",
    icon: "leaf-outline",
    genre: "Folk",
    bpm: 100,
    timeSignature: "4/4",
    chordProgressions: [
      { name: "Verse", chords: ["G", "C", "D", "G"], bars: 8 },
      { name: "Chorus", chords: ["C", "G", "D", "G"], bars: 8 },
    ],
    lyricsTemplate: "[Verse 1]\n\n\n[Verse 2]\n\n\n[Chorus]\n\n\n[Verse 3]\n\n\n[Chorus]\n\n\n[Verse 4]\n\n\n[Outro]\n",
  },
  {
    id: "waltz",
    name: "Waltz",
    description: "3/4 time signature",
    icon: "time-outline",
    genre: "Classical",
    bpm: 90,
    timeSignature: "3/4",
    chordProgressions: [
      { name: "A Section", chords: ["C", "G7", "C", "G7"], bars: 8 },
      { name: "B Section", chords: ["F", "C", "G7", "C"], bars: 8 },
    ],
    lyricsTemplate: "[A Section]\n\n\n[B Section]\n\n\n[A Section]\n",
  },
];

export default function CreateSong() {
  const colorScheme = useColorScheme();
  const createSong = useCreateSong();
  const styles = getStyles(colorScheme ?? "light");
  const aboutBottomSheetRef = useRef(null);
  const { trigger: Haptics } = useHaptics();

  const [selectedTemplate, setSelectedTemplate] = useState<string>("blank");
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

  const [pendingChordProgressions, setPendingChordProgressions] = useState<
    { name: string; chords: string[]; bars: number }[]
  >([]);

  const [isLoading, setIsLoading] = useState(false);

  const handleTemplateSelect = (template: SongTemplate) => {
    setSelectedTemplate(template.id);
    Haptics("selection");

    // Apply template settings
    setFormData((prev) => ({
      ...prev,
      bpm: template.bpm,
      timeSignature: template.timeSignature,
      genre: template.genre || prev.genre,
      lyrics: template.lyricsTemplate || "",
    }));

    // Store chord progressions to add after song creation
    setPendingChordProgressions(template.chordProgressions);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      Haptics("error");
      alert.dialog("Error", "Please enter a song title");
      return;
    }

    if (formData.bpm < 40 || formData.bpm > 200) {
      Haptics("error");
      alert.dialog("Error", "BPM must be between 40 and 200");
      return;
    }

    setIsLoading(true);
    try {
      const tagsArray = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);

      const newSong = await createSong({
        title: formData.title.trim(),
        key: formData.key,
        bpm: formData.bpm,
        timeSignature: formData.timeSignature,
        description: formData.description.trim(),
        inspiration: formData.inspiration.trim(),
        genre: formData.genre || undefined,
        lyrics: formData.lyrics.trim(),
        tags: tagsArray,
        chordProgressions: [],
        isCompleted: formData.isCompleted,
        isFavorite: false,
      });

      // Add chord progressions from template
      const { addChordProgression } = useSongsStore.getState();
      for (const progression of pendingChordProgressions) {
        await addChordProgression(newSong.id, progression);
      }

      Haptics("success");
      router.back();
    } catch (error) {
      console.error("Error creating song:", error);
      alert.dialog("Error", "Failed to create song. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <ScreenLayout
      styles={styles.container}
      aboutBottomSheetRef={aboutBottomSheetRef}
    >
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
              New Song
            </ThemedText>
            <Pressable
              onPress={handleSave}
              style={[
                styles.saveButton,
                isLoading && styles.saveButtonDisabled,
              ]}
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
            {/* Song Template Selector */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionLabel}>Start with a Template</ThemedText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.templateScrollContent}
              >
                {SONG_TEMPLATES.map((template) => (
                  <Pressable
                    key={template.id}
                    style={[
                      styles.templateCard,
                      selectedTemplate === template.id && styles.templateCardSelected,
                    ]}
                    onPress={() => handleTemplateSelect(template)}
                  >
                    <View
                      style={[
                        styles.templateIconContainer,
                        selectedTemplate === template.id && styles.templateIconContainerSelected,
                      ]}
                    >
                      <Ionicons
                        name={template.icon as any}
                        size={24}
                        color={
                          selectedTemplate === template.id
                            ? colorScheme === "dark" ? "#000" : "#fff"
                            : Colors[colorScheme ?? "light"].tint
                        }
                      />
                    </View>
                    <ThemedText style={styles.templateName}>{template.name}</ThemedText>
                    <ThemedText style={styles.templateDescription} numberOfLines={2}>
                      {template.description}
                    </ThemedText>
                    {selectedTemplate === template.id && (
                      <View style={styles.templateCheckmark}>
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color={Colors[colorScheme ?? "light"].tint}
                        />
                      </View>
                    )}
                  </Pressable>
                ))}
              </ScrollView>
              {selectedTemplate !== "blank" && (
                <View style={styles.templateInfo}>
                  <Ionicons
                    name="information-circle-outline"
                    size={16}
                    color={Colors[colorScheme ?? "light"].tint}
                  />
                  <ThemedText style={styles.templateInfoText}>
                    Template applied: {SONG_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                    {pendingChordProgressions.length > 0 && ` (${pendingChordProgressions.length} chord progressions)`}
                  </ThemedText>
                </View>
              )}
            </View>

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
                      handleInputChange(
                        "bpm",
                        Math.max(40, Math.min(200, bpm))
                      );
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
              <LyricsEditor
                value={formData.lyrics}
                onChangeText={(text) => handleInputChange("lyrics", text)}
                placeholder="Write the song lyrics..."
                maxLength={5000}
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
    </ScreenLayout>
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
    // Template Selector Styles
    templateScrollContent: {
      paddingRight: 16,
      gap: 12,
    },
    templateCard: {
      width: 120,
      padding: 12,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: Colors[colorScheme].borderColor,
      backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
      alignItems: "center",
    },
    templateCardSelected: {
      borderColor: Colors[colorScheme].tint,
      backgroundColor: Colors[colorScheme].tint + "15",
    },
    templateIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: Colors[colorScheme].tint + "20",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    templateIconContainerSelected: {
      backgroundColor: Colors[colorScheme].tint,
    },
    templateName: {
      fontSize: 13,
      fontWeight: "600",
      color: Colors[colorScheme].text,
      textAlign: "center",
      marginBottom: 4,
    },
    templateDescription: {
      fontSize: 11,
      color: Colors[colorScheme].icon,
      textAlign: "center",
      lineHeight: 14,
    },
    templateCheckmark: {
      position: "absolute",
      top: 6,
      right: 6,
    },
    templateInfo: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginTop: 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: Colors[colorScheme].tint + "10",
      borderRadius: 8,
    },
    templateInfoText: {
      fontSize: 13,
      color: Colors[colorScheme].tint,
      flex: 1,
    },
  });
