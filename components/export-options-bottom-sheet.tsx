import { ThemedText } from "@/components/themed/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useHaptics } from "@/hooks/useHaptics";
import {
    exportSong,
    exportSongAsJSON,
    exportSongAsPDF,
    SongExportData,
} from "@/utils/exporter";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetView,
} from "@gorhom/bottom-sheet";
import React, { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import { alert } from "yooo-native";

interface ExportOption {
    id: "pdf" | "text" | "json";
    title: string;
    description: string;
    icon: keyof typeof Ionicons.glyphMap;
    action: (song: SongExportData) => Promise<boolean>;
}

interface ExportOptionsBottomSheetProps {
    bottomSheetRef: React.RefObject<BottomSheet | null>;
    song: SongExportData | null;
    onChange?: (index: number) => void;
}

export default function ExportOptionsBottomSheet({
    bottomSheetRef,
    song,
    onChange,
}: ExportOptionsBottomSheetProps) {
    const colorScheme = useColorScheme();
    const { trigger: haptics } = useHaptics();
    const styles = getStyles(colorScheme ?? "light");
    const [isExporting, setIsExporting] = useState<string | null>(null);

    const snapPoints = useMemo(() => ["45%"], []);

    const exportOptions: ExportOption[] = useMemo(
        () => [
            {
                id: "pdf",
                title: "PDF Document",
                description: "Beautiful formatted document with all song details",
                icon: "document-text",
                action: exportSongAsPDF,
            },
            {
                id: "text",
                title: "Text File",
                description: "Simple text format for quick sharing",
                icon: "document-outline",
                action: exportSong,
            },
            {
                id: "json",
                title: "JSON Data",
                description: "Full data export for backup or import",
                icon: "code-slash",
                action: exportSongAsJSON,
            },
        ],
        []
    );

    const handleExport = useCallback(
        async (option: ExportOption) => {
            if (!song || isExporting) return;

            try {
                setIsExporting(option.id);
                haptics("selection");

                await option.action(song);

                haptics("success");
                bottomSheetRef.current?.close();
            } catch (error) {
                console.error(`Error exporting as ${option.id}:`, error);
                haptics("error");
                alert.dialog("Export Failed", `Failed to export as ${option.title}. Please try again.`);
            } finally {
                setIsExporting(null);
            }
        },
        [song, isExporting, haptics, bottomSheetRef]
    );

    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
            />
        ),
        []
    );

    return (
        <BottomSheet
            ref={bottomSheetRef}
            index={-1}
            snapPoints={snapPoints}
            enablePanDownToClose
            backdropComponent={renderBackdrop}
            backgroundStyle={styles.bottomSheetBackground}
            handleIndicatorStyle={styles.handleIndicator}
            onChange={onChange}
        >
            <BottomSheetView style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerIconContainer}>
                        <Ionicons
                            name="share-outline"
                            size={24}
                            color={Colors[colorScheme ?? "light"].tint}
                        />
                    </View>
                    <View style={styles.headerText}>
                        <ThemedText style={styles.title}>Export Song</ThemedText>
                        <ThemedText style={styles.subtitle} numberOfLines={1}>
                            {song?.title || "Select export format"}
                        </ThemedText>
                    </View>
                </View>

                {/* Export Options */}
                <View style={styles.optionsList}>
                    {exportOptions.map((option) => (
                        <Pressable
                            key={option.id}
                            style={({ pressed }) => [
                                styles.optionItem,
                                pressed && styles.optionItemPressed,
                                isExporting === option.id && styles.optionItemActive,
                            ]}
                            onPress={() => handleExport(option)}
                            disabled={isExporting !== null}
                        >
                            <View
                                style={[
                                    styles.optionIconContainer,
                                    isExporting === option.id && styles.optionIconContainerActive,
                                ]}
                            >
                                {isExporting === option.id ? (
                                    <ActivityIndicator
                                        size="small"
                                        color={colorScheme === "dark" ? "#000" : "#fff"}
                                    />
                                ) : (
                                    <Ionicons
                                        name={option.icon}
                                        size={22}
                                        color={Colors[colorScheme ?? "light"].tint}
                                    />
                                )}
                            </View>
                            <View style={styles.optionContent}>
                                <ThemedText style={styles.optionTitle}>{option.title}</ThemedText>
                                <ThemedText style={styles.optionDescription}>
                                    {option.description}
                                </ThemedText>
                            </View>
                            <Ionicons
                                name="chevron-forward"
                                size={20}
                                color={Colors[colorScheme ?? "light"].icon}
                            />
                        </Pressable>
                    ))}
                </View>

                {/* Tip */}
                <View style={styles.tipContainer}>
                    <Ionicons
                        name="bulb-outline"
                        size={16}
                        color={Colors[colorScheme ?? "light"].tint}
                    />
                    <ThemedText style={styles.tipText}>
                        PDF is recommended for printing or professional sharing
                    </ThemedText>
                </View>
            </BottomSheetView>
        </BottomSheet>
    );
}

const getStyles = (colorScheme: "light" | "dark") =>
    StyleSheet.create({
        bottomSheetBackground: {
            backgroundColor: Colors[colorScheme].bottomSheetBackground,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
        },
        handleIndicator: {
            backgroundColor: Colors[colorScheme].handleIndicator,
            width: 40,
        },
        container: {
            flex: 1,
            paddingHorizontal: 20,
            paddingBottom: 20,
        },
        header: {
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            marginBottom: 24,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: Colors[colorScheme].borderColor,
        },
        headerIconContainer: {
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: Colors[colorScheme].tint + "15",
            alignItems: "center",
            justifyContent: "center",
        },
        headerText: {
            flex: 1,
        },
        title: {
            fontSize: 20,
            fontWeight: "700",
            color: Colors[colorScheme].text,
        },
        subtitle: {
            fontSize: 14,
            color: Colors[colorScheme].icon,
            marginTop: 2,
        },
        optionsList: {
            gap: 12,
        },
        optionItem: {
            flexDirection: "row",
            alignItems: "center",
            gap: 14,
            padding: 16,
            borderRadius: 16,
            backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
            borderWidth: 1,
            borderColor: Colors[colorScheme].borderColor,
        },
        optionItemPressed: {
            opacity: 0.7,
            transform: [{ scale: 0.98 }],
        },
        optionItemActive: {
            borderColor: Colors[colorScheme].tint,
            backgroundColor: Colors[colorScheme].tint + "10",
        },
        optionIconContainer: {
            width: 44,
            height: 44,
            borderRadius: 12,
            backgroundColor: Colors[colorScheme].tint + "15",
            alignItems: "center",
            justifyContent: "center",
        },
        optionIconContainerActive: {
            backgroundColor: Colors[colorScheme].tint,
        },
        optionContent: {
            flex: 1,
        },
        optionTitle: {
            fontSize: 16,
            fontWeight: "600",
            color: Colors[colorScheme].text,
        },
        optionDescription: {
            fontSize: 13,
            color: Colors[colorScheme].icon,
            marginTop: 2,
        },
        tipContainer: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginTop: 20,
            paddingHorizontal: 14,
            paddingVertical: 12,
            backgroundColor: Colors[colorScheme].tint + "10",
            borderRadius: 12,
        },
        tipText: {
            flex: 1,
            fontSize: 13,
            color: Colors[colorScheme].tint,
        },
    });
