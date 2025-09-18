import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  ImageBackground,
  Image,
  Platform,
  SafeAreaView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { useSettings } from "../context/SettingsContext";

import PlayButton from "@/components/Buttons/PlayButton";
import RepeatButton from "@/components/Buttons/RepeatButton";
import OptionButton from "@/components/Buttons/OptionButton";
import OptionButton2 from "@/components/Buttons/OptionButton2";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import { soundFolders } from "@/constants/scales";
import { ScrollView } from "react-native-gesture-handler";
import { useFocusEffect } from "expo-router";

const instrumentImages: { [key: string]: any } = {
  piano: require("@/assets/images/piano.png"),
  oud: require("@/assets/images/oud.png"),
};
const intervalSteps: Record<string, string[]> = {
  "Unison": ["re", "re"],
  "Minor Second": ["re", "mi_b"],
  "Three Quarter Tone": ["re", "mi_q"],
  "Major Second": ["re", "mi"],
  "Minor Third": ["re", "fa"],
  // "Major Third": ["do", "mi"],
  // "Perfect Fourth": ["do", "fa"],
  // "Tritone": ["do", "fa_d"],
  // "Perfect Fifth": ["do", "sol"],
  // "Minor Sixth": ["do", "la_b"],
  // "Major Sixth": ["do", "la"],
  // "Minor Seventh": ["do", "si_b"],
  // "Major Seventh": ["do", "si"],
  "Octave": ["re", "ree"],
};
const IntervalTrainingScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const [selectedIntervals, setSelectedIntervals] = useState<string[]>(
    Object.keys(intervalSteps)
  );
  const [currentInterval, setCurrentInterval] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userSelection, setUserSelection] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(true);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [currentSoundObject, setCurrentSoundObject] =
    useState<Audio.Sound | null>(null);
  const [firstAttempt, setFirstAttempt] = useState(true);
  const [questionNumber, setQuestionNumber] = useState(0);
  const { state, dispatch } = useSettings();
  const navigation = useNavigation();
  const lables = state.labels.intervalsTraingingPage;

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", async () => {
      if (currentSoundObject) {
        try {
          const status = await currentSoundObject.getStatusAsync();
          if (status.isLoaded) {
            await currentSoundObject.stopAsync();
            await currentSoundObject.unloadAsync();
          }
        } catch (error) {
          console.log("Error handling sound cleanup:", error);
        }
      }
    });

    return unsubscribe;
  }, [navigation, currentSoundObject]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("blur", async () => {
      setIsPlaying(false);
      setCurrentInterval(null);
      setUserSelection(null);
      setIsAnswered(true);
      setShowAnswer(false);
      setQuestionNumber(0);
      setScore({ correct: 0, incorrect: 0 });
      if (currentSoundObject) {
        try {
          await currentSoundObject.stopAsync();
          await currentSoundObject.unloadAsync();
          setCurrentSoundObject(null);
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
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      playInterval();
    });

    return unsubscribe;
  }, [navigation]);

  // ----------- تم التعديل هنا -----------
  const playInterval = async () => {
    setFirstAttempt(true);
    setQuestionNumber((prev) => prev + 1);
    if (!selectedIntervals.length) return;
    console.log("in play intervla");
    setShowAnswer(false);
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
    const randomInterval =
      selectedIntervals[Math.floor(Math.random() * selectedIntervals.length)];

    setCurrentInterval(randomInterval);
    const currenInt = intervalSteps[randomInterval];

    let currentIndex = 0;

    const playNextSound = async () => {
      if (currentIndex >= currenInt.length) {
        return;
      }

      const soundName = currenInt[currentIndex];
      const folder = soundFolders[state.instrument];

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

        setTimeout(async () => {
          try {
            await soundObject.stopAsync();
            await soundObject.unloadAsync();
            currentIndex++;
            playNextSound();
          } catch (err) {
            console.error("Error stopping/unloading:", err);
          }
        }, 500);
      } catch (error) {
        console.error(`Error playing sound ${soundName}:`, error);
      }
    };

    playNextSound();
    setIsAnswered(false);
    setUserSelection(null);
  };
  // ----------- نهاية التعديل -----------

  // ----------- تم التعديل هنا -----------
  const playSpecificInterval = async (intervalName: string) => {
    if (currentSoundObject) {
      try {
        await currentSoundObject.stopAsync();
        await currentSoundObject.unloadAsync();
        setCurrentSoundObject(null);
      } catch (error) {
        console.warn("Error stopping/unloading current sound:", error);
      }
    }

    const currenInt = intervalSteps[intervalName];
    let currentIndex = 0;

    const playNextSound = async () => {
      if (currentIndex >= currenInt.length) {
        return;
      }

      const soundName = currenInt[currentIndex];
      const folder = soundFolders[state.instrument];

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

        setTimeout(async () => {
          try {
            await soundObject.stopAsync();
            await soundObject.unloadAsync();
            currentIndex++;
            playNextSound();
          } catch (err) {
            console.error("Error stopping/unloading:", err);
          }
        }, 500);
      } catch (error) {
        console.error(`Error playing sound ${soundName}:`, error);
      }
    };

    playNextSound();
  };
  // ----------- نهاية التعديل -----------

  const handleSelection = (interval: string) => {
    playSpecificInterval(interval);
    if (!isAnswered) {
      setUserSelection(interval);
      setFirstAttempt(false);
      // update the score state accrordingly;

      if (interval === currentInterval) {
        if (firstAttempt) {
          setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
        }
        // setIsAnswered(true);
        setShowAnswer(true);

        if (state.autoQuestionJump) {
          setTimeout(() => {
            playInterval();
          }, 3500);
        }
      } else {
        if (firstAttempt) {
          setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
        }
      }
    }
  };

  const toggleInterval = (interval: string) => {
    setSelectedIntervals((prev) =>
      prev.includes(interval)
        ? prev.filter((i) => i !== interval)
        : [...prev, interval]
    );
  };

  const toggleModal = () => setModalVisible(!modalVisible);
  const intervalsListFromLacale =
    state.labels.intervalsTraingingPage.intervalsNamesMap;

  // ----------- تم التعديل هنا -----------
  const repeatInterval = async () => {
    if (!selectedIntervals.length) return;
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
    if (!currentInterval) return;

    const currenInt = intervalSteps[currentInterval];

    let currentIndex = 0;

    const playNextSound = async () => {
      if (currentIndex >= currenInt.length) {
        return;
      }

      const soundName = currenInt[currentIndex];
      console.log("playing", currenInt);
      const folder = soundFolders[state.instrument];

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

        setTimeout(async () => {
          try {
            await soundObject.stopAsync();
            await soundObject.unloadAsync();
            currentIndex++;
            playNextSound();
          } catch (err) {
            console.error("Error stopping/unloading:", err);
          }
        }, 500);
      } catch (error) {
        console.error(`Error playing sound ${soundName}:`, error);
      }
    };

    playNextSound();
    setIsAnswered(false);
    setUserSelection(null);
  };
  // ----------- نهاية التعديل -----------

  const handlePlayInterval = () => {
    playInterval();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* <Text style={styles.title}>{lables.title}</Text> */}

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

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[styles.controlButton, styles.playButton]}
            onPress={handlePlayInterval}
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

        {/* intervlas Selection Buttons */}

        <View style={styles.maqamatContainer}>
          <View style={styles.maqamatGrid}>
            {selectedIntervals.map((interval) => {
              return (
                <TouchableOpacity
                  key={interval}
                  style={[
                    styles.maqamButton,
                    userSelection === interval &&
                      (interval === currentInterval
                        ? styles.maqamButtonCorrect
                        : styles.maqamButtonWrong),
                  ]}
                  onPress={() => handleSelection(interval)}
                  disabled={isAnswered}
                >
                  <Text style={styles.maqamName}>
                    {state.language === "en"
                      ? interval
                      : intervalsListFromLacale[
                          interval as keyof typeof intervalsListFromLacale
                        ]}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Settings Button */}

        <View style={styles.settingsBtCont}>
          <TouchableOpacity
            style={[styles.controlButton, styles.settingsButtonBG]}
            onPress={() => setModalVisible(true)}
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

        {/* Modal for Settings */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <TouchableWithoutFeedback onPress={toggleModal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>
                  {lables.intervalsSettings}
                </Text>
                <Text style={styles.chooseText}>{lables.chooseIntervals}:</Text>
                <View style={styles.intervalSelectionContainer}>
                  {Object.keys(intervalSteps).map((interval) => (
                    <OptionButton2
                      label={
                        intervalsListFromLacale[
                          interval as keyof typeof intervalsListFromLacale
                        ]
                      }
                      key={interval}
                      selectedIntervals={selectedIntervals}
                      interval={interval}
                      toggleInterval={toggleInterval}
                    />
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalVisible(false)}
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
          </TouchableWithoutFeedback>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
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
    width: 30,
    height: 30,
    backgroundColor: "#376863",
    borderRadius: 15,
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
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
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
    maxWidth: Platform.OS === "web" ? 400 : "100%",
  },
  modalContent: {
    backgroundColor: "#fbedd3",
    padding: 20,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
    flexWrap: "wrap",
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
});

export default IntervalTrainingScreen;
