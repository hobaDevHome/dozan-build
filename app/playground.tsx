import React, { useState, useCallback, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { Asset } from "expo-asset";
import { Audio } from "expo-av";
import { useSettings } from "../context/SettingsContext";
import { soundFolders } from "../constants/scales";
import { Ionicons } from "@expo/vector-icons";
import PianoScreen from "./PianoScreen";

const PlaygroundScreen = () => {
  const { state } = useSettings();
  const handlePianoKeyPress = (note: string) => {
    //  handleGuess(note);
    console.log(note);
  };

  return (
    <View style={styles.mainContainer}>
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

      <PianoScreen
        onKeyPress={handlePianoKeyPress}
        initialQuarterToneToggles={{}}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    width: "100%",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    flex: 1,
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
