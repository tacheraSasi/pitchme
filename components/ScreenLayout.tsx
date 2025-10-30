import AboutBottomSheet from "@/components/about-bottom-sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import React from "react";
import { Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

interface ScreenLayoutProps {
  styles: object;
  aboutBottomSheetRef: React.RefObject<BottomSheet | null>;
}
const ScreenLayout = ({ styles, aboutBottomSheetRef }: ScreenLayoutProps) => {
  return (
    <GestureHandlerRootView style={styles}>
      <AboutBottomSheet bottomSheetRef={aboutBottomSheetRef} />
    </GestureHandlerRootView>
  );
};

export default ScreenLayout;
