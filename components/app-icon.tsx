import { Image, StyleSheet } from 'react-native'
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
    width: 32,
    height: 32,
    // borderColor: "white",
    // borderWidth: 1,
    // borderRadius: 12,
    // marginBottom: 30,
    resizeMode: "contain",
  },
});

export default AppIcon