import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";

import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState, useCallback } from "react";
import "react-native-reanimated";
import { Drawer } from "expo-router/drawer";
import { router, Stack } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

import { DrawerActions } from "@react-navigation/native";

import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "@/hooks/useColorScheme";
import { SettingsProvider, useSettings } from "../context/SettingsContext";

import Head from "expo-router/head";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-gesture-handler";
import CustomDrawerContent from "../components/ui/Drawer";

// Prevent splash screen from auto-hiding before asset loading is complete
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();

  // تحميل الخطوط وأيضًا جلب الإعدادات من Context
  const [fontsLoaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  // الخطوة 2: استخدام useEffect لمراقبة تحميل كل شيء (الخطوط والإعدادات)
  useEffect(() => {
    // إذا تم تحميل الخطوط بنجاح
    if (fontsLoaded) {
      // قم بإخفاء السبلاش سكرين
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]); // هذا الـ hook سيعمل فقط عندما تتغير قيمة `fontsLoaded`

  // الخطوة 3: عرض "لا شيء" طالما أن الخطوط لم تُحمّل بعد
  // هذا يمنع ظهور وميض أو شاشة بيضاء قبل عرض التطبيق
  if (!fontsLoaded) {
    return null;
  }

  return (
    <SettingsProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <AppContent />
        </GestureHandlerRootView>
      </ThemeProvider>
    </SettingsProvider>
  );
}

function AppContent() {
  const { state } = useSettings();
  const [isWeb, setIsWeb] = useState(false);
  useEffect(() => {
    if (Platform.OS === "web") {
      setIsWeb(true);
    }
  }, []);

  if (!state) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    ); // Display a loading indicator
  }

  return (
    <View style={isWeb ? styles.mobileContainer : { flex: 1 }}>
      <Head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
      </Head>
      <Drawer drawerContent={() => <CustomDrawerContent />}>
        <Stack.Screen
          name="index"
          options={({ navigation }) => ({
            title: state.labels.appHeader,
            headerTitleStyle: {
              fontWeight: "bold",
              fontSize: 22,
              color: "#222", // title text color
            },
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => null,
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="settings-outline" size={28} color="black" />
              </TouchableOpacity>
            ),
          })}
        />

        <Stack.Screen
          name="Dictations/index"
          options={({ navigation }) => ({
            title: state.labels.dictations.title,
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={28} color="black" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="settings-outline" size={28} color="black" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Dictations/Dictaionsplay"
          options={({ navigation }) => ({
            title: state.labels.dictations.title,
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  router.replace("/Dictations"); // أو أي مسار تحبي ترجعي له بدل الهوم
                }}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={28} color="black" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="settings-outline" size={28} color="black" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="IntroGame/index"
          options={({ navigation }) => ({
            title: state.labels.introGamePage.header,
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={28} color="black" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="settings-outline" size={28} color="black" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="IntroGame/Level1"
          options={({ navigation }) => ({
            title: state.labels.introGamePage.levelPage.header,
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  router.replace("/IntroGame"); // أو أي مسار تحبي ترجعي له بدل الهوم
                }}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={28} color="black" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="settings-outline" size={28} color="black" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="IntroGame/Overview"
          options={({ navigation }) => ({
            title: state.labels.introGamePage.pages.overview,
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  router.replace("/IntroGame"); // أو أي مسار تحبي ترجعي له بدل الهوم
                }}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={28} color="black" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="settings-outline" size={28} color="black" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Training/index"
          options={({ navigation }) => ({
            title: state.labels.basicTrainingPages.basicTrainingHome.title,
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={28} color="black" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="settings-outline" size={28} color="black" />
              </TouchableOpacity>
            ),
          })}
        />

        <Stack.Screen
          name="Training/TrainingScreen"
          options={({ navigation }) => ({
            title: state.labels.basicTrainingPages.basicTrainingHome.title,
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  router.replace("/Training"); // أو أي مسار تحبي ترجعي له بدل الهوم
                }}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={28} color="black" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="settings-outline" size={28} color="black" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Training/play"
          options={({ navigation }) => ({
            title: state.labels.basicTrainingPages.basicTrainingLevel.play,
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  console.log("from play to training screen");
                  router.push("/Training/TrainingScreen"); // أو أي مسار تحبي ترجعي له بدل الهوم
                }}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={28} color="black" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="settings-outline" size={28} color="black" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="Training/listen"
          options={({ navigation }) => ({
            title: state.labels.basicTrainingPages.basicTrainingLevel.listen,
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => {
                  router.replace("/Training/TrainingScreen"); // أو أي مسار تحبي ترجعي له بدل الهوم
                }}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={28} color="black" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="settings-outline" size={28} color="black" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="LearnTheMethod"
          options={({ navigation }) => ({
            title: state.labels.learnMethod,
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={28} color="black" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="settings-outline" size={28} color="black" />
              </TouchableOpacity>
            ),
          })}
        />

        <Stack.Screen
          name="intervals"
          options={({ navigation }) => ({
            title: state.labels.intervals,
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={28} color="black" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="settings-outline" size={28} color="black" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="maqamat"
          options={({ navigation }) => ({
            title: state.labels.maqamat,
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={28} color="black" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="settings-outline" size={28} color="black" />
              </TouchableOpacity>
            ),
          })}
        />
        <Stack.Screen
          name="playground"
          options={({ navigation }) => ({
            title: state.labels.Playground,
            headerShown: true,
            headerTitleAlign: "center",
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ marginLeft: 10 }}
              >
                <Ionicons name="arrow-back" size={28} color="black" />
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
                style={{ marginRight: 10 }}
              >
                <Ionicons name="settings-outline" size={28} color="black" />
              </TouchableOpacity>
            ),
          })}
        />
      </Drawer>
    </View>
  );
}

const styles = StyleSheet.create({
  mobileContainer: { flex: 1, width: 380, justifyContent: "center" },
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
    padding: 20,
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
    fontSize: 14,
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
