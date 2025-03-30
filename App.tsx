import { SafeAreaView, StatusBar, StyleSheet } from "react-native"
import { NavigationContainer } from "@react-navigation/native"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import { GestureHandlerRootView } from "react-native-gesture-handler"

import HomeScreen from "./src/screens/HomeScreen"
import CameraScreen from "./src/screens/CameraScreen"
import PracticeScreen from "./src/screens/PracticeScreen"

const Stack = createNativeStackNavigator()

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <SafeAreaView style={styles.container}>
          <StatusBar barStyle="dark-content" />
          <Stack.Navigator initialRouteName="Home">
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: "Music Note Recognition" }} />
            <Stack.Screen name="Camera" component={CameraScreen} options={{ title: "Capture Sheet Music" }} />
            <Stack.Screen name="Practice" component={PracticeScreen} options={{ title: "Practice" }} />
          </Stack.Navigator>
        </SafeAreaView>
      </NavigationContainer>
    </GestureHandlerRootView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
})

