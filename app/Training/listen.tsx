import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Switch,
} from "react-native";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { RouteProp, useFocusEffect, useRoute } from "@react-navigation/native";
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
const TrainingListen = () => {
  const { state, dispatch } = useSettings();
  const { id, scale, levelChoices, label } = state.trainingParams || {};

  const [currentTone, setCurrentTone] = useState<string>("");

  const [playChords, setPlayChords] = useState<boolean>(true);

  const [isPlaying, setIsPlaying] = useState(false);

  const [buttonColors, setButtonColors] = useState<{
    [key: string]: "green" | "red" | null;
  }>({});

  // في بداية الكومبوننت بعد تعريف المتغيرات
  const levelChoicesRef = useRef(levelChoices);

  useEffect(() => {
    levelChoicesRef.current = levelChoices;
  }, [levelChoices]);

  // في كل مكان تستخدم فيه levelChoices استبدلها بـ levelChoicesRef.current

  const navigation = useNavigation();
  const soundRef = useRef<Audio.Sound | null>(null);
  const cancelled = useRef(false);
  const selectedScale = scale.charAt(0).toUpperCase() + scale.slice(1);
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
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      cancelled.current = true;

      if (soundRef.current) {
        soundRef.current.stopAsync();
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", async () => {
      setButtonColors({});
      setIsPlaying(false);
      setCurrentTone("");

      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        } catch (error) {
          console.log("Error stopping/unloading soundRef:", error);
        }
      }
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        } catch (error) {
          console.log("Error stopping/unloading currentSoundObject:", error);
        }
      }
    });

    return unsubscribe;
  }, [navigation, soundRef.current]);
  // play ranodm note on page load
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      playRandomTone();
    });

    return unsubscribe;
  }, [navigation]);

  const backToTonicRef = useRef(state.backToTonic);

  useEffect(() => {
    backToTonicRef.current = state.backToTonic;
  }, [state.backToTonic]);
  /////////// play tone function ///////////////////////
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
  //////////////// play playRandomTone function ///////////////////////

  const playRandomTone = async () => {
    if (cancelled.current) return;
    if (isPlaying) return;

    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }

    setIsPlaying(true);

    if (playChords) {
      await playTone("cords"); // Play the "cords" sound();
      await new Promise((r) => setTimeout(r, 500)); // Wait 500ms
    }

    const randomTone =
      levelChoicesRef.current[
        Math.floor(Math.random() * levelChoicesRef.current.length)
      ];
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

      // // Create a new sound object and set it as the current sound
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

      setTimeout(() => {
        handleGuess(randomTone);
      }, 2000); // 2000ms = 2 seconds
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }

    setIsPlaying(false);
  };

  const playPreviousNotes = async (fromIndex: number) => {
    for (let i = fromIndex; i >= 0; i--) {
      const tone = levelChoicesRef.current[i];
      // Set the current tone button to green, clear others
      setButtonColors({ [tone]: "green" });
      const duration = i === 0 ? 1200 : i === fromIndex ? 700 : 400;
      await playTone(tone, duration);
      await new Promise((r) => setTimeout(r, 0)); // Small delay after sound
    }
    // Clear all button colors at the end
    setButtonColors({});
  };

  const playNextNotes = async (fromIndex: number) => {
    for (let i = fromIndex; i < levelChoicesRef.current.length; i++) {
      const tone = levelChoicesRef.current[i];
      // Set the current tone button to green, clear others
      setButtonColors({ [tone]: "green" });

      const duration =
        i === levelChoicesRef.current.length - 1
          ? 1200
          : i === fromIndex
          ? 700
          : 400;

      await playTone(tone, duration);

      await new Promise((r) => setTimeout(r, 0)); // Small delay after sound
    }
    // Clear all button colors at the end
    setButtonColors({});
  };
  const handleGuess = async (guess: string) => {
    setButtonColors((prev) => ({
      ...prev,
      [guess]: "green",
    }));

    setTimeout(() => {
      setButtonColors({});
    }, 500);
    // Find the index of the guessed note in currentCadence
    const guessedIndex = levelChoicesRef.current.indexOf(guess);

    // Play guessed note and all previous notes if not the first note
    console.log("state.backToTonic in handle guess", state.backToTonic);

    if (backToTonicRef.current) {
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
    if (!cancelled.current) {
      setTimeout(() => {
        playRandomTone();
      }, 500);
    }
  };
  console.log("TrainingListen rendered, backToTonic:", state.backToTonic);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.leveContainer}>
        <View style={styles.intro}>
          <Ionicons
            name="musical-notes"
            size={32}
            color="#45b7d1"
            style={{ marginBottom: 5 }}
          />

          <Text style={styles.activitySubtitle}>
            {state.labels.basicTrainingPages.basicTrainingLevel.listenMsg}
          </Text>
        </View>
        <View style={styles.buttonsContainer}>
          {cadence.map((tone: string, i: number) => (
            <TouchableOpacity key={tone} style={[styles.toneButton]} disabled>
              <View
                style={[
                  styles.toneButtonTextBox,
                  !levelChoicesRef.current.includes(tone)
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

        <Text style={styles.feedbackText}>
          {state.labels.basicTrainingPages.basicTrainingLevel.listenMsg}
        </Text>
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
    //   justifyContent: "center",
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
  },

  playButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "70%",
    paddingHorizontal: 10,
    flexWrap: "wrap",
  },
  repeatButton: {
    backgroundColor: "#1bbc9b",
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    textAlign: "center",
  },
  playButton: {
    backgroundColor: "#e35f33",
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    textAlign: "center",
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
    marginVertical: 12,
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
  intro: {
    padding: 20,
    width: 300,
    height: 180,
    marginBottom: 70,
    marginTop: 20,

    justifyContent: "center",
    alignItems: "center",

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  activityTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 14,
    color: "#6f6f6f",
    textAlign: "center",
    opacity: 0.9,
  },
});

export default TrainingListen;
