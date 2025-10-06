import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Platform,
  StatusBar,
  ScrollView,
  Pressable,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { useSettings } from "../context/SettingsContext";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { soundFolders } from "@/constants/scales";
import OptionButton2 from "@/components/Buttons/OptionButton2";
import UpgradeModal from "@/components/ui/UpgradeModal";

const intervalSteps: Record<string, string[]> = {
  Unison: ["re", "re"],
  "Minor Second": ["re", "mi_b"],
  "Major Second": ["re", "mi"],
  "Three Quarters": ["re", "mi_q"],
  "Minor Third": ["re", "fa"],
  Octave: ["re", "ree"],
};
type IntervalType =
  | "Unison"
  | "Minor Second"
  | "Major Second"
  | "Three Quarters"
  | "Minor Third"
  | "Octave";

type StartingNoteType = "do" | "re" | "mi" | "re_b" | "mi_b" | "mi_q";
const intervalStepsObject: Record<
  IntervalType,
  Record<StartingNoteType, string[]>
> = {
  Unison: {
    do: ["do", "do"],
    re: ["re", "re"],
    mi: ["mi", "mi"],
    re_b: ["re_b", "re_b"],
    mi_b: ["mi_b", "mi_b"],
    mi_q: ["mi_q", "mi_q"],
  },
  "Minor Second": {
    do: ["do", "re_b"],
    re: ["re", "mi_b"],
    mi: ["mi", "fa"],
    re_b: ["re_b", "re"],
    mi_b: ["mi_b", "mi"],
    mi_q: ["mi_q", "fa_q"],
  },
  "Major Second": {
    do: ["do", "re"],
    re: ["re", "mi"],
    mi: ["mi", "fa_d"],
    re_b: ["re_b", "mi_b"],
    mi_b: ["mi_b", "fa"],
    mi_q: ["mi_q", "fa_d_q"],
  },
  "Three Quarters": {
    do: ["do", "re_q"],
    re: ["re", "mi_q"],
    mi: ["mi", "fa_d_q"],
    re_b: ["re_b", "mi_b_q"],
    mi_b: ["mi_b", "fa_q"],
    mi_q: ["mi_q", "fa"],
  },
  "Minor Third": {
    do: ["do", "mi_b"],
    re: ["re", "fa"],
    mi: ["mi", "sol"],
    re_b: ["re_b", "mi"],
    mi_b: ["mi_b", "sol_b"],
    mi_q: ["mi_q", "sol_q"],
  },
  Octave: {
    do: ["do", "doo"],
    re: ["re", "ree"],
    mi: ["mi", "mii"],
    re_b: ["re_b", "ree_b"],
    mi_b: ["mi_b", "mii_b"],
    mi_q: ["mi_q", "mii_q"],
  },
};

const IntervalTrainingScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const [currentInterval, setCurrentInterval] = useState<string | null>(null);
  const [currentIntervalSound, setCurrentIntervalSound] = useState<string[]>(
    []
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [userSelection, setUserSelection] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [firstAttempt, setFirstAttempt] = useState(true);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);

  const { state, dispatch } = useSettings();
  const lables = state.labels.intervalsTraingingPage;

  const soundRef = useRef<Audio.Sound | null>(null);
  const timersRef = useRef<number[]>([]);
  const [selectedIntervals, setSelectedIntervals] = useState<string[]>([]);

  useEffect(() => {
    if (state.isProUser) {
      setSelectedIntervals(Object.keys(intervalSteps));
    } else {
      setSelectedIntervals(Object.keys(intervalSteps).slice(0, 3));
      // setSelectedIntervals(Object.keys(intervalSteps));
    }
  }, [state.isProUser]);

  useFocusEffect(
    useCallback(() => {
      setCurrentInterval(null);
      setUserSelection(null);
      setIsAnswered(true);
      setIsPlaying(false);
      setShowAnswer(false);
      setQuestionNumber(0);
      setScore({ correct: 0, incorrect: 0 });

      playInterval();

      return () => {
        const cleanupSound = async () => {
          if (soundRef.current) {
            try {
              await soundRef.current.stopAsync();
              await soundRef.current.unloadAsync();
            } catch (error) {
              console.log("Cleanup error:", error);
            } finally {
              soundRef.current = null;
            }
          }
        };

        cleanupSound();
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
      };
    }, [selectedIntervals])
  );

  const handleUpgrade = () => {
    setUpgradeModalVisible(false);
    console.log("Navigate to upgrade screen");
  };
  const getProIntervals = () => {
    const allIntervals = Object.keys(intervalSteps);
    return allIntervals.slice(3); // Intervals from index 3 to end are Pro
  };

  const playInterval = () => {
    if (!selectedIntervals.length) return;

    setFirstAttempt(true);
    setQuestionNumber((prev) => prev + 1);
    setShowAnswer(false);
    setIsAnswered(false);
    setUserSelection(null);

    const randomInterval =
      selectedIntervals[Math.floor(Math.random() * selectedIntervals.length)];
    setCurrentInterval(randomInterval);

    //old alogorthm - one array for each interval for

    // const notesToPlay = intervalSteps[randomInterval];
    // playSoundSequence(notesToPlay);

    ////////////////////////
    // 2. اختيار نغمة بداية عشوائية من المسافة المختارة
    const intervalData =
      intervalStepsObject[randomInterval as keyof typeof intervalStepsObject];
    const availableStartingNotes = Object.keys(
      intervalData
    ) as StartingNoteType[];
    const randomStartingNote =
      availableStartingNotes[
        Math.floor(Math.random() * availableStartingNotes.length)
      ];

    // 3. حفظ النغمة الحالية للسؤال
    const notesToPlay = intervalData[randomStartingNote];
    setCurrentIntervalSound(notesToPlay);

    console.log("notes to play", notesToPlay);
    // 4. تشغيل النغمات

    playSoundSequence(notesToPlay);
  };

  const playSpecificInterval = (intervalName: string) => {
    // const notesToPlay = intervalSteps[intervalName];
    // playSoundSequence(notesToPlay);

    if (currentIntervalSound.length > 0 && currentInterval) {
      const currentStartingNote = currentIntervalSound[0];
      const intervalData =
        intervalStepsObject[
          currentInterval as keyof typeof intervalStepsObject
        ];
      const notesToPlay = intervalData[currentStartingNote as StartingNoteType];
      playSoundSequence(notesToPlay);
    }
  };

  const repeatInterval = () => {
    // if (currentInterval) {
    //   const notesToPlay = intervalSteps[currentInterval];
    //   playSoundSequence(notesToPlay);
    // }
    if (currentIntervalSound.length > 0) {
      playSoundSequence(currentIntervalSound);
    }
  };

  const handleSelection = (interval: string) => {
    // if (isAnswered) return;

    playSpecificInterval(interval);
    setUserSelection(interval);

    if (interval === currentInterval) {
      if (firstAttempt) {
        setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      }
      setShowAnswer(true);
      setIsAnswered(true);

      if (state.autoQuestionJump) {
        const timer = setTimeout(() => {
          playInterval(); // playInterval هي نفسها هتتحقق من الـ limit
        }, 3500);
        addTimer(timer);
      }
    } else {
      if (firstAttempt) {
        setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
      setFirstAttempt(false);
    }
  };

  const addTimer = (timer: number) => {
    timersRef.current.push(timer);
  };

  const playSoundSequence = async (notes: string[]) => {
    setIsPlaying(true);

    try {
      for (const note of notes) {
        if (soundRef.current) {
          try {
            await soundRef.current.stopAsync();
            await soundRef.current.unloadAsync();
          } catch (error) {
            console.log("Error cleaning up previous sound:", error);
          }
          soundRef.current = null;
        }

        const folder = soundFolders[state.instrument];
        if (!folder) continue;

        try {
          const soundModule = folder(`./${note}.mp3`);
          if (!soundModule) continue;

          const { sound: soundObject } = await Audio.Sound.createAsync(
            soundModule
          );
          soundRef.current = soundObject;
          await soundObject.playAsync();

          await new Promise<void>((resolve) => {
            const timer = setTimeout(() => {
              resolve();
            }, 800);
            addTimer(timer);
          });

          if (soundRef.current) {
            try {
              await soundRef.current.stopAsync();
              await soundRef.current.unloadAsync();
            } catch (error) {
              console.log("Error cleaning up sound after playback:", error);
            }
            soundRef.current = null;
          }
        } catch (error) {
          console.error("Error playing sound:", error);
        }
      }
    } catch (error) {
      console.error("Error in sound sequence:", error);
    } finally {
      setIsPlaying(false);
    }
  };

  const toggleInterval = (interval: string) => {
    const proIntervals = getProIntervals();
    if (proIntervals.includes(interval) && !state.isProUser) {
      setUpgradeModalVisible(true);
      return;
    }
    setSelectedIntervals((prev) =>
      prev.includes(interval)
        ? prev.filter((i) => i !== interval)
        : [...prev, interval]
    );
  };

  const toggleModal = () => setModalVisible(!modalVisible);
  const intervalsListFromLacale =
    state.labels.intervalsTraingingPage.intervalsNamesMap;

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
            onPress={playInterval}
            disabled={isPlaying}
          >
            <Ionicons
              name={isPlaying ? "hourglass-outline" : "play"}
              size={24}
              color="#FFFFFF"
            />
            <Text style={styles.controlButtonText}>{lables.playInterval}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.repeatButton]}
            onPress={repeatInterval}
            disabled={isPlaying}
          >
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>{lables.repeatButton}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.maqamatContainer}>
          <View style={styles.maqamatGrid}>
            {selectedIntervals.map((interval) => (
              <TouchableOpacity
                key={interval}
                style={[
                  styles.maqamButton,
                  !selectedIntervals.includes(interval) &&
                    styles.disabledButton,
                  userSelection === interval &&
                    (interval === currentInterval
                      ? styles.maqamButtonCorrect
                      : styles.maqamButtonWrong),
                  showAnswer &&
                    interval === currentInterval &&
                    styles.maqamButtonCorrect,
                ]}
                onPress={() => handleSelection(interval)}
                // disabled={isAnswered || !selectedIntervals.includes(interval)}
              >
                <Text style={styles.maqamName}>
                  {state.language === "en"
                    ? interval
                    : intervalsListFromLacale[
                        interval as keyof typeof intervalsListFromLacale
                      ]}
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
                <Text style={styles.modalTitle}>
                  {lables.intervalsSettings}
                </Text>
                <Text style={styles.chooseText}>{lables.chooseIntervals}:</Text>
                <View style={styles.intervalSelectionContainer}>
                  {Object.keys(intervalSteps).map((interval) => {
                    const proIntervals = getProIntervals();
                    const isProInterval = proIntervals.includes(interval);
                    const isLocked = isProInterval && !state.isProUser;
                    return (
                      <OptionButton2
                        label={
                          intervalsListFromLacale[
                            interval as keyof typeof intervalsListFromLacale
                          ]
                        }
                        key={interval}
                        isLocked={isLocked}
                        selectedIntervals={selectedIntervals}
                        interval={interval}
                        toggleInterval={() => {
                          if (isLocked) {
                            setUpgradeModalVisible(true);
                          } else {
                            toggleInterval(interval);
                          }
                        }}
                      />
                    );
                  })}
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

  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#5c3829",
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
  noteButton: {
    backgroundColor: "#336660",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    color: "#fff",
  },
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  chooseText: {
    fontSize: 16,
    marginBottom: 10,
    color: "#5c3829",
  },
  intervalSelectionContainer: {
    width: "100%",
    flexDirection: "row", // الأزرار بجانب بعضها
    flexWrap: "wrap", // عندما لا توجد مساحة، انتقل لسطر جديد
    justifyContent: "space-between", // توزيع المسافة بالتساوي بين الزرين
  },
  buttonText: {
    fontSize: 18,
    color: "#5c3829",
    marginLeft: 5,
  },
  settingsBtCont: {
    marginTop: 20,
  },
  playButtonContiner: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 40,
    marginTop: 20,
    color: "#5c3829",
  },

  intervalContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 20,
  },
  intervalButton: {
    backgroundColor: "#fbe0cb",
    padding: 15,
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
    // flexWrap: "wrap",
  },
  scaleContainer: { flexDirection: "row", marginBottom: 10 },
  scaleButton: {
    backgroundColor: "#ddd",
    padding: 10,
    borderRadius: 5,
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

export default IntervalTrainingScreen;
