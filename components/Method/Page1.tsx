import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { useSettings } from "../../context/SettingsContext";

const Page1 = () => {
  const { state } = useSettings();
  const labels = state.labels.metodTextPage1;

  // تحديد إذا كانت اللغة الحالية تتطلب اتجاه من اليمين لليسار
  const isRTL = state.language === "ar" || state.language === "fa";

  // إنشاء كائن style ديناميكي بناءً على اللغة
  // هذا سيضيف اتجاه الكتابة والمحاذاة الصحيحة
  const directionStyle = {
    writingDirection: isRTL ? "rtl" : "ltr",
    textAlign: isRTL ? "right" : "left",
  };

  return (
    <View style={{ flex: 1 }}>
      {/* title  */}
      {/* العناوين التي لها textAlign: 'center' لا تحتاج لتغيير المحاذاة */}
      <Text
        style={[styles.subtitle, { writingDirection: isRTL ? "rtl" : "ltr" }]}
      >
        {labels.title}
      </Text>

      {/* sec1 */}
      <Text style={[styles.text, directionStyle]}>{labels.sec1}</Text>

      {/* sec2 */}
      <Text style={[styles.text, directionStyle]}>{labels.sec2}</Text>

      {/* sec3 */}
      <Text style={[styles.text, directionStyle]}>{labels.sec3}</Text>

      {/* sec4*/}
      <Text style={[styles.text, directionStyle]}>{labels.sec4}</Text>

      {/* sec5 */}
      <Text style={[styles.blueText, directionStyle]}>{labels.sec5}</Text>

      {/* sec6- sapn - sec6 */}
      <Text style={[styles.text, directionStyle]}>
        <Text style={{ fontWeight: "bold" }}>{labels.sec6span}</Text>{" "}
        {labels.sec6}
      </Text>
      {/* sec7- sapn - sec7 */}
      <Text style={[styles.text, directionStyle]}>
        <Text style={{ fontWeight: "bold" }}>{labels.sec7span}</Text>{" "}
        {labels.sec7}
      </Text>
      {/* sec8- sapn - sec8 */}
      <Text style={[styles.text, directionStyle]}>
        <Text style={{ fontWeight: "bold" }}>{labels.sec8span}</Text>{" "}
        {labels.sec8}
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
    // بما أن هذا العنوان الرئيسي قد يكون في المنتصف أو يبدأ من طرف الشاشة،
    // يمكن إضافة textAlign: 'center' هنا إذا أردت أن يكون في المنتصف دائماً
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
