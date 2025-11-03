import { BottomTabBarButtonProps } from "@react-navigation/bottom-tabs";
import { PlatformPressable } from "@react-navigation/elements";
import * as Haptics from "expo-haptics";
import { useState } from "react";

export function HapticTab(props: BottomTabBarButtonProps) {
  const [focused, setFocused] = useState(false);
  return (
    <PlatformPressable
      {...props}
      // style={[
      //   ...props.styles,
      //   focused && {
      //     paddingHorizontal: 10,
      //     backgroundColor: "gray", 
      //     //TODO: Handle this well after furthure research the goal is to have nice animations here too
      //   },
      // ]}
      onFocus={() => {
        setFocused(true);
        console.log("Tab focused"); //TODO: Add nice animations and change the bg of the tab as well
      }}
      onPressIn={(ev) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        props.onPressIn?.(ev);
      }}
    />
  );
}
