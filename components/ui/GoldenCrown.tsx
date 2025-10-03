import { getBackgroundColorAsync } from "expo-navigation-bar";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Svg, { Path, G } from "react-native-svg";

type GoldenCrownProps = {
  size?: number;
  isLocked?: boolean;
};

const GoldenCrown: React.FC<GoldenCrownProps> = ({
  size = 14,
  isLocked = false,
}) => {
  return (
    <View style={styles.badgContainer}>
      <Svg width={size} height={size} viewBox="0 0 128 128">
        <Path
          d="M128 53.279c0 5.043-4.084 9.136-9.117 9.136-.091 0-.164 0-.255-.018l-8.914 34.06H18.286L8.734 65.01C3.884 64.81 0 60.808 0 55.892c0-5.043 4.084-9.136 9.117-9.136 5.032 0 9.117 4.093 9.117 9.136a9.557 9.557 0 0 1-.492 2.997l22.081 12.919 18.671-34.371a9.1 9.1 0 0 1-4.267-7.729c0-5.043 4.084-9.136 9.117-9.136s9.117 4.093 9.117 9.136a9.1 9.1 0 0 1-4.267 7.729l18.671 34.371 24.05-14.07a9.164 9.164 0 0 1-1.149-4.459c0-5.062 4.084-9.136 9.117-9.136 5.033 0 9.117 4.075 9.117 9.136zm-18.286 46.835H18.286v7.314h91.429v-7.314z"
          fill="#feb602"
        />
      </Svg>
    </View>
  );
};

export default GoldenCrown;

const styles = StyleSheet.create({
  badgContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#7f7f7f",
  },
});
