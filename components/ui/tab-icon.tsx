import { ThemedView } from "@/components/themed/themed-view";

type IconProps = {
  name: string;
  color: string;
  focused: boolean;
  IconComponent: React.ComponentType<any>;
};

export default function TabBarIcon({
  name,
  color,
  focused,
  IconComponent,
}: IconProps) {
  return (
    <ThemedView>
      <IconComponent size={28} style={{ marginBottom: -3 }} name={name} color={color} />
    </ThemedView>
  );
}
