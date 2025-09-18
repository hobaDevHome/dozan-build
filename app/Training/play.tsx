import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import {
  scalesLists,
  soundFolders,
  keysMap,
  tonesLables,
  maqamsSoundFolders,
} from "@/constants/scales";
import { useSettings } from "@/context/SettingsContext";
import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import MaqamTrainingScreen from "../maqamat";
import { Ionicons } from "@expo/vector-icons";

type PlayScreenParams = {
  id: string;
  scale: string;
  levelChoices: string[];
  label: string;
};
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
  const { state, dispatch } = useSettings();
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

  const navigation = useNavigation();
  const soundRef = useRef<Audio.Sound | null>(null);
  const cancelled = useRef(false);

  // --- تعديل هنا: تعريف ref لمتابعة أحدث قيمة للـ levelChoices
  const levelChoicesRef = useRef(levelChoices);
  useEffect(() => {
    levelChoicesRef.current = levelChoices;
  }, [levelChoices]);
  // ---

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

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", () => {
      // Stop and unload sound when leaving the screen
      if (currentSoundObject) {
        currentSoundObject
          .stopAsync()
          .catch((error) => console.log("Error stopping sound:", error));
        currentSoundObject
          .unloadAsync()
          .catch((error) => console.log("Error unloading sound:", error));
      }
    });

    return unsubscribe; // Cleanup listener on unmount
  }, [navigation, currentSoundObject]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      playRandomTone();
    });

    return unsubscribe;
  }, [navigation]);
  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", async () => {
      setFeedbackMessage("");
      setCanGuess(false);
      setFirstAttempt(true);
      setQuestionNumber(1);
      setButtonColors({});
      setIsPlaying(false);
      setCurrentTone("");
      setScore({ correct: 0, incorrect: 0 });
      // أوقف كل الأصوات عند مغادرة الصفحة
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        } catch (error) {
          console.log("Error stopping/unloading soundRef:", error);
        }
      }
      if (currentSoundObject) {
        try {
          await currentSoundObject.stopAsync();
          await currentSoundObject.unloadAsync();
          setCurrentSoundObject(null);
        } catch (error) {
          console.log("Error stopping/unloading currentSoundObject:", error);
        }
      }
    });

    return unsubscribe;
  }, [navigation, currentSoundObject]);

  //////////////// play tone function ///////////////////////
  const playTone = async (
    note: string,
    duration: number = 1000
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (cancelled.current) return resolve();
      try {
        if (soundRef.current) {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        const soundName = note.toLowerCase();
        const folder = soundFolders[state.instrument];
        if (!folder) {
          console.error(`Instrument "${state.instrument}" not found.`);
          return resolve();
        }
        const file = folder(`./${soundName}.mp3`);
        const asset = Asset.fromModule(file);
        const soundObject = new Audio.Sound();
        soundRef.current = soundObject;
        await soundObject.loadAsync({ uri: asset.uri });
        await soundObject.playAsync();
        if (soundName !== "cords" || duration < 1000) {
          setTimeout(async () => {
            try {
              await soundObject.stopAsync();
              await soundObject.unloadAsync();
              soundRef.current = null;
            } catch (error) {
              console.warn("Error during forced stop:", error);
            }
            resolve();
          }, duration);
        } else {
          soundObject.setOnPlaybackStatusUpdate(async (status) => {
            if (status && status.isLoaded) {
              if (status?.didJustFinish) {
                await soundObject.unloadAsync();
                soundRef.current = null;
                resolve();
              }
            }
          });
        }
      } catch (error) {
        console.error(`Error playing sound ${note}:`, error);
        reject(error);
      }
    });
  };

  //////////////// playRandomTone function ///////////////////////
  const playRandomTone = async () => {
    setFeedbackMessage("");
    setCanGuess(true);
    setFirstAttempt(true);

    if (cancelled.current) return;
    if (isPlaying) return;

    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    setIsPlaying(true);

    if (playChords) {
      await playTone("cords");
      await new Promise((r) => setTimeout(r, 500));
    }

    // --- تعديل هنا: استخدم ref بدل المتغير العادي
    const choices = levelChoicesRef.current;
    const randomTone = choices[Math.floor(Math.random() * choices.length)];
    setCurrentTone(randomTone);
    console.log("levelChoices: ", choices);
    console.log("Random tone: ", randomTone);

    const soundName = randomTone.toLocaleLowerCase();
    const folder = soundFolders[state.instrument];

    if (!folder) {
      console.error(`Instrument "${state.instrument}" not found.`);
      return;
    }

    try {
      const file = folder(`./${soundName}.mp3`);
      const asset = Asset.fromModule(file);
      let soundObject = new Audio.Sound();
      soundRef.current = soundObject;
      await soundObject.loadAsync({ uri: asset.uri });
      await soundObject.playAsync();
      soundObject.setOnPlaybackStatusUpdate(async (status) => {
        if (status && status.isLoaded) {
          if (status.didJustFinish) {
            await soundObject.unloadAsync();
            soundRef.current = null;
          }
        }
      });
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }

    setIsPlaying(false);
  };

  const playPreviousNotes = async (fromIndex: number) => {
    const choices = levelChoicesRef.current;
    for (let i = fromIndex; i >= 0; i--) {
      const tone = choices[i];
      setButtonColors({ [tone]: "green" });
      const duration = i === 0 ? 1200 : i === fromIndex ? 700 : 400;
      await playTone(tone, duration);
      await new Promise((r) => setTimeout(r, 0));
    }
    setButtonColors({});
  };

  const playNextNotes = async (fromIndex: number) => {
    const choices = levelChoicesRef.current;
    for (let i = fromIndex; i < choices.length; i++) {
      const tone = choices[i];
      setButtonColors({ [tone]: "green" });
      const duration =
        i === choices.length - 1 ? 1200 : i === fromIndex ? 700 : 400;
      await playTone(tone, duration);
      await new Promise((r) => setTimeout(r, 0));
    }
    setButtonColors({});
  };

  const handleGuess = async (guess: string) => {
    if (!canGuess) return;
    const choices = levelChoicesRef.current;
    if (guess === currentTone) {
      setCanGuess(false);
      if (firstAttempt) {
        setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      }
      setButtonColors((prev) => ({
        ...prev,
        [guess]: guess === currentTone ? "green" : "red",
      }));
      setTimeout(() => {
        setButtonColors({});
      }, 500);
      const guessedIndex = choices.indexOf(guess);
      if (state.backToTonic) {
        if (label === "section3") {
          if (guessedIndex <= 3) {
            await playPreviousNotes(guessedIndex);
          } else {
            await playNextNotes(guessedIndex);
          }
        } else if (label === "section1") {
          await playPreviousNotes(guessedIndex);
        } else {
          await playNextNotes(guessedIndex);
        }
      } else {
        await playTone(guess);
      }
      setTimeout(() => {
        setQuestionNumber((prev) => prev + 1);
        playRandomTone();
      }, 300);
    } else {
      playTone(guess);
      if (firstAttempt) {
        setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
      setFirstAttempt(false);
      setButtonColors((prev) => ({
        ...prev,
        [guess]: guess === currentTone ? "green" : "red",
      }));
      setTimeout(() => {
        setButtonColors({});
      }, 800);
    }
  };

  const playMaqam = async () => {
    if (currentSoundObject !== null) {
      try {
        await currentSoundObject.stopAsync();
        await currentSoundObject.unloadAsync();
      } catch (error) {
        console.warn("Error stopping/unloading current sound:", error);
      }
      setCurrentSoundObject(null);
    }
    let soundName = scale;
    if (label === "section1") {
      soundName = `${scale}First`;
    } else if (label === "section2") {
      soundName = `${scale}Second`;
    } else if (label === "section3") {
      soundName = `${scale}Full`;
    }
    const folder = maqamsSoundFolders[state.instrument];
    if (!folder) {
      console.error(`Instrument "${state.instrument}" not found.`);
      return;
    }
    try {
      const file = folder(`./${soundName}.mp3`);
      const asset = Asset.fromModule(file);
      let soundObject = new Audio.Sound();
      setCurrentSoundObject(soundObject);
      await soundObject.loadAsync({ uri: asset.uri });
      await soundObject.playAsync();
      soundObject.setOnPlaybackStatusUpdate(async (status) => {
        if (status && status.isLoaded) {
          if (status.didJustFinish) {
            await soundObject.unloadAsync();
          }
        }
      });
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Stats */}
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
            {" "}
            {state.labels.introGamePage.levelPage.incorrect}
          </Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{questionNumber}</Text>
          <Text style={styles.statLabel}> {state.labels.questionNo}</Text>
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
              onPress={() => handleGuess(tone.toLocaleLowerCase())}
              disabled={
                !levelChoicesRef.current.includes(tone.toLocaleLowerCase())
              }
            >
              <View
                style={[
                  styles.toneButtonTextBox,
                  !levelChoicesRef.current.includes(tone.toLocaleLowerCase())
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

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.nextButton]}
            onPress={async () => {
              await playRandomTone();
            }}
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
            onPress={async () => {
              await playTone(currentTone);
            }}
            disabled={isPlaying}
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
            onPress={async () => {
              await playMaqam();
            }}
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
});

export default TrainingPlay;
