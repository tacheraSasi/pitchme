import AboutBottomSheet from "@/components/about-bottom-sheet";
import BottomSheet from "@gorhom/bottom-sheet";
import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

interface ScreenLayoutProps {
  styles: object;
  aboutBottomSheetRef: React.RefObject<BottomSheet | null>;
  children: React.ReactNode;
}
const ScreenLayout = ({
  styles,
  aboutBottomSheetRef,
  children,
}: ScreenLayoutProps) => {
  return (
    <GestureHandlerRootView style={styles}>
      {children}
      <AboutBottomSheet bottomSheetRef={aboutBottomSheetRef} />
    </GestureHandlerRootView>
  );
};

export default ScreenLayout;
