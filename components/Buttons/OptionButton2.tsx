import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";

type OptionButtonProps = {
  interval: string;
  label: string;
  selectedIntervals: string[];
  toggleInterval: (interval: string) => void;
};

const OptionButton: React.FC<OptionButtonProps> = ({
  interval,
  label,
  selectedIntervals,
  toggleInterval,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.intervalSelectButton,
        selectedIntervals.includes(interval) ? styles.selected : null,
      ]}
      onPress={() => toggleInterval(interval)}
    >
      <Text
        style={
          selectedIntervals.includes(interval)
            ? styles.selectedText
            : styles.unselectedText
        }
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  intervalSelectButton: {
    padding: 5,
    margin: 3,
    borderRadius: 5,
    backgroundColor: "#ccc",
  },
  selected: { backgroundColor: "#DDA0DD" },
  selectedText: { color: "#fff" },
  unselectedText: { color: "#000" },
});

export default OptionButton;
