import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View, ViewStyle } from "react-native";

interface SkeletonProps {
    width?: number | string;
    height?: number | string;
    borderRadius?: number;
    style?: ViewStyle;
    animated?: boolean;
}

export function Skeleton({
    width = "100%",
    height = 20,
    borderRadius = 4,
    style,
    animated = true,
}: SkeletonProps) {
    const colorScheme = useColorScheme();
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        if (!animated) return;

        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        );

        animation.start();

        return () => animation.stop();
    }, [animated, opacity]);

    return (
        <Animated.View
            style={[
                {
                    width,
                    height,
                    borderRadius,
                    backgroundColor: Colors[colorScheme ?? "light"].icon + "30",
                    opacity: animated ? opacity : 0.3,
                },
                style,
            ]}
        />
    );
}

/**
 * Skeleton for a song list item
 */
export function SongItemSkeleton() {
    const colorScheme = useColorScheme();
    const styles = getStyles(colorScheme ?? "light");

    return (
        <View style={styles.songItem}>
            <View style={styles.songInfo}>
                <Skeleton width="70%" height={18} borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton width="50%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
                <Skeleton width="40%" height={12} borderRadius={4} />
            </View>
            <Skeleton width={40} height={40} borderRadius={20} />
        </View>
    );
}

/**
 * Skeleton for a recording list item
 */
export function RecordingItemSkeleton() {
    const colorScheme = useColorScheme();
    const styles = getStyles(colorScheme ?? "light");

    return (
        <View style={styles.recordingItem}>
            <View style={styles.recordingInfo}>
                <Skeleton width="60%" height={16} borderRadius={4} style={{ marginBottom: 6 }} />
                <Skeleton width="80%" height={12} borderRadius={4} />
            </View>
            <View style={styles.recordingActions}>
                <Skeleton width={36} height={36} borderRadius={18} />
            </View>
        </View>
    );
}

/**
 * Skeleton for song details page
 */
export function SongDetailsSkeleton() {
    const colorScheme = useColorScheme();
    const styles = getStyles(colorScheme ?? "light");

    return (
        <View style={styles.container}>
            <View style={styles.songCard}>
                {/* Title and status */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 16 }}>
                    <Skeleton width="60%" height={24} borderRadius={6} />
                    <Skeleton width={80} height={24} borderRadius={12} />
                </View>

                {/* Meta information */}
                <Skeleton width="40%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton width="50%" height={14} borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton width="35%" height={14} borderRadius={4} style={{ marginBottom: 16 }} />

                {/* Description */}
                <Skeleton width="30%" height={16} borderRadius={4} style={{ marginBottom: 8 }} />
                <Skeleton width="100%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
                <Skeleton width="90%" height={14} borderRadius={4} style={{ marginBottom: 6 }} />
                <Skeleton width="75%" height={14} borderRadius={4} />
            </View>

            {/* Metronome section */}
            <View style={[styles.songCard, { marginTop: 16 }]}>
                <Skeleton width="40%" height={18} borderRadius={4} style={{ marginBottom: 12 }} />
                <Skeleton width="100%" height={100} borderRadius={12} />
            </View>

            {/* Chord progressions */}
            <View style={[styles.songCard, { marginTop: 16 }]}>
                <Skeleton width="50%" height={18} borderRadius={4} style={{ marginBottom: 12 }} />
                <Skeleton width="100%" height={80} borderRadius={12} />
            </View>
        </View>
    );
}

/**
 * Skeleton for a list of items
 */
interface SkeletonListProps {
    count?: number;
    renderItem?: () => React.ReactElement;
}

export function SkeletonList({ count = 5, renderItem }: SkeletonListProps) {
    return (
        <View>
            {Array.from({ length: count }).map((_, index) => (
                <View key={index} style={{ marginBottom: 12 }}>
                    {renderItem ? renderItem() : <SongItemSkeleton />}
                </View>
            ))}
        </View>
    );
}

const getStyles = (colorScheme: "light" | "dark") =>
    StyleSheet.create({
        container: {
            padding: 16,
        },
        songCard: {
            backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: Colors[colorScheme].borderColor,
        },
        songItem: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: Colors[colorScheme].borderColor,
        },
        songInfo: {
            flex: 1,
            marginRight: 16,
        },
        recordingItem: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f8f9fa",
            borderRadius: 12,
            padding: 16,
            borderWidth: 1,
            borderColor: Colors[colorScheme].borderColor,
        },
        recordingInfo: {
            flex: 1,
            marginRight: 16,
        },
        recordingActions: {
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
        },
    });
