"use client"

import { useState, useRef, useEffect } from "react"
import { Camera, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CameraCaptureProps {
  onCapture: (imageSrc: string) => void
}

export default function CameraCapture({ onCapture }: CameraCaptureProps) {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      // Clean up camera stream when component unmounts
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    setError(null)
    setDebugInfo(null)
    setIsLoading(true)

    try {
      setDebugInfo("Checking for camera support...")

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera API is not supported in your browser")
      }

      // First try to enumerate devices to check if camera exists
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter((device) => device.kind === "videoinput")

      if (videoDevices.length === 0) {
        throw new Error("No camera detected on your device")
      }

      setDebugInfo(`Found ${videoDevices.length} camera(s). Attempting to access...`)

      // Try to get the camera stream
      let stream
      try {
        // First try environment camera (rear camera on mobile)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
        })
        setDebugInfo("Using environment-facing camera")
      } catch (err) {
        setDebugInfo("Couldn't access environment camera, trying default camera...")
        // If that fails, try with default camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        })
        setDebugInfo("Using default camera")
      }

      if (videoRef.current) {
        videoRef.current.srcObject = stream

        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          setDebugInfo("Video stream loaded, playing...")
          videoRef.current
            ?.play()
            .then(() => {
              setDebugInfo("Camera active and streaming")
              setIsCameraActive(true)
              setIsLoading(false)
            })
            .catch((e) => {
              console.error("Error playing video:", e)
              setError(`Could not play video stream: ${e.message}`)
              setIsLoading(false)
            })
        }

        videoRef.current.onerror = (e) => {
          console.error("Video element error:", e)
          setError("Error with video element")
          setIsLoading(false)
        }
      } else {
        setError("Video element not found")
        setIsLoading(false)
      }
    } catch (err: any) {
      console.error("Error accessing camera:", err)
      setError(`Camera access error: ${err.message || "Unknown error"}`)
      setIsLoading(false)
    }
  }

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())
      videoRef.current.srcObject = null
    }
    setIsCameraActive(false)
  }

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Draw the current video frame to the canvas
      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert canvas to data URL
        const imageSrc = canvas.toDataURL("image/jpeg")
        onCapture(imageSrc)
        stopCamera()
      }
    }
  }

  // For demo purposes, let's add a way to use a sample image
  const useSampleImage = () => {
    // Use a placeholder image for demo purposes
    onCapture("/placeholder.svg?height=400&width=600")
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-2xl mx-auto rounded-lg overflow-hidden bg-gray-100 aspect-video">
        {isCameraActive ? (
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        ) : isLoading ? (
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-sm text-gray-600">{debugInfo || "Initializing camera..."}</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Camera className="h-16 w-16 text-gray-400" />
          </div>
        )}

        {/* Hidden canvas for capturing images */}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {isCameraActive ? (
          <>
            <Button onClick={captureImage} className="flex items-center gap-2">
              Capture
            </Button>
            <Button variant="outline" onClick={stopCamera} className="flex items-center gap-2">
              <X className="h-4 w-4" />
              Cancel
            </Button>
          </>
        ) : (
          <>
            <Button onClick={startCamera} className="flex items-center gap-2" disabled={isLoading}>
              <Camera className="h-4 w-4" />
              {isLoading ? "Opening Camera..." : "Open Camera"}
            </Button>
            <Button variant="outline" onClick={useSampleImage} className="flex items-center gap-2">
              Use Sample Image
            </Button>
          </>
        )}
      </div>

      {debugInfo && !error && !isCameraActive && <div className="mt-2 text-xs text-gray-500">Debug: {debugInfo}</div>}
    </div>
  )
}

