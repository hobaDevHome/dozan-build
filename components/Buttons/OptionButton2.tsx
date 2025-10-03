import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GoldenCrown from "../ui/GoldenCrown";
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
        <View style={styles.crownBadge}>
          <GoldenCrown size={18} isLocked={isLocked} />
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
    position: "relative",
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
  crownBadge: {
    marginLeft: 6,
    position: "absolute",
    top: -10,
    left: -15,
    zIndex: 1,
  },
});

export default OptionButton;
