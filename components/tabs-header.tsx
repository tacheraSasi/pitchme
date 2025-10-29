import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import React from "react";
import { StyleSheet } from "react-native";

interface TabsHeaderProps {
  title:string
}
const TabsHeader = ({ title }: TabsHeaderProps) => {
  return (
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{title}</ThemedText>
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
    justifyContent: "center",
    marginVertical: 16,
    alignItems: "center",
  },
});

export default TabsHeader;
