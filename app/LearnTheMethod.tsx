import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import React, { useState, useRef, useEffect } from "react";
import Carousel from "react-native-reanimated-carousel";

import Page1 from "../components/Method/Page1";
import Page2 from "../components/Method/Page2";
import Page3 from "../components/Method/Page3";
import Page4 from "../components/Method/Page4";
import Page5 from "../components/Method/Page5";
import Page6 from "../components/Method/Page6";

const SLIDER_WIDTH = Dimensions.get("window").width;
const SLIDER_HEIGHT = Dimensions.get("window").height;
const DOTS_HEIGHT = 130;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 1);

const data = [
  { id: "1", component: Page1 },
  { id: "2", component: Page2 },
  { id: "3", component: Page3 },
  // { id: "4", component: Page4 },
  // { id: "5", component: Page5 },
];

const LearnTheMethod = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<any>(null);

  const renderItem = ({ item }: { item: (typeof data)[0] }) => {
    // "Component" is a dynamic component
    const SlideContent = item.component;
    return (
      <View style={styles.slide}>
        <SlideContent />
      </View>
    );
  };

  const handleDotPress = (index: number) => {
    carouselRef.current?.snapToItem(index);
  };

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        loop={false} // Disable looping
        width={SLIDER_WIDTH}
        height={SLIDER_HEIGHT - DOTS_HEIGHT}
        autoPlay={false}
        data={data}
        scrollAnimationDuration={500}
        onSnapToItem={(index) => setActiveSlide(index)}
        renderItem={renderItem}
        snapEnabled // to make it swipe properly and fix dots indicator
      />

      <View style={styles.paginationContainer}>
        {data.map((_, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dot,
              activeSlide === index ? styles.activeDot : styles.inactiveDot,
            ]}
            onPress={() => handleDotPress(index)}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  slide: {
    width: ITEM_WIDTH,
    height: SLIDER_HEIGHT - DOTS_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    padding: 20,
    marginHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
    textAlign: "center",
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: "#007bff",
  },
  inactiveDot: {
    backgroundColor: "#a1b5c8",
  },
});

export default LearnTheMethod;
