import ScreenLayout from "@/components/ScreenLayout";
import { Stack } from "expo-router";
import React, { useRef } from "react";

export default function SongsLayout() {
  const aboutBottomSheetRef = useRef(null);
  return (
    <ScreenLayout
      styles={{
        flex: 1,
      }}
      aboutBottomSheetRef={aboutBottomSheetRef}
    >
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      />
    </ScreenLayout>
  );
}
