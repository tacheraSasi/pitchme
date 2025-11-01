import Entypo from "@expo/vector-icons/Entypo";

export default function TabBarIcon(props: {
  name: React.ComponentProps<typeof Entypo>["name"];
  color: string;
}) {
  return (
    <Entypo
      size={26}
      style={{ marginBottom: -3 }}
      {...props}
    />
  );
}
