import OptionButton2 from "@/components/Buttons/OptionButton2";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  scalesLists,
  maqamsSoundFolders,
  maqamsScaleLists,
  maqamsExamplesLists,
  examplesSoundFolders,
  Maqam,
} from "@/constants/scales";
import UpgradeModal from "@/components/ui/UpgradeModal";
import { useFocusEffect } from "@react-navigation/native";
import { Audio } from "expo-av";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  StatusBar,
} from "react-native";

const MaqamTrainingScreen = () => {
  // --- المتغيرات الأصلية للمكون ---
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMaqams, setSelectedMaqams] = useState<string[]>(
    Object.keys(scalesLists)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentMaqam, setCurrentMaqam] = useState<string | null>(null);
  const [userSelection, setUserSelection] = useState<string | null>(null);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [currentMaqamSound, setCurrentMaqamSound] = useState<string | null>(
    null
  );
  const [isAnswered, setIsAnswered] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [isExamplePlaying, setIsExamplePlaying] = useState(false);
  const [showExampleControlButton, setShowExampleControlButton] =
    useState(false);
  const [firstAttempt, setFirstAttempt] = useState(true);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);

  const { state, dispatch } = useSettings();

  const lables = state.labels.maqamatTraingingPage;
  const maqamsListFromLacale =
    state.labels.basicTrainingPages.basicTrainingHome;
  const hasReachedLimit =
    !state.isProUser &&
    state.freeQuestionsUsed.maqamatTraining >= state.freeQuestionsLimit;

  const soundRef = useRef<Audio.Sound | null>(null);
  const timersRef = useRef<number[]>([]);

  useFocusEffect(
    useCallback(() => {
      setIsPlaying(false);
      setCurrentMaqam(null);
      setUserSelection(null);
      setIsAnswered(true);
      setShowAnswer(false);
      setQuestionNumber(0);
      setScore({ correct: 0, incorrect: 0 });
      setFirstAttempt(true);
      setShowExampleControlButton(false);

      playMaqam();

      return () => {
        if (soundRef.current) {
          soundRef.current.stopAsync().catch(() => {});
          soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
      };
    }, [selectedMaqams]) // شيلت hasReachedLimit من الـ dependencies
  );
  const handleUpgrade = () => {
    setUpgradeModalVisible(false);
    console.log("Navigate to upgrade screen for Maqamat");
  };
  const addTimer = (timer: number) => {
    timersRef.current.push(timer);
  };

  const playSound = async (folder: any, soundName: string | null) => {
    if (!soundName) return;
    setIsPlaying(true);

    // تنظيف آمن للصوت الحالي
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (error) {
        console.log("Error cleaning up previous sound:", error);
      }
      soundRef.current = null;
    }

    if (!folder) {
      setIsPlaying(false);
      return;
    }

    try {
      const soundModule = folder(`./${soundName}.mp3`);
      if (!soundModule) {
        setIsPlaying(false);
        return;
      }

      const { sound: soundObject } = await Audio.Sound.createAsync(soundModule);
      soundRef.current = soundObject;
      await soundObject.playAsync();

      soundObject.setOnPlaybackStatusUpdate(async (status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          try {
            await soundObject.unloadAsync();
          } catch (error) {
            console.log("Error unloading sound:", error);
          }
          if (soundRef.current === soundObject) {
            soundRef.current = null;
          }
          setIsPlaying(false);
        }
      });
    } catch (error) {
      console.error("Error playing sound:", error);
      setIsPlaying(false);
    }
  };

  const playMaqam = () => {
    if (!selectedMaqams.length) return;

    setIsExamplePlaying(false);
    setShowExampleControlButton(false);
    setUserSelection(null);
    setFirstAttempt(true);
    setQuestionNumber((prev) => prev + 1);
    setShowAnswer(false);
    setIsAnswered(false);

    const randomMaqam =
      selectedMaqams[Math.floor(Math.random() * selectedMaqams.length)];
    setCurrentMaqam(randomMaqam);

    const randomMaqamList = maqamsScaleLists[randomMaqam as Maqam];
    const randomSound =
      randomMaqamList[Math.floor(Math.random() * randomMaqamList.length)];
    setCurrentMaqamSound(randomSound);

    playSound(maqamsSoundFolders[state.instrument], randomSound);
  };

  const playExample = () => {
    if (!state.isProUser) {
      setUpgradeModalVisible(true);
      return;
    }
    if (!currentMaqam) return;

    const currentExamplesList = maqamsExamplesLists[currentMaqam as Maqam];
    const randomExample =
      currentExamplesList[
        Math.floor(Math.random() * currentExamplesList.length)
      ];

    setShowExampleControlButton(true);
    playSound(examplesSoundFolders[state.instrument], randomExample);
  };

  const repeatMaqam = () => {
    if (currentMaqamSound) {
      playSound(maqamsSoundFolders[state.instrument], currentMaqamSound);
    }
  };

  const handleSelection = (maqam: string) => {
    if (isAnswered) return;

    setUserSelection(maqam);

    if (maqam === currentMaqam) {
      if (firstAttempt) {
        setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      }
      setIsAnswered(true);
      setShowAnswer(true);

      if (state.autoQuestionJump) {
        const timer = setTimeout(playMaqam, 2000);
        addTimer(timer);
      }
    } else {
      if (firstAttempt) {
        setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
      setFirstAttempt(false);
    }
  };

  const toggleMaqam = (maqam: string) => {
    setSelectedMaqams((prev) =>
      prev.includes(maqam) ? prev.filter((m) => m !== maqam) : [...prev, maqam]
    );
  };

  const toggleModal = () => setModalVisible(!modalVisible);

  const maqamMap: Record<Maqam, string> = {
    Rast: "راست",
    Bayaty: "بياتي",
    Agam: "عجم",
    Nahawand: "نهاوند",
    Saba: "صبا",
    Sika: "سيكا",
    Hegaz: "حجاز",
    Kurd: "كرد",
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{score.correct}</Text>
            <Text style={styles.statLabel}>
              {state.labels.introGamePage.levelPage.correct}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{score.incorrect}</Text>
            <Text style={styles.statLabel}>
              {state.labels.introGamePage.levelPage.incorrect}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{questionNumber}</Text>
            <Text style={styles.statLabel}>{state.labels.questionNo}</Text>
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.playButton]}
            onPress={playMaqam}
            disabled={isPlaying}
          >
            <Ionicons
              name={isPlaying ? "hourglass-outline" : "play"}
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.controlButtonText}>{lables.playMaqam}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.repeatButton]}
            onPress={repeatMaqam}
            disabled={isPlaying}
          >
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>{lables.repeatButton}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.exampleButtonsView}>
          <TouchableOpacity
            style={[styles.controlButton, styles.nextButton]}
            onPress={playExample}
          >
            <Ionicons name="mic" size={24} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>{lables.example}</Text>
            <View
              style={[
                styles.proBadge,
                { backgroundColor: !state.isProUser ? "#e09f13" : "#FFD700" },
              ]}
            >
              <Ionicons
                name={!state.isProUser ? "lock-closed" : "star"}
                size={12}
                color={!state.isProUser ? "#FFF" : "#000"}
              />
              <Text
                style={[
                  styles.proBadgeText,
                  { color: !state.isProUser ? "#FFF" : "#000", marginLeft: 4 },
                ]}
              >
                PRO
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.maqamatContainer}>
          <View style={styles.maqamatGrid}>
            {Object.keys(scalesLists).map((maqam) => (
              <TouchableOpacity
                key={maqam}
                style={[
                  styles.maqamButton,
                  !selectedMaqams.includes(maqam) && styles.disabledButton,
                  userSelection === maqam &&
                    (maqam === currentMaqam
                      ? styles.maqamButtonCorrect
                      : styles.maqamButtonWrong),
                  showAnswer &&
                    maqam === currentMaqam &&
                    styles.maqamButtonCorrect,
                ]}
                onPress={() => handleSelection(maqam)}
                disabled={isAnswered || !selectedMaqams.includes(maqam)}
              >
                <Text style={styles.maqamName}>
                  {state.language === "en"
                    ? maqam
                    : maqamsListFromLacale[maqam as Maqam]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.settingsBtCont}>
          <TouchableOpacity
            style={[styles.controlButton, styles.settingsButtonBG]}
            onPress={toggleModal}
          >
            <View style={styles.settingsBtnContainer}>
              <Ionicons
                name="settings-outline"
                size={24}
                color="#FFFFFF"
                style={{ marginRight: 5 }}
              />
              <Text style={styles.controlButtonText}>{lables.settings}</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Modal visible={modalVisible} transparent animationType="slide">
          <Pressable onPress={toggleModal} style={styles.modalContainer}>
            <View style={{ flex: 1, justifyContent: "center" }}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{lables.maqamtSettings}</Text>
                <Text style={styles.chooseText}>{lables.chooseMaqam}</Text>
                <View style={styles.maqamSelectionContainer}>
                  {Object.keys(scalesLists).map((maqam) => (
                    <OptionButton2
                      key={maqam}
                      selectedIntervals={selectedMaqams}
                      interval={maqam}
                      toggleInterval={toggleMaqam}
                      label={
                        state.language === "en"
                          ? maqam
                          : maqamMap[maqam as Maqam]
                      }
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={toggleModal}
                >
                  <AntDesign
                    name="close"
                    size={24}
                    color="black"
                    style={styles.closeIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </Modal>
        <UpgradeModal
          visible={upgradeModalVisible}
          onClose={() => setUpgradeModalVisible(false)}
          onUpgrade={handleUpgrade}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    marginTop: 20,
    textAlign: "center",
  },

  settingsButton: {
    backgroundColor: "#80cdc7",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
  },

  buttonText: {
    // color: "#fff",
    fontWeight: "bold",
    marginLeft: 5,
  },
  maqamContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
  },
  maqamButton1: {
    backgroundColor: "#E0E0E0",
    padding: 10,
    borderRadius: 5,
    margin: 5,
  },
  correct: { borderColor: "green", borderWidth: 3 },
  wrong: { borderColor: "red", borderWidth: 3 },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
    flexWrap: "wrap",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  maqamSelectionContainer: {
    flexWrap: "wrap",
    flexDirection: "row",
  },
  maqamSelectButton: {
    padding: 5,
    margin: 3,
    borderRadius: 5,
    backgroundColor: "#ccc",
  },
  selected: {
    backgroundColor: "#34C759",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 15,
    width: 40,
    height: 40,
    backgroundColor: "#45B7D1",
    borderRadius: 20,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
  },
  closeIcon: {
    color: "#fff",
    fontSize: 24,
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fbedd3",
    overflow: "hidden",
  },
  playButtonContiner: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    flexWrap: "wrap",
  },
  settingsBtCont: {
    marginTop: 30,
  },
  chooseText: {
    marginBottom: 15,
    fontSize: 18,

    color: "#5c3829",
    alignSelf: "flex-start",
  },
  settingsBtnContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedInstCont: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 20,

    backgroundColor: "#d7e7d9",
    paddingVertical: 10,

    borderRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    marginTop: 10,
  },
  instIcon: {
    width: 30,
    height: 30,
    resizeMode: "contain",
    marginLeft: 10,
  },
  exampleButtonsView: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  exampleControlButton: {
    padding: 10,
    marginHorizontal: 10, // Add some space from the example button
    justifyContent: "center",
    alignItems: "center",
    // Add background/border if needed
    backgroundColor: "#9cdde2",
    borderRadius: 10,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: 10,
  },
  score: {
    fontSize: 18,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  controlsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    gap: 12,
  },
  controlButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  playButton: {
    backgroundColor: "#4CAF50",
  },
  nextButton: {
    backgroundColor: "#007AFF",
  },
  repeatButton: {
    backgroundColor: "#FF9500",
  },
  settingsButtonBG: {
    backgroundColor: "#45B7D1",
  },
  controlButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
  maqamatContainer: {
    paddingBottom: 20,
    marginTop: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  maqamatGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  maqamButton: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  maqamButtonSelected: {
    borderColor: "#007AFF",
    backgroundColor: "#E3F2FD",
  },
  maqamButtonCorrect: {
    borderColor: "#4CAF50",
    backgroundColor: "#E8F5E8",
  },
  maqamButtonWrong: {
    borderColor: "#F44336",
    backgroundColor: "#FFEBEE",
  },
  maqamName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  maqamNameArabic: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
    opacity: 0.6,
  },
  questionsCounter: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  counterText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  counterSubtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },

  // Upgrade Modal Styles
  upgradeModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  upgradeModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  upgradeMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 22,
  },
  upgradeSubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
  },
  upgradeFeatures: {
    width: "100%",
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  upgradeButtons: {
    width: "100%",
    gap: 12,
  },
  upgradeButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  laterButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  laterButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    marginRight: 8,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  lockOverlay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  lockText: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 4,
  },
});

export default MaqamTrainingScreen;
