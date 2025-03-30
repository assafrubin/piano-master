"use client"

import type { Note } from "@/lib/types"

interface SheetMusicDisplayProps {
  notes: Note[]
  currentIndex: number
  incorrectNote?: string | null
}

export default function SheetMusicDisplay({ notes, currentIndex, incorrectNote }: SheetMusicDisplayProps) {
  // Add a function to find the position of a note on the staff
  const getNotePosition = (noteName: string): number => {
    // Simple mapping from note names to positions
    // C4 is position 0 (middle C)
    const noteMap: Record<string, number> = {
      C3: -7,
      "C#3": -7,
      D3: -6,
      "D#3": -6,
      E3: -5,
      F3: -4,
      "F#3": -4,
      G3: -3,
      "G#3": -3,
      A3: -2,
      "A#3": -2,
      B3: -1,
      C4: 0,
      "C#4": 0,
      D4: 1,
      "D#4": 1,
      E4: 2,
      F4: 3,
      "F#4": 3,
      G4: 4,
      "G#4": 4,
      A4: 5,
      "A#4": 5,
      B4: 6,
      C5: 7,
      "C#5": 7,
      D5: 8,
      "D#5": 8,
      E5: 9,
      F5: 10,
      "F#5": 10,
      G5: 11,
      "G#5": 11,
      A5: 12,
      "A#5": 12,
      B5: 13,
    }

    return noteMap[noteName] || 0
  }

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-max p-4 bg-gray-50 rounded-lg border">
        {/* Staff lines */}
        <div className="relative w-full h-[200px]">
          {/* Draw 5 staff lines */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="absolute w-full h-[1px] bg-gray-800" style={{ top: `${40 + i * 20}px` }} />
          ))}

          {/* Draw notes */}
          <div className="flex">
            {notes.map((note, index) => (
              <div key={index} className="relative mx-4 first:ml-12 last:mr-12" style={{ height: "200px" }}>
                {/* Note stem */}
                <div
                  className={`absolute w-[2px] h-[80px] ${
                    note.played ? "bg-green-500" : index === currentIndex ? "bg-blue-500" : "bg-black"
                  }`}
                  style={{
                    left: "14px",
                    top:
                      getNotePosition(note.note) < 3
                        ? `${100 - getNotePosition(note.note) * 10}px`
                        : `${100 - (getNotePosition(note.note) * 10) - 80}px`,
                  }}
                />

                {/* Note head */}
                <div
                  className={`absolute w-[16px] h-[12px] rounded-full ${
                    note.played ? "bg-green-500" : index === currentIndex ? "bg-blue-500" : "bg-black"
                  }`}
                  style={{
                    left: "8px",
                    top: `${100 - getNotePosition(note.note) * 10}px`,
                  }}
                />

                {/* Note name (for demonstration) */}
                <div
                  className="absolute text-xs font-bold"
                  style={{
                    left: "8px",
                    top: `${100 - (getNotePosition(note.note) * 10) + 20}px`,
                    color: note.played ? "green" : index === currentIndex ? "blue" : "gray",
                  }}
                >
                  {note.note}
                </div>
              </div>
            ))}

            {/* Incorrect note indicator */}
            {incorrectNote && (
              <div
                className="absolute transition-opacity duration-500 ease-in-out"
                style={{
                  left: "50%",
                  transform: "translateX(-50%)",
                  opacity: 1,
                }}
              >
                {/* Note stem */}
                <div
                  className="absolute w-[2px] h-[80px] bg-yellow-500"
                  style={{
                    left: "14px",
                    top:
                      getNotePosition(incorrectNote) < 3
                        ? `${100 - getNotePosition(incorrectNote) * 10}px`
                        : `${100 - (getNotePosition(incorrectNote) * 10) - 80}px`,
                  }}
                />

                {/* Note head */}
                <div
                  className="absolute w-[16px] h-[12px] rounded-full bg-yellow-500"
                  style={{
                    left: "8px",
                    top: `${100 - getNotePosition(incorrectNote) * 10}px`,
                  }}
                />

                {/* Note name */}
                <div
                  className="absolute text-xs font-bold text-yellow-600"
                  style={{
                    left: "8px",
                    top: `${100 - (getNotePosition(incorrectNote) * 10) + 20}px`,
                  }}
                >
                  {incorrectNote}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          {currentIndex < notes.length ? (
            <>
              Play: <span className="font-bold">{notes[currentIndex].note}</span>
            </>
          ) : (
            "Great job! You've completed the piece."
          )}
        </p>
      </div>
    </div>
  )
}

// Helper function to calculate vertical position based on note position
// function getNotePosition(position: number): number {
//   // Position 0 is middle C, each step is a half step up or down
//   // We'll use 100px as the middle position (position 0)
//   return 100 - position * 10
// }

