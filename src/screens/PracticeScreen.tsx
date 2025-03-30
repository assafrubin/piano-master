"use client"

import { useState, useEffect } from "react"
import { StyleSheet, Text, View, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native"
import { Audio } from "expo-av"
import { useRoute, useNavigation, type RouteProp } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons"
import SheetMusicDisplay from "../components/SheetMusicDisplay"
import NoteButton from "../components/NoteButton"
import { processSheetMusicImage } from "../utils/imageProcessing"
import type { Note } from "../types"
import { demoSheetMusic } from "../data/demoData"

type RouteParams = {
  imageUri?: string
  useDemoMode: boolean
}

export default function PracticeScreen() {
  const route = useRoute<RouteProp<Record<string, RouteParams>, string>>()
  const navigation = useNavigation()
  const { imageUri, useDemoMode = false } = route.params || {}

  const [isProcessing, setIsProcessing] = useState(false)
  const [sheetMusic, setSheetMusic] = useState<Note[]>(demoSheetMusic)
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [incorrectNote, setIncorrectNote] = useState<string | null>(null)
  const [recording, setRecording] = useState<Audio.Recording | null>(null)
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean | null>(null)

  useEffect(() => {
    if (imageUri) {
      processImage(imageUri)
    }
    // Request audio permissions
    ;(async () => {
      const { status } = await Audio.requestPermissionsAsync()
      setHasAudioPermission(status === "granted")
    })()

    return () => {
      stopListening()
    }
  }, [imageUri])

  const processImage = async (uri: string) => {
    setIsProcessing(true)
    try {
      // In a real app, this would call an API or use a library to process the image
      const recognizedNotes = await processSheetMusicImage(uri)
      setSheetMusic(recognizedNotes)
      setCurrentNoteIndex(0)
    } catch (error) {
      console.error("Error processing sheet music:", error)
      // Fallback to demo data if processing fails
      setSheetMusic(demoSheetMusic)
    } finally {
      setIsProcessing(false)
    }
  }

  const startListening = async () => {
    if (!hasAudioPermission) {
      Alert.alert("Permission Required", "Microphone permission is needed to detect notes.", [{ text: "OK" }])
      return
    }

    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilenceWhileRecordingIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      })

      const recording = new Audio.Recording()
      await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY)
      await recording.startAsync()
      setRecording(recording)
      setIsListening(true)

      // In a real app, we would continuously analyze the audio
      // This is simplified for the demo
      simulateAudioDetection()
    } catch (error) {
      console.error("Error starting audio recording:", error)
      Alert.alert("Error", "Failed to start audio listening. Please try again.")
    }
  }

  const stopListening = async () => {
    if (recording) {
      try {
        await recording.stopAndUnloadAsync()
      } catch (error) {
        // Recording might already be stopped
      }
      setRecording(null)
    }
    setIsListening(false)
  }

  // Simulate audio detection for demo purposes
  const simulateAudioDetection = () => {
    // In a real app, this would be replaced with actual audio analysis
    if (useDemoMode) {
      // Don't simulate in demo mode - user will tap buttons instead
      return
    }

    const interval = setInterval(() => {
      if (!isListening) {
        clearInterval(interval)
        return
      }

      // Randomly decide whether to detect the correct note or a random one
      const detectCorrect = Math.random() > 0.7

      if (detectCorrect && currentNoteIndex < sheetMusic.length) {
        handleNoteDetected(sheetMusic[currentNoteIndex].note)
      } else {
        // Detect a random incorrect note occasionally
        const allNotes = ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"]
        const randomNote = allNotes[Math.floor(Math.random() * allNotes.length)]
        if (randomNote !== sheetMusic[currentNoteIndex].note) {
          handleNoteDetected(randomNote)
        }
      }
    }, 2000) // Check every 2 seconds

    return () => clearInterval(interval)
  }

  const handleNoteDetected = (detectedNote: string) => {
    if (currentNoteIndex < sheetMusic.length) {
      const expectedNote = sheetMusic[currentNoteIndex].note

      if (detectedNote === expectedNote) {
        // Mark the current note as played
        const updatedSheetMusic = [...sheetMusic]
        updatedSheetMusic[currentNoteIndex] = {
          ...updatedSheetMusic[currentNoteIndex],
          played: true,
        }
        setSheetMusic(updatedSheetMusic)

        // Move to the next note
        setCurrentNoteIndex(currentNoteIndex + 1)
      } else {
        // Show incorrect note temporarily
        setIncorrectNote(detectedNote)

        // Clear the incorrect note after 500ms
        setTimeout(() => {
          setIncorrectNote(null)
        }, 500)
      }
    }
  }

  const resetPractice = () => {
    const resetSheetMusic = sheetMusic.map((note) => ({
      ...note,
      played: false,
    }))
    setSheetMusic(resetSheetMusic)
    setCurrentNoteIndex(0)
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Practice Your Music</Text>
        <Text style={styles.subtitle}>
          {useDemoMode
            ? "Demo Mode: Tap the note buttons below to practice"
            : "Play the notes in sequence. Correct notes will be highlighted."}
        </Text>
      </View>

      {imageUri && (
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUri }} style={styles.image} resizeMode="contain" />
        </View>
      )}

      {isProcessing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Processing sheet music...</Text>
        </View>
      ) : (
        <>
          <SheetMusicDisplay notes={sheetMusic} currentIndex={currentNoteIndex} incorrectNote={incorrectNote} />

          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={[styles.button, isListening ? styles.stopButton : styles.startButton]}
              onPress={toggleListening}
            >
              <Ionicons name={isListening ? "stop-circle" : "mic"} size={24} color={isListening ? "#fff" : "#fff"} />
              <Text style={styles.buttonText}>{isListening ? "Stop Listening" : "Start Listening"}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.resetButton} onPress={resetPractice}>
              <Ionicons name="refresh" size={20} color="#3b82f6" />
              <Text style={styles.resetButtonText}>Reset</Text>
            </TouchableOpacity>
          </View>

          {currentNoteIndex < sheetMusic.length && (
            <View style={styles.nextNoteContainer}>
              <Text style={styles.nextNoteLabel}>Next note to play:</Text>
              <Text style={styles.nextNote}>{sheetMusic[currentNoteIndex].note}</Text>
            </View>
          )}

          {(useDemoMode || !hasAudioPermission) && (
            <View style={styles.demoContainer}>
              <Text style={styles.demoTitle}>{useDemoMode ? "Demo Mode" : "Microphone Access Required"}</Text>
              <Text style={styles.demoSubtitle}>Tap these buttons to simulate playing notes:</Text>
              <View style={styles.noteButtonsContainer}>
                {["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"].map((note) => (
                  <NoteButton
                    key={note}
                    note={note}
                    onPress={() => handleNoteDetected(note)}
                    isActive={note === sheetMusic[currentNoteIndex]?.note}
                  />
                ))}
              </View>
            </View>
          )}

          {currentNoteIndex >= sheetMusic.length && (
            <View style={styles.completedContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#10b981" />
              <Text style={styles.completedText}>Great job!</Text>
              <Text style={styles.completedSubtext}>You've completed the piece</Text>
              <TouchableOpacity style={styles.startButton} onPress={resetPractice}>
                <Text style={styles.buttonText}>Practice Again</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  imageContainer: {
    marginBottom: 20,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  image: {
    width: "100%",
    height: 200,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#666",
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  startButton: {
    backgroundColor: "#3b82f6",
  },
  stopButton: {
    backgroundColor: "#ef4444",
  },
  resetButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#3b82f6",
    backgroundColor: "transparent",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  resetButtonText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  nextNoteContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  nextNoteLabel: {
    fontSize: 14,
    color: "#666",
  },
  nextNote: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b82f6",
  },
  demoContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  demoTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  demoSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  noteButtonsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  completedContainer: {
    alignItems: "center",
    marginTop: 30,
    padding: 20,
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
  },
  completedText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#10b981",
    marginTop: 12,
  },
  completedSubtext: {
    fontSize: 16,
    color: "#059669",
    marginBottom: 20,
  },
})

