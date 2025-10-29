import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import TabsHeader from "@/components/tabs-header";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import Entypo from "@expo/vector-icons/Entypo";
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
          headerShown: false,
          tabBarButton: HapticTab,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color }) => (
              <Entypo name="folder-music" size={24} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="record"
          options={{
            title: "Studio",
            tabBarIcon: ({ color }) => (
              <Entypo name="mic" size={24} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
