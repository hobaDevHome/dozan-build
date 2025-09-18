import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import { useSettings } from "../../context/SettingsContext"; // Assuming this provides language/instrument settings
import { soundFolders } from "../../constants/scales"; // Assuming this maps instrument to sound folder require function

// Define the piano layout
const pianoLayout = [
  { note: "do", type: "white", label: "Do" },
  { note: "do_d", type: "black", label: "Do#" },
  { note: "re", type: "white", label: "Re" },
  { note: "mi_b", type: "black", label: "Mi♭" },
  { note: "mi", type: "white", label: "Mi", hasToggle: true },
  { note: "fa", type: "white", label: "Fa" },
  { note: "fa_d", type: "black", label: "Fa#" },
  { note: "sol", type: "white", label: "Sol" },
  { note: "la_b", type: "black", label: "La♭" },
  { note: "la", type: "white", label: "La" },
  { note: "si_b", type: "black", label: "Si♭" },
  { note: "si", type: "white", label: "Si", hasToggle: true },
  { note: "doo", type: "white", label: "Do" }, // Higher octave Do
  { note: "ree_b", type: "black", label: "Re♭" }, // Higher octave Re flat
  { note: "ree", type: "white", label: "Re" }, // Higher octave Re
];

// Count white keys for layout calculation
const whiteKeysCount = pianoLayout.filter((key) => key.type === "white").length;

const PlaygroundScreen = () => {
  const { state } = useSettings(); // Get settings like instrument and language
  const [miQuarterTone, setMiQuarterTone] = useState(false);
  const [siQuarterTone, setSiQuarterTone] = useState(false);

  const playTone = async (note: string) => {
    let soundName = note.toLowerCase();
    const folder = soundFolders[state.instrument];

    // Adjust note name if quarter tone is active
    if (note === "mi" && miQuarterTone) {
      soundName = "mi_q";
    } else if (note === "si" && siQuarterTone) {
      soundName = "si_q";
    }

    console.log(`Attempting to play: ${soundName}.mp3`); // Debug log

    if (!folder) {
      console.error(
        `Instrument "${state.instrument}" not found in soundFolders.`
      );
      return;
    }

    try {
      // Assuming soundFolders[state.instrument] is a function like require.context
      // that returns a map or similar, or directly the require function for the folder.
      // Adjust this based on the actual structure of soundFolders.
      const file = folder(`./${soundName}.mp3`);
      const asset = Asset.fromModule(file);

      if (!asset.uri) {
        console.error(
          `Asset not found for ${soundName}.mp3. Check if file exists and is correctly referenced.`
        );
        return;
      }

      const { sound } = await Audio.Sound.createAsync({ uri: asset.uri });
      await sound.playAsync();

      // Unload sound after playing
      sound.setOnPlaybackStatusUpdate(async (status) => {
        // Use status.isLoaded check for safety
        if (status.isLoaded && status.didJustFinish) {
          await sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
      // Consider adding user-facing feedback if needed
      // Alert.alert("Error", `Could not play sound: ${soundName}`);
    }
  };

  const toggleMiQuarterTone = () => setMiQuarterTone(!miQuarterTone);
  const toggleSiQuarterTone = () => setSiQuarterTone(!siQuarterTone);

  // --- Revised Key Dimensions Calculation ---
  // Target width (approximate)
  const targetScreenWidth = 400;
  // Use actual screen width or target width, whichever is smaller, for responsiveness
  const screenWidth = Math.min(
    Dimensions.get("window").width,
    targetScreenWidth
  );

  // Calculate white key width based on the number of white keys to fit the screen width
  const whiteKeyWidth = screenWidth / whiteKeysCount;
  const whiteKeyHeight = whiteKeyWidth * 4; // Adjusted ratio for less height
  const blackKeyWidth = whiteKeyWidth * 0.6;
  const blackKeyHeight = whiteKeyHeight * 0.6;
  const toggleButtonSize = whiteKeyWidth * 0.5;
  const toggleButtonTopOffset = toggleButtonSize * 0.3; // Space above white key for toggle
  const pianoHeight = whiteKeyHeight + toggleButtonSize + toggleButtonTopOffset; // Total height needed

  let whiteKeyRenderIndex = -1; // Tracks the index for positioning white keys

  return (
    <View style={styles.mainContainer}>
      {/* --- Piano Container --- */}
      <View style={[styles.pianoContainer, { height: pianoHeight }]}>
        {/* --- White Keys Layer --- */}
        <View style={styles.keysLayer}>
          {pianoLayout.map((key) => {
            if (key.type === "white") {
              whiteKeyRenderIndex++;
              const keyStyle = [
                styles.whiteKey,
                {
                  width: whiteKeyWidth,
                  height: whiteKeyHeight,
                  // Position based on render index
                  left: whiteKeyRenderIndex * whiteKeyWidth,
                },
              ];
              const isMiOrSi = key.note === "mi" || key.note === "si";
              const isToggled =
                (key.note === "mi" && miQuarterTone) ||
                (key.note === "si" && siQuarterTone);

              return (
                <TouchableOpacity
                  key={`${key.note}-white`}
                  style={keyStyle}
                  onPress={() => playTone(key.note)}
                >
                  <Text
                    style={[styles.keyLabel, { fontSize: whiteKeyWidth * 0.3 }]}
                  >
                    {key.label}
                  </Text>
                  {isMiOrSi && isToggled && (
                    <Text style={styles.quarterToneSymbol}>q</Text>
                  )}
                </TouchableOpacity>
              );
            }
            return null; // Render only white keys in this pass
          })}
        </View>

        {/* --- Black Keys & Toggles Layer --- */}
        {/* Rendered separately to ensure correct z-index behavior implicitly */}
        {/* Or explicitly using zIndex if needed, but structure helps */}
        <View style={styles.keysLayer}>
          {(function () {
            let currentWhiteKeyIndex = -1; // Reset index for positioning relative to white keys
            return pianoLayout.map((key, layoutIndex) => {
              if (key.type === "white") {
                currentWhiteKeyIndex++; // Increment for each white key encountered

                // Render Toggle Button if applicable for this white key
                if (key.hasToggle) {
                  const toggleActive =
                    (key.note === "mi" && miQuarterTone) ||
                    (key.note === "si" && siQuarterTone);
                  return (
                    <TouchableOpacity
                      key={`${key.note}-toggle`}
                      style={[
                        styles.toggleButton,
                        {
                          width: toggleButtonSize,
                          height: toggleButtonSize,
                          // Position above the corresponding white key
                          left:
                            currentWhiteKeyIndex * whiteKeyWidth +
                            (whiteKeyWidth - toggleButtonSize) / 2,
                          top: toggleButtonTopOffset, // Positioned from the top of the piano container
                        },
                        toggleActive ? styles.toggleButtonActive : null,
                      ]}
                      onPress={
                        key.note === "mi"
                          ? toggleMiQuarterTone
                          : toggleSiQuarterTone
                      }
                    >
                      <Text style={styles.toggleButtonText}>q</Text>
                    </TouchableOpacity>
                  );
                }
              } else if (key.type === "black") {
                // Position black key relative to the *previous* white key's index
                const blackKeyLeft =
                  currentWhiteKeyIndex * whiteKeyWidth +
                  whiteKeyWidth -
                  blackKeyWidth / 2;
                const keyStyle = [
                  styles.blackKey,
                  {
                    width: blackKeyWidth,
                    height: blackKeyHeight,
                    left: blackKeyLeft,
                    top: 0, // Black keys align to the top of the container
                  },
                ];
                return (
                  <TouchableOpacity
                    key={`${key.note}-black`}
                    style={keyStyle}
                    onPress={() => playTone(key.note)}
                  >
                    <Text
                      style={[
                        styles.keyLabel,
                        styles.blackKeyLabel,
                        { fontSize: blackKeyWidth * 0.3 },
                      ]}
                    >
                      {key.label}
                    </Text>
                  </TouchableOpacity>
                );
              }
              return null;
            });
          })()}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    justifyContent: "flex-end", // Place piano at the bottom
    alignItems: "center",
    backgroundColor: "#e0e0e0", // Light grey background
    paddingBottom: 20, // Add some padding at the bottom
  },
  pianoContainer: {
    flexDirection: "row", // Although keys are positioned absolutely, this helps structure
    width: "100%", // Take full width available
    maxWidth: 400, // Max width constraint
    position: "relative", // Needed for absolute positioning of children keys
    backgroundColor: "#c7c7c7", // A slightly darker background for the piano base
    borderTopWidth: 1,
    borderTopColor: "#888",
  },
  keysLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  whiteKey: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#999999", // Lighter border
    position: "absolute",
    bottom: 0, // Align to the bottom of the container
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 8, // Adjust label padding
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    // zIndex: 0, // White keys are behind black keys
  },
  blackKey: {
    backgroundColor: "#333333", // Darker black
    borderWidth: 1,
    borderColor: "#000000",
    position: "absolute",
    // top: 0, // Align to the top of the container (set in inline style)
    zIndex: 1, // Ensure black keys are visually above white keys
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 5,
    borderBottomLeftRadius: 2,
    borderBottomRightRadius: 2,
  },
  keyLabel: {
    fontWeight: "bold",
    color: "#000000",
    textAlign: "center",
  },
  blackKeyLabel: {
    color: "#ffffff",
  },
  toggleButton: {
    position: "absolute",
    backgroundColor: "#cccccc", // Inactive color
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#888888",
    zIndex: 2, // Above all keys
    elevation: 3, // For Android shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  toggleButtonActive: {
    backgroundColor: "#4caf50", // Active color (green)
    borderColor: "#388e3c",
  },
  toggleButtonText: {
    color: "#000000",
    fontWeight: "bold",
    fontSize: 16, // Keep toggle text size fixed or scale differently
  },
  quarterToneSymbol: {
    position: "absolute",
    top: 3,
    right: 3,
    fontSize: 10, // Smaller symbol
    fontWeight: "bold",
    color: "#e53935", // Red symbol
    backgroundColor: "rgba(255, 255, 255, 0.5)", // Slight background for visibility
    borderRadius: 2,
    paddingHorizontal: 2,
  },
});

export default PlaygroundScreen;
