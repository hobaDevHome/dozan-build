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
import { useSettings } from "../context/SettingsContext";
import { StackNavigationProp } from "@react-navigation/stack";

const cadence = ["Do", "Re", "Mi", "Doo"];

const levels = [
  { title: "1. Do, Re", levelChoices: ["Do", "Re"], cadence: cadence },
  {
    title: "2. Do, Re, Mi",
    levelChoices: ["Do", "Re", "Mi"],
    cadence: cadence,
  },
  {
    title: "3. Do, Re, Mi, Fa",
    levelChoices: ["Do", "Re", "Mi", "Fa"],
    cadence: cadence,
  },
  { title: "4. Si, Do", levelChoices: ["Si", "Doo"], cadence: cadence },
  {
    title: "5. La, Si, Do",
    levelChoices: ["La", "Si", "Doo"],
    cadence: cadence,
  },
  {
    title: "6. Sol, La, Si, Do",
    levelChoices: ["Sol", "La", "Si", "Doo"],
    cadence: cadence,
  },
  {
    title: "7. The Whole Octave",
    levelChoices: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Doo"],
    cadence: cadence,
  },
];

type LevelParams = {
  title: string;
  levelChoices: string[];
  cadence: string[];
};
type RootStackParamList = {
  BasicTrainingLevelScreen: LevelParams; // Level1 screen accepts LevelParams
};
export default function IntroGame() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const getButtonStyle = (index: number): ViewStyle => {
    const buttonStyles: Record<number, keyof typeof styles> = {
      0: "button1",
      1: "button2",
      2: "button3",
      3: "button4",
      4: "button5",
      5: "button6",
    };

    return styles[buttonStyles[index] || "button1"] as ViewStyle; // Ensure proper type
  };
  const { state, dispatch } = useSettings();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {levels.slice(1).map((level, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.button,
            getButtonStyle(index),
            {
              justifyContent:
                state.language === "ar" ? "flex-end" : "flex-start",
            },
          ]}
          onPress={() =>
            navigation.navigate("BasicTrainingLevelScreen", {
              levelChoices: level.levelChoices,
              cadence: level.cadence,
            } as LevelParams)
          }
        >
          <Text style={styles.buttonText}>training</Text>
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
    backgroundColor: "#fbeccb",
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
});
