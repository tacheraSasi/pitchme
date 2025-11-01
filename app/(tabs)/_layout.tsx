import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import TabBarIcon from "@/components/ui/tab-icon";
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
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="folder-music" color={color} focused={focused} />
            ),
          }}
        />
        <Tabs.Screen
          name="record"
          options={{
            title: "Studio",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="mic" color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
