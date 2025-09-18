import React from "react";
import {
  Image,
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSettings } from "../context/SettingsContext";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { ScrollView } from "react-native";
type RootStackParamList = {
  Home: undefined;
  BasicTraining: undefined;
  LearnTheMethod: undefined;
  "IntroGame/index": undefined;
  MelodicDictations: undefined;
  intervals: undefined;
  maqamat: undefined;
  "Training/index": undefined;
  playground: undefined;
  "Dictations/index": undefined;
};

export default function HomeScreen() {
  type NavigationProps = NavigationProp<RootStackParamList>;

  const navigation = useNavigation<NavigationProps>();
  const { state } = useSettings();

  const navigateTo = (screenName: keyof RootStackParamList) => {
    navigation.navigate(screenName);
  };

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1 }}
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      horizontal={false}
    >
      <View style={styles.container}>
        <Text
          style={[
            styles.sectionTitle,
            {
              alignSelf: state.language === "ar" ? "flex-end" : "flex-start",
              marginLeft: state.language === "ar" ? 0 : 24,
              marginRight: state.language === "ar" ? 24 : 0,
            },
          ]}
        >
          {state.labels.chooseAnAcitivity}
        </Text>
        {/* Buttons Container */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.activityCard, styles.button1]}
            onPress={() => navigateTo("IntroGame/index")}
            activeOpacity={0.8}
          >
            <View
              style={{
                flexDirection: state.language === "ar" ? "row-reverse" : "row",
                marginBottom: 12,
              }}
            >
              <Ionicons name="game-controller" size={30} color="#fff" />
            </View>
            <Text style={styles.activityTitle}>{state.labels.introGame}</Text>
            <Text style={styles.activitySubtitle}>
              {state.labels.homePage.testYouEar}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.activityCard, styles.button2]}
            onPress={() => navigateTo("LearnTheMethod")}
          >
            <View
              style={{
                flexDirection: state.language === "ar" ? "row-reverse" : "row",
                marginBottom: 12,
              }}
            >
              <MaterialIcons
                name="school"
                size={24}
                color="#fff"
                style={styles.buttonIcon}
              />
            </View>
            <Text style={styles.activityTitle}>{state.labels.learnMethod}</Text>
            <Text style={styles.activitySubtitle}>
              {state.labels.homePage.knowAboutMaqams}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.activityCard, styles.button3]}
            onPress={() => navigateTo("Training/index")}
          >
            <View
              style={{
                flexDirection: state.language === "ar" ? "row-reverse" : "row",
                marginBottom: 12,
              }}
            >
              <MaterialIcons
                name="fitness-center"
                size={24}
                color="#fff"
                style={styles.buttonIcon}
              />
            </View>
            <Text style={styles.activityTitle}>
              {state.labels.basicTraining}
            </Text>
            <Text style={styles.activitySubtitle}>
              {state.labels.homePage.timeForTraining}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.activityCard, styles.button4]}
            onPress={() => navigateTo("Dictations/index")}
          >
            <View
              style={{
                flexDirection: state.language === "ar" ? "row-reverse" : "row",
                marginBottom: 12,
              }}
            >
              <FontAwesome
                name="assistive-listening-systems"
                color="#fff"
                size={24}
                style={styles.buttonIcon}
              />
            </View>
            <Text style={styles.activityTitle}>
              {state.labels.melodicDictations}
            </Text>
            <Text style={styles.activitySubtitle}>
              {state.labels.homePage.abitOfdictations}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.activityCard, styles.button5]}
            onPress={() => navigateTo("intervals")}
          >
            <View
              style={{
                flexDirection: state.language === "ar" ? "row-reverse" : "row",
                marginBottom: 12,
              }}
            >
              <MaterialIcons
                name="graphic-eq"
                size={24}
                color="#fff"
                style={styles.buttonIcon}
              />
            </View>
            <Text style={styles.activityTitle}>{state.labels.intervals}</Text>
            <Text style={styles.activitySubtitle}>
              {state.labels.homePage.diffBetweenIntervals}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.activityCard, styles.button6]}
            onPress={() => navigateTo("maqamat")}
          >
            <View
              style={{
                flexDirection: state.language === "ar" ? "row-reverse" : "row",
                marginBottom: 12,
              }}
            >
              <MaterialIcons
                name="library-music"
                size={24}
                color="#fff"
                style={styles.buttonIcon}
              />
            </View>
            <Text style={styles.activityTitle}>{state.labels.maqamat}</Text>
            <Text style={styles.activitySubtitle}>
              {state.labels.homePage.guessTheMaqam}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.activityCard, styles.button7]}
            onPress={() => navigateTo("playground")}
          >
            <View
              style={{
                flexDirection: state.language === "ar" ? "row-reverse" : "row",
                marginBottom: 12,
              }}
            >
              <MaterialIcons
                name="piano"
                size={24}
                color="#fff"
                style={styles.buttonIcon}
              />
            </View>
            <Text style={styles.activityTitle}>{state.labels.Playground}</Text>
            <Text style={styles.activitySubtitle}>
              {state.labels.homePage.someFun}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
    alignItems: "center",
    width: "100%", // 🔑 يمنع الزيادة بالعرض
    maxWidth: "100%", // 🔑 برضو زيادة أمان
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    marginTop: 18,
    textAlign: "left",

    marginLeft: 24,
  },

  buttonContainer: {
    width: "90%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
  },
  button: {
    paddingVertical: 30,
    marginVertical: 10,
    width: "48%", // Two columns
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  activityCard: {
    width: "46%",
    aspectRatio: 1,
    borderRadius: 20,
    padding: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 12,
  },
  iconContainer: {
    marginBottom: 12,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 4,
  },
  activitySubtitle: {
    fontSize: 12,
    color: "#FFFFFF",
    textAlign: "center",
    opacity: 0.9,
  },
  buttonContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontSize: 18,
    textTransform: "uppercase",
    marginRight: 8,
  },
  button1: {
    backgroundColor: "#FF6B6B",
  },
  button2: {
    backgroundColor: "#4ECDC4",
  },
  button3: {
    backgroundColor: "#45B7D1",
  },
  button4: {
    backgroundColor: "#96CEB4",
  },
  button5: {
    backgroundColor: "#eecb59",
  },
  button6: {
    backgroundColor: "#DDA0DD",
  },
  button7: {
    backgroundColor: "#FFB347",
  },
  buttonIcon: {
    marginRight: 8,
  },
});
