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
          tabBarStyle: {
            borderTopWidth: 0.2,
            borderTopColor: "rgba(33, 33, 33, 0.16)",
            paddingVertical: 20,
            height: 90,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "600",
          },
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
        <Tabs.Screen
          name="songs"
          options={{
            title: "Songs",
            tabBarIcon: ({ color, focused }) => (
              <TabBarIcon name="music" color={color} focused={focused} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}
