import { Audio } from "expo-av";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { trackData } from "./assets/data/trackData";
import MainPlayer from "./components/MainPlayer/index";

export default function App() {
  const [sound, setSound] = useState(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  useEffect(() => {
    if (sound) {
      sound.unloadAsync();
    }

    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync(
        { uri: trackData[currentTrackIndex].audio_url },
        { shouldPlay: false }
      );
      setSound(sound);
    };

    loadSound();

    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [currentTrackIndex]);

  const playNextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % trackData.length;
    setCurrentTrackIndex(nextIndex);
  };

  const playPrevTrack = () => {
    const prevIndex =
      (currentTrackIndex - 1 + trackData.length) % trackData.length;
    setCurrentTrackIndex(prevIndex);
  };

  return (
    <View style={styles.container}>
      <MainPlayer
        item={trackData[currentTrackIndex]}
        playNextTrack={playNextTrack}
        playPrevTrack={playPrevTrack}
        sound={sound}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
});
