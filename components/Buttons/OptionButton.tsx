import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";

type OptionButtonProps = {
  interval: string;
  currentInterval: string | null;
  userSelection: string | null;
  handleSelection: (nterval: string) => void;
  isAnswered: boolean;
  label: string | null;
};

const OptionButton: React.FC<OptionButtonProps> = ({
  interval,
  currentInterval,
  userSelection,
  handleSelection,
  isAnswered,
  label,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.intervalButton,
        userSelection === interval &&
          (interval === currentInterval ? styles.correct : styles.wrong),
      ]}
      onPress={() => handleSelection(interval)}
      disabled={isAnswered}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  intervalButton: {
    backgroundColor: "#fbe0cb",
    padding: 15,
    borderRadius: 5,
    margin: 5,
  },
  correct: { borderColor: "green", borderWidth: 3 },
  wrong: { borderColor: "red", borderWidth: 3 },

  buttonText: {
    color: "#512a1d",
    textAlign: "center",
    fontSize: 20,
    marginRight: 8,
  },
});

export default OptionButton;
