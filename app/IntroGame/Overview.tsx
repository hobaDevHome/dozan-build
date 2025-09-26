import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useSettings } from "../../context/SettingsContext";
import AppText from "@/components/ui/AppText";

const Overview = () => {
  const { state, dispatch } = useSettings();
  const overviewLabels = state.labels.introGamePage.overViewPage;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <AppText style={styles.subtitle}>{overviewLabels.header}</AppText>
      {/* sec1 */}
      <AppText style={[styles.text, { fontWeight: "bold" }]}>
        {overviewLabels.textSections.sec1}
      </AppText>

      {/* sec2 */}
      <AppText style={styles.text}>{overviewLabels.textSections.sec2}</AppText>

      {/* sec3 */}
      <AppText style={styles.text}>{overviewLabels.textSections.sec3}</AppText>

      {/* sec4 */}

      <AppText style={styles.text}>{overviewLabels.textSections.sec4}</AppText>
      {/* sec5  - sec 5 span*/}
      <AppText style={styles.text}>
        <AppText style={{ fontWeight: "bold" }}>
          {overviewLabels.textSections.sec5span}
        </AppText>
        {overviewLabels.textSections.sec5}
      </AppText>
      {/* {/* se6/} */}
      <AppText style={styles.text}>{overviewLabels.textSections.sec6}</AppText>

      {/* {/* sec7/} */}
      <AppText style={styles.highlight}>
        <AppText style={[styles.text, { textAlign: "center" }]}>
          {overviewLabels.textSections.sec7}
        </AppText>
      </AppText>
      {/* {/* sec8/} */}
      <AppText style={styles.text}>{overviewLabels.textSections.sec8}</AppText>

      {/* {/* sec9 - sec9-span/} */}
      <AppText style={styles.text}>
        <AppText style={{ fontWeight: "bold" }}>
          {overviewLabels.textSections.sec9span}
        </AppText>
        {overviewLabels.textSections.sec9}
      </AppText>
      {/* {/* sec99/} */}
      <AppText style={styles.text}>{overviewLabels.textSections.sec99}</AppText>
      {/* {/* sec10/} */}
      <AppText style={styles.text}>{overviewLabels.textSections.sec10}</AppText>

      {/* {/* sec11 - sec11-span/} */}
      <AppText style={styles.text}>
        <AppText style={{ fontWeight: "bold" }}>
          {" "}
          {overviewLabels.textSections.sec11span}
        </AppText>{" "}
        {overviewLabels.textSections.sec11}
      </AppText>
      {/* {/* sec12/} */}
      <AppText style={styles.text}>{overviewLabels.textSections.sec12}</AppText>
      {/* {/* sec13/} */}
      <AppText style={styles.text}>{overviewLabels.textSections.sec13}</AppText>
      {/* {/* sec14/} */}
      <AppText style={styles.text}>{overviewLabels.textSections.sec14}</AppText>
      {/* {/* sec15/} */}
      <AppText style={styles.text}>{overviewLabels.textSections.sec15}</AppText>
    </ScrollView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: "#fff",
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
});

export default Overview;
