import { router, useNavigation } from "expo-router";
import { I18nManager } from "react-native";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Button,
  ViewStyle,
} from "react-native";
import { useSettings } from "@/context/SettingsContext";
import { StackNavigationProp } from "@react-navigation/stack";
import { dictaionsLevels, Maqam } from "@/constants/scales";

type LevelParams = {
  id: string;
  scale: string;
};
type RootStackParamList = {
  "/Dictations/Dictaionsplay": LevelParams;
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
export default function DictaionsHome() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const { state, dispatch } = useSettings();

  const trainingLables = state.labels.basicTrainingPages.basicTrainingHome;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>
          {state.labels.introGamePage.chooseYourChallenge}
        </Text>
        <Text style={styles.instructionsText}>
          {state.labels.dictations.intro}
        </Text>
      </View>
      {dictaionsLevels.map((level, index) => (
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
          onPress={() =>
            router.navigate({
              pathname: "/Dictations/Dictaionsplay",
              params: {
                id: level.id,
                scale: level.scale,
              },
            })
          }
        >
          <Text style={styles.buttonText}>
            {level.id} : {trainingLables[level.scale as Maqam]}
          </Text>
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
});
