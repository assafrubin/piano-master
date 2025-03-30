export interface Note {
  note: string // e.g., "C4", "D#3", etc.
  position: number // Position on the staff (0 = middle C)
  duration: number // Duration in beats
  played: boolean // Whether the note has been played correctly
}

