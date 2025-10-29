import AppIcon from "@/components/app-icon";
import SettingsIcon from "@/components/settings/icon";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet } from "react-native";

interface TabsHeaderProps {
  title: string;
}
const TabsHeader = ({ title }: TabsHeaderProps) => {
  const router = useRouter()
  return (
    <ThemedView style={styles.titleContainer}>
      <AppIcon />
      <ThemedText type="title">{title}</ThemedText>
      <Pressable onPress={()=>{
        router.push("/settings")
      }}>
        <SettingsIcon />
      </Pressable>
    </ThemedView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: "grey",
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginVertical: 16,
    alignItems: "center",
  },
});

export default TabsHeader;
