import { DrawerNavigationProp } from "@react-navigation/drawer";

import { useState } from "react";
import "react-native-reanimated";

import { useNavigation } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
} from "react-native";

import { DrawerActions } from "@react-navigation/native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { Ionicons } from "@expo/vector-icons";

import Foundation from "@expo/vector-icons/Foundation";

import "react-native-gesture-handler";
import { useSettings } from "@/context/SettingsContext";
import { useRouter } from "expo-router";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
  { code: "fa", name: "فارسی", flag: "🇮🇷" }, // Persian (Iran)
  { code: "tr", name: "Türkçe", flag: "🇹🇷" }, // Turkish (Turkey)
];
const instruments = [
  { code: "piano", name: "piano", icon: "piano" },
  { code: "oud", name: "oud", icon: "guitar-acoustic" },
];
function CustomDrawerContent() {
  const navigation = useNavigation<DrawerNavigationProp<any>>();
  const router = useRouter();
  const { state, dispatch } = useSettings();
  const [autoQuestion, setAutoQuestion] = useState<boolean>(false);
  const [backToTonic, setBackToTonic] = useState<boolean>(false);
  const screens = [
    { key: "", name: state.labels.home, icon: "home-outline" },
    {
      key: "IntroGame",
      name: state.labels.introGame,
      icon: "game-controller-outline",
    },
    {
      key: "LearnTheMethod",
      name: state.labels.learnMethod,
      icon: "create-outline",
    },
    {
      key: "Training",
      name: state.labels.basicTraining,
      icon: "pulse-outline",
    },
    {
      key: "Dictations",
      name: state.labels.melodicDictations,
      icon: "ear-outline",
    },
    {
      key: "intervals",
      name: state.labels.intervals,
      icon: "analytics-outline",
    },
    {
      key: "maqamat",
      name: state.labels.maqamat,
      icon: "musical-notes-outline",
    },
    {
      key: "playground",
      name: state.labels.Playground,
      icon: "play-outline",
    },
  ];

  const toggleLanguage = (lang: "en" | "ar" | "fa" | "tr") => {
    dispatch({
      type: "SET_LANGUAGE",
      payload: lang,
    });
    // navigation.dispatch(DrawerActions.closeDrawer());
  };

  const toggleAutoQuestionJump = (auto: boolean) => {
    setAutoQuestion(auto);

    dispatch({
      type: "SET_AUTOQUESTIONJUMP",
      payload: auto,
    });
    // navigation.dispatch(DrawerActions.closeDrawer());
    console.log(state.autoQuestionJump);
  };

  const toggleBackToTonic = (back: boolean) => {
    setBackToTonic(back);
    dispatch({
      type: "SET_BACKTOTONIC",
      payload: back,
    });
    //  navigation.dispatch(DrawerActions.closeDrawer());
  };

  // a handler for choosieng hte innstrument
  const changeInstrument = (instrument: string) => {
    dispatch({
      type: "SET_INSTRUMENT",
      payload: instrument,
    });
    // navigation.dispatch(DrawerActions.closeDrawer());
  };

  const navigateTo = (screenName: string) => {
    console.log("navigate to:", screenName);
    router.push("/" + screenName);
    //navigation.dispatch(DrawerActions.closeDrawer());
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* // setting header and close button */}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.closeDrawer())}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>{state.labels.settings}</Text>
      </View>

      {/* Language Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{state.labels.language}</Text>
        <View style={styles.languageGrid}>
          {languages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              style={[
                styles.languageButton,
                state.language === lang.code && styles.languageButtonActive,
              ]}
              onPress={() => toggleLanguage(lang.code as any)}
            >
              <Text style={styles.languageFlag}>{lang.flag}</Text>
              <Text
                style={[
                  styles.languageName,
                  state.language === lang.code && styles.languageNameActive,
                ]}
              >
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      {/* instrumets Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{state.labels.Instrument}</Text>
        <View style={styles.languageGrid}>
          {instruments.map((inst) => (
            <TouchableOpacity
              key={inst.code}
              style={[
                styles.languageButton,
                state.instrument === inst.code && styles.instButtonActive,
              ]}
              onPress={() => changeInstrument(inst.code as any)}
            >
              <MaterialCommunityIcons
                name={inst.icon as any}
                size={20}
                color="#03866a"
                style={{ marginRight: 5 }}
              />

              <Text
                style={[
                  styles.languageName,
                  state.language === inst.code && styles.languageNameActive,
                ]}
              >
                {inst.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Settings Switches */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{state.labels.Preferences}</Text>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Foundation name="next" size={18} color="#666" />
            <Text style={styles.settingLabel}>{state.labels.autoJump}</Text>
          </View>
          <Switch
            value={autoQuestion}
            onValueChange={(value) => toggleAutoQuestionJump(value)}
            trackColor={{ false: "#E5E5E5", true: "#007AFF" }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Ionicons name="return-up-back" size={18} color="#666" />

            <Text style={styles.settingLabel}>{state.labels.backToTonic}</Text>
          </View>
          <Switch
            value={backToTonic}
            onValueChange={(value) => toggleBackToTonic(value)}
            trackColor={{ false: "#E5E5E5", true: "#007AFF" }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{state.labels.Navigation}</Text>
        {screens.map((screen) => (
          <TouchableOpacity
            key={screen.key}
            style={styles.navItem}
            onPress={() => navigateTo(screen.key)}
          >
            <Ionicons name={screen.icon as any} size={20} color="#007AFF" />
            <Text style={styles.navLabel}>{screen.name}</Text>
            <Ionicons name="chevron-forward" size={16} color="#999" />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

export default CustomDrawerContent;
const styles = StyleSheet.create({
  mobileContainer: { flex: 1, width: 500, justifyContent: "center" },
  switchContainer: { marginTop: 10, flexDirection: "row" },
  switch: { marginHorizontal: 10 },
  instContianer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
  },
  instIcon: {
    width: 100,
    height: 70,
    resizeMode: "contain",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  closeButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  button: {
    backgroundColor: "#ba68c8",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  link: {
    paddingVertical: 10,
  },
  linkText: {
    fontSize: 16,
    color: "#4e342e",
  },
  languagesContianer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  languageIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  languageGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
    borderWidth: 2,
    borderColor: "transparent",
    minWidth: "45%",
  },
  languageButtonActive: {
    backgroundColor: "#E3F2FD",
    borderColor: "#007AFF",
  },
  instButtonActive: {
    backgroundColor: "#ecfaf2",
    borderColor: "#0c915e",
  },
  languageFlag: {
    fontSize: 20,
    marginRight: 8,
  },
  languageName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666",
  },
  languageNameActive: {
    color: "#007AFF",
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  settingLabel: {
    fontSize: 13,
    color: "#333",
    marginLeft: 12,
  },
  navItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 4,
  },
  navLabel: {
    fontSize: 16,
    color: "#333",
    marginLeft: 12,
    flex: 1,
    textAlign: "left",
  },
});
