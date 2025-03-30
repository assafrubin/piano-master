"use client"

import { useState, useRef, useEffect } from "react"
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from "react-native"
import { Camera } from "expo-camera"
import * as ImageManipulator from "expo-image-manipulator"
import { useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"

export default function CameraScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const cameraRef = useRef<Camera | null>(null)
  const navigation = useNavigation()

  useEffect(() => {
    ;(async () => {
      const { status } = await Camera.requestCameraPermissionsAsync()
      setHasPermission(status === "granted")
    })()
  }, [])

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      setIsCapturing(true)
      try {
        const photo = await cameraRef.current.takePictureAsync()

        // Resize and optimize the image
        const processedImage = await ImageManipulator.manipulateAsync(photo.uri, [{ resize: { width: 1000 } }], {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        })

        // Navigate to practice screen with the captured image
        navigation.navigate(
          "Practice" as never,
          {
            imageUri: processedImage.uri,
            useDemoMode: false,
          } as never,
        )
      } catch (error) {
        console.error("Error taking picture:", error)
        Alert.alert("Error", "Failed to capture image. Please try again.")
      } finally {
        setIsCapturing(false)
      }
    }
  }

  const useDemoMode = () => {
    navigation.navigate(
      "Practice" as never,
      {
        useDemoMode: true,
      } as never,
    )
  }

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    )
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-off-outline" size={64} color="#666" />
        <Text style={styles.text}>No access to camera</Text>
        <Text style={styles.subText}>Camera permission is required to capture sheet music.</Text>
        <TouchableOpacity style={styles.button} onPress={useDemoMode}>
          <Text style={styles.buttonText}>Use Demo Mode Instead</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={Camera.Constants.Type.back}
        onCameraReady={() => setIsCameraReady(true)}
        ratio="4:3"
      >
        <View style={styles.overlay}>
          <View style={styles.guideFrame} />
        </View>
      </Camera>

      <View style={styles.controls}>
        <Text style={styles.instructionText}>Position your sheet music within the frame</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color="#3b82f6" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.captureButton} onPress={takePicture} disabled={!isCameraReady || isCapturing}>
            {isCapturing ? <ActivityIndicator size="small" color="#fff" /> : <View style={styles.captureButtonInner} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.demoButton} onPress={useDemoMode}>
            <Text style={styles.demoButtonText}>Demo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  camera: {
    flex: 1,
    width: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  guideFrame: {
    width: "80%",
    height: "40%",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.7)",
    borderRadius: 8,
  },
  controls: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 20,
    alignItems: "center",
  },
  instructionText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#3b82f6",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  demoButton: {
    width: 60,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  demoButtonText: {
    color: "#fff",
    fontSize: 14,
  },
  text: {
    fontSize: 18,
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: "#3b82f6",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})

