import { ThemedView } from "@/components/themed-view";
import React from "react";
import { Image, StyleSheet } from "react-native";

interface AppIconProps {
    backgroundColor?: string;
}
const iconSource = require("../assets/images/icon.png");
const AppIcon = ({ backgroundColor }: AppIconProps) => {
  return (
    <ThemedView>
      <Image source={iconSource} style={[styles.logo, { backgroundColor }]} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: 28,
    height: 28,
    resizeMode: "contain",
  },
});

export default AppIcon;
