import { StyleSheet, View, Text } from "react-native"
import type { Note } from "../types"

interface SheetMusicDisplayProps {
  notes: Note[]
  currentIndex: number
  incorrectNote?: string | null
}

export default function SheetMusicDisplay({ notes, currentIndex, incorrectNote }: SheetMusicDisplayProps) {
  // Function to get the position of a note on the staff
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
      'B5": 13,  8, "D#5': 8,
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
    <View style={styles.container}>
      <View style={styles.staffContainer}>
        {/* Draw 5 staff lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={`line-${i}`} style={[styles.staffLine, { top: 40 + i * 20 }]} />
        ))}

        {/* Draw notes */}
        <View style={styles.notesContainer}>
          {notes.map((note, index) => (
            <View key={`note-${index}`} style={[styles.noteContainer, { width: 30, marginHorizontal: 10 }]}>
              {/* Note stem */}
              <View
                style={[
                  styles.noteStem,
                  {
                    backgroundColor: note.played ? "#10b981" : index === currentIndex ? "#3b82f6" : "#000",
                    top:
                      getNotePosition(note.note) < 3
                        ? 100 - getNotePosition(note.note) * 10
                        : 100 - getNotePosition(note.note) * 10 - 80,
                    height: 80,
                  },
                ]}
              />

              {/* Note head */}
              <View
                style={[
                  styles.noteHead,
                  {
                    backgroundColor: note.played ? "#10b981" : index === currentIndex ? "#3b82f6" : "#000",
                    top: 100 - getNotePosition(note.note) * 10,
                  },
                ]}
              />

              {/* Note name (for demonstration) */}
              <Text
                style={[
                  styles.noteName,
                  {
                    color: note.played ? "#10b981" : index === currentIndex ? "#3b82f6" : "#666",
                    top: 100 - getNotePosition(note.note) * 10 + 20,
                  },
                ]}
              >
                {note.note}
              </Text>
            </View>
          ))}

          {/* Incorrect note indicator */}
          {incorrectNote && (
            <View style={[styles.incorrectNoteContainer, { left: "50%" }]}>
              {/* Note stem */}
              <View
                style={[
                  styles.noteStem,
                  {
                    backgroundColor: "#f59e0b",
                    top:
                      getNotePosition(incorrectNote) < 3
                        ? 100 - getNotePosition(incorrectNote) * 10
                        : 100 - getNotePosition(incorrectNote) * 10 - 80,
                    height: 80,
                  },
                ]}
              />

              {/* Note head */}
              <View
                style={[
                  styles.noteHead,
                  {
                    backgroundColor: "#f59e0b",
                    top: 100 - getNotePosition(incorrectNote) * 10,
                  },
                ]}
              />

              {/* Note name */}
              <Text
                style={[
                  styles.noteName,
                  {
                    color: "#d97706",
                    top: 100 - getNotePosition(incorrectNote) * 10 + 20,
                  },
                ]}
              >
                {incorrectNote}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  staffContainer: {
    height: 200,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    position: "relative",
    padding: 10,
  },
  staffLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "#334155",
  },
  notesContainer: {
    flexDirection: "row",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  noteContainer: {
    height: "100%",
    position: "relative",
  },
  noteStem: {
    position: "absolute",
    width: 2,
    left: 14,
  },
  noteHead: {
    position: "absolute",
    width: 16,
    height: 12,
    borderRadius: 6,
    left: 8,
  },
  noteName: {
    position: "absolute",
    fontSize: 10,
    fontWeight: "bold",
    left: 8,
  },
  incorrectNoteContainer: {
    position: "absolute",
    height: "100%",
    width: 30,
    transform: [{ translateX: -15 }],
  },
})

