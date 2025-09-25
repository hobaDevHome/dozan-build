import React, { useState, useRef } from "react"; // <-- 1. استيراد الـ Hooks من 'react'
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native"; // <-- 2. استيراد المكونات من 'react-native'
import Carousel, { ICarouselInstance } from "react-native-reanimated-carousel";

// ... باقي المكونات (Page1, Page2, etc.)
import Page1 from "../components/Method/Page1";
import Page2 from "../components/Method/Page2";
import Page3 from "../components/Method/Page3";
import Page4 from "../components/Method/Page4";
import Page5 from "../components/Method/Page5";
import Page6 from "../components/Method/Page6";
import Page10 from "@/components/Method/Page10";
import Page11 from "@/components/Method/Page11";
import Page9 from "@/components/Method/Page9";
import Page8 from "@/components/Method/Page8";
import Page7 from "@/components/Method/Page7";

const SLIDER_WIDTH = Dimensions.get("window").width;
const SLIDER_HEIGHT = Dimensions.get("window").height;
const DOTS_HEIGHT = 130;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 1);

const data = [
  { id: "1", component: Page1 },
  { id: "2", component: Page2 },
  { id: "3", component: Page3 },
  { id: "4", component: Page4 },
  { id: "5", component: Page5 },
  { id: "6", component: Page6 },
  { id: "7", component: Page7 },
  { id: "8", component: Page8 },
  { id: "9", component: Page9 },
  { id: "10", component: Page10 },
  { id: "11", component: Page11 },
];

const LearnTheMethod = () => {
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselRef = useRef<ICarouselInstance>(null);

  const renderItem = ({ item }: { item: (typeof data)[0] }) => {
    const SlideContent = item.component;
    return (
      <View style={styles.slide}>
        <SlideContent />
      </View>
    );
  };

  const handleDotPress = (index: number) => {
    if (carouselRef.current) {
      // استخدمنا scrollTo بدلاً من snapToItem
      carouselRef.current.scrollTo({
        count: index - activeSlide,
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <Carousel
        ref={carouselRef}
        loop={false}
        width={SLIDER_WIDTH}
        height={SLIDER_HEIGHT - DOTS_HEIGHT}
        autoPlay={false}
        data={data}
        scrollAnimationDuration={500}
        onSnapToItem={(index) => setActiveSlide(index)}
        renderItem={renderItem}
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

// ... Styles (تبقى كما هي)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  slide: {
    width: ITEM_WIDTH - 20,
    height: SLIDER_HEIGHT - DOTS_HEIGHT,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 0,

    marginLeft: 10,
    marginRight: 15,
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
    marginTop: 10,
  },
  activeDot: {
    backgroundColor: "#007bff",
  },
  inactiveDot: {
    backgroundColor: "#a1b5c8",
  },
});

export default LearnTheMethod;
