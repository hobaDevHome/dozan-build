import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import React from "react";
import { RouteProp, useRoute } from "@react-navigation/native";
import { router, useNavigation } from "expo-router";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSettings } from "@/context/SettingsContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import Foundation from "@expo/vector-icons/Foundation";
import { Maqam } from "@/constants/scales";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
type TrainingScreenParams = {
  id: string;
  scale: string;
  levelChoices: string[];
  label: string;
};

type PlayParams = {
  id: string;
  scale: string;
  levelChoices: string[];
  label: string;
};

type RootStackParamList = {
  "Training/play": PlayParams;
  "Training/listen": PlayParams;
};
const TrainingScreen = () => {
  const { state, dispatch } = useSettings();
  const trainingLevelLables =
    state.labels.basicTrainingPages.basicTrainingLevel;
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  const { id, scale, levelChoices, label } = state.trainingParams || {};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>
        {trainingLevelLables.describtion} :
        {state.labels.basicTrainingPages.basicTrainingHome[scale as Maqam]}
      </Text>

      <View style={styles.playButtonContiner}>
        <TouchableOpacity
          style={[styles.activityCard, styles.button1]}
          onPress={() =>
            router.push({
              pathname: "/Training/play",
              params: {
                id: id,
                scale: scale,
                levelChoices: levelChoices,
                label: label,
              },
            })
          }
          activeOpacity={0.8}
        >
          <View
            style={{
              flexDirection: state.language === "ar" ? "row-reverse" : "row",
              marginBottom: 12,
            }}
          >
            <MaterialCommunityIcons
              name="weight-lifter"
              size={28}
              color="#fff"
            />
          </View>
          <Text style={styles.activityTitle}>{trainingLevelLables.play}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.activityCard, styles.button2]}
          onPress={() =>
            router.push({
              pathname: "/Training/listen",
              params: {
                id: id,
                scale: scale,
                levelChoices: levelChoices,
                label: label,
              },
            })
          }
        >
          <View
            style={{
              flexDirection: state.language === "ar" ? "row-reverse" : "row",
              marginBottom: 12,
            }}
          >
            <AntDesign name="sound" size={24} color="#fff" />
          </View>
          <Text style={styles.activityTitle}>{trainingLevelLables.listen}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
  },

  buttonText: {
    fontSize: 18,
    color: "#5c3829",
    marginLeft: 5,
  },

  playButtonContiner: {
    width: "100%",
    marginTop: 20,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 10,
    marginTop: 18,
    textAlign: "left",

    marginLeft: 24,
  },
  subTitle: {
    fontSize: 18,
    color: "#5c3829",
    marginLeft: 5,
    marginTop: 10,
  },
  playButton: {
    backgroundColor: "#f3b7ad",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  listenButton: {
    backgroundColor: "#80cdc7",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
    marginBottom: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },

  buttonIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  activityCard: {
    width: "47%",
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
  button1: {
    backgroundColor: "#FF6B6B",
  },
  button2: {
    backgroundColor: "#4ECDC4",
  },
});

export default TrainingScreen;
