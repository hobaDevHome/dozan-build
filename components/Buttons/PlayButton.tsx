import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";

type PlayButtonProps = {
  label: string;
  playInterval: () => void;
  isPlaying: boolean;
};

const PlayButton: React.FC<PlayButtonProps> = ({
  label,
  playInterval,
  isPlaying,
}) => {
  return (
    <TouchableOpacity
      style={styles.playButton}
      onPress={playInterval}
      disabled={isPlaying}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  playButton: {
    backgroundColor: "#f3b7ad",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
    marginRight: 10,
  },
  buttonText: {
    color: "#512a1d",
    textAlign: "center",
    fontSize: 20,
    marginRight: 8,
    marginLeft: 10,
  },
});

export default PlayButton;
