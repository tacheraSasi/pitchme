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
                    id: 'record',
                    label: 'Record',
                    icon: 'fiber-manual-record',
                    route: '/(tabs)/record',
                },
                {
                    id: 'songs',
                    label: 'Songs',
                    icon: 'library-music',
                    route: '/(tabs)/songs',
                },
                {
                    id: 'recordings',
                    label: 'My Recordings',
                    icon: 'storage',
                    route: '/(tabs)/recordings',
                },
                {
                    id: 'tools',
                    label: 'Tools',
                    icon: 'build',
                    route: '/(tabs)/tools',
                },
            ]
        },
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
                            ? 'rgba(150, 89, 151, 0.15)'
                            : 'linear-gradient(135deg, #965997 0%, #9559A8 100%)',
                    }
                ]}>
                    <View style={[
                        styles.headerGradientFallback,
                        {
                            backgroundColor: colorScheme === 'dark'
                                ? 'rgba(150, 89, 151, 0.15)'
                                : '#965997',
                        }
                    ]}>
                        <View style={styles.header}>
                            <View style={[
                                styles.appIconContainer,
                                {
                                    backgroundColor: colorScheme === 'dark'
                                        ? 'rgba(255, 255, 255, 0.1)'
                                        : 'rgba(255, 255, 255, 0.2)',
                                }
                            ]}>
                                <MaterialIcons
                                    name="music-note"
                                    size={36}
                                    color={colorScheme === 'dark' ? '#fff' : '#fff'}
                                />
                            </View>
                            <View style={styles.headerTextContainer}>
                                <Text style={[
                                    styles.appTitle,
                                    { color: colorScheme === 'dark' ? '#fff' : '#fff' }
                                ]}>
                                    PitchMe
                                </Text>
                                <Text style={[
                                    styles.appSubtitle,
                                    { color: colorScheme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.8)' }
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
                                                    ? 'rgba(255, 255, 255, 0.05)'
                                                    : 'rgba(150, 89, 151, 0.08)'
                                                : theme.background,
                                            borderColor: item.highlight
                                                ? colorScheme === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.1)'
                                                    : 'rgba(150, 89, 151, 0.2)'
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
                                                ? '#965997'
                                                : colorScheme === 'dark'
                                                    ? 'rgba(255, 255, 255, 0.08)'
                                                    : 'rgba(150, 89, 151, 0.12)',
                                        }
                                    ]}>
                                        <MaterialIcons
                                            name={item.icon as any}
                                            size={20}
                                            color={item.highlight ? '#fff' : '#965997'}
                                        />
                                    </View>
                                    <View style={styles.menuItemContent}>
                                        <Text style={[
                                            styles.menuItemText,
                                            {
                                                color: item.highlight ? '#965997' : theme.text,
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
                                            color="#965997"
                                        />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </DrawerContentScrollView>

            {/* Footer Section */}
            <View style={[styles.footer, { backgroundColor: theme.background }]}>
                <Text style={[styles.footerText, { color: theme.text, opacity: 0.5 }]}>
                    Made with ♪ for music lovers
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
                                ? 'rgba(255, 255, 255, 0.1)'
                                : 'rgba(0, 0, 0, 0.1)'
                        }
                    ],
                    drawerActiveBackgroundColor: colorScheme === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(150, 89, 151, 0.1)',
                    drawerActiveTintColor: '#965997',
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
