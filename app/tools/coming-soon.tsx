import ScreenLayout from '@/components/ScreenLayout'
import { ThemedText } from '@/components/themed/themed-text'
import { ThemedView } from '@/components/themed/themed-view'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useHaptics } from '@/hooks/useHaptics'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import React from 'react'
import { Pressable, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const ComingSoonScreen = () => {
    const colorScheme = useColorScheme()
    const haptics = useHaptics()
    const styles = getStyles(colorScheme ?? 'light')

    const handleGoBack = () => {
        haptics.light()
        router.back()
    }

    return (
        <ScreenLayout>
            <SafeAreaView style={styles.container}>
                <ThemedView style={styles.content}>
                    <ThemedView style={styles.iconContainer}>
                        <Ionicons
                            name="construct-outline"
                            size={80}
                            color={Colors[colorScheme ?? 'light'].icon}
                        />
                    </ThemedView>

                    <ThemedView style={styles.textContainer}>
                        <ThemedText style={styles.title}>Coming Soon</ThemedText>
                        <ThemedText style={styles.subtitle}>
                            We're working hard to bring you this feature. Stay tuned for updates!
                        </ThemedText>
                    </ThemedView>

                    <Pressable style={styles.backButton} onPress={handleGoBack}>
                        <Ionicons
                            name="arrow-back"
                            size={20}
                            color={Colors[colorScheme ?? 'light'].background}
                        />
                        <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
                    </Pressable>
                </ThemedView>
            </SafeAreaView>
        </ScreenLayout>
    )
}

const getStyles = (colorScheme: 'light' | 'dark') =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        content: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 32,
        },
        iconContainer: {
            marginBottom: 32,
            opacity: 0.6,
        },
        textContainer: {
            alignItems: 'center',
            marginBottom: 48,
        },
        title: {
            fontSize: 28,
            fontWeight: '700',
            color: Colors[colorScheme].text,
            marginBottom: 12,
            textAlign: 'center',
        },
        subtitle: {
            fontSize: 16,
            color: Colors[colorScheme].icon,
            textAlign: 'center',
            lineHeight: 24,
            paddingHorizontal: 16,
        },
        backButton: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: Colors[colorScheme].tint,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
            gap: 8,
        },
        backButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors[colorScheme].background,
        },
    })

export default ComingSoonScreen