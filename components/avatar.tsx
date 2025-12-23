import { ThemedView } from "@/components/themed/themed-view";
import React from "react";
import { Image, ImageSourcePropType, StyleSheet } from "react-native";

interface AvatarProps {
  source: ImageSourcePropType;
  size?: number;
}
const Avatar = ({ source, size = 28 }: AvatarProps) => {
  const styles = getStyles(size);
  return (
    <ThemedView>
      <Image source={source} style={[styles.avatar, { width: size, height: size }]} />
    </ThemedView>
  );
};

const getStyles = (size: number) => StyleSheet.create({
  avatar: {
    width: size,
    height: size,
    borderRadius: 14,
    resizeMode: "cover",
  },
});

export default Avatar;
