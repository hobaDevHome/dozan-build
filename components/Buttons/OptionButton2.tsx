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
    backgroundColor: "#eed4ee",
    width: "45%", // <-- هذا هو الجزء الأهم. 48% تترك مسافة 4% بين الزرين
    marginBottom: 10,
    alignItems: "center",
  },
  selected: { backgroundColor: "#e286e2" },
  selectedText: { color: "#fff" },
  unselectedText: { color: "#aeaeae" },
});

export default OptionButton;
