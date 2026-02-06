import { ThemedText } from "@/components/themed/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/useHaptics";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
    Pressable,
    ScrollView,
    StyleSheet,
    TextInput,
    View,
} from "react-native";

interface LyricsEditorProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    maxLength?: number;
}

// Section markers that can be inserted
const SECTION_MARKERS = [
    { id: "verse", label: "Verse", marker: "[Verse]" },
    { id: "chorus", label: "Chorus", marker: "[Chorus]" },
    { id: "bridge", label: "Bridge", marker: "[Bridge]" },
    { id: "pre-chorus", label: "Pre-Chorus", marker: "[Pre-Chorus]" },
    { id: "intro", label: "Intro", marker: "[Intro]" },
    { id: "outro", label: "Outro", marker: "[Outro]" },
    { id: "hook", label: "Hook", marker: "[Hook]" },
    { id: "instrumental", label: "Instrumental", marker: "[Instrumental]" },
];

// Common chord patterns for quick reference
const COMMON_CHORDS = ["C", "G", "Am", "F", "D", "Em", "A", "E", "Dm", "Bm"];

export default function LyricsEditor({
    value,
    onChangeText,
    placeholder = "Write your lyrics here...",
    maxLength = 5000,
}: LyricsEditorProps) {
    const colorScheme = useColorScheme();
    const { trigger: haptics } = useHaptics();
    const styles = getStyles(colorScheme ?? "light");
    const textInputRef = useRef<TextInput>(null);

    const [showChordPicker, setShowChordPicker] = useState(false);
    const [cursorPosition, setCursorPosition] = useState(0);

    // Parse lyrics to identify sections for preview
    const parsedLyrics = useMemo(() => {
        if (!value) return [];

        const lines = value.split("\n");
        return lines.map((line, index) => {
            // Check if line is a section marker
            const sectionMatch = line.match(/^\[(.*?)\]$/);
            if (sectionMatch) {
                return { type: "section", text: sectionMatch[1], line };
            }

            // Check if line has inline chords (e.g., "Am       G")
            const chordLineMatch = line.match(/^[A-G][#b]?m?(?:maj|min|dim|aug|sus|add|7|9|11|13)*(?:\s+[A-G][#b]?m?(?:maj|min|dim|aug|sus|add|7|9|11|13)*)*$/);
            if (chordLineMatch) {
                return { type: "chords", text: line, line };
            }

            return { type: "lyric", text: line, line };
        });
    }, [value]);

    const insertAtCursor = useCallback((text: string) => {
        haptics("selection");
        const before = value.substring(0, cursorPosition);
        const after = value.substring(cursorPosition);

        // Add newlines if needed for section markers
        let newText = text;
        if (text.startsWith("[") && text.endsWith("]")) {
            // Add newline before if not at start and previous char isn't newline
            if (before.length > 0 && !before.endsWith("\n")) {
                newText = "\n" + newText;
            }
            // Add newline after
            newText = newText + "\n";
        }

        onChangeText(before + newText + after);
        textInputRef.current?.focus();
    }, [value, cursorPosition, onChangeText, haptics]);

    const handleSelectionChange = useCallback((event: any) => {
        setCursorPosition(event.nativeEvent.selection.start);
    }, []);

    const insertChord = useCallback((chord: string) => {
        haptics("selection");
        const before = value.substring(0, cursorPosition);
        const after = value.substring(cursorPosition);
        onChangeText(before + chord + " " + after);
        setShowChordPicker(false);
        textInputRef.current?.focus();
    }, [value, cursorPosition, onChangeText, haptics]);

    // Calculate line and character counts
    const stats = useMemo(() => {
        const lines = value.split("\n").length;
        const chars = value.length;
        const sections = (value.match(/\[.*?\]/g) || []).length;
        return { lines, chars, sections };
    }, [value]);

    return (
        <View style={styles.container}>
            {/* Section Quick Insert Buttons */}
            <View style={styles.toolbarContainer}>
                <ThemedText style={styles.toolbarLabel}>Insert Section:</ThemedText>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.toolbarScroll}
                >
                    {SECTION_MARKERS.map((section) => (
                        <Pressable
                            key={section.id}
                            style={styles.sectionButton}
                            onPress={() => insertAtCursor(section.marker)}
                        >
                            <ThemedText style={styles.sectionButtonText}>
                                {section.label}
                            </ThemedText>
                        </Pressable>
                    ))}
                </ScrollView>
            </View>

            {/* Chord Insert Toggle */}
            <View style={styles.chordToolbar}>
                <Pressable
                    style={[styles.chordToggle, showChordPicker && styles.chordToggleActive]}
                    onPress={() => {
                        haptics("selection");
                        setShowChordPicker(!showChordPicker);
                    }}
                >
                    <Ionicons
                        name="musical-notes"
                        size={16}
                        color={showChordPicker ? (colorScheme === "dark" ? "#000" : "#fff") : Colors[colorScheme ?? "light"].tint}
                    />
                    <ThemedText
                        style={[styles.chordToggleText, showChordPicker && styles.chordToggleTextActive]}
                    >
                        Insert Chord
                    </ThemedText>
                </Pressable>

                {showChordPicker && (
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.chordPicker}
                    >
                        {COMMON_CHORDS.map((chord) => (
                            <Pressable
                                key={chord}
                                style={styles.chordButton}
                                onPress={() => insertChord(chord)}
                            >
                                <ThemedText style={styles.chordButtonText}>{chord}</ThemedText>
                            </Pressable>
                        ))}
                    </ScrollView>
                )}
            </View>

            {/* Main Text Input */}
            <TextInput
                ref={textInputRef}
                style={styles.textInput}
                value={value}
                onChangeText={onChangeText}
                onSelectionChange={handleSelectionChange}
                placeholder={placeholder}
                placeholderTextColor={Colors[colorScheme ?? "light"].icon}
                multiline
                textAlignVertical="top"
                maxLength={maxLength}
            />

            {/* Stats Footer */}
            <View style={styles.statsContainer}>
                <View style={styles.stat}>
                    <Ionicons
                        name="document-text-outline"
                        size={14}
                        color={Colors[colorScheme ?? "light"].icon}
                    />
                    <ThemedText style={styles.statText}>{stats.lines} lines</ThemedText>
                </View>
                <View style={styles.stat}>
                    <Ionicons
                        name="text-outline"
                        size={14}
                        color={Colors[colorScheme ?? "light"].icon}
                    />
                    <ThemedText style={styles.statText}>
                        {stats.chars}/{maxLength}
                    </ThemedText>
                </View>
                <View style={styles.stat}>
                    <Ionicons
                        name="list-outline"
                        size={14}
                        color={Colors[colorScheme ?? "light"].icon}
                    />
                    <ThemedText style={styles.statText}>
                        {stats.sections} sections
                    </ThemedText>
                </View>
            </View>

            {/* Tip */}
            <View style={styles.tipContainer}>
                <Ionicons
                    name="information-circle-outline"
                    size={14}
                    color={Colors[colorScheme ?? "light"].tint}
                />
                <ThemedText style={styles.tipText}>
                    Use [Verse], [Chorus], etc. to mark sections. Add chord lines above lyrics.
                </ThemedText>
            </View>
        </View>
    );
}

const getStyles = (colorScheme: "light" | "dark") =>
    StyleSheet.create({
        container: {
            gap: 12,
        },
        toolbarContainer: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
        },
        toolbarLabel: {
            fontSize: 12,
            fontWeight: "500",
            color: Colors[colorScheme].icon,
        },
        toolbarScroll: {
            gap: 6,
        },
        sectionButton: {
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 12,
            backgroundColor: Colors[colorScheme].tint + "20",
            borderWidth: 1,
            borderColor: Colors[colorScheme].tint + "40",
        },
        sectionButtonText: {
            fontSize: 12,
            fontWeight: "600",
            color: Colors[colorScheme].tint,
        },
        chordToolbar: {
            gap: 8,
        },
        chordToggle: {
            flexDirection: "row",
            alignItems: "center",
            alignSelf: "flex-start",
            gap: 6,
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors[colorScheme].tint,
        },
        chordToggleActive: {
            backgroundColor: Colors[colorScheme].tint,
        },
        chordToggleText: {
            fontSize: 12,
            fontWeight: "600",
            color: Colors[colorScheme].tint,
        },
        chordToggleTextActive: {
            color: colorScheme === "dark" ? "#000" : "#fff",
        },
        chordPicker: {
            gap: 6,
            paddingVertical: 4,
        },
        chordButton: {
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            backgroundColor: colorScheme === "dark" ? "#3a3a3a" : "#e8e8e8",
            minWidth: 40,
            alignItems: "center",
        },
        chordButtonText: {
            fontSize: 14,
            fontWeight: "700",
            color: Colors[colorScheme].text,
        },
        textInput: {
            borderWidth: 1,
            borderColor: Colors[colorScheme].borderColor,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            lineHeight: 24,
            color: Colors[colorScheme].text,
            backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
            minHeight: 200,
            fontFamily: "monospace",
        },
        statsContainer: {
            flexDirection: "row",
            gap: 16,
        },
        stat: {
            flexDirection: "row",
            alignItems: "center",
            gap: 4,
        },
        statText: {
            fontSize: 12,
            color: Colors[colorScheme].icon,
        },
        tipContainer: {
            flexDirection: "row",
            alignItems: "flex-start",
            gap: 6,
            paddingHorizontal: 10,
            paddingVertical: 8,
            backgroundColor: Colors[colorScheme].tint + "10",
            borderRadius: 8,
        },
        tipText: {
            flex: 1,
            fontSize: 12,
            color: Colors[colorScheme].tint,
            lineHeight: 16,
        },
    });
