import { View, Text, TouchableOpacity, StyleSheet, Switch } from "react-native";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  scalesLists,
  soundFolders,
  keysMap,
  tonesLables,
  chordsFolders,
  maqamsSoundFolders,
} from "@/constants/scales";
import { useSettings } from "@/context/SettingsContext";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

type Maqam =
  | "Rast"
  | "Bayaty"
  | "Agam"
  | "Nahawand"
  | "Saba"
  | "Sika"
  | "Hegaz"
  | "Kurd";

const TrainingPlay = () => {
  const { state } = useSettings();
  const { id, scale, levelChoices = [], label } = state.trainingParams || {};

  const [currentTone, setCurrentTone] = useState<string>("");
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [playChords, setPlayChords] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [canGuess, setCanGuess] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [currentSoundObject, setCurrentSoundObject] =
    useState<Audio.Sound | null>(null);
  const [buttonColors, setButtonColors] = useState<{
    [key: string]: "green" | "red" | null;
  }>({});
  const [firstAttempt, setFirstAttempt] = useState(true);
  const [questionNumber, setQuestionNumber] = useState(1);

  const soundRef = useRef<Audio.Sound | null>(null);
  const maqamSoundRef = useRef<Audio.Sound | null>(null); // Ref مخصص لصوت المقام
  const timersRef = useRef<NodeJS.Timeout[]>([]); // Ref لتخزين كل المؤقتات
  const levelChoicesRef = useRef(levelChoices);

  useEffect(() => {
    levelChoicesRef.current = levelChoices;
  }, [levelChoices]);

  const selectedScale = scale.charAt(0).toUpperCase() + scale.slice(1);
  const levelLabels = state.labels.introGamePage.levelPage;
  const cadence = scalesLists[selectedScale as Maqam];
  let keyLables = cadence.map((key) => {
    let keyName1 = key.charAt(0).toUpperCase() + key.slice(1);
    let keyName2 = keyName1.split("_")[0];
    if (keyName2.length > 2 && keyName2 !== "Sol") {
      keyName2 = keyName2.slice(0, 2);
    }
    return keyName2;
  });
  let currentKeyMap = tonesLables[state.toneLabel as keyof typeof tonesLables];

  // ======================= الحل المركزي باستخدام useFocusEffect =======================
  useFocusEffect(
    useCallback(() => {
      // هذا الكود سيعمل الآن في كل مرة تدخل فيها إلى الشاشة
      // أو في كل مرة يتغير فيها المقام الذي اخترته

      // للتأكد 100%، أضف هذا السطر في البداية
      console.log("useFocusEffect is running! Scale is:", scale);

      // إعادة ضبط الحالة والبدء
      setFeedbackMessage("");
      setCanGuess(false);
      setFirstAttempt(true);
      setQuestionNumber(1);
      setButtonColors({});
      setIsPlaying(false);
      setCurrentTone("");
      setScore({ correct: 0, incorrect: 0 });

      // استدعاء الدالة التي كانت لا تعمل
      playRandomTone();

      // --- دالة التنظيف (Cleanup Function) ---
      // هذه الدالة ستعمل عند الخروج من الشاشة
      return () => {
        console.log("Cleaning up the screen..."); // للتأكد من أن التنظيف يعمل
        setIsPlaying(false);
        // إيقاف وتفريغ كل الأصوات النشطة
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

        // إلغاء أي مؤقتات (timers) معلقة لمنع تسريب الذاكرة
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
      };
    }, [state.trainingParams]) // <-- التعديل الأهم: أضفنا الاعتمادية هنا
  );
  // ======================= نهاية الحل =======================

  const addTimer = (timer: NodeJS.Timeout) => {
    timersRef.current.push(timer);
  };

  const playTone = async (
    note: string,
    duration: number = 1000,
    chord: boolean = false
  ): Promise<void> => {
    return new Promise(async (resolve) => {
      try {
        const soundName = chord ? note : note.toLowerCase();
        const folder = chord
          ? chordsFolders[state.instrument]
          : soundFolders[state.instrument];
        if (!folder) return resolve();
        const soundModule = folder(`./${soundName}.mp3`);
        if (!soundModule) return resolve();

        const { sound: soundObject } = await Audio.Sound.createAsync(
          soundModule
        );
        soundRef.current = soundObject;
        await soundObject.playAsync();

        const onPlaybackStatusUpdate = async (status: any) => {
          if (status.isLoaded && status.didJustFinish) {
            soundObject.setOnPlaybackStatusUpdate(null);
            await soundObject.unloadAsync().catch(() => {});
            resolve();
          }
        };
        soundObject.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
      } catch (error) {
        resolve();
      }
    });
  };

  const playRandomTone = async () => {
    setFeedbackMessage("");
    setCanGuess(true);
    setFirstAttempt(true);
    if (isPlaying) return;

    setIsPlaying(true);
    console.log("playchords", playChords);
    if (playChords) {
      const chordName = `${scale}_chord`;
      console.log("Playing chord:", chordName);
      await playTone(chordName, 1500, true);
    }

    const choices = levelChoicesRef.current;
    if (!choices || choices.length === 0) {
      setIsPlaying(false);
      return;
    }
    const randomTone = choices[Math.floor(Math.random() * choices.length)];
    setCurrentTone(randomTone);

    await playTone(randomTone);
    setIsPlaying(false);
  };

  const playPreviousNotes = async (fromIndex: number) => {
    const choices = levelChoicesRef.current;
    for (let i = fromIndex; i >= 0; i--) {
      const tone = choices[i];
      setButtonColors({ [tone]: "green" });
      await playTone(tone, 100);
    }
    setButtonColors({});
  };

  const playNextNotes = async (fromIndex: number) => {
    const choices = levelChoicesRef.current;
    for (let i = fromIndex; i < choices.length; i++) {
      const tone = choices[i];
      setButtonColors({ [tone]: "green" });
      await playTone(tone, 100);
    }
    setButtonColors({});
  };

  const handleGuess = async (guess: string) => {
    if (!canGuess) return;
    const choices = levelChoicesRef.current;
    const lowerCaseGuess = guess.toLowerCase();

    if (lowerCaseGuess === currentTone) {
      setCanGuess(false);
      if (firstAttempt) {
        setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      }
      setButtonColors({ [guess]: "green" });
      addTimer(setTimeout(() => setButtonColors({}), 500));

      const guessedIndex = choices.indexOf(lowerCaseGuess);
      if (state.backToTonic) {
        if (label === "section3") {
          guessedIndex <= 3
            ? await playPreviousNotes(guessedIndex)
            : await playNextNotes(guessedIndex);
        } else if (label === "section1") {
          await playPreviousNotes(guessedIndex);
        } else {
          await playNextNotes(guessedIndex);
        }
      } else {
        await playTone(lowerCaseGuess);
      }
      addTimer(
        setTimeout(() => {
          setQuestionNumber((prev) => prev + 1);
          playRandomTone();
        }, 300)
      );
    } else {
      playTone(lowerCaseGuess);
      if (firstAttempt) {
        setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
      setFirstAttempt(false);
      setButtonColors({ [guess]: "red" });
      addTimer(setTimeout(() => setButtonColors({}), 800));
    }
  };

  const playMaqam = async () => {
    if (maqamSoundRef.current) {
      await maqamSoundRef.current.stopAsync().catch(() => {});
      await maqamSoundRef.current.unloadAsync().catch(() => {});
    }
    let soundName = scale;
    if (label === "section1") soundName = `${scale}First`;
    else if (label === "section2") soundName = `${scale}Second`;
    else if (label === "section3") soundName = `${scale}Full`;

    const folder = maqamsSoundFolders[state.instrument];
    if (!folder) return;

    try {
      const soundModule = folder(`./${soundName}.mp3`);
      if (!soundModule) return;

      const { sound: soundObject } = await Audio.Sound.createAsync(soundModule);
      maqamSoundRef.current = soundObject;
      await soundObject.playAsync();
      soundObject.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await soundObject.unloadAsync().catch(() => {});
          maqamSoundRef.current = null;
        }
      });
    } catch (error) {}
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.tilteContainer}>
        <Text style={styles.title}>
          {
            state.labels.basicTrainingPages.basicTrainingHome[
              selectedScale as Maqam
            ]
          }
        </Text>
      </View>
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
          value={playChords}
          onValueChange={(value) => setPlayChords(value)}
          thumbColor={playChords ? "#4CAF50" : "#f4f3f4"}
          trackColor={{ false: "#767577", true: "#81b0ff" }}
        />
        <Text style={styles.label}>{levelLabels.playchords}</Text>
      </View>

      <View style={styles.leveContainer}>
        <View style={styles.buttonsContainer}>
          {cadence.map((tone: string, i: number) => (
            <TouchableOpacity
              key={tone}
              style={[styles.toneButton]}
              onPress={() => handleGuess(tone)}
              disabled={!levelChoicesRef.current.includes(tone.toLowerCase())}
            >
              <View
                style={[
                  styles.toneButtonTextBox,
                  !levelChoicesRef.current.includes(tone.toLowerCase())
                    ? styles.dimmed
                    : null,
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
        {feedbackMessage !== "" && (
          <Text style={styles.feedbackText}>{feedbackMessage}</Text>
        )}

        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.nextButton]}
            onPress={playRandomTone}
            disabled={isPlaying}
          >
            <Ionicons
              name="play"
              size={24}
              color="#FFFFFF"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.controlButtonText}>{levelLabels.paly}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.playButton]}
            onPress={() => playTone(currentTone)}
            disabled={isPlaying || !currentTone}
          >
            <Ionicons
              name="refresh"
              size={24}
              color="#FFFFFF"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.controlButtonText}>{levelLabels.repeat}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.repeatButton]}
            onPress={playMaqam}
            disabled={isPlaying}
          >
            <Ionicons
              name="musical-notes"
              size={24}
              color="#FFFFFF"
              style={{ marginRight: 5 }}
            />
            <Text style={styles.controlButtonText}>
              {state.labels.maqamatTraingingPage.playMaqam}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// --- Styles remain unchanged ---
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
    // justifyContent: "center",
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
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    flexWrap: "wrap",
  },

  pickerContainer: {
    width: "100%",
    alignItems: "center",
    borderRadius: 10, // Rounded corners
    overflow: "hidden", // Ensure rounded corners work
    padding: 10,
  },
  picker: {
    height: 50, // Set a fixed height
    color: "#333", // Text color
    fontSize: 16, // Font size
    width: "70%",
    overflow: "hidden",
  },
  pickerItem: {
    fontSize: 16, // Font size for dropdown items
    color: "#333", // Text color for dropdown items
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
    // marginTop: 100,
    fontSize: 14,
    textAlign: "center",
    color: "#fff",
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
  correctButton: {
    backgroundColor: "green",
  },
  incorrectButton: {
    backgroundColor: "red",
  },
  controlsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    flexWrap: "wrap",
    width: "90%",
    justifyContent: "center",
  },
  controlButton: {
    width: 120,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 12,
    paddingHorizontal: 24,
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
  tilteContainer: {
    borderRadius: 16,
    padding: 18,
    marginTop: 5,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    position: "relative",
    backgroundColor: "#4ECDC4",
    width: "50%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
});

export default TrainingPlay;
