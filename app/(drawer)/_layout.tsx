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
const BRAND_COLOR = '#9559A8';

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
                <View style={[styles.headerGradient, { backgroundColor: BRAND_COLOR }]}>
                    <View style={styles.header}>
                        <View style={styles.appIconContainer}>
                            <MaterialIcons name="music-note" size={36} color="#fff" />
                        </View>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.appTitle}>PitchMe</Text>
                            <Text style={styles.appSubtitle}>Record & Share Ideas</Text>
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
                        <Text style={[styles.sectionTitle, { color: theme.text + '99' }]}>
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
                                                ? BRAND_COLOR + '15'
                                                : 'transparent',
                                            borderColor: item.highlight
                                                ? BRAND_COLOR + '40'
                                                : 'transparent',
                                            borderWidth: item.highlight ? 1.5 : 0,
                                        }
                                    ]}
                                    onPress={() => {
                                        HapticFeedback('selection');
                                        props.navigation.closeDrawer();
                                        router.push(item.route as any);
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <View style={[
                                        styles.iconContainer,
                                        {
                                            backgroundColor: item.highlight
                                                ? BRAND_COLOR
                                                : BRAND_COLOR + '20'
                                        }
                                    ]}>
                                        <MaterialIcons
                                            name={item.icon as any}
                                            size={20}
                                            color={item.highlight ? '#fff' : BRAND_COLOR}
                                        />
                                    </View>
                                    <View style={styles.menuItemContent}>
                                        <Text style={[
                                            styles.menuItemText,
                                            {
                                                color: item.highlight ? BRAND_COLOR : theme.text,
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
                                            color={BRAND_COLOR}
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
                <Text style={[styles.footerText, { color: theme.text + '80' }]}>
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
                            borderRightColor: theme.text + '15'
                        }
                    ],
                    drawerActiveBackgroundColor: BRAND_COLOR + '15',
                    drawerActiveTintColor: BRAND_COLOR,
                    drawerInactiveTintColor: theme.text + '80',
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    appIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTextContainer: {
        marginLeft: 16,
        flex: 1,
    },
    appTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#fff',
        marginBottom: 2,
    },
    appSubtitle: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        fontWeight: '500',
    },
    drawerLinks: {
        flex: 1,
    },
    drawerLinksContent: {
        paddingTop: 8,
        paddingBottom: 20,
    },
    section: {
        marginTop: 20,
        marginBottom: 8,
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
        paddingHorizontal: 16,
        marginBottom: 8,
    },
    items: {
        paddingHorizontal: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 12,
        marginVertical: 3,
        borderRadius: 10,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
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
        paddingBottom: 24,
        paddingTop: 12,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 12,
        fontStyle: 'italic',
        fontWeight: '500',
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
