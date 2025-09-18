import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { useSettings } from "../../context/SettingsContext";

const Overview = () => {
  const { state, dispatch } = useSettings();
  const overviewLabels = state.labels.introGamePage.overViewPage;
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.subtitle}>{overviewLabels.header}</Text>
      {/* sec1 */}
      <Text style={[styles.text, { fontWeight: "bold" }]}>
        {overviewLabels.textSections.sec1}
      </Text>

      {/* sec2 */}
      <Text style={styles.text}>{overviewLabels.textSections.sec2}</Text>

      {/* sec3 */}
      <Text style={styles.text}>{overviewLabels.textSections.sec3}</Text>

      {/* sec4 */}

      <Text style={styles.text}>{overviewLabels.textSections.sec4}</Text>
      {/* sec5  - sec 5 span*/}
      <Text style={styles.text}>
        <Text style={{ fontWeight: "bold" }}>
          {overviewLabels.textSections.sec5span}
        </Text>
        {overviewLabels.textSections.sec5}
      </Text>
      {/* {/* se6/} */}
      <Text style={styles.text}>{overviewLabels.textSections.sec6}</Text>

      {/* {/* sec7/} */}
      <View style={styles.highlight}>
        <Text style={styles.text}>{overviewLabels.textSections.sec7}</Text>
      </View>
      {/* {/* sec8/} */}
      <Text style={styles.text}>{overviewLabels.textSections.sec8}</Text>

      {/* {/* sec9 - sec9-span/} */}
      <Text style={styles.text}>
        <Text style={{ fontWeight: "bold" }}>
          {" "}
          {overviewLabels.textSections.sec9span}
        </Text>{" "}
        {overviewLabels.textSections.sec9}
      </Text>
      {/* {/* sec99/} */}
      <Text style={styles.text}>{overviewLabels.textSections.sec99}</Text>
      {/* {/* sec10/} */}
      <Text style={styles.text}>{overviewLabels.textSections.sec10}</Text>

      {/* {/* sec11 - sec11-span/} */}
      <Text style={styles.text}>
        <Text style={{ fontWeight: "bold" }}>
          {" "}
          {overviewLabels.textSections.sec11span}
        </Text>{" "}
        {overviewLabels.textSections.sec11}
      </Text>
      {/* {/* sec12/} */}
      <Text style={styles.text}>{overviewLabels.textSections.sec12}</Text>
      {/* {/* sec13/} */}
      <Text style={styles.text}>{overviewLabels.textSections.sec13}</Text>
      {/* {/* sec14/} */}
      <Text style={styles.text}>{overviewLabels.textSections.sec14}</Text>
      {/* {/* sec15/} */}
      <Text style={styles.text}>{overviewLabels.textSections.sec15}</Text>
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
