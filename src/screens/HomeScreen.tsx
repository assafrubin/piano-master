import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native"
import { useNavigation } from "@react-navigation/native"
import { Camera, Music } from "../components/Icons"

export default function HomeScreen() {
  const navigation = useNavigation()

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../../assets/logo.png")}
          style={styles.logo}
          defaultSource={require("../../assets/logo.png")}
        />
        <Text style={styles.title}>Music Note Recognition</Text>
        <Text style={styles.subtitle}>Take a photo of sheet music, practice, and get real-time feedback</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Camera" as never)}>
          <Camera width={24} height={24} color="#fff" />
          <Text style={styles.buttonText}>Capture Sheet Music</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={() => navigation.navigate("Practice" as never, { useDemoMode: true } as never)}
        >
          <Music width={24} height={24} color="#3b82f6" />
          <Text style={styles.secondaryButtonText}>Try Demo Mode</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>How it works:</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoNumber}>1</Text>
          <Text style={styles.infoText}>Take a photo of your sheet music</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoNumber}>2</Text>
          <Text style={styles.infoText}>The app will digitize the notes</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoNumber}>3</Text>
          <Text style={styles.infoText}>Play along and get real-time feedback</Text>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginHorizontal: 20,
  },
  buttonContainer: {
    marginBottom: 40,
  },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: 10,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  secondaryButton: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#3b82f6",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: "#3b82f6",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    padding: 20,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoNumber: {
    backgroundColor: "#3b82f6",
    color: "#fff",
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: "center",
    lineHeight: 24,
    marginRight: 12,
    fontWeight: "bold",
  },
  infoText: {
    fontSize: 16,
    flex: 1,
  },
})

