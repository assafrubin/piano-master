// Simple pitch detection using autocorrelation
export function detectNote(buffer: Float32Array, sampleRate: number): string | null {
  // Find the fundamental frequency using autocorrelation
  const frequency = findFundamentalFrequency(buffer, sampleRate)

  if (!frequency) return null

  // Convert frequency to note
  return frequencyToNote(frequency)
}

function findFundamentalFrequency(buffer: Float32Array, sampleRate: number): number | null {
  // Simple autocorrelation-based pitch detection
  const bufferSize = buffer.length

  // Find the average magnitude
  let sum = 0
  for (let i = 0; i < bufferSize; i++) {
    sum += Math.abs(buffer[i])
  }
  const magnitude = sum / bufferSize

  // Lower the threshold to make it more sensitive
  if (magnitude < 0.003) return null

  // Perform autocorrelation
  const correlations = new Float32Array(bufferSize)
  for (let lag = 0; lag < bufferSize; lag++) {
    let correlation = 0
    for (let i = 0; i < bufferSize - lag; i++) {
      correlation += buffer[i] * buffer[i + lag]
    }
    correlations[lag] = correlation
  }

  // Find the highest correlation after the first zero crossing
  let foundZeroCrossing = false
  let maxCorrelation = 0
  let maxLag = 0

  // Start from a reasonable minimum (to avoid detecting very high frequencies)
  const minLag = Math.floor(sampleRate / 2000) // ~2000Hz max

  for (let lag = minLag; lag < bufferSize; lag++) {
    if (!foundZeroCrossing && correlations[lag] <= 0) {
      foundZeroCrossing = true
    }

    if (foundZeroCrossing && correlations[lag] > maxCorrelation) {
      maxCorrelation = correlations[lag]
      maxLag = lag
    }

    // If we've found a good peak, stop looking
    if (foundZeroCrossing && correlations[lag] < 0) {
      break
    }
  }

  // Lower the correlation threshold to make it more sensitive
  if (maxLag > 0 && maxCorrelation > 0.01) {
    return sampleRate / maxLag
  }

  return null
}

function frequencyToNote(frequency: number): string {
  // A4 is 440Hz
  const A4 = 440
  const C0 = A4 * Math.pow(2, -4.75)

  // Calculate the number of half steps from C0
  const halfSteps = Math.round(12 * Math.log2(frequency / C0))

  // Calculate the octave
  const octave = Math.floor(halfSteps / 12)

  // Calculate the note within the octave
  const noteIndex = halfSteps % 12

  // Note names
  const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

  // Return the note name with octave
  return noteNames[noteIndex] + octave
}

