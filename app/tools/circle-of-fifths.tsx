import ScreenLayout from '@/components/ScreenLayout'
import { ThemedText } from '@/components/themed/themed-text'
import { ThemedView } from '@/components/themed/themed-view'
import { Colors } from '@/constants/theme'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useHaptics } from '@/hooks/useHaptics'
import { Ionicons } from '@expo/vector-icons'
import React, { useState } from 'react'
import { Dimensions, Pressable, ScrollView, StyleSheet } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Circle, G, Line, Text as SvgText } from 'react-native-svg'

interface Key {
    major: string
    minor: string
    sharps?: number
    flats?: number
    angle: number
}

interface Mode {
    name: string
    degree: string
    notes: string[]
    description: string
}

interface Chord {
    romanNumeral: string
    type: string
    notes: string[]
    function: string
}

type InfoTab = 'key' | 'chords' | 'modes' | 'theory'

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

// Major scale chord progressions
const getMajorKeyChords = (key: string): Chord[] => {
    const chords: Record<string, Chord[]> = {
        'C': [
            { romanNumeral: 'I', type: 'Major', notes: ['C', 'E', 'G'], function: 'Tonic' },
            { romanNumeral: 'ii', type: 'minor', notes: ['D', 'F', 'A'], function: 'Supertonic' },
            { romanNumeral: 'iii', type: 'minor', notes: ['E', 'G', 'B'], function: 'Mediant' },
            { romanNumeral: 'IV', type: 'Major', notes: ['F', 'A', 'C'], function: 'Subdominant' },
            { romanNumeral: 'V', type: 'Major', notes: ['G', 'B', 'D'], function: 'Dominant' },
            { romanNumeral: 'vi', type: 'minor', notes: ['A', 'C', 'E'], function: 'Submediant' },
            { romanNumeral: 'vii°', type: 'diminished', notes: ['B', 'D', 'F'], function: 'Leading Tone' },
        ],
        'G': [
            { romanNumeral: 'I', type: 'Major', notes: ['G', 'B', 'D'], function: 'Tonic' },
            { romanNumeral: 'ii', type: 'minor', notes: ['A', 'C', 'E'], function: 'Supertonic' },
            { romanNumeral: 'iii', type: 'minor', notes: ['B', 'D', 'F#'], function: 'Mediant' },
            { romanNumeral: 'IV', type: 'Major', notes: ['C', 'E', 'G'], function: 'Subdominant' },
            { romanNumeral: 'V', type: 'Major', notes: ['D', 'F#', 'A'], function: 'Dominant' },
            { romanNumeral: 'vi', type: 'minor', notes: ['E', 'G', 'B'], function: 'Submediant' },
            { romanNumeral: 'vii°', type: 'diminished', notes: ['F#', 'A', 'C'], function: 'Leading Tone' },
        ],
        'D': [
            { romanNumeral: 'I', type: 'Major', notes: ['D', 'F#', 'A'], function: 'Tonic' },
            { romanNumeral: 'ii', type: 'minor', notes: ['E', 'G', 'B'], function: 'Supertonic' },
            { romanNumeral: 'iii', type: 'minor', notes: ['F#', 'A', 'C#'], function: 'Mediant' },
            { romanNumeral: 'IV', type: 'Major', notes: ['G', 'B', 'D'], function: 'Subdominant' },
            { romanNumeral: 'V', type: 'Major', notes: ['A', 'C#', 'E'], function: 'Dominant' },
            { romanNumeral: 'vi', type: 'minor', notes: ['B', 'D', 'F#'], function: 'Submediant' },
            { romanNumeral: 'vii°', type: 'diminished', notes: ['C#', 'E', 'G'], function: 'Leading Tone' },
        ],
        // Add other keys similarly
    }

    return chords[key.split('/')[0]] || chords.C
}

// Get modes for a major key
const getModes = (key: string): Mode[] => [
    {
        name: 'Ionian (Major)',
        degree: 'I',
        notes: ['1', '2', '3', '4', '5', '6', '7'],
        description: 'The standard major scale - bright and happy'
    },
    {
        name: 'Dorian',
        degree: 'ii',
        notes: ['1', '2', '♭3', '4', '5', '6', '♭7'],
        description: 'Minor scale with raised 6th - jazzy, soulful'
    },
    {
        name: 'Phrygian',
        degree: 'iii',
        notes: ['1', '♭2', '♭3', '4', '5', '♭6', '♭7'],
        description: 'Minor scale with flat 2nd - exotic, Spanish'
    },
    {
        name: 'Lydian',
        degree: 'IV',
        notes: ['1', '2', '3', '♯4', '5', '6', '7'],
        description: 'Major scale with raised 4th - dreamy, mystical'
    },
    {
        name: 'Mixolydian',
        degree: 'V',
        notes: ['1', '2', '3', '4', '5', '6', '♭7'],
        description: 'Major scale with flat 7th - bluesy, rock'
    },
    {
        name: 'Aeolian (Natural Minor)',
        degree: 'vi',
        notes: ['1', '2', '♭3', '4', '5', '♭6', '♭7'],
        description: 'Natural minor scale - sad, melancholic'
    },
    {
        name: 'Locrian',
        degree: 'vii°',
        notes: ['1', '♭2', '♭3', '4', '♭5', '♭6', '♭7'],
        description: 'Diminished scale - tense, unstable'
    }
]

const CircleOfFifthsScreen = () => {
    const colorScheme = useColorScheme()
    const haptics = useHaptics()
    const [selectedKey, setSelectedKey] = useState<Key | null>(keys[0])
    const [activeTab, setActiveTab] = useState<InfoTab>('key')
    const styles = getStyles(colorScheme ?? 'light')

    const screenWidth = Dimensions.get('window').width
    const circleSize = Math.min(screenWidth - 40, 380)
    const radius = circleSize / 2
    const centerX = radius
    const centerY = radius
    const keyRadius = radius * 0.38
    const innerRadius = radius * 0.65
    const outerRadius = radius - 15

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

    const getAccidentalsList = (key: Key) => {
        if (key.sharps) {
            const sharpOrder = ['F', 'C', 'G', 'D', 'A', 'E', 'B']
            return Array.from({ length: key.sharps }, (_, i) => sharpOrder[i] + '#')
        }
        if (key.flats) {
            const flatOrder = ['B', 'E', 'A', 'D', 'G', 'C', 'F']
            return Array.from({ length: key.flats }, (_, i) => flatOrder[i] + '♭')
        }
        return []
    }

    const renderKeyButton = (key: Key, index: number) => {
        const angleRad = (key.angle - 90) * (Math.PI / 180)
        const x = centerX + Math.cos(angleRad) * keyRadius
        const y = centerY + Math.sin(angleRad) * keyRadius

        const isSelected = selectedKey?.major === key.major
        const buttonRadius = 32

        return (
            <G key={index}>
                {/* Shadow circle for depth */}
                <Circle
                    cx={x + 1}
                    cy={y + 1}
                    r={buttonRadius}
                    fill={colorScheme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.1)'}
                />
                {/* Main circle */}
                <Circle
                    cx={x}
                    cy={y}
                    r={buttonRadius}
                    fill={isSelected ? Colors[colorScheme ?? 'light'].tint : Colors[colorScheme ?? 'light'].background}
                    stroke={isSelected ? Colors[colorScheme ?? 'light'].tint : Colors[colorScheme ?? 'light'].borderColor}
                    strokeWidth={isSelected ? 3 : 2}
                />
                {/* Major key text */}
                <SvgText
                    x={x}
                    y={y - 3}
                    fontSize={14}
                    fontWeight="700"
                    textAnchor="middle"
                    fill={isSelected ? Colors[colorScheme ?? 'light'].background : Colors[colorScheme ?? 'light'].text}
                >
                    {key.major}
                </SvgText>
                {/* Minor key text */}
                <SvgText
                    x={x}
                    y={y + 12}
                    fontSize={11}
                    fontWeight="600"
                    textAnchor="middle"
                    fill={isSelected ? Colors[colorScheme ?? 'light'].background :
                        Colors[(colorScheme ?? 'light')].text + (colorScheme === 'dark' ? 'CC' : '88')}
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
                            left: x - 32,
                            top: y - 32,
                        }
                    ]}
                    onPress={() => handleKeyPress(key)}
                />
            )
        })
    }

    const renderCircleOfFifths = () => (
        <ThemedView style={styles.circleContainer}>
            <ThemedView style={styles.svgContainer}>
                <Svg height={circleSize} width={circleSize} style={styles.svg}>
                    {/* Outer circle with fifths lines */}
                    <Circle
                        cx={centerX}
                        cy={centerY}
                        r={outerRadius}
                        fill="transparent"
                        stroke={Colors[colorScheme ?? 'light'].tint + '40'}
                        strokeWidth={2}
                    />

                    {/* Inner circle with fourths lines */}
                    <Circle
                        cx={centerX}
                        cy={centerY}
                        r={innerRadius}
                        fill="transparent"
                        stroke={Colors[colorScheme ?? 'light'].tint + '30'}
                        strokeWidth={1}
                        strokeDasharray="8,4"
                    />

                    {/* Draw lines for perfect fifths */}
                    {keys.map((key, index) => {
                        const angleRad = (key.angle - 90) * (Math.PI / 180)
                        const x1 = centerX + Math.cos(angleRad) * innerRadius
                        const y1 = centerY + Math.sin(angleRad) * innerRadius
                        const x2 = centerX + Math.cos(angleRad) * outerRadius
                        const y2 = centerY + Math.sin(angleRad) * outerRadius

                        return (
                            <Line
                                key={`line-${index}`}
                                x1={x1}
                                y1={y1}
                                x2={x2}
                                y2={y2}
                                stroke={Colors[colorScheme ?? 'light'].tint + '25'}
                                strokeWidth={1.5}
                            />
                        )
                    })}

                    {/* Center background circle */}
                    <Circle
                        cx={centerX}
                        cy={centerY}
                        r={55}
                        fill={Colors[colorScheme ?? 'light'].background}
                        stroke={Colors[colorScheme ?? 'light'].tint + '20'}
                        strokeWidth={1}
                    />
                    {/* Center labels */}
                    <SvgText
                        x={centerX}
                        y={centerY - 18}
                        fontSize={14}
                        fontWeight="700"
                        textAnchor="middle"
                        fill={Colors[colorScheme ?? 'light'].tint}
                    >
                        CIRCLE OF
                    </SvgText>
                    <SvgText
                        x={centerX}
                        y={centerY + 2}
                        fontSize={18}
                        fontWeight="800"
                        textAnchor="middle"
                        fill={Colors[colorScheme ?? 'light'].text}
                    >
                        FIFTHS
                    </SvgText>
                    <SvgText
                        x={centerX}
                        y={centerY + 20}
                        fontSize={10}
                        fontWeight="600"
                        textAnchor="middle"
                        fill={Colors[colorScheme ?? 'light'].tint + 'AA'}
                    >
                        & FOURTHS
                    </SvgText>

                    {/* Render key buttons */}
                    {keys.map((key, index) => renderKeyButton(key, index))}
                </Svg>

                {/* Invisible touchable areas */}
                {renderTouchableAreas()}
            </ThemedView>
        </ThemedView>
    )

    const renderKeySignatureInfo = () => (
        <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Key Signature</ThemedText>
            <ThemedView style={styles.infoGrid}>
                <ThemedView style={styles.infoCell}>
                    <ThemedText style={styles.infoLabel}>Major Key</ThemedText>
                    <ThemedText style={styles.infoValueLarge}>{selectedKey?.major}</ThemedText>
                </ThemedView>
                <ThemedView style={styles.infoCell}>
                    <ThemedText style={styles.infoLabel}>Relative Minor</ThemedText>
                    <ThemedText style={styles.infoValueLarge}>{selectedKey?.minor}</ThemedText>
                </ThemedView>
            </ThemedView>

            <ThemedView style={styles.accidentalsContainer}>
                <ThemedText style={styles.infoLabel}>Accidentals:</ThemedText>
                <ThemedView style={styles.accidentalsList}>
                    {getAccidentalsList(selectedKey!).map((acc, index) => (
                        <ThemedView key={index} style={styles.accidentalBadge}>
                            <ThemedText style={styles.accidentalText}>{acc}</ThemedText>
                        </ThemedView>
                    ))}
                    {getAccidentalsList(selectedKey!).length === 0 && (
                        <ThemedText style={styles.noAccidentals}>No accidentals</ThemedText>
                    )}
                </ThemedView>
            </ThemedView>
        </ThemedView>
    )

    const renderChordsInfo = () => (
        <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Diatonic Chords in {selectedKey?.major} Major</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Based on the major scale</ThemedText>

            <ThemedView style={styles.chordsGrid}>
                {getMajorKeyChords(selectedKey?.major.split('/')[0] || 'C').map((chord, index) => (
                    <ThemedView key={index} style={styles.chordCard}>
                        <ThemedView style={styles.chordHeader}>
                            <ThemedText style={styles.romanNumeral}>{chord.romanNumeral}</ThemedText>
                            <ThemedText style={styles.chordType}>{chord.type}</ThemedText>
                        </ThemedView>
                        <ThemedText style={styles.chordNotes}>{chord.notes.join(' - ')}</ThemedText>
                        <ThemedText style={styles.chordFunction}>{chord.function}</ThemedText>
                    </ThemedView>
                ))}
            </ThemedView>

            <ThemedView style={styles.theoryNote}>
                <Ionicons name="information-circle" size={16} color={Colors[colorScheme ?? 'light'].tint} />
                <ThemedText style={styles.theoryNoteText}>
                    The V-I progression (perfect cadence) is the strongest resolution in Western music
                </ThemedText>
            </ThemedView>
        </ThemedView>
    )

    const renderModesInfo = () => (
        <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Modes of {selectedKey?.major} Major</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Each mode starts on a different degree of the scale</ThemedText>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modesScroll}>
                {getModes(selectedKey?.major || 'C').map((mode, index) => (
                    <ThemedView key={index} style={styles.modeCard}>
                        <ThemedView style={styles.modeHeader}>
                            <ThemedText style={styles.modeName}>{mode.name}</ThemedText>
                            <ThemedView style={styles.modeDegree}>
                                <ThemedText style={styles.degreeText}>{mode.degree}</ThemedText>
                            </ThemedView>
                        </ThemedView>
                        <ThemedView style={styles.modeNotes}>
                            {mode.notes.map((note, i) => (
                                <ThemedView key={i} style={styles.noteBadge}>
                                    <ThemedText style={styles.noteText}>{note}</ThemedText>
                                </ThemedView>
                            ))}
                        </ThemedView>
                        <ThemedText style={styles.modeDescription}>{mode.description}</ThemedText>
                    </ThemedView>
                ))}
            </ScrollView>
        </ThemedView>
    )

    const renderTheoryInfo = () => (
        <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Music Theory</ThemedText>

            <ThemedView style={styles.theoryCards}>
                <ThemedView style={styles.theoryCard}>
                    <Ionicons name="musical-notes" size={24} color={Colors[colorScheme ?? 'light'].tint} />
                    <ThemedText style={styles.theoryCardTitle}>Circle Basics</ThemedText>
                    <ThemedText style={styles.theoryCardText}>
                        Moving clockwise (→) by perfect fifths adds sharps.
                        Moving counter-clockwise (←) by perfect fourths adds flats.
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.theoryCard}>
                    <Ionicons name="git-compare" size={24} color={Colors[colorScheme ?? 'light'].tint} />
                    <ThemedText style={styles.theoryCardTitle}>Key Relationships</ThemedText>
                    <ThemedText style={styles.theoryCardText}>
                        Closely related keys are adjacent in the circle.
                        Distant keys are opposite (e.g., C major vs F#/Gb major).
                    </ThemedText>
                </ThemedView>

                <ThemedView style={styles.theoryCard}>
                    <Ionicons name="trending-up" size={24} color={Colors[colorScheme ?? 'light'].tint} />
                    <ThemedText style={styles.theoryCardTitle}>Common Progressions</ThemedText>
                    <ThemedText style={styles.theoryCardText}>
                        Common patterns: I-IV-V (blues), ii-V-I (jazz),
                        vi-IV-I-V (pop), I-V-vi-IV (pop ballad).
                    </ThemedText>
                </ThemedView>
            </ThemedView>

            <ThemedView style={styles.quickFacts}>
                <ThemedText style={styles.quickFactsTitle}>Quick Facts</ThemedText>
                <ThemedView style={styles.factItem}>
                    <ThemedView style={styles.factDot} />
                    <ThemedText style={styles.factText}>Each key shares all but one note with its neighbors</ThemedText>
                </ThemedView>
                <ThemedView style={styles.factItem}>
                    <ThemedView style={styles.factDot} />
                    <ThemedText style={styles.factText}>Relative major/minor keys share the same key signature</ThemedText>
                </ThemedView>
                <ThemedView style={styles.factItem}>
                    <ThemedView style={styles.factDot} />
                    <ThemedText style={styles.factText}>The circle shows both perfect fifths (clockwise) and perfect fourths (counter-clockwise)</ThemedText>
                </ThemedView>
            </ThemedView>
        </ThemedView>
    )

    return (
        <ScreenLayout>
            <SafeAreaView style={styles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <ThemedView style={styles.header}>
                        <ThemedText style={styles.title}>Circle of Fifths</ThemedText>
                        <ThemedText style={styles.subtitle}>
                            Interactive music theory reference
                        </ThemedText>
                    </ThemedView>

                    {renderCircleOfFifths()}

                    {selectedKey && (
                        <ThemedView style={styles.infoContainer}>
                            <ThemedView style={styles.tabContainer}>
                                {(['key', 'chords', 'modes', 'theory'] as InfoTab[]).map((tab) => (
                                    <Pressable
                                        key={tab}
                                        style={[
                                            styles.tab,
                                            activeTab === tab && styles.activeTab
                                        ]}
                                        onPress={() => setActiveTab(tab)}
                                    >
                                        <ThemedText style={[
                                            styles.tabText,
                                            activeTab === tab && styles.activeTabText
                                        ]}>
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                                        </ThemedText>
                                    </Pressable>
                                ))}
                            </ThemedView>

                            <ThemedView style={styles.tabContent}>
                                {activeTab === 'key' && renderKeySignatureInfo()}
                                {activeTab === 'chords' && renderChordsInfo()}
                                {activeTab === 'modes' && renderModesInfo()}
                                {activeTab === 'theory' && renderTheoryInfo()}
                            </ThemedView>
                        </ThemedView>
                    )}
                </ScrollView>
            </SafeAreaView>
        </ScreenLayout>
    )
}

const getStyles = (colorScheme: 'light' | 'dark') =>
    StyleSheet.create({
        container: {
            flex: 1,
        },
        header: {
            alignItems: 'center',
            paddingVertical: 20,
            paddingHorizontal: 16,
        },
        title: {
            fontSize: 28,
            fontWeight: '800',
            color: Colors[colorScheme].tint,
            marginBottom: 4,
        },
        subtitle: {
            fontSize: 14,
            color: Colors[colorScheme].icon,
            textAlign: 'center',
        },
        circleContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 24,
            backgroundColor: Colors[colorScheme].background,
            marginHorizontal: 16,
            borderRadius: 20,
            shadowColor: Colors[colorScheme].text,
            shadowOffset: {
                width: 0,
                height: 2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 4,
        },
        svgContainer: {
            position: 'relative',
        },
        svg: {

        },
        touchArea: {
            position: 'absolute',
            width: 64,
            height: 64,
            borderRadius: 32,
        },
        infoContainer: {
            margin: 16,
            borderRadius: 20,
            overflow: 'hidden',
            borderWidth: 1.5,
            borderColor: Colors[colorScheme].borderColor,
            backgroundColor: Colors[colorScheme].background,
            shadowColor: Colors[colorScheme].text,
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 6,
        },
        tabContainer: {
            flexDirection: 'row',

            borderBottomWidth: 1,
            borderBottomColor: Colors[colorScheme].borderColor,
        },
        tab: {
            flex: 1,
            paddingVertical: 12,
            alignItems: 'center',
        },
        activeTab: {
            borderBottomWidth: 2,
            borderBottomColor: Colors[colorScheme].tint,
        },
        tabText: {
            fontSize: 12,
            fontWeight: '600',
            color: Colors[colorScheme].icon,
        },
        activeTabText: {
            color: Colors[colorScheme].tint,
        },
        tabContent: {
            padding: 16,
        },
        section: {
            marginBottom: 24,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: '700',
            color: Colors[colorScheme].text,
            marginBottom: 8,
        },
        sectionSubtitle: {
            fontSize: 12,
            color: Colors[colorScheme].icon,
            marginBottom: 16,
        },
        infoGrid: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 16,
        },
        infoCell: {
            flex: 1,

            padding: 12,
            borderRadius: 8,
            alignItems: 'center',
        },
        infoLabel: {
            fontSize: 11,
            color: Colors[colorScheme].icon,
            marginBottom: 4,
            fontWeight: '600',
            textTransform: 'uppercase',
        },
        infoValueLarge: {
            fontSize: 18,
            fontWeight: '700',
            color: Colors[colorScheme].text,
        },
        accidentalsContainer: {
            marginTop: 8,
        },
        accidentalsList: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
            marginTop: 8,
        },
        accidentalBadge: {

            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors[colorScheme].tint + '40',
        },
        accidentalText: {
            fontSize: 14,
            fontWeight: '700',
            color: Colors[colorScheme].tint,
        },
        noAccidentals: {
            fontSize: 14,
            color: Colors[colorScheme].icon,
            fontStyle: 'italic',
        },
        chordsGrid: {
            gap: 12,
        },
        chordCard: {

            padding: 12,
            borderRadius: 8,
            borderLeftWidth: 3,
            borderLeftColor: Colors[colorScheme].tint,
        },
        chordHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 8,
        },
        romanNumeral: {
            fontSize: 20,
            fontWeight: '800',
            color: Colors[colorScheme].text,
        },
        chordType: {
            fontSize: 12,
            fontWeight: '600',
            color: Colors[colorScheme].icon,
            textTransform: 'uppercase',
        },
        chordNotes: {
            fontSize: 14,
            color: Colors[colorScheme].text,
            marginBottom: 4,
            fontFamily: 'monospace',
        },
        chordFunction: {
            fontSize: 12,
            color: Colors[colorScheme].icon,
            fontStyle: 'italic',
        },
        modesScroll: {
            marginHorizontal: -16,
            paddingHorizontal: 16,
        },
        modeCard: {
            width: 200,

            padding: 16,
            borderRadius: 12,
            marginRight: 12,
            borderWidth: 1,
            borderColor: Colors[colorScheme].borderColor,
        },
        modeHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
        },
        modeName: {
            fontSize: 16,
            fontWeight: '700',
            color: Colors[colorScheme].text,
            flex: 1,
        },
        modeDegree: {

            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
        },
        degreeText: {
            fontSize: 12,
            fontWeight: '800',
            color: Colors[colorScheme].tint,
        },
        modeNotes: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 6,
            marginBottom: 12,
        },
        noteBadge: {

            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 4,
            borderWidth: 1,
            borderColor: Colors[colorScheme].borderColor,
        },
        noteText: {
            fontSize: 12,
            fontWeight: '600',
            color: Colors[colorScheme].text,
        },
        modeDescription: {
            fontSize: 12,
            color: Colors[colorScheme].icon,
            lineHeight: 16,
        },
        theoryCards: {
            gap: 12,
            marginBottom: 20,
        },
        theoryCard: {

            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors[colorScheme].borderColor,
        },
        theoryCardTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: Colors[colorScheme].text,
            marginTop: 8,
            marginBottom: 8,
        },
        theoryCardText: {
            fontSize: 13,
            color: Colors[colorScheme].text,
            lineHeight: 18,
        },
        quickFacts: {

            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors[colorScheme].borderColor,
        },
        quickFactsTitle: {
            fontSize: 16,
            fontWeight: '700',
            color: Colors[colorScheme].text,
            marginBottom: 12,
        },
        factItem: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 12,
        },
        factDot: {
            width: 6,
            height: 6,
            borderRadius: 3,

            marginTop: 6,
            marginRight: 10,
        },
        factText: {
            fontSize: 13,
            color: Colors[colorScheme].text,
            flex: 1,
            lineHeight: 18,
        },
        theoryNote: {
            flexDirection: 'row',
            alignItems: 'flex-start',

            padding: 12,
            borderRadius: 8,
            marginTop: 16,
            borderLeftWidth: 3,
            borderLeftColor: Colors[colorScheme].tint,
        },
        theoryNoteText: {
            fontSize: 12,
            color: Colors[colorScheme].text,
            marginLeft: 8,
            flex: 1,
            fontStyle: 'italic',
            lineHeight: 16,
        },
    })

export default CircleOfFifthsScreen