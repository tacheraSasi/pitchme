import ScreenLayout from '@/components/ScreenLayout'
import { ThemedText } from '@/components/themed/themed-text'
import { ThemedView } from '@/components/themed/themed-view'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useHaptics } from '@/hooks/useHaptics'
import React, { useState } from 'react'
import { Dimensions, Pressable, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg'

interface Key {
    major: string
    minor: string
    sharps?: number
    flats?: number
    angle: number
}

const keys: Key[] = [
    { major: 'C', minor: 'Am', angle: 0 },
    { major: 'G', minor: 'Em', sharps: 1, angle: 30 },
    { major: 'D', minor: 'Bm', sharps: 2, angle: 60 },
    { major: 'A', minor: 'F#m', sharps: 3, angle: 90 },
    { major: 'E', minor: 'C#m', sharps: 4, angle: 120 },
    { major: 'B', minor: 'G#m', sharps: 5, angle: 150 },
    { major: 'F#/Gb', minor: 'D#m/Ebm', sharps: 6, flats: 6, angle: 180 },
    { major: 'Db', minor: 'Bbm', flats: 5, angle: 210 },
    { major: 'Ab', minor: 'Fm', flats: 4, angle: 240 },
    { major: 'Eb', minor: 'Cm', flats: 3, angle: 270 },
    { major: 'Bb', minor: 'Gm', flats: 2, angle: 300 },
    { major: 'F', minor: 'Dm', flats: 1, angle: 330 },
]

const CircleOfFifthsScreen = () => {
    const colorScheme = useColorScheme()
    const haptics = useHaptics()
    const [selectedKey, setSelectedKey] = useState<Key | null>(null)
    const styles = getStyles(colorScheme ?? 'light')

    const screenWidth = Dimensions.get('window').width
    const circleSize = Math.min(screenWidth - 40, 350)
    const radius = circleSize / 2
    const centerX = radius
    const centerY = radius
    const keyRadius = radius * 0.35
    const innerRadius = radius * 0.6

    const handleKeyPress = (key: Key) => {
        haptics.light()
        setSelectedKey(key)
    }

    const getAccidentalText = (key: Key) => {
        if (key.sharps) {
            return `${key.sharps} sharp${key.sharps > 1 ? 's' : ''}`
        }
        if (key.flats) {
            return `${key.flats} flat${key.flats > 1 ? 's' : ''}`
        }
        return 'No accidentals'
    }

    const renderKeyButton = (key: Key, index: number) => {
        const angleRad = (key.angle - 90) * (Math.PI / 180)
        const x = centerX + Math.cos(angleRad) * keyRadius
        const y = centerY + Math.sin(angleRad) * keyRadius

        const isSelected = selectedKey?.major === key.major

        return (
            <G key={index}>
                <Circle
                    cx={x}
                    cy={y}
                    r={25}
                    fill={isSelected ? Colors[colorScheme ?? 'light'].tint : 'transparent'}
                    stroke={Colors[colorScheme ?? 'light'].borderColor}
                    strokeWidth={2}
                />
                <SvgText
                    x={x}
                    y={y - 4}
                    fontSize={12}
                    fontWeight="600"
                    textAnchor="middle"
                    fill={isSelected ?
                        Colors[colorScheme ?? 'light'].background :
                        Colors[colorScheme ?? 'light'].text
                    }
                >
                    {key.major}
                </SvgText>
                <SvgText
                    x={x}
                    y={y + 8}
                    fontSize={10}
                    textAnchor="middle"
                    fill={isSelected ?
                        Colors[colorScheme ?? 'light'].background :
                        Colors[colorScheme ?? 'light'].icon
                    }
                >
                    {key.minor}
                </SvgText>
            </G>
        )
    }

    const renderTouchableAreas = () => {
        return keys.map((key, index) => {
            const angleRad = (key.angle - 90) * (Math.PI / 180)
            const x = centerX + Math.cos(angleRad) * keyRadius
            const y = centerY + Math.sin(angleRad) * keyRadius

            return (
                <Pressable
                    key={index}
                    style={[
                        styles.touchArea,
                        {
                            left: x - 25,
                            top: y - 25,
                        }
                    ]}
                    onPress={() => handleKeyPress(key)}
                />
            )
        })
    }

    return (
        <ScreenLayout>
            <SafeAreaView style={styles.container}>
                <ThemedView style={styles.header}>
                    <ThemedText style={styles.title}>Circle of Fifths</ThemedText>
                    <ThemedText style={styles.subtitle}>
                        Explore major and minor key relationships
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.circleContainer}>
                    <View style={styles.svgContainer}>
                        <Svg height={circleSize} width={circleSize} style={styles.svg}>
                            {/* Outer circle */}
                            <Circle
                                cx={centerX}
                                cy={centerY}
                                r={radius - 20}
                                fill="transparent"
                                stroke={Colors[colorScheme ?? 'light'].borderColor}
                                strokeWidth={1}
                                strokeDasharray="5,5"
                            />

                            {/* Inner circle */}
                            <Circle
                                cx={centerX}
                                cy={centerY}
                                r={innerRadius - 20}
                                fill="transparent"
                                stroke={Colors[colorScheme ?? 'light'].borderColor}
                                strokeWidth={1}
                                strokeDasharray="5,5"
                            />

                            {/* Center label */}
                            <SvgText
                                x={centerX}
                                y={centerY - 5}
                                fontSize={14}
                                fontWeight="600"
                                textAnchor="middle"
                                fill={Colors[colorScheme ?? 'light'].text}
                            >
                                Circle of
                            </SvgText>
                            <SvgText
                                x={centerX}
                                y={centerY + 10}
                                fontSize={14}
                                fontWeight="600"
                                textAnchor="middle"
                                fill={Colors[colorScheme ?? 'light'].text}
                            >
                                Fifths
                            </SvgText>

                            {/* Render key buttons */}
                            {keys.map((key, index) => renderKeyButton(key, index))}
                        </Svg>

                        {/* Invisible touchable areas */}
                        {renderTouchableAreas()}
                    </View>
                </ThemedView>

                {selectedKey && (
                    <ThemedView style={styles.infoCard}>
                        <View style={styles.infoHeader}>
                            <ThemedText style={styles.infoTitle}>
                                {selectedKey.major} Major / {selectedKey.minor}
                            </ThemedText>
                        </View>

                        <View style={styles.infoContent}>
                            <View style={styles.infoRow}>
                                <ThemedText style={styles.infoLabel}>Key Signature:</ThemedText>
                                <ThemedText style={styles.infoValue}>
                                    {getAccidentalText(selectedKey)}
                                </ThemedText>
                            </View>

                            {selectedKey.sharps && (
                                <View style={styles.infoRow}>
                                    <ThemedText style={styles.infoLabel}>Sharps:</ThemedText>
                                    <ThemedText style={styles.infoValue}>
                                        {Array.from({ length: selectedKey.sharps }, (_, i) => {
                                            const sharpOrder = ['F', 'C', 'G', 'D', 'A', 'E', 'B']
                                            return sharpOrder[i] + '#'
                                        }).join(', ')}
                                    </ThemedText>
                                </View>
                            )}

                            {selectedKey.flats && (
                                <View style={styles.infoRow}>
                                    <ThemedText style={styles.infoLabel}>Flats:</ThemedText>
                                    <ThemedText style={styles.infoValue}>
                                        {Array.from({ length: selectedKey.flats }, (_, i) => {
                                            const flatOrder = ['B', 'E', 'A', 'D', 'G', 'C', 'F']
                                            return flatOrder[i] + '♭'
                                        }).join(', ')}
                                    </ThemedText>
                                </View>
                            )}
                        </View>
                    </ThemedView>
                )}

                {!selectedKey && (
                    <ThemedView style={styles.instructionCard}>
                        <ThemedText style={styles.instructionText}>
                            Tap on any key to see its details
                        </ThemedText>
                    </ThemedView>
                )}
            </SafeAreaView>
        </ScreenLayout>
    )
}

const getStyles = (colorScheme: 'light' | 'dark') =>
    StyleSheet.create({
        container: {
            flex: 1,
            paddingHorizontal: 16,
        },
        header: {
            alignItems: 'center',
            paddingVertical: 20,
        },
        title: {
            fontSize: 24,
            fontWeight: '700',
            color: Colors[colorScheme].text,
            marginBottom: 4,
        },
        subtitle: {
            fontSize: 14,
            color: Colors[colorScheme].icon,
            textAlign: 'center',
        },
        circleContainer: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 20,
        },
        svgContainer: {
            position: 'relative',
        },
        svg: {
            backgroundColor: 'transparent',
        },
        touchArea: {
            position: 'absolute',
            width: 50,
            height: 50,
            borderRadius: 25,
        },
        infoCard: {
            backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f9fa',
            borderRadius: 12,
            padding: 16,
            marginTop: 20,
            borderWidth: 1,
            borderColor: Colors[colorScheme].borderColor,
        },
        infoHeader: {
            marginBottom: 12,
        },
        infoTitle: {
            fontSize: 16,
            fontWeight: '600',
            color: Colors[colorScheme].text,
            textAlign: 'center',
        },
        infoContent: {
            gap: 8,
        },
        infoRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
        },
        infoLabel: {
            fontSize: 14,
            color: Colors[colorScheme].icon,
            fontWeight: '500',
        },
        infoValue: {
            fontSize: 14,
            color: Colors[colorScheme].text,
            fontWeight: '400',
            flex: 1,
            textAlign: 'right',
        },
        instructionCard: {
            backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f8f9fa',
            borderRadius: 12,
            padding: 16,
            marginTop: 20,
            borderWidth: 1,
            borderColor: Colors[colorScheme].borderColor,
            opacity: 0.8,
        },
        instructionText: {
            fontSize: 14,
            color: Colors[colorScheme].icon,
            textAlign: 'center',
            fontStyle: 'italic',
        },
    })

export default CircleOfFifthsScreen
