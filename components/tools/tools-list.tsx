import { Tool, toolsList } from "@/utils/tools";
import { ToolsListItem } from "./tools-list-item";
import { ThemedView } from "../themed/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { ScrollView, StyleSheet, useWindowDimensions, View } from "react-native";

export function ToolsList() {
  const { width } = useWindowDimensions();
  const colorScheme = useColorScheme();
  const styles = getStyles(colorScheme ?? "light");
  
  const columns = width < 400 ? 1 : 2;
  const gap = 16;
  const horizontalPadding = 16;
  const itemSize =
    (width - horizontalPadding * 2 - gap * (columns - 1)) / columns;

  // Split tools into rows for grid layout
  const rows = [];
  for (let i = 0; i < toolsList.length; i += columns) {
    rows.push(toolsList.slice(i, i + columns));
  }

  return (
    <ThemedView style={styles.wrapper}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        bounces={true}
        style={{ flex: 1 }}
      >
        {rows.map((row, rowIndex) => (
          <View key={rowIndex} style={[styles.row, { gap }]}>
            {row.map((tool: Tool) => (
              <View key={tool.id} style={{ width: itemSize }}>
                <ToolsListItem {...tool} size={itemSize} />
              </View>
            ))}
            {/* Add empty placeholder for last row if needed */}
            {row.length < columns && (
              <View style={{ width: itemSize }} />
            )}
          </View>
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
      width: '100%',
    },
    container: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      paddingBottom: 40,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      marginBottom: 16,
    },
  });