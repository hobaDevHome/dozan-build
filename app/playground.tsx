import React, { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import { useSettings } from "../context/SettingsContext";
import { soundFolders } from "../constants/scales";
import { Ionicons } from "@expo/vector-icons";

// Define the piano layout with toggle info for keys that support quarter tones
const pianoLayout = [
  {
    note: "do",
    type: "white",
    label: "Do",
    labelAr: "دو",
    hasToggle: true,
    toggleKey: "do",
  },
  {
    note: "do_d",
    type: "black",
    label: "Do#",
    labelAr: "دو#",
    hasToggle: true,
    toggleKey: "do_d",
  },
  {
    note: "re",
    type: "white",
    label: "Re",
    labelAr: "ري",
    hasToggle: true,
    toggleKey: "re",
  },
  {
    note: "mi_b",
    type: "black",
    label: "Mi♭",
    labelAr: "مي♭",
    hasToggle: true,
    toggleKey: "mi_b",
  },
  {
    note: "mi",
    type: "white",
    label: "Mi",
    labelAr: "مي",
    hasToggle: true,
    toggleKey: "mi",
  },
  {
    note: "fa",
    type: "white",
    label: "Fa",
    labelAr: "فا",
    hasToggle: true,
    toggleKey: "fa",
  },
  {
    note: "fa_d",
    type: "black",
    label: "Fa#",
    labelAr: "فا#",
    hasToggle: true,
    toggleKey: "fa_d",
  },
  {
    note: "sol",
    type: "white",
    label: "Sol",
    labelAr: "صول",
    hasToggle: true,
    toggleKey: "sol",
  },
  {
    note: "la_b",
    type: "black",
    label: "La♭",
    labelAr: "لا♭",
    hasToggle: true,
    toggleKey: "la_b",
  },
  {
    note: "la",
    type: "white",
    label: "La",
    labelAr: "لا",
    hasToggle: true,
    toggleKey: "la",
  },
  {
    note: "si_b",
    type: "black",
    label: "Si♭",
    labelAr: "سي♭",
    hasToggle: true,
    toggleKey: "si_b",
  },
  {
    note: "si",
    type: "white",
    label: "Si",
    labelAr: "سي",
    hasToggle: true,
    toggleKey: "si",
  },
  {
    note: "doo",
    type: "white",
    label: "Do",
    labelAr: "دو",
    hasToggle: true,
    toggleKey: "doo",
  }, // Higher octave Do
  {
    note: "ree_b",
    type: "black",
    label: "Re♭",
    labelAr: "ري♭",
    // hasToggle: true,
    // toggleKey: "ree_b",
  }, // Higher octave Re flat
  {
    note: "ree",
    type: "white",
    label: "Re",
    labelAr: "ري",
  }, // Higher octave Re
];

type PlaygroundScreenProps = {
  onKeyPress?: (note: string) => void;
  showIntro?: boolean;
  initialQuarterToneToggles?: Record<string, boolean>;
};

const whiteKeysCount = pianoLayout.filter((key) => key.type === "white").length;

const PlaygroundScreen: React.FC<PlaygroundScreenProps> = ({
  onKeyPress,
  showIntro = true,
  initialQuarterToneToggles,
}) => {
  const { state } = useSettings();
  const [quarterToneToggles, setQuarterToneToggles] = useState<
    Record<string, boolean>
  >({});

  // داخل كومبوننت PlaygroundScreen:
  useEffect(() => {
    if (initialQuarterToneToggles) {
      setQuarterToneToggles(initialQuarterToneToggles);
    }
  }, [initialQuarterToneToggles]);

  const [containerWidth, setContainerWidth] = useState(0);

  const handleLayout = useCallback(
    (event: any) => {
      const { width } = event.nativeEvent.layout;
      if (width > 0 && width !== containerWidth) {
        setContainerWidth(width);
      }
    },
    [containerWidth]
  );

  // Play tone with quarter-tone support
  const playTone = async (note: string) => {
    let soundName = note.toLowerCase();
    const folder = soundFolders[state.instrument];

    const layoutEntry = pianoLayout.find((k) => k.note === note);
    if (
      layoutEntry?.hasToggle &&
      layoutEntry.toggleKey &&
      quarterToneToggles[layoutEntry.toggleKey]
    ) {
      soundName = `${note}_q`;
    }

    // console.log(`Playing sound: ${soundName}.mp3`);
    // pass the note to the parent if any
    if (onKeyPress) {
      onKeyPress(soundName);
    }

    if (!folder) {
      console.error(`Instrument "${state.instrument}" not found.`);
      return;
    }

    try {
      const file = folder(`./${soundName}.mp3`);
      const asset = Asset.fromModule(file);
      if (!asset.uri) {
        console.error(`Asset not found for ${soundName}.mp3.`);
        return;
      }
      const { sound } = await Audio.Sound.createAsync({ uri: asset.uri });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
    }
  };

  // Toggle quarter tone for any key
  const toggleQuarterTone = (toggleKey: string) => {
    setQuarterToneToggles((prev) => ({
      ...prev,
      [toggleKey]: !prev[toggleKey],
    }));
  };

  // Calculate dimensions dynamically
  let whiteKeyWidth = 0,
    whiteKeyHeight = 0,
    blackKeyWidth = 0,
    blackKeyHeight = 0;
  let toggleButtonSize = 0,
    pianoHeight = 200;
  let toggleButtonTopMargin = 10;

  if (containerWidth > 0) {
    whiteKeyWidth = containerWidth / whiteKeysCount;
    whiteKeyHeight = whiteKeyWidth * 4.5;
    blackKeyWidth = whiteKeyWidth * 0.6;
    blackKeyHeight = whiteKeyHeight * 0.6;
    toggleButtonSize = whiteKeyWidth * 0.55;
    pianoHeight = whiteKeyHeight;
    toggleButtonTopMargin = toggleButtonSize * 0.8;
  }

  const blackKeyToggles = pianoLayout.filter(
    (k) => k.hasToggle && k.type === "black"
  );

  const whiteKeyToggles = pianoLayout.filter(
    (k) => k.hasToggle && k.type === "white"
  );

  return (
    <View style={styles.mainContainer}>
      {showIntro && (
        <View style={styles.intro}>
          <Ionicons
            name="musical-notes"
            size={32}
            color="#45b7d1"
            style={{ marginBottom: 5 }}
          />
          <Text style={styles.activityTitle}>
            {state.labels.playGroundPage.express}
          </Text>
          <Text style={styles.activitySubtitle}>
            {state.labels.playGroundPage.intro}
          </Text>
        </View>
      )}

      {/* Toggle buttons container */}
      <View style={styles.toggleContainer}>
        <View style={styles.toggleRow}>
          {blackKeyToggles.map((key) => {
            if (!key.toggleKey) return null; // Early return if toggleKey is undefined

            const active = !!quarterToneToggles[key.toggleKey];

            return (
              <TouchableOpacity
                key={key.toggleKey}
                style={[
                  styles.toggleKey,
                  styles.toggleKeyBlack,
                  active && styles.toggleKeyActive,
                ]}
                onPress={() => toggleQuarterTone(key.toggleKey!)}
              >
                {active && (
                  <Image
                    source={require("@/assets/images/half_flat_w.png")}
                    style={styles.toggleButtonImage}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.toggleRow}>
          {whiteKeyToggles.map((key) => {
            if (!key.toggleKey) return null; // Guard against undefined toggleKey

            const active = !!quarterToneToggles[key.toggleKey];

            return (
              <TouchableOpacity
                key={key.toggleKey}
                style={[
                  styles.toggleKey,
                  styles.toggleKeyWhite,
                  active && styles.toggleKeyActive,
                ]}
                onPress={() => toggleQuarterTone(key.toggleKey!)}
              >
                {active && (
                  <Image
                    source={require("@/assets/images/half_flat.png")}
                    style={styles.toggleButtonImage}
                    resizeMode="contain"
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Piano rendering as before, but remove toggle buttons from keys */}
      <View
        style={[
          styles.pianoContainer,
          { height: pianoHeight, marginTop: toggleButtonTopMargin },
        ]}
        onLayout={handleLayout}
      >
        {containerWidth > 0 && (
          <>
            {(function () {
              let currentWhiteKeyIndex = -1;
              const elements: JSX.Element[] = [];

              pianoLayout.forEach((key) => {
                if (key.type === "white") {
                  currentWhiteKeyIndex++;
                  const isToggled =
                    key.hasToggle &&
                    key.toggleKey &&
                    quarterToneToggles[key.toggleKey];

                  // White key
                  elements.push(
                    <TouchableOpacity
                      key={`${key.note}-white`}
                      style={[
                        styles.whiteKey,
                        {
                          width: whiteKeyWidth,
                          height: whiteKeyHeight,
                          left: currentWhiteKeyIndex * whiteKeyWidth,
                          zIndex: 0,
                        },
                      ]}
                      onPress={() => playTone(key.note)}
                    >
                      {isToggled && (
                        <Image
                          source={require("@/assets/images/half_flat.png")}
                          style={[
                            styles.toggleButtonImage,
                            { marginBottom: 130 },
                          ]}
                          resizeMode="contain"
                        />
                      )}
                      <Text
                        style={[
                          styles.keyLabel,
                          { fontSize: whiteKeyWidth * 0.3 },
                        ]}
                      >
                        {state.language === "ar" ? key.labelAr : key.label}
                      </Text>
                    </TouchableOpacity>
                  );
                } else if (key.type === "black") {
                  // Position black key relative to current white key index
                  const blackKeyLeft =
                    currentWhiteKeyIndex * whiteKeyWidth +
                    whiteKeyWidth -
                    blackKeyWidth / 2;

                  const isToggled =
                    key.hasToggle &&
                    key.toggleKey &&
                    quarterToneToggles[key.toggleKey];

                  // Black key
                  elements.push(
                    <TouchableOpacity
                      key={`${key.note}-black`}
                      style={[
                        styles.blackKey,
                        {
                          width: blackKeyWidth,
                          height: blackKeyHeight,
                          left: blackKeyLeft,
                          top: 0,
                          zIndex: 1,
                        },
                      ]}
                      onPress={() => playTone(key.note)}
                    >
                      {isToggled && (
                        <Image
                          source={require("@/assets/images/half_flat_w.png")}
                          style={[
                            styles.toggleButtonImage,
                            { marginBottom: 70 },
                          ]}
                          resizeMode="contain"
                        />
                      )}
                      <Text
                        style={[
                          styles.keyLabel,
                          styles.blackKeyLabel,
                          { fontSize: blackKeyWidth * 0.3 },
                        ]}
                      >
                        {state.language === "ar" ? key.labelAr : key.label}
                      </Text>
                    </TouchableOpacity>
                  );
                }
              });

              return elements;
            })()}
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    // justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },
  pianoContainer: {
    width: "90%",
    position: "relative",
    backgroundColor: "transparent",
    alignSelf: "center",
    overflow: "visible",
    //  marginTop: 50,
  },
  whiteKey: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#b0b0b0",
    position: "absolute",
    top: 0,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  blackKey: {
    backgroundColor: "#333333",
    borderWidth: 1,
    borderColor: "#000000",
    position: "absolute",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 5,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.27,
    shadowRadius: 4.65,
    elevation: 6,
  },
  keyLabel: {
    fontWeight: "bold",
    color: "#555555",
    textAlign: "center",
  },
  blackKeyLabel: {
    color: "#ffffff",
  },
  toggleButtonImage: {
    width: 12,
    height: 12,
    resizeMode: "contain",
  },
  toggleContainer: {
    alignSelf: "center",
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 4,
  },
  toggleKey: {
    width: 24,
    height: 24,
    borderRadius: 16,
    marginHorizontal: 4,
    justifyContent: "center",
    alignItems: "center",
    // borderWidth: 2,
    // borderColor: "#888",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  toggleKeyBlack: {
    backgroundColor: "#222",
  },
  toggleKeyWhite: {
    backgroundColor: "#fff",
  },
  toggleKeyActive: {
    // borderColor: "#33e09e",
    // backgroundColor: "#b5ffe0",
  },
  intro: {
    padding: 20,
    width: 300,
    height: 180,
    marginBottom: 100,
    marginTop: 50,

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

export default PlaygroundScreen;
