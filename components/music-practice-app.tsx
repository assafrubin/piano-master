"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import CameraCapture from "./camera-capture"
import SheetMusicDisplay from "./sheet-music-display"
import AudioAnalyzer from "./audio-analyzer"
import type { Note } from "@/lib/types"
import { processSheetMusicImage } from "@/lib/image-processing"
import { demoSheetMusic } from "@/lib/demo-data"

export default function MusicPracticeApp() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [sheetMusic, setSheetMusic] = useState<Note[]>(demoSheetMusic)
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [activeTab, setActiveTab] = useState("capture")
  const [incorrectNote, setIncorrectNote] = useState<string | null>(null)
  const [isDemoMode, setIsDemoMode] = useState(false)

  const handleImageCapture = (imageSrc: string) => {
    setCapturedImage(imageSrc)
    setActiveTab("practice")
    processImage(imageSrc)

    // If it's a placeholder image, we're in demo mode
    if (imageSrc.includes("placeholder.svg")) {
      setIsDemoMode(true)
    }
  }

  const processImage = async (imageSrc: string) => {
    setIsProcessing(true)
    try {
      // In a real app, this would call an API or use a library to process the image
      const recognizedNotes = await processSheetMusicImage(imageSrc)
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

  const handleNoteDetected = (detectedNote: string, isCorrect: boolean) => {
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
    setIsListening(!isListening)
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-4 md:p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="capture">Capture Sheet Music</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
        </TabsList>

        <TabsContent value="capture" className="space-y-4">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold">Take a Photo of Your Sheet Music</h2>
            <p className="text-muted-foreground">Position your sheet music clearly in the frame</p>
          </div>

          <CameraCapture onCapture={handleImageCapture} />

          {capturedImage && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Preview:</h3>
              <div className="relative border rounded-md overflow-hidden">
                <img
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured sheet music"
                  className="w-full object-contain max-h-[300px]"
                />
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold">Practice Your Music</h2>
            <p className="text-muted-foreground">
              {isDemoMode
                ? "Demo Mode: Use the simulated note buttons below to practice"
                : "Play the notes in sequence. Correct notes will be highlighted."}
            </p>
          </div>

          {isProcessing ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <span className="ml-3">Processing sheet music...</span>
            </div>
          ) : (
            <>
              <SheetMusicDisplay notes={sheetMusic} currentIndex={currentNoteIndex} incorrectNote={incorrectNote} />

              <div className="flex flex-col md:flex-row gap-4 justify-center mt-6">
                <Button
                  onClick={toggleListening}
                  variant={isListening ? "destructive" : "default"}
                  className="flex items-center gap-2"
                >
                  {isListening ? "Stop Listening" : "Start Listening"}
                </Button>

                <Button onClick={resetPractice} variant="outline">
                  Reset Practice
                </Button>
              </div>

              {isListening && <AudioAnalyzer onNoteDetected={handleNoteDetected} isListening={isListening} />}

              {!isListening && isDemoMode && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                  <h3 className="font-medium mb-2">Demo Mode</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Click on these buttons to simulate playing notes:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"].map((note) => (
                      <Button key={note} variant="outline" size="sm" onClick={() => handleNoteDetected(note, false)}>
                        {note}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

