import { View, Text, StyleSheet, TextStyle } from "react-native";
import React from "react";
import { useSettings } from "../../context/SettingsContext";
import AppText from "../ui/AppText";

const Page1 = () => {
  const { state } = useSettings();
  const labels = state.labels.metodTextPage1;

  return (
    <View style={{ flex: 1 }}>
      <AppText style={styles.subtitle}>{labels.title}</AppText>

      <AppText style={styles.text}>{labels.sec1}</AppText>

      <AppText style={styles.text}>{labels.sec2}</AppText>

      <AppText style={styles.text}>{labels.sec3}</AppText>

      <AppText style={styles.text}>{labels.sec4}</AppText>

      <AppText style={styles.blueText}>{labels.sec5}</AppText>

      <AppText style={styles.text}>
        <Text style={{ fontWeight: "bold" }}>{labels.sec6span}</Text>{" "}
        {labels.sec6}
      </AppText>
      <AppText style={styles.text}>
        <Text style={{ fontWeight: "bold" }}>{labels.sec7span}</Text>{" "}
        {labels.sec7}
      </AppText>
      <AppText style={styles.text}>
        <Text style={{ fontWeight: "bold" }}>{labels.sec8span}</Text>{" "}
        {labels.sec8}
      </AppText>
    </View>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  content: {
    padding: 20,
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    textAlign: "center",
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 32,
    color: "#24b896",
    marginBottom: 10,
    marginTop: 20,
  },
  text: {
    fontSize: 16,
    color: "#000",
    marginBottom: 20,
    // تم حذف أي textAlign من هنا لكي يتم التحكم به ديناميكياً
  },
  blueText: {
    color: "#24b896",
    fontWeight: "bold",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#000",
    padding: 15,
    marginVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 18,
    color: "#fff",
  },
  highlight: {
    backgroundColor: "#ebf9fc",
    textAlign: "center", // هذا العنصر سيبقى في المنتصف دائماً
    padding: 15,
    margin: 20,
  },
});

export default Page1;
