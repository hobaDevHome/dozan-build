import React from "react";
import { Text, StyleSheet, TextStyle } from "react-native";
import { useSettings } from "../../context/SettingsContext"; // <-- تأكد من أن هذا المسار صحيح!

// نقوم بتعريف أنواع الـ props لـ TypeScript
// هذا يسمح لنا بتمرير أي prop يقبله مكون Text الأصلي
type AppTextProps = Text["props"];

const AppText = (props: AppTextProps) => {
  const { state } = useSettings();
  const isRTL = state.language === "ar" || state.language === "fa";

  // كائن الـ style الديناميكي الذي يحتوي على الحل النهائي
  const dynamicStyle: TextStyle = {
    writingDirection: isRTL ? "rtl" : "ltr",
    // إذا كان النص له محاذاة محددة (مثل 'center')، احترمها.
    // وإلا، طبق المحاذاة الافتراضية (right لـ RTL و left لـ LTR).
    textAlign:
      props.style && (StyleSheet.flatten(props.style) as TextStyle).textAlign
        ? (StyleSheet.flatten(props.style) as TextStyle).textAlign
        : isRTL
        ? "right"
        : "left",
  };

  return (
    // ...props لتمرير كل الخصائص (مثل children)
    // نضع dynamicStyle في النهاية لضمان الأولوية
    <Text {...props} style={[props.style, dynamicStyle]} />
  );
};

export default AppText;
