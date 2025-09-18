import React, { ReactElement } from "react";
import { View, Image, StyleSheet, Dimensions, ScrollView } from "react-native";

interface ParallaxScrollViewProps {
  headerImage: { uri: string } | undefined;
  headerHeight: number;
  headerBackgroundColor: string;
  children: React.ReactNode[];
}

const ParallaxScrollView: React.FC<ParallaxScrollViewProps> = ({
  headerImage,
  headerHeight,
  headerBackgroundColor,
  children,
}) => {
  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: headerHeight, overflow: "hidden" }}>
        {headerImage && headerImage.uri ? (
          <Image
            source={{ uri: headerImage.uri }}
            style={{
              height: headerHeight,
              width: "100%",
              resizeMode: "cover",
            }}
          />
        ) : null}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: headerBackgroundColor,
          }}
        />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
      >
        {children}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 20,
    flex: 1,
  },
});

export default ParallaxScrollView;
