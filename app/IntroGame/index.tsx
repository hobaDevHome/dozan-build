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
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "@react-navigation/native";
import UpgradeModal from "@/components/ui/UpgradeModal";

const cadence = ["Do", "Re", "Mi", "Doo"];

const levels = [
  { title: "Overview", levelChoices: [], maqamSection: 0, isPro: false },
  {
    title: "1. Do, Re",
    levelChoices: [0, 1],
    maqamSection: 0,
    notes: ["Do", "Re"],
    color: "#FFB347",
    isPro: false, // مجاني
  },
  {
    title: "2. Do, Re, Mi",
    levelChoices: [0, 2],
    maqamSection: 0,
    notes: ["Do", "Re", "Mi"],
    color: "#4ECDC4",
    isPro: false, // مجاني
  },
  {
    title: "3. Do, Re, Mi, Fa",
    levelChoices: [0, 3],
    maqamSection: 0,
    notes: ["Do", "Re", "Mi", "Fa"],
    color: "#45B7D1",
    isPro: true,
  },
  {
    title: "4. Si, Do",
    levelChoices: [6, 7],
    cadence: cadence,
    maqamSection: 1,
    notes: ["Si", "Re"],
    color: "#96CEB4",
    isPro: true,
  },
  {
    title: "5. La, Si, Do",
    levelChoices: [5, 7],
    maqamSection: 1,
    notes: ["La", "Si", "Do"],
    color: "#FF6B6B",
    isPro: true,
  },
  {
    title: "6. Sol, La, Si, Do",
    levelChoices: [4, 7],
    maqamSection: 1,
    notes: ["Sol", "La", "Si", "Do"],
    color: "#DDA0DD",
    isPro: true,
  },
  {
    title: "7. The Whole Octave",
    levelChoices: [0, 7],
    maqamSection: 2,
    notes: ["Do", "Re", "Mi", "Fa", "Sol", "La", "Si", "Do"],
    color: "#ecd484",
    isPro: true,
  },
];

type LevelParams = {
  title: string;
  levelChoices: number[];
  cadence: string[];
};

export default function IntroGame() {
  const [scores, setScores] = useState<{ [key: string]: number }>({});
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const { state, dispatch } = useSettings();

  useFocusEffect(
    useCallback(() => {
      const fetchScores = async () => {
        const newScores: { [key: string]: number } = {};
        for (const level of levels.slice(1)) {
          const key = `score_level_${level.levelChoices.join("_")}`;
          const scoreStr = await AsyncStorage.getItem(key);
          if (scoreStr !== null) {
            newScores[key] = parseFloat(scoreStr);
          }
        }
        setScores(newScores);
      };

      fetchScores();
    }, [])
  );

  const handleUpgrade = () => {
    setUpgradeModalVisible(false);
    console.log("Navigate to upgrade screen from IntroGame");
  };

  const getBackgroundColor = (score: number | undefined): string => {
    if (!score) return "#be2e25"; // لون افتراضي لو السكور غير موجود
    if (score <= 50) return "#be2e25"; // لون للجودة المنخفضة (أحمر)
    if (score <= 75) return "#f89901"; // لون متوسط (أصفر)
    return "#2eb163"; // لون جيد (أخضر)
  };
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

      {levels.slice(1).map((test, index) => {
        const scoreKey = `score_level_${test.levelChoices.join("_")}`;
        const scorePercent = scores[scoreKey];
        const isProLevel = test.isPro;
        const isLocked = isProLevel && !state.isProUser;

        return (
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
            activeOpacity={isLocked ? 0.6 : 0.8}
            onPress={() => {
              if (isLocked) {
                // بعدين هنضيف navigation لشاشة الـ Upgrade
                setUpgradeModalVisible(true);
                console.log("هتفتح شاشة الـ Upgrade هنا");
                return;
              }
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
              {isProLevel && (
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
                    {scorePercent.toFixed(0)} %
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
    justifyContent: "space-between",
  },
  difficultyLabel: {
    fontSize: 12,
    color: "#FFFFFF",
    opacity: 0.8,
    marginRight: 4,
    marginLeft: 4,
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
  percentageBox: {
    backgroundColor: "orange",
    borderRadius: 8,
    padding: 6,
    marginLeft: 8,
    marginRight: 8,
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
});
