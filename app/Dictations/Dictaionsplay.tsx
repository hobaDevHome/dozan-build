import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { RouteProp, useRoute, useFocusEffect } from "@react-navigation/native"; // استيراد useFocusEffect
import {
  scalesLists,
  keysMap,
  tonesLables,
  maqamsSoundFolders,
  dictationSoundFolders,
  Maqam,
  soundFolders,
} from "@/constants/scales";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useSettings } from "@/context/SettingsContext";
import { Audio } from "expo-av";
import {
  scalesListsForDictation,
  maqamPivots,
} from "../../constants/DictationLists";
import PianoScreen from "../PianoScreen";

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
  const { id, scale } = route.params || {};

  // --- المتغيرات الأصلية للمكون ---
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState(0);
  const [clicksMade, setClicksMade] = useState(0);
  const [randomNotes, setRandomNotes] = useState<string[]>([]);
  const [iconColors, setIconColors] = useState(Array(4).fill("gray"));
  const [showCorrectNotes, setShowCorrectNotes] = useState(false);
  const [correctNoteNames, setCorrectNoteNames] = useState<string[]>([]);
  const [clickedItems, setClickedItems] = useState(0);
  const [clickedright, setClickedright] = useState(0);
  const [showSikaDiscalimer, setShowSikaDiscalimer] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });

  const { state } = useSettings();
  let selectedScale = scale.charAt(0).toUpperCase() + scale.slice(1);

  // --- Refs لإدارة الحالة بدون إعادة رندر ---
  const soundRef = useRef<Audio.Sound | null>(null);
  const maqamSoundRef = useRef<Audio.Sound | null>(null); // Ref مخصص لصوت المقام
  const revealTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ======================= الحل المركزي باستخدام useFocusEffect =======================
  useFocusEffect(
    useCallback(() => {
      // هذا الكود يعمل عند الدخول إلى الشاشة
      // لا حاجة لوضع أي شيء هنا إذا كانت البداية تتم يدويًا بالضغط على زر "Play"

      // --- دالة التنظيف (الأهم): تعمل عند الخروج من الشاشة ---
      return () => {
        // 1. إعادة ضبط الحالة بالكامل
        setClickedItems(0);
        setClickedright(0);
        setShowCorrectNotes(false);
        setIsPlaying(false);
        setCurrentNoteIndex(0);
        setIconColors(Array(4).fill("gray"));
        setScore({ correct: 0, incorrect: 0 });
        setRandomNotes([]);
        setCorrectNoteNames([]);
        setClicksMade(0);

        // 2. إيقاف وتفريغ صوت النغمة الرئيسي
        if (soundRef.current) {
          soundRef.current.stopAsync().catch(() => {});
          soundRef.current.unloadAsync().catch(() => {});
          soundRef.current = null;
        }
        // 3. إيقاف وتفريغ صوت المقام
        if (maqamSoundRef.current) {
          maqamSoundRef.current.stopAsync().catch(() => {});
          maqamSoundRef.current.unloadAsync().catch(() => {});
          maqamSoundRef.current = null;
        }
        // 4. إلغاء أي مؤقتات معلقة
        if (revealTimeoutRef.current) {
          clearTimeout(revealTimeoutRef.current);
          revealTimeoutRef.current = null;
        }
      };
    }, [])
  );
  // ======================= نهاية الحل =======================

  useEffect(() => {
    if (showCorrectNotes && randomNotes.length > 0) {
      const names = randomNotes.map((note) => getNoteDisplayName(note));
      setCorrectNoteNames(names);
    }
  }, [state.language, showCorrectNotes, randomNotes]);

  const levelLabels = state.labels.introGamePage.levelPage;
  const cadence = scalesLists[selectedScale as Maqam];
  const maxStep = 1;
  const quarterTones = maqamatQuarterTones.hasOwnProperty(selectedScale)
    ? maqamatQuarterTones[selectedScale as keyof typeof maqamatQuarterTones]
    : {};

  const getNoteDisplayName = (note: string): string => {
    const keyIndex = cadence.findIndex(
      (key) => key.toLowerCase() === note.toLowerCase()
    );
    if (keyIndex === -1) return note;

    let keyName1 =
      cadence[keyIndex].charAt(0).toUpperCase() + cadence[keyIndex].slice(1);
    let keyName2 = keyName1.split("_")[0];
    if (keyName2.length > 2 && keyName2 !== "Sol") {
      keyName2 = keyName2.slice(0, 2);
    }

    let currentKeyMap =
      tonesLables[state.toneLabel as keyof typeof tonesLables];
    if (state.language === "en") {
      return currentKeyMap[keyName1 as keyof typeof currentKeyMap] || keyName1;
    } else {
      return keysMap[keyName1 as keyof typeof keysMap] || keyName1;
    }
  };

  const playTone = async (note: string, folderType: number = 0) => {
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
    }

    const soundName = note.toLowerCase();
    const folder =
      folderType === 0
        ? dictationSoundFolders[state.instrument]
        : soundFolders[state.instrument];
    if (!folder) return;

    try {
      const soundModule = folder(`./${soundName}.mp3`);
      if (!soundModule) return;

      const { sound: soundObject } = await Audio.Sound.createAsync(soundModule);
      soundRef.current = soundObject;
      await soundObject.playAsync();
      soundObject.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await soundObject.unloadAsync().catch(() => {});
          if (soundRef.current === soundObject) {
            soundRef.current = null;
          }
        }
      });
    } catch (error) {}
  };

  const playSequence = (notesToPlay: string[]) => {
    setIsPlaying(true);
    let index = 0;

    const intervalId = setInterval(() => {
      if (index >= notesToPlay.length) {
        setIsPlaying(false);
        clearInterval(intervalId);
        return;
      }

      const note = notesToPlay[index];
      playTone(note, 1); // تشغيل النغمة بدون انتظار انتهاءها

      index++;
    }, 1000); // كل 500 مللي ثانية تشغيل نغمة جديدة
  };

  const playRandomNotes = async () => {
    if (revealTimeoutRef.current) clearTimeout(revealTimeoutRef.current);
    setClickedItems(0);
    setClickedright(0);
    setIconColors(Array(4).fill("gray"));
    setShowCorrectNotes(false);
    setCorrectNoteNames([]);
    setCurrentNoteIndex(0);
    setClicksMade(0);
    setRandomNotes([]);
    setShowSikaDiscalimer(false);

    const pivots = maqamPivots[selectedScale] || [];
    if (!cadence || cadence.length < 4) return;

    const phrase: string[] = [];
    let currentIndex: number;
    const pivotNote = pivots[Math.floor(Math.random() * pivots.length)];
    currentIndex =
      pivotNote && cadence.includes(pivotNote)
        ? cadence.indexOf(pivotNote)
        : Math.floor(Math.random() * cadence.length);
    phrase.push(cadence[currentIndex]);

    const countNote = (arr: string[], note: string) =>
      arr.filter((n) => n === note).length;

    for (let i = 1; i < 4; i++) {
      let nextNote: string;
      let attempts = 0;
      do {
        const step = Math.floor(Math.random() * (2 * maxStep + 1)) - maxStep;
        currentIndex = Math.min(
          Math.max(currentIndex + step, 0),
          cadence.length - 1
        );
        nextNote = cadence[currentIndex];
        attempts++;
      } while (countNote(phrase, nextNote) >= 2 && attempts < 10);
      phrase.push(nextNote);
    }

    if (!phrase.some((n) => pivots.includes(n)) && pivots.length > 0) {
      phrase[phrase.length - 1] = pivots[0];
    }

    if (phrase.some((note) => note.includes("q"))) setShowSikaDiscalimer(true);
    setRandomNotes(phrase);
    await playSequence(phrase);
  };

  const repeatRandomNotes = async () => {
    if (randomNotes.length > 0) {
      await playSequence(randomNotes);
    }
  };

  const revealCorrectSequence = () => {
    const names = randomNotes.map((note) => getNoteDisplayName(note));
    setCorrectNoteNames(names);
    setShowCorrectNotes(true);
  };

  const handleGuess = (guess: string) => {
    if (clicksMade >= 4 || isPlaying || randomNotes.length === 0) return;

    const newIconColors = [...iconColors];
    const correctNote = randomNotes[clicksMade];
    setClickedItems((prev) => prev + 1);

    if (scale === "Saba" && guess === "fa_d") guess = "sol_b";

    if (guess.toLowerCase() === correctNote.toLowerCase()) {
      newIconColors[clicksMade] = "green";
      setClickedright((prev) => prev + 1);
    } else {
      newIconColors[clicksMade] = "red";
    }

    setIconColors(newIconColors);
    const nextClicksMade = clicksMade + 1;
    setClicksMade(nextClicksMade);

    if (nextClicksMade === 4) {
      if (
        clickedright +
          (guess.toLowerCase() === correctNote.toLowerCase() ? 1 : 0) ===
        4
      ) {
        setScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      } else {
        setScore((prev) => ({ ...prev, incorrect: prev.incorrect + 1 }));
      }
      revealCorrectSequence();
    }
  };

  const playMaqam = async () => {
    if (maqamSoundRef.current) {
      await maqamSoundRef.current.stopAsync().catch(() => {});
      await maqamSoundRef.current.unloadAsync().catch(() => {});
    }
    let soundName = scale + "Full";
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
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.contentContainer}
    >
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
          <Text style={styles.statNumber}>
            {score.correct + score.incorrect + 1}
          </Text>
          <Text style={styles.statLabel}>{state.labels.questionNo}</Text>
        </View>
      </View>
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
      <PianoScreen
        onKeyPress={handleGuess}
        initialQuarterToneToggles={quarterTones || {}}
      />
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
    </ScrollView>
  );
};

// --- Styles remain unchanged ---
const styles = StyleSheet.create({
  scrollView: {
    flex: 1, // اجعلي الـ ScrollView نفسه يملأ الشاشة
    backgroundColor: "#FAFAFA",
  },
  contentContainer: {
    padding: 0, // ضعي الـ padding هنا
    flexGrow: 1,
  },

  feedbackContainer: {
    alignItems: "center",
    marginBottom: 5, // Add some vertical space
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
    fontSize: 14,
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
    minWidth: 60,
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
