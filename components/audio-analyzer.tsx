"use client"

import { useEffect, useRef, useState } from "react"
import { detectNote } from "@/lib/audio-processing"
import { AlertCircle, Volume2, VolumeX } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface AudioAnalyzerProps {
  onNoteDetected: (note: string, isCorrect: boolean) => void
  isListening: boolean
}

export default function AudioAnalyzer({ onNoteDetected, isListening }: AudioAnalyzerProps) {
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const dataArrayRef = useRef<Float32Array | null>(null)
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [detectedNote, setDetectedNote] = useState<string>("")
  const [volume, setVolume] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)

  const lastNoteTimeRef = useRef<number>(0)
  const lastDetectedNoteRef = useRef<string>("")
  const rawDataRef = useRef<number[]>([])

  useEffect(() => {
    if (isListening) {
      startListening()
    } else {
      stopListening()
    }

    return () => {
      stopListening()
    }
  }, [isListening])

  const startListening = async () => {
    setError(null)
    setDebugInfo(null)
    setIsInitializing(true)

    try {
      setDebugInfo("Checking for microphone support...")

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Audio API is not supported in your browser")
      }

      // First try to enumerate devices to check if microphone exists
      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioDevices = devices.filter((device) => device.kind === "audioinput")

      if (audioDevices.length === 0) {
        throw new Error("No microphone detected on your device")
      }

      setDebugInfo(`Found ${audioDevices.length} microphone(s). Attempting to access...`)

      // Try to get the audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      })

      streamRef.current = stream
      setDebugInfo("Microphone access granted")

      // Create audio context
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) {
        throw new Error("AudioContext not supported in this browser")
      }

      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      setDebugInfo(`Audio context created. Sample rate: ${audioContext.sampleRate}Hz`)

      // Create analyzer
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 2048
      analyserRef.current = analyser

      // Create buffer
      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Float32Array(bufferLength)
      dataArrayRef.current = dataArray

      // Connect microphone to analyzer
      const source = audioContext.createMediaStreamSource(stream)
      source.connect(analyser)
      sourceRef.current = source

      setDebugInfo("Audio analyzer ready. Starting audio processing...")
      setIsInitializing(false)

      // Start analyzing
      analyzeAudio()
    } catch (error: any) {
      console.error("Error accessing microphone:", error)
      setError(`Microphone access error: ${error.message || "Unknown error"}`)
      setIsInitializing(false)
    }
  }

  const stopListening = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }

    if (sourceRef.current) {
      sourceRef.current.disconnect()
      sourceRef.current = null
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }

    setDebugInfo(null)
  }

  const analyzeAudio = () => {
    if (!analyserRef.current || !dataArrayRef.current) return

    analyserRef.current.getFloatTimeDomainData(dataArrayRef.current)

    // Store raw data for debugging
    rawDataRef.current = Array.from(dataArrayRef.current).slice(0, 50)

    // Calculate volume (RMS)
    let sum = 0
    for (let i = 0; i < dataArrayRef.current.length; i++) {
      sum += dataArrayRef.current[i] * dataArrayRef.current[i]
    }
    const rms = Math.sqrt(sum / dataArrayRef.current.length)
    const volumeLevel = Math.max(0, Math.min(100, rms * 100))
    setVolume(volumeLevel)

    // Lower the threshold to make it more sensitive
    if (volumeLevel > 1) {
      const note = detectNote(dataArrayRef.current, audioContextRef.current?.sampleRate || 44100)

      if (note) {
        const now = Date.now()
        // Reduce debounce time to make it more responsive
        if (now - lastNoteTimeRef.current > 200 || note !== lastDetectedNoteRef.current) {
          setDetectedNote(note)
          onNoteDetected(note, false) // We don't know if it's correct yet, the parent will determine
          lastNoteTimeRef.current = now
          lastDetectedNoteRef.current = note
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(analyzeAudio)
  }

  // For demo purposes, let's add a way to simulate note detection
  const simulateNote = (note: string) => {
    setDetectedNote(note)
    onNoteDetected(note, false)
  }

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
      <h3 className="font-medium mb-2">Audio Input</h3>

      {error ? (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : isInitializing ? (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-3"></div>
          <p className="text-sm">{debugInfo || "Initializing audio..."}</p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4 mb-3">
            <div className="flex-1">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all duration-100" style={{ width: `${volume}%` }} />
              </div>
            </div>

            {volume > 1 ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-gray-400" />}

            <div className="text-sm font-medium min-w-[100px]">
              {detectedNote ? (
                <span className="text-primary">{detectedNote}</span>
              ) : (
                <span className="text-muted-foreground">No note detected</span>
              )}
            </div>
          </div>

          {/* Debug info */}
          <div className="text-xs text-gray-500 mb-3">
            {volume > 0 ? (
              <span>Audio level: {volume.toFixed(1)}%</span>
            ) : (
              <span>No audio detected. Please make sure your microphone is working.</span>
            )}
          </div>

          {/* Simulate notes for testing */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-xs text-muted-foreground mb-2">For testing: Click to simulate playing these notes</p>
            <div className="flex flex-wrap gap-2">
              {["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5"].map((note) => (
                <button
                  key={note}
                  onClick={() => simulateNote(note)}
                  className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                >
                  {note}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

