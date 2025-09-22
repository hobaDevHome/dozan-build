import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { useFocusEffect } from "@react-navigation/native";
import {
  scalesLists,
  soundFolders,
  chordsFolders,
  keysMap,
  tonesLables,
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

const TrainingListen = () => {
  const { state } = useSettings();
  const { id, scale, levelChoices, label } = state.trainingParams || {};

  const [playChords, setPlayChords] = useState<boolean>(true);
  const [buttonColors, setButtonColors] = useState<{
    [key: string]: "green" | "red" | null;
  }>({});

  const soundRef = useRef<Audio.Sound | null>(null);
  const levelChoicesRef = useRef(levelChoices);
  const backToTonicRef = useRef(state.backToTonic);
  const timersRef = useRef<number[]>([]);

  useEffect(() => {
    levelChoicesRef.current = levelChoices;
    backToTonicRef.current = state.backToTonic;
  }, [levelChoices, state.backToTonic]);

  useFocusEffect(
    useCallback(() => {
      // التأكد من وجود البيانات قبل تشغيل الصوت
      if (scale && levelChoices) {
        playRandomTone();
      }
      return () => {
        if (soundRef.current) {
          soundRef.current.stopAsync().catch(() => {});
          soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
        timersRef.current.forEach(clearTimeout);
        timersRef.current = [];
      };
    }, [state.instrument, scale, levelChoices]) // أضفنا scale و levelChoices لضمان إعادة التشغيل عند توفرها
  );

  if (!scale || !levelChoices) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#45b7d1" />
      </View>
    );
  }

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

  const addTimer = (timer: number) => {
    timersRef.current.push(timer);
  };

  const playTone = async (
    note: string,
    chord: boolean = false
  ): Promise<void> => {
    return new Promise(async (resolve) => {
      try {
        const soundName = !chord ? note.toLowerCase() : note;

        const folder = !chord
          ? soundFolders[state.instrument]
          : chordsFolders[state.instrument];

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
    if (!levelChoicesRef.current || levelChoicesRef.current.length === 0)
      return;

    if (playChords) {
      const chordName = `${scale}_chord`;
      console.log("Playing chord:", chordName);
      await playTone(chordName, true);
    }

    const randomTone =
      levelChoicesRef.current[
        Math.floor(Math.random() * levelChoicesRef.current.length)
      ];

    try {
      await playTone(randomTone);
      addTimer(setTimeout(() => handleGuess(randomTone), 1000));
    } catch (error) {
      console.log("Error in playRandomTone loop:", error);
    }
  };

  const playNotesSequence = async (
    startIndex: number,
    direction: "up" | "down"
  ) => {
    // ... (الدالة تبقى كما هي)
    const choices = levelChoicesRef.current;
    const loopEnd = direction === "down" ? -1 : choices.length;
    const step = direction === "down" ? -1 : 1;

    for (let i = startIndex; i !== loopEnd; i += step) {
      const tone = choices[i];
      setButtonColors({ [tone]: "green" });
      await playTone(tone);
    }
    setButtonColors({});
  };

  const handleGuess = async (guess: string) => {
    setButtonColors({ [guess]: "green" });
    addTimer(setTimeout(() => setButtonColors({}), 500));

    const guessedIndex = levelChoicesRef.current.indexOf(guess);

    if (backToTonicRef.current) {
      if (label === "section3") {
        await playNotesSequence(
          guessedIndex,
          guessedIndex <= 3 ? "down" : "up"
        );
      } else if (label === "section1") {
        await playNotesSequence(guessedIndex, "down");
      } else {
        await playNotesSequence(guessedIndex, "up");
      }
    }

    addTimer(setTimeout(playRandomTone, 1000));
  };

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
                  !levelChoicesRef.current?.includes(tone)
                    ? styles.dimmed
                    : null,
                  buttonColors[tone] === "green" && styles.correctButton,
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-between",
    backgroundColor: "#FAFAFA",
    padding: 10,
  },
  leveContainer: {
    alignItems: "center",
    flex: 1,
    padding: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
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
  activitySubtitle: {
    fontSize: 14,
    color: "#6f6f6f",
    textAlign: "center",
    opacity: 0.9,
  },
});

export default TrainingListen;
