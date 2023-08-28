import {
  View,
  Text,
  Animated,
  StyleSheet,
  StatusBar,
  Image,
  Pressable,
  ScrollView,
} from "react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  AntDesign,
  Ionicons,
  FontAwesome,
  MaterialCommunityIcons,
  Feather,
  Entypo,
} from "@expo/vector-icons";

const MainPlayer = ({ item, playNextTrack, playPrevTrack, sound }) => {
  const scrollViewRef = useRef(null);
  const [scrollX] = useState(new Animated.Value(0));
  const [isPlaying, setIsPlaying] = useState(false);
  const [playBackPosition, setPlayBackPosition] = useState(0);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);
  const [progress, setProgress] = useState(0);

  // Handle playback wick useEffect
  useEffect(() => {
    if (sound) {
      if (isPlaying) {
        sound.playAsync();
      }
    }
  }, [sound, isPlaying]);

  // Handle Play Pause button press
  const handlePlayPause = async () => {
    if (sound) {
      if (isPlaying) {
        await sound.pauseAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Update PlayBack Position and Progress
  const updatePosition = async () => {
    if (sound && isPlaying) {
      const status = await sound.getStatusAsync();
      const newPosition =
        (status.positionMillis / item.duration) * (scrollViewWidth * 2);
      setPlayBackPosition(status.positionMillis);
      scrollViewRef.current.scrollTo({ x: newPosition, animated: true });

      const newProgress = (status.positionMillis / item.duration) * 100;
      setProgress(newProgress);
    }
  };

  useEffect(() => {
    const intervalId = setInterval(updatePosition, 200);
    return () => clearInterval(intervalId);
  }, [sound, isPlaying]);

  const calculateGroupAverage = (samples, startIdx, groupSize) => {
    let sum = 0;
    for (let i = startIdx; i < startIdx + groupSize; i++) {
      sum += samples[i];
    }
    return sum / groupSize;
  };

  const topWaveform = useMemo(() => {
    return (
      <View
        style={{
          flexDirection: "row",
          transform: [{ scaleY: -1 }],
        }}
      >
        {Array.from({
          length: Math.ceil(item.trackWave.samples.length / 10),
        }).map((group, groupIndex) => {
          const startIdx = groupIndex * 6;
          const gropuAverage = calculateGroupAverage(
            item.trackWave.samples,
            startIdx,
            10
          );

          const bgColorInterpolation = scrollX.interpolate({
            inputRange: [
              (startIdx / item.trackWave.samples.length) *
                (scrollViewWidth * 2),
              ((startIdx + 10) / item.trackWave.samples.length) *
                (scrollViewWidth * 2),
            ],
            outputRange: ["white", "#FF5A18"],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={groupIndex}
              style={{
                width: 2,
                height: gropuAverage * 0.5,
                backgroundColor: bgColorInterpolation,
                marginLeft: 1,
              }}
            />
          );
        })}
      </View>
    );
  }, [item.trackWave.samples, scrollX, scrollViewWidth]);

  const bottomWaveform = useMemo(() => {
    return (
      <View
        style={{
          flexDirection: "row",
        }}
      >
        {Array.from({
          length: Math.ceil(item.trackWave.samples.length / 10),
        }).map((group, groupIndex) => {
          const startIdx = groupIndex * 6;
          const gropuAverage = calculateGroupAverage(
            item.trackWave.samples,
            startIdx,
            10
          );

          const bgColorInterpolation = scrollX.interpolate({
            inputRange: [
              (startIdx / item.trackWave.samples.length) *
                (scrollViewWidth * 2),
              ((startIdx + 10) / item.trackWave.samples.length) *
                (scrollViewWidth * 2),
            ],
            outputRange: ["white", "#FF956A"],
            extrapolate: "clamp",
          });

          return (
            <Animated.View
              key={groupIndex}
              style={{
                width: 2,
                height: gropuAverage * 0.3,
                backgroundColor: bgColorInterpolation,
                marginLeft: 1,
              }}
            />
          );
        })}
      </View>
    );
  }, [item.trackWave.samples, scrollX, scrollViewWidth]);

  return (
    <View style={styles.container}>
      <StatusBar animated={true} backgroundColor="black" />
      <Image source={{ uri: item.artwork_url }} style={styles.coverImage} />

      {/* Render Title */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={styles.titleContainer}>
          <View>
            <View style={styles.titleTextContainer}>
              <Text style={styles.titleText}>{item.title}</Text>
            </View>
          </View>
          <View style={{ backgroundColor: "black", padding: 5, marginTop: -5 }}>
            <Text style={styles.titleUserNameText}>{item.user.userName}</Text>
          </View>
        </View>
        <View style={styles.arrowDownContainer}>
          <AntDesign name="down" size={20} color="gray" />
        </View>
      </View>

      {/* Render play/pause button */}
      <View style={styles.buttonsRow}>
        <Pressable
          style={[styles.forwardBackButtons, isPlaying ? { opacity: 0 } : null]}
          onPress={playPrevTrack}
        >
          <Ionicons name="play-skip-back" size={20} color="white" />
        </Pressable>
        <Pressable
          style={[
            styles.playButton,
            isPlaying
              ? {
                  opacity: 0,
                  width: 200,
                  height: 200,
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 60,
                  // backgroundColor: "red",
                }
              : null,
          ]}
          onPress={handlePlayPause}
        >
          <FontAwesome name="play" size={18} color="white" />
        </Pressable>
        {isPlaying && (
          <Pressable
            style={{
              flex: 1,
              width: "100%",
              height: "100%",
              backgroundColor: "trasparent",
            }}
            onPress={handlePlayPause}
          ></Pressable>
        )}
        <Pressable
          style={[styles.forwardBackButtons, isPlaying ? { opacity: 0 } : null]}
          onPress={playNextTrack}
        >
          <Ionicons name="play-skip-forward" size={20} color="white" />
        </Pressable>
      </View>

      {/* Wave Animation */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        bounces={false}
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onLayout={(event) => {
          setScrollViewWidth(event.nativeEvent.layout.width);
        }}
        contentContainerStyle={{
          flexDirection: "row",
          paddingHorizontal: "25%",
          marginTop: 170,
        }}
      >
        {isPlaying ? (
          <View>
            {/* Top Waveform */}
            {topWaveform}

            {/* Display Timer */}
            <Animated.View
              style={{
                marginLeft: scrollX.interpolate({
                  inputRange: [0, scrollViewWidth * 2.2 - scrollViewWidth],
                  outputRange: ["0%", "100%"],
                  extrapolate: "clamp",
                }),
                position: "relative",
                marginTop: -15,
              }}
            >
              <View
                style={{
                  backgroundColor: "black",
                  width: 80,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "white", fontSize: 12 }}>
                  <Text>
                    {`${Math.floor(
                      ((progress / 100) * item.duration) / 1000 / 60
                    )}:${String(
                      Math.floor(
                        (((progress / 100) * item.duration) / 1000) % 60
                      )
                    ).padStart(2, "0")}`}{" "}
                  </Text>
                  <Text style={{ color: "gray" }}>I</Text>
                  <Text style={{ color: "gray" }}>
                    {` ${Math.floor(item.duration / 1000 / 60)}:${String(
                      Math.floor((item.duration / 1000) % 60)
                    ).padStart(2, "0")}`}
                  </Text>
                </Text>
              </View>
            </Animated.View>

            {/* Bottom Wave form */}
            {bottomWaveform}
          </View>
        ) : (
          <View>
            <View style={{ width: 80, alignItems: "center" }}>
              <Text style={{ color: "white", fontSize: 12 }}>
                <Text>
                  {`${Math.floor(
                    ((progress / 100) * item.duration) / 1000 / 60
                  )}:${String(
                    Math.floor((((progress / 100) * item.duration) / 1000) % 60)
                  ).padStart(2, "0")}`}{" "}
                </Text>
                <Text style={{ color: "white" }}>I</Text>
                <Text style={{ color: "white" }}>
                  {` ${Math.floor(item.duration / 1000 / 60)}:${String(
                    Math.floor((item.duration / 1000) % 60)
                  ).padStart(2, "0")}`}
                </Text>
              </Text>
            </View>
            <View style={styles.progressContainer}>
              <View
                style={[
                  styles.progress,
                  { width: `${(playBackPosition / item.duration) * 100}%` },
                ]}
              ></View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        <View style={styles.footerIconTextContainer}>
          <AntDesign name="hearto" size={20} color="white" />
          <Text style={styles.footerIconText}>{item.likes_count}</Text>
        </View>
        <View style={styles.footerIconTextContainer}>
          <MaterialCommunityIcons
            name="comment-text-outline"
            size={20}
            color="white"
          />
          <Text style={styles.footerIconText}>{item.comment_count}</Text>
        </View>
        <View style={styles.footerIconTextContainer}>
          <Feather name="share-2" size={20} color="white" />
          <Text style={styles.footerIconText}>{item.shares_count}</Text>
        </View>
        <View style={styles.footerIconTextContainer}>
          <Entypo name="dots-three-vertical" size={20} color="white" />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  coverImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: null,
    marginBottom: 60,
    borderRadius: 20,
    resizeMode: "cover",
  },
  titleContainer: {
    flexDirection: "column",
    alignItems: "flex-start",
    marginLeft: 10,
    marginTop: 30,
    width: 310,
  },
  titleTextContainer: {
    backgroundColor: "black",
    flexDirection: "column",
    padding: 5,
  },
  titleText: {
    color: "white",
    fontSize: 16,
  },
  titleUserNameText: {
    color: "gray",
    fontSize: 16,
  },
  arrowDownContainer: {
    backgroundColor: "white",
    borderRadius: 50,
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
  buttonsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: "60%",
    paddingHorizontal: 10,
  },
  forwardBackButtons: {
    width: 40,
    height: 40,
    borderRadius: 50,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
  },
  progressContainer: {
    height: 1,
    width: 350,
    backgroundColor: "white",
  },
  progress: {
    height: 1,
    backgroundColor: "#FF5A18",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 20,
    justifyContent: "space-around",
  },
  footerIconTextContainer: {
    flexDirection: "row",
  },
  footerIconText: {
    color: "white",
    marginLeft: 5,
    fontWeight: "500",
    fontSize: 15,
  },
});

export default MainPlayer;
