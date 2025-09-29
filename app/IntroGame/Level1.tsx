import React, { useState, useEffect, useRef, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import { useNavigation } from "expo-router";
import {
  soundFolders,
  scalesLists,
  tonesLables,
  keysMap,
  maqamsSoundFolders,
  Maqam,
} from "../../constants/scales";
import { useFocusEffect } from "@react-navigation/native";
import { useSettings } from "../../context/SettingsContext";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
type Level1RouteParams = {
  levelChoices: string;
  maqamSection?: string;
};

type ToneLabelKey = keyof typeof tonesLables;

const Level1 = () => {
  const { state } = useSettings();
  const { levelChoices, maqamSection } = state.gameParams || {};

  const [currentTone, setCurrentTone] = useState<string>("");
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [canGuess, setCanGuess] = useState<boolean>(false);
  const [currentSoundObject, setCurrentSoundObject] =
    useState<Audio.Sound | null>(null);
  const [playCords, setPlayCords] = useState<boolean>(true);
  const [buttonColors, setButtonColors] = useState<{
    [key: string]: "green" | "red" | null;
  }>({});
  const [firstAttempt, setFirstAttempt] = useState(true);
  const [questionNumber, setQuestionNumber] = useState(1);

  const soundRef = useRef<Audio.Sound | null>(null);
  const maqamSoundRef = useRef<Audio.Sound | null>(null);
  const currentLevelChoicesRef = useRef<string[]>([]);

  const levelLabels = state.labels.introGamePage.levelPage;
  const selectedScaleName = "Agam";
  const currentCadence = scalesLists[selectedScaleName as Maqam];

  let keyLables = currentCadence.map((key: string) => {
    let keyName1 = key.charAt(0).toUpperCase() + key.slice(1);
    let keyName2 = keyName1.split("_")[0];
    if (keyName2.length > 2 && keyName2 !== "Sol") {
      keyName2 = keyName2.slice(0, 2);
    }
    return keyName2;
  });

  let currentKeyMap = tonesLables[state.toneLabel as ToneLabelKey];
  let currentLevelChoices = currentCadence.slice(
    levelChoices[0],
    levelChoices[1] + 1
  );

  const scoreRef = useRef(score);
  const questionNumberRef = useRef(questionNumber);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);
  useEffect(() => {
    questionNumberRef.current = questionNumber;
  }, [questionNumber]);

  useEffect(() => {
    currentLevelChoicesRef.current = currentLevelChoices;
  }, [currentLevelChoices]);

  // ======================= الحل النهائي والصحيح =======================
  useFocusEffect(
    useCallback(() => {
      // إعادة تعيين الحالة عند دخول الصفحة
      setScore({ correct: 0, incorrect: 0 });
      setQuestionNumber(1);
      setFirstAttempt(true);
      setButtonColors({});
      setCanGuess(false);

      const gameStartTimer = setTimeout(() => {
        playRandomTone();
      }, 100);

      // التنظيف وحفظ السكور عند الخروج من الصفحة
      return () => {
        clearTimeout(gameStartTimer);

        const currentScore = scoreRef.current;
        const currentQuestionNumber = questionNumberRef.current;

        const totalAnswers = currentScore.correct + currentScore.incorrect;
        const percentage =
          totalAnswers > 0 ? (currentScore.correct / totalAnswers) * 100 : 0;

        console.log("Saving score on exit:", {
          correct: currentScore.correct,
          questionNumber: currentQuestionNumber,
          percentage,
          key: `score_level_${levelChoices?.join("_")}`,
        });
        //
        AsyncStorage.setItem(
          `score_level_${levelChoices?.join("_")}`,
          percentage.toString()
        ).catch(console.error);

        // وقف وتنظيف الأصوات بأمان
        if (soundRef.current) {
          soundRef.current.stopAsync().catch(() => {});
          soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
        if (maqamSoundRef.current) {
          maqamSoundRef.current.stopAsync().catch(() => {});
          maqamSoundRef.current.unloadAsync().catch(() => {});
          maqamSoundRef.current = null;
        }
      };
    }, [levelChoices])
  );
  // ======================= نهاية الحل =======================

  const playTone = async (
    note: string,
    duration: number = 1000
  ): Promise<void> => {
    // ... الكود هنا يبقى كما هو
    return new Promise(async (resolve, reject) => {
      try {
        // لا داعي لإيقاف الصوت هنا، سيتم التعامل معه في بداية التشغيل التالي
        const soundName = note.toLowerCase();
        const folder = soundFolders[state.instrument];
        if (!folder) return resolve();

        const soundModule = folder(`./${soundName}.mp3`);
        if (!soundModule) return resolve();

        const { sound: soundObject } = await Audio.Sound.createAsync(
          soundModule
        );
        soundRef.current = soundObject; // تخزين الكائن في الـ ref
        await soundObject.playAsync();

        if (soundName !== "cords" || duration < 1000) {
          setTimeout(async () => {
            try {
              await soundObject.stopAsync();
              await soundObject.unloadAsync();
            } catch (error) {}
            resolve();
          }, duration);
        } else {
          soundObject.setOnPlaybackStatusUpdate(async (status) => {
            if (status.isLoaded && status.didJustFinish) {
              await soundObject.unloadAsync();
              resolve();
            }
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  };

  const playRandomTone = async () => {
    // ... الكود هنا يبقى كما هو
    setCanGuess(true);
    setFirstAttempt(true);
    if (isPlaying) return;

    setIsPlaying(true);
    if (playCords) {
      await playTone("cords");
      await new Promise((r) => setTimeout(r, 200));
    }

    const choices = currentLevelChoicesRef.current;
    const randomTone = choices[Math.floor(Math.random() * choices.length)];
    setCurrentTone(randomTone);

    const soundName = randomTone.toLocaleLowerCase();
    const folder = soundFolders[state.instrument];
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
      soundObject.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await soundObject.unloadAsync();
        }
      });
    } catch (error) {}
    setIsPlaying(false);
  };

  const playMaqam = async () => {
    if (maqamSoundRef.current) {
      await maqamSoundRef.current.stopAsync().catch(() => {});
      await maqamSoundRef.current.unloadAsync().catch(() => {});
    }

    let currentMaqamSound = "AgamFirst";
    if (maqamSection === 1) currentMaqamSound = "AgamSecond";
    else if (maqamSection === 2) currentMaqamSound = "AgamFull";

    const folder = maqamsSoundFolders[state.instrument];
    if (!folder) return;

    try {
      const soundModule = folder(`./${currentMaqamSound}.mp3`);
      if (!soundModule) return;

      const { sound: soundObject } = await Audio.Sound.createAsync(soundModule);
      maqamSoundRef.current = soundObject; // استخدام الـ ref الخاص بالمقام
      await soundObject.playAsync();
      soundObject.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await soundObject.unloadAsync();
          maqamSoundRef.current = null;
        }
      });
    } catch (error) {}
  };

  const handleGuess = async (guess: string) => {
    // ... الكود هنا يبقى كما هو
    if (!canGuess) return;
    const choices = currentLevelChoicesRef.current;
    if (guess === currentTone) {
      setCanGuess(false);
      if (firstAttempt) {
        setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      }
      setButtonColors({ [guess]: "green" });
      setTimeout(() => setButtonColors({}), 500);
      // ... (باقي منطق اللعب)
      await playTone(guess); // مثال
      setTimeout(() => {
        setQuestionNumber((prev) => prev + 1);
        playRandomTone();
      }, 100);
    } else {
      playTone(guess);
      if (firstAttempt) {
        setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
      setFirstAttempt(false);
      setButtonColors({ [guess]: "red" });
      setTimeout(() => setButtonColors({}), 500);
    }
  };

  // ... (باقي الدوال مثل playPreviousNotes و playNextNotes تبقى كما هي)
  const playPreviousNotes = async (fromIndex: number) => {
    const choices = currentLevelChoicesRef.current;
    for (let i = fromIndex; i >= 0; i--) {
      const tone = choices[i];
      setButtonColors({ [tone]: "green" });
      const duration = i === 0 ? 1200 : i === fromIndex ? 700 : 400;
      await playTone(tone, duration);
    }
    setButtonColors({});
  };

  const playNextNotes = async (fromIndex: number) => {
    const choices = currentLevelChoicesRef.current;
    for (let i = fromIndex; i < choices.length; i++) {
      const tone = choices[i];
      setButtonColors({ [tone]: "green" });
      const duration =
        i === choices.length - 1 ? 1200 : i === fromIndex ? 700 : 400;
      await playTone(tone, duration);
    }
    setButtonColors({});
  };

  // واجهة المستخدم (JSX) تبقى كما هي بدون تغيير
  return (
    <View style={styles.mainContainer}>
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{score.correct}</Text>
          <Text style={styles.statLabel}>{levelLabels.correct}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{score.incorrect}</Text>
          <Text style={styles.statLabel}>{levelLabels.incorrect}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{questionNumber}</Text>
          <Text style={styles.statLabel}>{state.labels.questionNo}</Text>
        </View>
      </View>

      <View
        style={[
          styles.switchContainer,
          { flexDirection: state.language === "ar" ? "row-reverse" : "row" },
        ]}
      >
        <Switch
          value={playCords}
          onValueChange={(value) => setPlayCords(value)}
          thumbColor={playCords ? "#4CAF50" : "#f4f3f4"}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
        />
        <Text style={styles.label}>{levelLabels.playchords}</Text>
      </View>

      <View style={styles.leveContainer}>
        <View style={styles.buttonsContainer}>
          {currentCadence.map((tone, i) => (
            <TouchableOpacity
              key={tone}
              style={[styles.toneButton]}
              onPress={() => handleGuess(tone)}
              disabled={!currentLevelChoices.includes(tone)}
            >
              <View
                style={[
                  styles.toneButtonTextBox,
                  !currentLevelChoices.includes(tone) ? styles.dimmed : null,
                  buttonColors[tone] === "green" && styles.correctButton,
                  buttonColors[tone] === "red" && styles.incorrectButton,
                ]}
              >
                <Text style={styles.toneButtonText}>
                  {state.language == "ar"
                    ? keysMap[keyLables[i] as keyof typeof keysMap]
                    : currentKeyMap[keyLables[i] as keyof typeof currentKeyMap]}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.playButton]}
            onPress={async () => {
              if (currentTone) await playTone(currentTone);
            }}
            disabled={isPlaying || !currentTone}
          >
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>{levelLabels.repeat}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.repeatButton]}
            onPress={playMaqam}
            disabled={isPlaying}
          >
            <Ionicons name="play" size={24} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>
              {levelLabels.palyMaqam}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// الـ Styles تبقى كما هي بدون تغيير
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#FAFAFA",
    padding: 10,
  },
  scoreContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    padding: 10,
  },
  leveContainer: {
    alignItems: "center",
    flex: 1,
    padding: 10,
  },
  questionNumber: {
    fontSize: 18,
    marginBottom: 10,
  },
  score: {
    fontSize: 18,
    marginBottom: 20,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginTop: 40,
    marginBottom: 20,
  },
  playButtonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    width: "70%",
    paddingHorizontal: 10,
    flexWrap: "wrap",
  },
  pickerContainer: {
    width: "100%",
    alignItems: "center",
    borderRadius: 10,
    overflow: "hidden",
    padding: 10,
  },
  picker: {
    height: 50,
    color: "#333",
    fontSize: 16,
    width: "70%",
    overflow: "hidden",
  },
  pickerItem: {
    fontSize: 16,
    color: "#333",
    width: "100%",
    margin: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    textTransform: "uppercase",
  },
  feedbackText: {
    marginTop: 10,
    fontSize: 18,
    textAlign: "center",
    color: "#333",
  },
  toggleButton: {
    padding: 10,
    backgroundColor: "#ccc",
    borderRadius: 8,
    margin: 10,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: "#4CAF50",
  },
  toggleButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  switchContainer: {
    flexDirection: "row",
    alignItems: "center",
    margin: 20,
  },
  label: {
    marginRight: 10,
    marginLeft: 10,
    fontSize: 16,
  },
  toneButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 5,
    borderRadius: 5,
    margin: 1,
    width: 40,
    height: 150,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
  dimmed: {
    backgroundColor: "#cad3d2",
  },
  toneButtonTextBox: {
    width: 35,
    height: 35,
    backgroundColor: "#95a5a5",
    borderRadius: 5,
    marginTop: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  toneButtonText: {
    fontSize: 14,
    textAlign: "center",
    color: "#fff",
  },
  correctButton: {
    backgroundColor: "green",
  },
  incorrectButton: {
    backgroundColor: "red",
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
    width: 150,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
    borderRadius: 12,
    gap: 8,
    paddingHorizontal: 18,
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
  controlButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});

export default Level1;
