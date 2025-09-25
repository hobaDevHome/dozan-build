import { View, Text, StyleSheet, Image } from "react-native";
import React from "react";
import { useSettings } from "../../context/SettingsContext";

const Page6 = () => {
  const { state } = useSettings();
  const labels = state.labels.metodTextPage6;
  const isRTL = state.language === "ar" || state.language === "fa";
  return (
    <View style={{ flex: 1 }}>
      {/* title  */}
      <Text
        style={[styles.subtitle, { writingDirection: isRTL ? "rtl" : "ltr" }]}
      >
        {labels.title}
      </Text>

      {/* sec1 */}
      <Text style={[styles.text, { writingDirection: isRTL ? "rtl" : "ltr" }]}>
        {labels.sec1}
      </Text>

      <View style={styles.scaleImageContainer}>
        <Image
          source={require("@/assets/images/scales/methodScales/agam_ar.png")}
          style={styles.maqamScaleImage}
        />
      </View>

      {/* sec2 */}
      <Text style={[styles.text, { writingDirection: isRTL ? "rtl" : "ltr" }]}>
        {labels.sec2}
      </Text>
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
    textAlign: "center",
    padding: 15,
    margin: 20,
  },
  scaleImageContainer: {
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    marginTop: 10,
    width: "90%",
    alignSelf: "center",
  },
  maqamScaleImage: {
    width: 300,
    height: 100,
    resizeMode: "contain",
    marginTop: 10,
  },
});

export default Page6;
