import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { HapticFeedback } from '@/utils/haptics';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { router } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import { useMemo } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const { width } = Dimensions.get('window');

const CustomDrawerContent = (props: DrawerContentComponentProps) => {
    const colorScheme = useColorScheme();
    const theme = useMemo(() => Colors[colorScheme ?? 'light'], [colorScheme]);

    const menuSections = [
        {
            title: 'Main',
            items: [
                {
                    id: 'home',
                    label: 'Home',
                    icon: 'home',
                    route: '/(tabs)',
                    highlight: true,
                },
                {
                    id: 'tools',
                    label: 'Tools',
                    icon: 'build',
                    route: '/(tabs)/tools',
                },
                {
                    id: 'search',
                    label: 'Search',
                    icon: 'search',
                    route: '/songs/search',
                },
            ]
        },
    ];

    const bottomSections = [
        {
            title: 'About & Support',
            items: [
                {
                    id: 'about',
                    label: 'About',
                    icon: 'info',
                    route: '/about',
                },
                {
                    id: 'settings',
                    label: 'Settings',
                    icon: 'settings',
                    route: '/settings',
                },
            ]
        }
    ];

    return (
        <View style={[styles.drawerContainer, { backgroundColor: theme.background }]}>
            {/* Header Section */}
            <View style={styles.headerContainer}>
                <View style={[
                    styles.headerGradient,
                    {
                        backgroundColor: colorScheme === 'dark'
                            ? theme.tint + '18'
                            : theme.tint,
                    }
                ]}>
                    <View style={[
                        styles.headerGradientFallback,
                        {
                            backgroundColor: theme.tint,
                        }
                    ]}>
                        <View style={styles.header}>
                            <View style={[
                                styles.appIconContainer,
                                {
                                    backgroundColor: colorScheme === 'dark'
                                        ? theme.tint + '14'
                                        : theme.tint + '20',
                                }
                            ]}>
                                <MaterialIcons
                                    name="music-note"
                                    size={36}
                                    color="#fff"
                                />
                            </View>
                            <View style={styles.headerTextContainer}>
                                <Text style={[
                                    styles.appTitle,
                                    { color: '#fff' }
                                ]}>
                                    PitchMe
                                </Text>
                                <Text style={[
                                    styles.appSubtitle,
                                    { color: 'rgba(255,255,255,0.8)' }
                                ]}>
                                    Record & Share Ideas
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>

            {/* Drawer Menu Items */}
            <DrawerContentScrollView
                {...props}
                style={[styles.drawerLinks, { backgroundColor: theme.background }]}
                contentContainerStyle={styles.drawerLinksContent}
                showsVerticalScrollIndicator={false}
            >
                {menuSections.map((section) => (
                    <View key={section.title} style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: theme.text, opacity: 0.6 }]}>
                            {section.title}
                        </Text>
                        <View style={styles.items}>
                            {section.items.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.menuItem,
                                        {
                                            backgroundColor: item.highlight
                                                ? colorScheme === 'dark'
                                                    ? theme.tint + '0D'
                                                    : theme.tint + '14'
                                                : theme.background,
                                            borderColor: item.highlight
                                                ? colorScheme === 'dark'
                                                    ? theme.tint + '1A'
                                                    : theme.tint + '33'
                                                : colorScheme === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(0, 0, 0, 0.05)',
                                        }
                                    ]}
                                    onPress={() => {
                                        HapticFeedback('selection');
                                        props.navigation.closeDrawer();
                                        router.push(item.route as any);
                                    }}
                                    activeOpacity={0.6}
                                >
                                    <View style={[
                                        styles.iconContainer,
                                        {
                                            backgroundColor: item.highlight
                                                ? theme.tint
                                                : colorScheme === 'dark'
                                                    ? theme.tint + '14'
                                                    : theme.tint + '1F',
                                        }
                                    ]}>
                                        <MaterialIcons
                                            name={item.icon as any}
                                            size={20}
                                            color={item.highlight ? (colorScheme === 'dark' ? theme.tint : '#fff') : theme.tint}
                                        />
                                    </View>
                                    <View style={styles.menuItemContent}>
                                        <Text style={[
                                            styles.menuItemText,
                                            {
                                                color: item.highlight ? theme.tint : theme.text,
                                                fontWeight: item.highlight ? '600' : '500'
                                            }
                                        ]}>
                                            {item.label}
                                        </Text>
                                    </View>
                                    {item.highlight && (
                                        <Entypo
                                            name="chevron-right"
                                            size={16}
                                            color={theme.tint}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </DrawerContentScrollView>

            {/* Bottom Fixed Section */}
            <View style={[styles.bottomSection, { backgroundColor: theme.background }]}>
                {bottomSections.map((section) => (
                    <View key={section.title}>
                        <Text style={[styles.sectionTitle, { color: theme.text, opacity: 0.6 }]}>
                            {section.title}
                        </Text>
                        <View style={styles.items}>
                            {section.items.map((item) => (
                                <TouchableOpacity
                                    key={item.id}
                                    style={[
                                        styles.menuItem,
                                        {
                                            backgroundColor: item.highlight
                                                ? colorScheme === 'dark'
                                                    ? theme.tint + '0D'
                                                    : theme.tint + '14'
                                                : theme.background,
                                            borderColor: item.highlight
                                                ? colorScheme === 'dark'
                                                    ? theme.tint + '1A'
                                                    : theme.tint + '33'
                                                : colorScheme === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(0, 0, 0, 0.05)',
                                        }
                                    ]}
                                    onPress={() => {
                                        HapticFeedback('selection');
                                        props.navigation.closeDrawer();
                                        router.push(item.route as any);
                                    }}
                                    activeOpacity={0.6}
                                >
                                    <View style={[
                                        styles.iconContainer,
                                        {
                                            backgroundColor: item.highlight
                                                ? theme.tint
                                                : colorScheme === 'dark'
                                                    ? theme.tint + '14'
                                                    : theme.tint + '1F',
                                        }
                                    ]}>
                                        <MaterialIcons
                                            name={item.icon as any}
                                            size={20}
                                            color={item.highlight ? (colorScheme === 'dark' ? theme.tint : '#fff') : theme.tint}
                                        />
                                    </View>
                                    <View style={styles.menuItemContent}>
                                        <Text style={[
                                            styles.menuItemText,
                                            {
                                                color: item.highlight ? theme.tint : theme.text,
                                                fontWeight: item.highlight ? '600' : '500'
                                            }
                                        ]}>
                                            {item.label}
                                        </Text>
                                    </View>
                                    {item.highlight && (
                                        <Entypo
                                            name="chevron-right"
                                            size={16}
                                            color={theme.tint}
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </View>

            {/* Footer Section */}
            <View style={[styles.footer, { backgroundColor: theme.background }]}>
                <Text style={[styles.footerText, { color: theme.text, opacity: 0.5 }]}>
                    Make sure you hit that note ♪
                </Text>
            </View>
        </View>
    );
};

export default function Layout() {
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ?? 'light'];

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <Drawer
                drawerContent={(props) => <CustomDrawerContent {...props} />}
                screenOptions={{
                    drawerStyle: [
                        styles.drawerStyle,
                        {
                            backgroundColor: theme.background,
                            borderRightWidth: StyleSheet.hairlineWidth,
                            borderRightColor: colorScheme === 'dark'
                                ? theme.text + '1A'
                                : theme.text + '1A'
                        }
                    ],
                    drawerActiveBackgroundColor: colorScheme === 'dark'
                        ? theme.tint + '14'
                        : theme.tint + '1A',
                    drawerActiveTintColor: theme.tint,
                    drawerInactiveTintColor: theme.text,
                    drawerLabelStyle: [styles.drawerLabelStyle, { color: theme.text }],
                    headerShown: false,
                    drawerType: 'slide',
                }}
            />
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    drawerContainer: {
        flex: 1,
    },
    headerContainer: {
        overflow: 'hidden',
    },
    headerGradient: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 24,
    },
    headerGradientFallback: {
        paddingHorizontal: 20,
        paddingTop: 0,
        paddingBottom: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextContainer: {
        marginLeft: 16,
        flex: 1,
    },
    appTitle: {
        fontSize: 32,
        fontWeight: '800',
        marginBottom: 4,
    },
    appSubtitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    drawerLinks: {
        flex: 1,
    },
    drawerLinksContent: {
        paddingTop: 12,
        paddingBottom: 20,
    },
    section: {
        marginTop: 24,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    items: {
        paddingHorizontal: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 13,
        paddingHorizontal: 12,
        marginVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    menuItemContent: {
        flex: 1,
    },
    menuItemText: {
        fontSize: 15,
        fontWeight: '500',
    },
    footer: {
        paddingHorizontal: 16,
        paddingBottom: 28,
        paddingTop: 16,
        alignItems: 'center',
    },
    bottomSection: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        paddingBottom: 24,
    },
    footerText: {
        fontSize: 12,
        fontStyle: 'italic',
        fontWeight: '500',
        lineHeight: 18,
    },
    drawerStyle: {
        width: width * 0.82,
    },
    drawerLabelStyle: {
        fontWeight: '500',
        fontSize: 15,
        marginLeft: -20,
    },
});
