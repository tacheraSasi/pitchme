import { Tool, toolsList } from "@/utils/tools";
import { ToolsListItem } from "./tools-list-item";
import { ThemedView } from "../themed/themed-view";

export function ToolsList() {
  return (
    <ThemedView className="tools-list">
      {toolsList.map((tool: Tool) => (
        <ToolsListItem key={tool.id} {...tool} />
      ))}
    </ThemedView>
  );
}