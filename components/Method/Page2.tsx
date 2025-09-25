import { View, Text, StyleSheet, TextStyle } from "react-native"; // تمت إضافة TextStyle
import React from "react";
import { useSettings } from "../../context/SettingsContext";

const Page2 = () => {
  const { state } = useSettings(); // لم نعد بحاجة إلى dispatch هنا
  const labels = state.labels.metodTextPage2;

  const isRTL = state.language === "ar" || state.language === "fa";

  // كائن الـ style الديناميكي الذي يحل كل المشاكل
  const dynamicStyle: TextStyle = {
    writingDirection: isRTL ? "rtl" : "ltr",
    textAlign: isRTL ? "right" : "left",
  };

  return (
    <View style={{ flex: 1 }}>
      {/* title  */}
      <Text style={[styles.subtitle, dynamicStyle]}>{labels.title}</Text>

      {/* sec1 */}
      <Text style={[styles.text, dynamicStyle]}>{labels.sec1}</Text>

      {/* sec2 */}
      {/* 
        العنصر highlight له textAlign: 'center' في الـ style الأساسي.
        إذا أردت أن يبقى في المنتصف دائماً، لا تطبق عليه dynamicStyle.
        إذا أردت أن تتم محاذاته لليمين/اليسار، قم بتطبيق dynamicStyle واحذف textAlign: 'center' من styles.highlight.
        سأفترض أنك تريده أن يبقى في المنتصف.
      */}
      <Text
        style={[styles.highlight, { writingDirection: isRTL ? "rtl" : "ltr" }]}
      >
        {labels.sec2}
      </Text>

      {/* sec3 */}
      <Text style={[styles.text, dynamicStyle]}>{labels.sec3}</Text>

      {/* sec4*/}
      <Text style={[styles.text, dynamicStyle]}>{labels.sec4}</Text>
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
