import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import React from "react";
import { useSettings } from "../../context/SettingsContext";

const Page2 = () => {
  const { state, dispatch } = useSettings();
  const labels = state.labels.metodTextPage2;
  return (
    <View style={{ flex: 1 }}>
      {/* title  */}
      <Text style={styles.subtitle}>{labels.title}</Text>

      {/* sec1 */}
      <Text style={styles.text}>{labels.sec1}</Text>

      {/* sec2 */}
      <Text style={styles.highlight}>{labels.sec2}</Text>

      {/* sec3 */}
      <Text style={styles.text}>{labels.sec3}</Text>

      {/* sec4*/}
      <Text style={styles.text}>{labels.sec4}</Text>
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
});

export default Page2;
