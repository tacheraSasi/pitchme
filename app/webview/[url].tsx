import { WebView } from "react-native-webview"
import { StyleSheet, ActivityIndicator, View } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { use, useState } from "react"
import { useColorScheme } from "@/hooks/use-color-scheme"
import { Colors } from "@/constants/theme"

export default function WebviewScreen() {
  const { url } = useLocalSearchParams()
  const [loading, setLoading] = useState(true)
  const colorTheme = useColorScheme()

  const uri = typeof url === "string" ? url : url?.[0]

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={Colors[colorTheme ? colorTheme : "light"].tint} />
        </View>
      )}

      <WebView
        source={{ uri }}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    zIndex: 1,
  },
})
