import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";

type OptionButtonProps = {
  interval: string;
  label: string;
  selectedIntervals: string[];
  toggleInterval: (interval: string) => void;
  isLocked: boolean;
};

const OptionButton: React.FC<OptionButtonProps> = ({
  interval,
  label,
  selectedIntervals,
  toggleInterval,
  isLocked,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.intervalSelectButton,
        selectedIntervals.includes(interval) ? styles.selected : null,
      ]}
      onPress={() => toggleInterval(interval)}
    >
      {isLocked && (
        <View
          style={[
            styles.proBadge,
            { backgroundColor: isLocked ? "#098a9b" : "#FFD700" },
          ]}
        >
          <Ionicons
            name={isLocked ? "lock-closed" : "star"}
            size={12}
            color={isLocked ? "#FFF" : "#000"}
          />
          <Text
            style={[
              styles.proBadgeText,
              { color: isLocked ? "#FFF" : "#000", marginLeft: 4 },
            ]}
          >
            PRO
          </Text>
        </View>
      )}
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
    flexDirection: "row",
    justifyContent: "center",
  },
  selected: { backgroundColor: "#e286e2" },
  selectedText: { color: "#fff" },
  unselectedText: { color: "#aeaeae" },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
    marginRight: 8,
  },
  proBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  lockOverlay: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  lockText: {
    fontSize: 10,
    color: "#FFF",
    fontWeight: "bold",
    marginLeft: 4,
  },
});

export default OptionButton;
