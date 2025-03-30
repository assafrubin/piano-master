import { StyleSheet, Text, TouchableOpacity } from "react-native"

interface NoteButtonProps {
  note: string
  onPress: () => void
  isActive?: boolean
}

export default function NoteButton({ note, onPress, isActive = false }: NoteButtonProps) {
  return (
    <TouchableOpacity style={[styles.button, isActive && styles.activeButton]} onPress={onPress}>
      <Text style={[styles.text, isActive && styles.activeText]}>{note}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    margin: 4,
  },
  activeButton: {
    backgroundColor: "#3b82f6",
    borderColor: "#2563eb",
  },
  text: {
    fontSize: 16,
    fontWeight: "600",
    color: "#334155",
  },
  activeText: {
    color: "#fff",
  },
})

