import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';

export function HapticTab(props: BottomTabBarButtonProps) {
  const [focused, setFocused] = useState(false)
  props.onFocus = () =>{
    setFocused(true)
    console.log("Tab focused")
  }
  return (
    <PlatformPressable
      {...props}
      
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        props.onPressIn?.(ev);
      }}
    />
  );
}
