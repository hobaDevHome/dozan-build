import React, { useState, useEffect, useRef } from "react";
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
import { useFocusEffect, useRoute } from "@react-navigation/native";
import { RouteProp } from "@react-navigation/native";
import { useSettings } from "../../context/SettingsContext";

import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

type Level1RouteParams = {
  levelChoices: string;
  maqamSection?: string;
};

type ToneLabelKey = keyof typeof tonesLables;

const Level1 = () => {
  const { state, dispatch } = useSettings();

  const { levelChoices, maqamSection } = state.gameParams || {};
  const [currentTone, setCurrentTone] = useState<string>("");
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  const [canGuess, setCanGuess] = useState<boolean>(false);

  const [feedbackMessage, setFeedbackMessage] = useState<string>("");
  const [currentSoundObject, setCurrentSoundObject] =
    useState<Audio.Sound | null>(null);
  const [playCords, setPlayCords] = useState<boolean>(true);
  const [buttonColors, setButtonColors] = useState<{
    [key: string]: "green" | "red" | null;
  }>({});
  const [firstAttempt, setFirstAttempt] = useState(true);
  const [questionNumber, setQuestionNumber] = useState(1);

  const navigation = useNavigation();
  const soundRef = useRef<Audio.Sound | null>(null);
  const cancelled = useRef(false);

  let selectedScaleName = "Agam";

  const levelLabels = state.labels.introGamePage.levelPage;

  const currentCadence = scalesLists[selectedScaleName as Maqam];

  // ---- التعديل هنا: تعريف ref لتتبع آخر قيمة
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
  const currentLevelChoicesRef = useRef(currentLevelChoices);

  useEffect(() => {
    currentLevelChoicesRef.current = currentLevelChoices;
  }, [currentLevelChoices]);
  // ---- نهاية التعديل

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

        // فقط لو مش "cords" نوقفه بعد مدة
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
          // نستنى لحد ما الصوت يخلص طبيعي
          soundObject.setOnPlaybackStatusUpdate(async (status) => {
            if (status.isLoaded && status.didJustFinish) {
              await soundObject.unloadAsync();
              soundRef.current = null;
              resolve();
            }
          });
        }
      } catch (error) {
        console.error(`Error playing sound ${note}:`, error);
        reject(error);
      }
    });
  };

  ////////////////  playRandomTone function ///////////////////////
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
    if (playCords) {
      await playTone("cords"); // Play the "cords" sound();
      await new Promise((r) => setTimeout(r, 200)); // Wait 500ms
    }

    // ---- التعديل هنا: استخدم ref بدل المتغير العادي
    const choices = currentLevelChoicesRef.current;
    const randomTone = choices[Math.floor(Math.random() * choices.length)];
    setCurrentTone(randomTone);
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

      // Create a new sound object and set it as the current sound
      let soundObject = new Audio.Sound();
      soundRef.current = soundObject; // Store reference

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

  const playMaqam = async () => {
    if (currentSoundObject !== null) {
      console.log("there is currently playing");
      try {
        await currentSoundObject.stopAsync();
        await currentSoundObject.unloadAsync();
      } catch (error) {
        console.warn("Error stopping/unloading current sound:", error);
      }
      setCurrentSoundObject(null);
    }

    let currentMaqamSound = "AgamFirst";
    if (maqamSection === 1) {
      currentMaqamSound = "AgamSecond";
    } else if (maqamSection === 2) {
      currentMaqamSound = "AgamFull";
    }

    const soundName = currentMaqamSound;
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

  const handleGuess = async (guess: string) => {
    if (!canGuess) return;

    const choices = currentLevelChoicesRef.current;

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

      // Find the index of the guessed note in choices
      const guessedIndex = choices.indexOf(guess);

      // Play guessed note and all previous notes if not the first note

      if (state.backToTonic) {
        if (maqamSection === 2) {
          if (guessedIndex <= 3) {
            await playPreviousNotes(guessedIndex);
          } else {
            await playNextNotes(guessedIndex);
          }
        } else if (maqamSection === 0) {
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
      }, 100);
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
      }, 500);
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

      {/* // toggle cords switch */}
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

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.playButton]}
            onPress={async () => {
              await playTone(currentTone);
            }}
            disabled={isPlaying}
          >
            <Ionicons name="refresh" size={24} color="#FFFFFF" />
            <Text style={styles.controlButtonText}>{levelLabels.repeat}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, styles.repeatButton]}
            onPress={async () => {
              await playMaqam();
            }}
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
    //justifyContent: "center",
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
    // marginTop: 100,
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
