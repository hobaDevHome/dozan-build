import { router, useNavigation } from "expo-router";

import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  View,
} from "react-native";
import { useSettings } from "@/context/SettingsContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { trainigLevels } from "@/constants/scales";
import { Ionicons } from "@expo/vector-icons";

type RootStackParamList = {
  "play": PlayParams;
  "Training/TrainingScreen": PlayParams;
};
const buttonColors = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#ecd484",
  "#DDA0DD",
  "#FFB347",
];

type PlayParams = {
  id: string;
  scale: string;
  levelChoices: string[];
  label: string;
};
export default function IntroGame() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { state, dispatch } = useSettings();

  const pageLables = state.labels.basicTrainingPages.basicTrainingHome;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>
          {state.labels.introGamePage.chooseYourChallenge}
        </Text>
        <Text style={styles.instructionsText}>
          {state.labels.basicTrainingPages.basicTrainingHome.intro}
        </Text>
      </View>
      {trainigLevels.map((level, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.button,
            { backgroundColor: buttonColors[index % buttonColors.length] },
            {
              justifyContent:
                state.language === "ar" || state.language === "fa"
                  ? "flex-end"
                  : "flex-start",
            },
          ]}
          onPress={() => {
            dispatch({
              type: "SET_TRAINING_PARAMS",
              payload: {
                id: level.id,
                scale: level.scale,
                levelChoices: level.levelChoices,
                label: level.label,
              },
            });
            router.push("/Training/TrainingScreen");
          }}
        >
          {/* // text */}

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
            <Text style={styles.buttonText}>
              {level.id} :{" "}
              {pageLables.hasOwnProperty(level.scale)
                ? pageLables[level.scale as keyof typeof pageLables]
                : level.scale}{" "}
              -
              {level.label == "section1"
                ? pageLables.firstHalf
                : level.label == "section2"
                ? pageLables.secondHalf
                : pageLables.wholescale}
            </Text>
            <TouchableOpacity style={styles.previewButton}>
              <Ionicons name="play-circle-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* diff */}
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
    borderRadius: 16,
    padding: 24,
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
