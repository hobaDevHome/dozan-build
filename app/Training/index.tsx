import { router, useNavigation } from "expo-router";

import {
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  View,
} from "react-native";
import { useSettings } from "@/context/SettingsContext";
import { trainigLevels } from "@/constants/scales";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useState } from "react";
import UpgradeModal from "@/components/ui/UpgradeModal";
import GoldenCrown from "@/components/ui/GoldenCrown";

const buttonColors = [
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#ecd484",
  "#DDA0DD",
  "#FFB347",
  "#FF6B6B",
];

export default function TrainingMneu() {
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const { state, dispatch } = useSettings();

  const pageLables = state.labels.basicTrainingPages.basicTrainingHome;

  useFocusEffect(
    useCallback(() => {
      const fetchScores = async () => {
        const newScores: { [key: string]: number } = {};
        for (const level of trainigLevels) {
          const key = `training_score_level_${level.scale.toLowerCase()}_${level.levelChoices.join(
            "_"
          )}`;
          const scoreStr = await AsyncStorage.getItem(key);
          if (scoreStr !== null) {
            newScores[key] = parseFloat(scoreStr);
            console.log(
              `[trining] Loaded Score for ${key}:`,
              parseFloat(scoreStr)
            );
          }
        }
        setScores(newScores);
      };

      fetchScores();
    }, [])
  );
  const getBackgroundColor = (score: number | undefined): string => {
    if (!score) return "#be2e25";
    if (score <= 50) return "#be2e25";
    if (score <= 75) return "#f89901";
    return "#2eb163";
  };
  const handleLevelPress = (level: any) => {
    const isLocked = level.isPro && !state.isProUser;

    if (isLocked) {
      // بعدين هنضيف navigation لشاشة الـ Upgrade
      setUpgradeModalVisible(true);
      console.log("هتفتح شاشة الـ Upgrade هنا");
      return;
    }

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
  };
  const handleUpgrade = () => {
    setUpgradeModalVisible(false);
    console.log("Navigate to upgrade screen from IntroGame");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>
          {state.labels.introGamePage.chooseYourChallenge}
        </Text>
        <Text style={styles.instructionsText}>
          {state.labels.basicTrainingPages.basicTrainingHome.intro}
        </Text>
      </View>
      {trainigLevels.map((level, index) => {
        const storageKey = `training_score_level_${level.scale.toLowerCase()}_${level.levelChoices.join(
          "_"
        )}`;
        const scorePercent = scores[storageKey];
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
              },
            ]}
            activeOpacity={0.8}
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
                {level.id}:{" "}
                {pageLables.hasOwnProperty(level.scale)
                  ? pageLables[level.scale as keyof typeof pageLables]
                  : level.scale}{" "}
                -{" "}
                {level.label == "section1"
                  ? pageLables.firstHalf
                  : level.label == "section2"
                  ? pageLables.secondHalf
                  : pageLables.wholescale}
              </Text>

              {level.isPro && <GoldenCrown size={18} isLocked={isLocked} />}
            </View>

            {/* الـ Difficulty Container */}
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
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                }}
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
              {scorePercent !== undefined && scorePercent !== 0 && (
                <View
                  style={[
                    styles.percentageBox,
                    { backgroundColor: getBackgroundColor(scorePercent) },
                  ]}
                >
                  <Text style={{ color: "#fff", fontSize: 12 }}>
                    {scorePercent !== undefined ? scorePercent.toFixed(0) : "0"}{" "}
                    %
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
      <UpgradeModal
        visible={upgradeModalVisible}
        onClose={() => setUpgradeModalVisible(false)}
        onUpgrade={handleUpgrade}
      />
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
  percentageBox: {
    backgroundColor: "orange",
    borderRadius: 8,
    padding: 6,
  },
  button: {
    borderRadius: 16,
    padding: 18,
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

  difficultyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    justifyContent: "space-between",
  },
  difficultyLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
  },
  difficultyStars: {
    marginLeft: 4,
    marginRight: 4,
    flexDirection: "row",
    gap: 2,
  },
});
