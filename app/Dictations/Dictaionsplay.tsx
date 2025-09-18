import { View, Text, TouchableOpacity, Alert, StyleSheet } from "react-native";
import React, { useEffect, useState, useRef } from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { useNavigation } from "@react-navigation/native";
import {
  scalesLists,
  keysMap,
  tonesLables,
  maqamsSoundFolders,
  dictationSoundFolders,
  Maqam,
  scalesNamesMap,
  soundFolders,
} from "@/constants/scales";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSettings } from "@/context/SettingsContext";
import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import {
  scalesListsForDictation,
  maqamPivots,
} from "../../constants/DictationLists";
import PlaygroundScreen from "../playground";
import tr from "@/locales/tr";

type PlayScreenParams = {
  id: string;
  scale: string;
};

const maqamatQuarterTones = {
  Saba: { mi: true },
  Bayaty: { mi: true },
  Sika: { mi: true, si: true },
  Rast: { mi: true, si: true },
  Nahawand: {},
  Agam: {},
  Hegaz: {},
  Kurd: {},
};

const DictaionsPlay = () => {
  const route = useRoute<RouteProp<{ params: PlayScreenParams }, "params">>();
  const { id: id, scale: scale } = route.params || {};
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0); // Tracks the index for *correct* note checking
  const [clicksMade, setClicksMade] = useState(0); // Tracks the number of user clicks
  const [randomNotes, setRandomNotes] = useState<string[]>([]);
  const [randomSound, setRandomSound] = useState<string>("");
  const [currentSoundObject, setCurrentSoundObject] =
    useState<Audio.Sound | null>(null);

  const [iconColors, setIconColors] = useState(Array(4).fill("gray"));
  // const [showRectangle, setShowRectangle] = useState(false); // Replaced by showCorrectNotes
  const [showCorrectNotes, setShowCorrectNotes] = useState(false);
  const [correctNoteNames, setCorrectNoteNames] = useState<string[]>([]);

  const [clickedItems, setClickedItems] = useState(0);
  const [clickedright, setClickedright] = useState(0);
  const [showSikaDiscalimer, setShowSikaDiscalimer] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });

  const { state, dispatch } = useSettings();
  let selectedScale = scale.charAt(0).toUpperCase() + scale.slice(1);
  const navigation = useNavigation();
  const soundRef = useRef<Audio.Sound | null>(null);
  const cancelled = useRef(false);
  const revealTimeoutRef = useRef<NodeJS.Timeout | null>(null); // Ref for timeout

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
    const unsubscribe = navigation.addListener("blur", async () => {
      // Reset state when leaving the screen
      setClickedItems(0);
      setClickedright(0);
      setShowCorrectNotes(false);
      setIsPlaying(false);
      setCurrentNoteIndex(0);
      setIconColors(Array(4).fill("gray"));
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
  useEffect(() => {
    if (showCorrectNotes && randomNotes.length > 0) {
      // إعادة حساب أسماء النغمات وفق اللغة الحالية
      const names = randomNotes.map((note) => getNoteDisplayName(note));
      setCorrectNoteNames(names);
    }
  }, [state.language]);

  const levelLabels = state.labels.introGamePage.levelPage;
  const cadence = scalesLists[selectedScale as Maqam];
  const maxStep = 1;
  // Helper to get display name based on settings
  const getNoteDisplayName = (note: string): string => {
    const keyIndex = cadence.findIndex(
      (key) => key.toLowerCase() === note.toLowerCase()
    );
    if (keyIndex === -1) return note; // Fallback

    let keyName1 =
      cadence[keyIndex].charAt(0).toUpperCase() + cadence[keyIndex].slice(1);
    let keyName2 = keyName1.split("_")[0];
    if (keyName2.length > 2 && keyName2 !== "Sol") {
      keyName2 = keyName2.slice(0, 2);
    }

    let currentKeyMap =
      tonesLables[state.toneLabel as keyof typeof tonesLables];
    if (state.language === "en") {
      return currentKeyMap.hasOwnProperty(keyName1)
        ? currentKeyMap[keyName1 as keyof typeof currentKeyMap]
        : keyName1;
    } else {
      return keysMap.hasOwnProperty(keyName1)
        ? keysMap[keyName1 as keyof typeof keysMap]
        : keyName1;
    }
  };

  //////////////// play tone function ///////////////////////
  const playTone = async (note: string, folderType: number = 0) => {
    if (cancelled.current) return;
    if (soundRef.current) {
      try {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
      } catch (e) {
        console.warn("Error stopping/unloading previous sound:", e);
      }
      soundRef.current = null;
    }

    const soundName = note.toLowerCase();

    const folder =
      folderType === 0
        ? dictationSoundFolders[state.instrument]
        : soundFolders[state.instrument];

    if (!folder) {
      console.error(`Instrument \"${state.instrument}\" not found.`);
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
        if (status && status.isLoaded && status.didJustFinish) {
          await soundObject.unloadAsync().catch(console.warn);
          if (soundRef.current === soundObject) {
            // Ensure we only nullify if it's the same sound object
            soundRef.current = null;
          }
        }
      });
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  };

  //////////////// play cadence function (Unused in this game logic) ///////////////////////
  // const playCadence = async () => { ... };

  const playSequence = async (notesToPlay: string[]) => {
    setIsPlaying(true);
    for (let i = 0; i < notesToPlay.length; i++) {
      if (cancelled.current) break;
      await playTone(notesToPlay[i], 1);
      await new Promise((resolve) => setTimeout(resolve, 1200)); // Delay between notes
    }
    setIsPlaying(false);
  };

  const playRandomNotes = async () => {
    cancelled.current = false;
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
    }
    setClickedItems(0);
    setClickedright(0);
    setIconColors(Array(4).fill("gray"));
    setShowCorrectNotes(false);
    setCorrectNoteNames([]);
    setCurrentNoteIndex(0);
    setClicksMade(0);
    setRandomNotes([]); // Clear previous notes first
    setShowSikaDiscalimer(false);

    const currentMaqamList = scalesListsForDictation[selectedScale as Maqam];
    let selectedRandomSequence =
      currentMaqamList[Math.floor(Math.random() * currentMaqamList.length)];
    let currentNotes = selectedRandomSequence.notes;
    let currentSound = selectedRandomSequence.name;

    setRandomNotes(currentNotes);
    setRandomSound(currentSound);
    //  play pre recorded sounds
    // ====================================
    //await playTone(currentSound);

    /////////////////////////////////////////////////////
    // get notes from pre recoreded sequence in dictaion list

    /////////////// another random sequence but around some pattern ///////////////
    const startIndex = Math.floor(Math.random() * (cadence.length - 4));
    let currentIndex = startIndex;
    const phrase = [cadence[currentIndex]];

    // دالة تعد عدد مرات النغمة في الجملة
    const countNote = (arr: string[], note: string): number =>
      arr.filter((n) => n === note).length;

    for (let i = 1; i < 4; i++) {
      let nextNote;
      let attempts = 0;

      do {
        const step = Math.floor(Math.random() * 3) - 1; // -1 أو 0 أو +1
        currentIndex = Math.min(
          Math.max(currentIndex + step, 0),
          cadence.length - 1
        );
        nextNote = cadence[currentIndex];
        attempts++;
        // لو النغمة دي ظهرت بالفعل مرتين ⇒ نجرب تاني
      } while (countNote(phrase, nextNote) >= 2 && attempts < 10);

      phrase.push(nextNote);
    }

    // ========================================
    // play sequence randomly generated
    // نغمات عشواية من نغمات المقام بحيث لا تتكرر النغمة اكتر من مرتين ف الجملة وماتكونش المسافات بينهم اكتر من تون واحد
    console.log(phrase);
    //setRandomNotes(phrase);
    //await playSequence(phrase);

    // ========= باستخدام ركووزات المقامات =======================
    const pivots = maqamPivots[selectedScale] || [];
    if (!currentMaqamList || currentMaqamList.length < 4) {
      console.warn("Selected scale is not valid or too short.");
      return;
    }

    const countNote2 = (arr: string[], note: string): number =>
      arr.filter((n) => n === note).length;

    const phrase2: string[] = [];

    let currentIndex2: number;
    // 1. Start from a pivot note if possible, otherwise choose a random note
    const pivotNote = pivots[Math.floor(Math.random() * pivots.length)];
    if (pivotNote && cadence.includes(pivotNote)) {
      currentIndex2 = cadence.indexOf(pivotNote);
    } else {
      currentIndex2 = Math.floor(Math.random() * cadence.length);
    }
    phrase2.push(cadence[currentIndex2]);

    // 2. Build the rest of the phrase
    for (let i = 1; i < 4; i++) {
      let nextNote: string;
      let attempts = 0;

      do {
        const step = Math.floor(Math.random() * (2 * maxStep + 1)) - maxStep;
        currentIndex2 = Math.min(
          Math.max(currentIndex2 + step, 0),
          currentMaqamList.length - 1
        );
        nextNote = cadence[currentIndex2];
        attempts++;
      } while (countNote(phrase2, nextNote) >= 2 && attempts < 10);

      phrase2.push(nextNote);
    }

    // 3. Make sure at least one pivot is included
    const hasPivot = phrase2.some((n) => pivots.includes(n));
    if (!hasPivot && pivots.length > 0) {
      phrase2[phrase2.length - 1] = pivots[0]; // نحط Pivot في الآخر
    }

    console.log("Generated phrase:", phrase2);
    const hasQuarterTone = phrase2.some((note) => note.includes("q"));
    if (hasQuarterTone) setShowSikaDiscalimer(true);
    setRandomNotes(phrase2);
    await playSequence(phrase2);
  };

  const repeatRandomNotes = async () => {
    if (randomNotes.length > 0) {
      await playSequence(randomNotes);
    }
  };

  const revealCorrectSequence = async () => {
    const names = randomNotes.map((note) => getNoteDisplayName(note));

    setCorrectNoteNames(names);
    setShowCorrectNotes(true);

    // setTimeout(() => {
    //   playTone(randomSound);
    //   // revealTimeoutRef.current = null; // Clear ref after execution
    // }, 1000);

    // Play the correct sequence after 500ms
    // revealTimeoutRef.current = setTimeout(() => {
    //   playSequence(randomNotes);
    //   revealTimeoutRef.current = null; // Clear ref after execution
    // }, 2000);
  };

  const handleGuess = (guess: string) => {
    if (clicksMade >= 4 || isPlaying || randomNotes.length === 0) {
      return;
    }

    const newIconColors = [...iconColors];
    const correctNote = randomNotes[clicksMade]; // Check against the note for this click position
    setClickedItems(clickedItems + 1);

    if (scale === "Saba" && guess === "fa_d") guess = "sol_b";
    if (guess.toLowerCase() === correctNote.toLowerCase()) {
      newIconColors[clicksMade] = "green";
      setClickedright(clickedright + 1);
    } else {
      newIconColors[clicksMade] = "red"; // Stays red if wrong
    }

    if (clickedItems === 3) {
      setClickedItems(0);
      setClickedright(0);
      if (clickedright === 3) {
        setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
    }
    setIconColors(newIconColors);

    const nextClicksMade = clicksMade + 1;
    setClicksMade(nextClicksMade);
    // We don't advance currentNoteIndex based on correctness anymore, only track clicks

    if (nextClicksMade === 4) {
      // End of round after 4 clicks
      revealCorrectSequence();
    }

    // update score state accordingly:
  };

  const playMaqam = async () => {
    // This function seems unrelated to the core game, keeping it as is
    if (currentSoundObject !== null) {
      try {
        await currentSoundObject.stopAsync();
        await currentSoundObject.unloadAsync();
      } catch (error) {
        console.warn("Error stopping/unloading current sound:", error);
      }
      setCurrentSoundObject(null);
    }
    let soundName = scale + "Full";
    const folder = maqamsSoundFolders[state.instrument];
    if (!folder) {
      console.error(`Instrument \"${state.instrument}\" not found.`);
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
        if (status && status.isLoaded && status.didJustFinish) {
          await soundObject.unloadAsync().catch(console.warn);
          setCurrentSoundObject(null);
        }
      });
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  };

  const handlePianoKeyPress = (note: string) => {
    handleGuess(note);
  };

  return (
    <View style={styles.mainContainer}>
      {/* // Title and Score Area */}
      <View style={styles.tilteContainer}>
        <Text style={styles.title}>
          {state.labels.dictations.description} :{" "}
          {
            state.labels.basicTrainingPages.basicTrainingHome[
              selectedScale as Maqam
            ]
          }
        </Text>
      </View>

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
          <Text style={styles.statNumber}>
            {score.correct + score.incorrect + 1}
          </Text>
          <Text style={styles.statLabel}> {state.labels.questionNo}</Text>
        </View>
      </View>

      {/* Icons and Correct Notes Display */}
      <View style={styles.feedbackContainer}>
        <View style={styles.iconContainer}>
          {iconColors.map((color, index) => (
            <Ionicons
              key={index}
              name="musical-note"
              size={32}
              color={color}
              style={styles.iconStyle}
            />
          ))}
        </View>
        {showCorrectNotes && (
          <>
            <View style={styles.correctNotesContainer}>
              <Text style={styles.correctNotesText}>
                {state.labels.dictations.correctSequence} :{" "}
                {correctNoteNames.join(" - ")}
              </Text>
            </View>
            {state.language !== "ar" && showSikaDiscalimer && (
              <View style={styles.correctNotesContainer}>
                <Text style={styles.correctNotesText}>
                  {state.labels.dictations.sikaDiscalimer}
                </Text>
              </View>
            )}
          </>
        )}
      </View>

      {/* pino component */}

      <PlaygroundScreen
        onKeyPress={handlePianoKeyPress}
        showIntro={false}
        initialQuarterToneToggles={maqamatQuarterTones[selectedScale] || {}}
      />

      {/* Buttons Area */}

      {/* Control Buttons */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlButton, styles.nextButton]}
          onPress={playRandomNotes}
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
          onPress={repeatRandomNotes}
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
  );
};

// Add new styles and adjust existing ones
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    flexDirection: "column",
    // justifyContent: "space-between", // Adjusted for better layout
    backgroundColor: "#FAFAFA",
    padding: 10,
  },
  feedbackContainer: {
    alignItems: "center",
    marginVertical: 20, // Add some vertical space
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10, // Space below icons
  },
  iconStyle: {
    marginHorizontal: 8, // Add spacing between icons
  },
  correctNotesContainer: {
    marginTop: 10, // Space above the text
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.05)", // Light background for emphasis
    borderRadius: 5,
  },
  correctNotesText: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
  },
  leveContainer: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1, // Allow this area to take remaining space
    padding: 10,
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
    marginBottom: 20, // Add space below note buttons
  },
  toneButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    margin: 4,
    minWidth: 60, // Ensure buttons have a decent size
    alignItems: "center",
    justifyContent: "center",
  },
  toneButtonText: {
    fontSize: 18,
    textAlign: "center",
    color: "#fff",
  },
  playButtonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
    flexWrap: "wrap",
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    textTransform: "uppercase",
  },
  // Unchanged styles below (picker, score etc. if they existed)
  pickerContainer: {
    width: "100%",
    alignItems: "center",
    // Removed styling as it wasn't used in the provided code's return
    // borderRadius: 10,
    // overflow: "hidden",
    // padding: 10,
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
  tilteContainer: {
    borderRadius: 16,
    padding: 18,
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
    backgroundColor: "#4ECDC4",
    width: "70%",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 16,
    color: "#fff",
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
  controlsContainer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    flexWrap: "wrap",
    width: "90%",
    justifyContent: "center",
    marginTop: 10,
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
  // Styles like scoreContainer, questionNumber, score, dimmed, picker, pickerItem, musicalIcon, greenRectangle were either unused or replaced/modified above.
});

export default DictaionsPlay;
