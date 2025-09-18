import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";

type RepeatButtonProps = {
  label: string;
  repeatInterval: () => void;
  isPlaying: boolean;
};

const RepeatButton: React.FC<RepeatButtonProps> = ({
  label,
  repeatInterval,
  isPlaying,
}) => {
  return (
    <TouchableOpacity
      style={styles.repeatButton}
      onPress={repeatInterval}
      disabled={isPlaying}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  buttonText: {
    color: "#512a1d",
    textAlign: "center",
    fontSize: 20,
    marginRight: 8,
  },
  repeatButton: {
    backgroundColor: "#80cdc7",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
});

export default RepeatButton;
