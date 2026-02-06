import ScreenLayout from "@/components/ScreenLayout";
import { StatusBarPresets } from "@/components/themed/themed-status-bar";
import { ThemedText } from "@/components/themed/themed-text";
import { ThemedView } from "@/components/themed/themed-view";
import { privacyPolicyUrl, supportUrl } from "@/constants/external-urls";
import { Colors } from "@/constants/theme";
import { APP_VERSION } from "@/constants/version";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { HapticFeedback } from "@/utils/haptics";
import Entypo from "@expo/vector-icons/Entypo";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Link, router } from "expo-router";
import {
    Linking,
    Pressable,
    ScrollView,
    StyleSheet,
    View,
} from "react-native";

export function AboutScreen() {
    const colorScheme = useColorScheme();
    const styles = getStyles(colorScheme ?? "light");

    const InfoCard = ({
        icon,
        title,
        description,
    }: {
        icon: string;
        title: string;
        description: string;
    }) => (
        <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
                <MaterialIcons
                    name={icon as any}
                    size={24}
                    color={Colors[colorScheme ?? "light"].tint}
                />
            </View>
            <View style={styles.infoContent}>
                <ThemedText style={styles.infoTitle}>{title}</ThemedText>
                <ThemedText style={styles.infoDescription}>{description}</ThemedText>
            </View>
        </View>
    );

    const LinkButton = ({
        title,
        onPress,
    }: {
        title: string;
        onPress: () => void;
    }) => (
        <Pressable style={styles.linkButton} onPress={onPress}>
            <ThemedText style={styles.linkButtonText}>{title}</ThemedText>
            <Entypo
                name="chevron-right"
                size={18}
                color={Colors[colorScheme ?? "light"].tint}
            />
        </Pressable>
    );

    return (
        <ScreenLayout styles={styles.container}>
            <ThemedView style={styles.container}>
                {StatusBarPresets.modal()}
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.iconContainer}>
                            <MaterialIcons
                                name="music-note"
                                size={48}
                                color={Colors[colorScheme ?? "light"].tint}
                            />
                        </View>
                        <ThemedText style={styles.appTitle}>PitchMe</ThemedText>
                        <ThemedText style={styles.tagline}>
                            Record, Tag & Share Ideas
                        </ThemedText>
                    </View>

                    {/* Description */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>About</ThemedText>
                        <ThemedText style={styles.description}>
                            PitchMe is your musical idea companion. Capture inspiration
                            whenever it strikes with seamless audio recording, organize your
                            creative thoughts with tags, and never lose a melody again.
                        </ThemedText>
                    </View>

                    {/* Features */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Features</ThemedText>
                        <InfoCard
                            icon="mic"
                            title="Record Ideas"
                            description="Capture musical ideas with high-quality audio recording"
                        />
                        <InfoCard
                            icon="label"
                            title="Organize with Tags"
                            description="Categorize and tag your recordings for easy discovery"
                        />
                        <InfoCard
                            icon="share"
                            title="Share Creations"
                            description="Export and share your musical ideas with others"
                        />
                        <InfoCard
                            icon="music-note"
                            title="Voice Presets"
                            description="Choose from multiple voice options for guidance"
                        />
                    </View>

                    {/* Credits */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Credits</ThemedText>
                        <View style={styles.creditCard}>
                            <ThemedText style={styles.creditTitle}>Created by</ThemedText>
                            <ThemedText style={styles.creditValue}>Tachera Sasi</ThemedText>
                        </View>
                    </View>

                    {/* Version */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>App Info</ThemedText>
                        <View style={styles.infoRow}>
                            <ThemedText style={styles.infoLabel}>Version</ThemedText>
                            <ThemedText style={styles.infoValue}>{APP_VERSION}</ThemedText>
                        </View>
                    </View>

                    {/* Links */}
                    <View style={styles.section}>
                        <ThemedText style={styles.sectionTitle}>Support</ThemedText>
                        <LinkButton
                            title="Help & Support"
                            onPress={() => {
                                HapticFeedback("success");
                                Linking.openURL(supportUrl);
                            }}
                        />
                        <LinkButton
                            title="Privacy Policy"
                            onPress={() => {
                                HapticFeedback("success");
                                const encodedUrl = encodeURIComponent(privacyPolicyUrl);
                                router.push(`webview/${encodedUrl}` as any);
                            }}
                        />
                    </View>

                    {/* Footer */}
                    <View style={styles.footer}>
                        <Link href="/" dismissTo style={styles.backButton}>
                            <ThemedText style={styles.backButtonText}>
                                ← Back to Home
                            </ThemedText>
                        </Link>
                        <ThemedText style={styles.footerText}>
                            Made with ♪ for music lovers
                        </ThemedText>
                    </View>
                </ScrollView>
            </ThemedView>
        </ScreenLayout>
    );
}

const getStyles = (colorScheme: "light" | "dark") =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: Colors[colorScheme].background,
        },
        scrollView: {
            flex: 1,
            paddingHorizontal: 20,
        },
        header: {
            alignItems: "center",
            paddingVertical: 40,
            paddingTop: 20,
        },
        iconContainer: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: Colors[colorScheme].tint + "15",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
        },
        appTitle: {
            fontSize: 32,
            fontWeight: "800",
            color: Colors[colorScheme].text,
            marginBottom: 8,
        },
        tagline: {
            fontSize: 16,
            color: Colors[colorScheme].text,
            opacity: 0.6,
        },
        section: {
            marginBottom: 32,
        },
        sectionTitle: {
            fontSize: 18,
            fontWeight: "600",
            marginBottom: 16,
            color: Colors[colorScheme].text,
            opacity: 0.8,
        },
        description: {
            fontSize: 16,
            lineHeight: 24,
            color: Colors[colorScheme].text,
            opacity: 0.7,
        },
        infoCard: {
            flexDirection: "row",
            alignItems: "flex-start",
            paddingVertical: 16,
            paddingHorizontal: 16,
            marginVertical: 8,
            backgroundColor: Colors[colorScheme].background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors[colorScheme].text + "15",
        },
        infoIconContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: Colors[colorScheme].tint + "15",
            alignItems: "center",
            justifyContent: "center",
            marginRight: 12,
            marginTop: 2,
        },
        infoContent: {
            flex: 1,
        },
        infoTitle: {
            fontSize: 16,
            fontWeight: "500",
            color: Colors[colorScheme].text,
            marginBottom: 4,
        },
        infoDescription: {
            fontSize: 13,
            color: Colors[colorScheme].text,
            opacity: 0.6,
        },
        creditCard: {
            paddingVertical: 16,
            paddingHorizontal: 16,
            backgroundColor: Colors[colorScheme].background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors[colorScheme].text + "15",
        },
        creditTitle: {
            fontSize: 14,
            color: Colors[colorScheme].text,
            opacity: 0.6,
            marginBottom: 4,
        },
        creditValue: {
            fontSize: 18,
            fontWeight: "600",
            color: Colors[colorScheme].text,
        },
        infoRow: {
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: Colors[colorScheme].background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors[colorScheme].text + "15",
        },
        infoLabel: {
            fontSize: 16,
            fontWeight: "500",
            color: Colors[colorScheme].text,
        },
        infoValue: {
            fontSize: 16,
            color: Colors[colorScheme].text,
            opacity: 0.6,
        },
        linkButton: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            paddingVertical: 16,
            paddingHorizontal: 16,
            marginVertical: 8,
            backgroundColor: Colors[colorScheme].background,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: Colors[colorScheme].text + "15",
        },
        linkButtonText: {
            fontSize: 16,
            fontWeight: "500",
            color: Colors[colorScheme].text,
        },
        footer: {
            alignItems: "center",
            paddingVertical: 40,
            paddingHorizontal: 20,
        },
        backButton: {
            paddingVertical: 12,
            paddingHorizontal: 24,
            backgroundColor: Colors[colorScheme].tint + "15",
            borderRadius: 25,
            marginBottom: 20,
        },
        backButtonText: {
            fontSize: 16,
            fontWeight: "500",
            color: Colors[colorScheme].tint,
        },
        footerText: {
            fontSize: 14,
            color: Colors[colorScheme].text,
            opacity: 0.5,
            fontStyle: "italic",
        },
    });