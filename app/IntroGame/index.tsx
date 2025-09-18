import { router, useNavigation } from "expo-router";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ViewStyle,
} from "react-native";
import { useSettings } from "../../context/SettingsContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

const cadence = ["Do", "Re", "Mi", "Doo"];

const levels = [
  { title: "Overview", levelChoices: [], maqamSection: 0 },
  {
    title: "1. Do, Re",
    levelChoices: [0, 1],
    maqamSection: 0,
    notes: ["Do", "Re"],
    color: "#FF6B6B",
  },
  {
    title: "2. Do, Re, Mi",
    levelChoices: [0, 2],
    maqamSection: 0,
    notes: ["Do", "Re", "Mi"],
    color: "#4ECDC4",
  },
  {
    title: "3. Do, Re, Mi, Fa",
    levelChoices: [0, 3],
    maqamSection: 0,
    notes: ["Do", "Re", "Mi", "Fa"],
    color: "#45B7D1",
  },
  {
    title: "4. Si, Do",
    levelChoices: [6, 7],
    cadence: cadence,
    maqamSection: 1,
    notes: ["Si", "Re"],
    color: "#96CEB4",
  },
  {
    title: "5. La, Si, Do",
    levelChoices: [5, 7],
    maqamSection: 1,
    notes: ["La", "Si", "Do"],
    color: "#ecd484",
  },
  {
    title: "6. Sol, La, Si, Do",
    levelChoices: [4, 7],
    maqamSection: 1,
    notes: ["Sol", "La", "Si", "Do"],
    color: "#DDA0DD",
  },
  {
    title: "7. The Whole Octave",
    levelChoices: [0, 7],
    maqamSection: 2,
    notes: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do"],
    color: "#FFB347",
  },
];

type LevelParams = {
  title: string;
  levelChoices: number[];
  cadence: string[];
};
type RootStackParamList = {
  "/IntroGame/Overview": undefined; // No parameters for the overview screen
  "/IntroGame/Level1": LevelParams; // Level1 screen accepts LevelParams
};
export default function IntroGame() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { state, dispatch } = useSettings();

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>
          {state.labels.introGamePage.chooseYourChallenge}
        </Text>
        <Text style={styles.instructionsText}>
          {state.labels.introGamePage.intro}
        </Text>
      </View>
      {/* // overview button */}
      <TouchableOpacity
        style={[
          styles.testCard,
          {
            backgroundColor: "#DDA0DD",
            justifyContent:
              state.language === "ar" || state.language === "fa"
                ? "flex-end"
                : "flex-start",
          },
        ]}
        activeOpacity={0.8}
        onPress={() => router.navigate("/IntroGame/Overview")}
      >
        <Text style={styles.buttonText}>
          {state.labels.introGamePage.pages.overview}
        </Text>
      </TouchableOpacity>

      {/* level buttons */}

      {levels.slice(1).map((test, index) => (
        <TouchableOpacity
          key={test.title}
          style={[
            styles.testCard,
            {
              backgroundColor: test.color,
              justifyContent:
                state.language === "ar" || state.language === "fa"
                  ? "flex-end"
                  : "flex-start",
            },
          ]}
          activeOpacity={0.8}
          onPress={() => {
            dispatch({
              type: "SET_GAME_PARAMS",
              payload: {
                levelChoices: test.levelChoices,
                maqamSection: test.maqamSection,
              },
            });
            router.push("/IntroGame/Level1");
          }}
        >
          <View
            style={[
              styles.testHeader,
              {
                flexDirection:
                  state.language === "ar" || state.language === "fa"
                    ? "row-reverse"
                    : "row",
              },
            ]}
            key={index}
          >
            <Text style={styles.testName}>
              {
                state.labels.introGamePage.pages[
                  `level${
                    index + 1
                  }` as keyof typeof state.labels.introGamePage.pages
                ]
              }
            </Text>
            <TouchableOpacity style={styles.previewButton}>
              <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.notesContainer,
              {
                justifyContent:
                  state.language === "ar" || state.language === "fa"
                    ? "flex-end"
                    : "flex-start",
              },
            ]}
          >
            {test.notes?.slice(0, 6).map((note, noteIndex) => (
              <View key={noteIndex} style={styles.noteChip}>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
            {test.notes && test.notes.length > 6 && (
              <View style={styles.noteChip}>
                <Text style={styles.noteText}>+{test.notes.length - 6}</Text>
              </View>
            )}
          </View>

          <View
            style={[
              styles.difficultyContainer,
              {
                flexDirection:
                  state.language === "ar" || state.language === "fa"
                    ? "row-reverse"
                    : "row",
              },
            ]}
          >
            <Text style={styles.difficultyLabel}>
              {state.labels.difficulty}:
            </Text>
            <View
              style={[
                styles.difficultyStars,
                {
                  flexDirection:
                    state.language === "ar" || state.language === "fa"
                      ? "row-reverse"
                      : "row",
                },
              ]}
            >
              {[...Array(5)].map((_, starIndex) => (
                <Ionicons
                  key={starIndex}
                  name={
                    starIndex < Math.ceil(index / 2) + 1
                      ? "star"
                      : "star-outline"
                  }
                  size={12}
                  color="#FFFFFF"
                />
              ))}
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#FAFAFA",
  },

  button: {
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    flexDirection: "row",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
  },
  instructionsContainer: {
    paddingTop: 5,
    paddingBottom: 22,
    alignItems: "center",
  },
  instructionsTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  instructionsText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  button1: {
    backgroundColor: "#b9414c",
  },
  button2: {
    backgroundColor: "#dda276",
  },
  button3: {
    backgroundColor: "#3aa1ac",
  },
  button4: {
    backgroundColor: "#e89e97",
  },
  button5: {
    backgroundColor: "#839278",
  },
  button6: {
    backgroundColor: "#d3803f",
  },
  button7: {
    backgroundColor: "#b9414c",
  },
  testCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
  },
  testCardSelected: {
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  testHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  testName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    flex: 1,
  },
  previewButton: {
    padding: 4,
  },
  notesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  noteChip: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  noteText: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  difficultyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  difficultyLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  difficultyStars: {
    flexDirection: "row",
    gap: 2,
  },
  selectedIndicator: {
    position: "absolute",
    top: 16,
    right: 16,
  },
});
