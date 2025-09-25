import { View, Text, StyleSheet, TextStyle } from "react-native"; // تمت إضافة TextStyle
import React from "react";
import { useSettings } from "../../context/SettingsContext";
import AppText from "../ui/AppText";

const Page2 = () => {
  const { state } = useSettings(); // لم نعد بحاجة إلى dispatch هنا
  const labels = state.labels.metodTextPage2;

  return (
    <View style={{ flex: 1 }}>
      <AppText style={styles.subtitle}>{labels.title}</AppText>

      <AppText style={styles.text}>{labels.sec1}</AppText>

      <AppText style={styles.highlight}>{labels.sec2}</AppText>

      {/* sec3 */}
      <AppText style={styles.text}>{labels.sec3}</AppText>

      {/* sec4*/}
      <AppText style={styles.text}>{labels.sec4}</AppText>
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
    textAlign: "center", // هذا النمط سيجعل النص في المنتصف
    padding: 15,
    margin: 20,
  },
});

export default Page2;
