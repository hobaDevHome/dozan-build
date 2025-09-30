import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSettings } from "@/context/SettingsContext";

const UpgradeModal = ({
  visible,
  onClose,
  onUpgrade,
}: {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}) => {
  const { state, dispatch } = useSettings();

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.upgradeModalContainer}>
        <View style={styles.upgradeModalContent}>
          <Ionicons name="lock-closed" size={48} color="#FF6B6B" />

          <Text style={styles.upgradeTitle}>
            {state.labels.upgradeRequired}
          </Text>

          <Text style={styles.upgradeMessage}>
            {state.labels.freeLimitReached}
          </Text>

          <Text style={styles.upgradeSubtitle}>
            {state.labels.upgradeToUnlock}
          </Text>

          {/* قائمة المزايا */}
          <View style={styles.upgradeFeatures}>
            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>
                {state.labels.unlimitedQuestions}
              </Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>{state.labels.allLevels}</Text>
            </View>

            <View style={styles.featureItem}>
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
              <Text style={styles.featureText}>{state.labels.noAds}</Text>
            </View>
          </View>

          {/* أزرار التحكم */}
          <View style={styles.upgradeButtons}>
            <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
              <Text style={styles.upgradeButtonText}>
                {state.labels.upgradeNow}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.laterButton} onPress={onClose}>
              <Text style={styles.laterButtonText}>
                {state.labels.maybeLater}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  upgradeModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 20,
  },
  upgradeModalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    width: "100%",
    maxWidth: 400,
  },
  upgradeTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  upgradeMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 4,
    lineHeight: 22,
  },
  upgradeSubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    marginBottom: 24,
  },
  upgradeFeatures: {
    width: "100%",
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  featureText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  upgradeButtons: {
    width: "100%",
    gap: 12,
  },
  upgradeButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  upgradeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  laterButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
  },
  laterButtonText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default UpgradeModal;
