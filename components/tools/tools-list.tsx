import { Tool, toolsList } from "@/utils/tools";
import { ToolsListItem } from "./tools-list-item";
import { ThemedView } from "../themed/themed-view";
import { ThemedText } from "../themed/themed-text";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ScrollView, StyleSheet, useWindowDimensions } from "react-native";

export function ToolsList() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");

  const columns = width < 400 ? 2 : 3;
  const gap = 16;
  const horizontalPadding = 16;
  const itemSize =
    (width - horizontalPadding * 2 - gap * (columns - 1)) / columns;

  return (
    <ThemedView style={styles.wrapper}>
      <ThemedText style={styles.listTitle}>Practice Tools</ThemedText>
      <ScrollView
        contentContainerStyle={[styles.container, { gap }]}
        showsVerticalScrollIndicator={false}
        bounces={true}
        style={{ flex: 1 }}
      >
        {toolsList.map((tool: Tool) => (
          <ToolsListItem key={tool.id} {...tool} size={itemSize} />
        ))}
      </ScrollView>
    </ThemedView>
  );
}

const getStyles = (colorScheme: "light" | "dark" = "light") =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
      minHeight: 300,
    },
    listTitle: {
      fontSize: 18,
      fontWeight: "600",
      marginBottom: 16,
      paddingHorizontal: 14,
      color: Colors[colorScheme].text,
    },
    container: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "flex-start",
      paddingHorizontal: 16,
      paddingVertical: 10,
      paddingBottom: 40,
    },
  });
