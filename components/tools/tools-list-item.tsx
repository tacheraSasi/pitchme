import { Tool } from "@/utils/tools";
import { ThemedView } from "../themed/themed-view";
import { ThemedText } from "../themed/themed-text";

export function ToolsListItem({ id, title, icon }: Tool) {
  return (
    <ThemedView className="tool-list-item">
      <ThemedText>{title}</ThemedText>
    </ThemedView>
  );
}