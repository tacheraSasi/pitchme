import { View, Text, Image, StyleSheet } from 'react-native'
import React from 'react'
import { ThemedView } from '@/components/themed-view'

const iconSource = require("../assets/images/icon.png")
const AppIcon = () => {
  return (
    <ThemedView>
      <Image source={iconSource} style={styles.logo}/>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: 26,
    height: 26,
    // marginBottom: 30,
    resizeMode: "contain",
  },
});

export default AppIcon