import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';

export function HapticTab(props: BottomTabBarButtonProps) {
  const [focused, setFocused] = useState(false)
  return (
    <PlatformPressable
      {...props}
      style={[ focused && { 
        paddingHorizontal:10,
        backgroundColor: 'gray'
      }]}
      onPressIn={(ev) => {
        setFocused(true)
        console.log("Tab ficused") //TODO: Add nice animations and change the bg of the tab as well 
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        props.onPressIn?.(ev);
      }}
    />
  );
}
