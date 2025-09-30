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
import { Ionicons } from "@expo/vector-icons";

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
  const { state, dispatch } = useSettings();

  const trainingLables = state.labels.basicTrainingPages.basicTrainingHome;

  const handleLevelPress = (level: any) => {
    const isLocked = level.isPro && !state.isProUser;

    if (isLocked) {
      // بعدين هنضيف navigation لشاشة الـ Upgrade
      console.log("هتفتح شاشة الـ Upgrade هنا");
      return;
    }

    router.navigate({
      pathname: "/Dictations/Dictaionsplay",
      params: {
        id: level.id,
        scale: level.scale,
      },
    });
  };

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
      {dictaionsLevels.map((level, index) => {
        const isLocked = level.isPro && !state.isProUser;

        return (
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
                opacity: isLocked ? 0.7 : 1,
              },
            ]}
            activeOpacity={isLocked ? 0.8 : 0.8}
            onPress={() => handleLevelPress(level)}
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
            >
              <Text style={styles.buttonText}>
                {level.id} : {trainingLables[level.scale as Maqam]}
              </Text>

              {/* الـ Pro Badge */}
              {level.isPro && (
                <View
                  style={[
                    styles.proBadge,
                    { backgroundColor: isLocked ? "#098a9b" : "#FFD700" },
                  ]}
                >
                  <Ionicons
                    name={isLocked ? "lock-closed" : "star"}
                    size={12}
                    color={isLocked ? "#FFF" : "#000"}
                  />
                  <Text
                    style={[
                      styles.proBadgeText,
                      { color: isLocked ? "#FFF" : "#000", marginLeft: 4 },
                    ]}
                  >
                    PRO
                  </Text>
                </View>
              )}
            </View>

            {/* الـ Lock Overlay إذا كان المستوى مقفول */}
          </TouchableOpacity>
        );
      })}
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
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  lockOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  lockText: {
    fontSize: 14,
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 8,
  },
});
