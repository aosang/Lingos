import { Colors } from "@/constants/theme";
import { EBGaramond_500Medium_Italic, useFonts } from '@expo-google-fonts/eb-garamond';
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import { Dimensions, Keyboard, Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { verticalScale } from 'react-native-size-matters';

const {  width, height } = Dimensions.get("window")
const videoSource = require("../../assets/video/broll.mp4")

const MENU_HEIGHT = 250
const PEEK_MENU_HEIGHT = 50
const CLOSED_POSITION = MENU_HEIGHT - PEEK_MENU_HEIGHT

export default function IntroScreen () {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const mainTextOpacity = useSharedValue(0)
  const scriptTextOpacity = useSharedValue(0)
  const manuTraslateY = useSharedValue(CLOSED_POSITION)
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  const [fontsLoaded] = useFonts({
    EBGaramond_500Medium_Italic
  })

  const mainTextWords: string[] = ["Learn", "Mandarin", "the", "right", "way"] 
  const scriptPhrases: string[] = [
    "Speaking", 
    "Listening", 
    "Practising", 
    "Conversing"
  ] 

  const player = useVideoPlayer(videoSource, (player) => {
    player.loop = true
    player.muted = true
    player.play()
  })

  const mainTextContainer = useAnimatedStyle(() => {
    const translateY = interpolate(
      mainTextOpacity.value,
      [0, 1],
      [30, 0],
      Extrapolation.CLAMP
    )

    return {
      opacity: mainTextOpacity.value,
      transform: [{ translateY }]
    }
  })

  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{translateY: manuTraslateY.value}]
    }
  })

  const scriptTextAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scriptTextOpacity.value,
      [0, 1],
      [20, 0],
      Extrapolation.CLAMP
    )

    return {
      opacity: scriptTextOpacity.value,
      transform: [{ translateY }]
    }
  })

  const animateTextIn = () => {
    mainTextOpacity.value = withTiming(1, {duration: 1200})
    scriptTextOpacity.value = withDelay(800, withTiming(1, {duration: 800}))
  }

  const animateScriptOut = () => {
    scriptTextOpacity.value = withTiming(0, {duration: 500})
  }

  const animateScriptIn = () => {
    scriptTextOpacity.value = withTiming(1, {duration: 600})
  }

  useEffect(() => {
    player.play()
    const timeout = setTimeout(() => {
      animateTextIn()
    }, 300)

    // Wait 3.5s (reading time)
    // Start fade out
    // Wait 0.5s (animation time)
    // Change Word (invisible)
    // Wait 0.15s (small pause)
    // Start fade in

    const cycleInterval = setInterval(() => {
      animateScriptOut()
      setTimeout(() => {
        setCurrentPhraseIndex((prev) => {
          const nextIndex = (prev + 1) % scriptPhrases.length

          if(nextIndex === 0){
            setTimeout(() => animateScriptIn(), 150)
          }

          return nextIndex
        })
      }, 500)
    }, 3500)

    return () => {
      clearTimeout(timeout)
      clearInterval(cycleInterval)
    }
  }, [])

  useEffect(() => {
    if(currentPhraseIndex > 0) {
      const timeout = setTimeout(() => {
        animateScriptIn()
      }, 150)

      return () => clearTimeout(timeout)
    }
  }, [currentPhraseIndex])

  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios'? "keyboardWillShow" : "keyboardDidShow", (event) => {
        setKeyboardHeight(event.endCoordinates.height)
      }
    )

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios'? "keyboardWillHide" : "keyboardDidHide", (event) => {
        setKeyboardHeight(0)
      }
    )

    return () => {
      keyboardWillShowListener.remove()
      keyboardWillHideListener.remove()
    }
  }, [])


  if(!fontsLoaded) {
    return null
  }

  const dynamicMenuHeight = keyboardHeight

  return (
    <View style={{flex: 1, backgroundColor: "black"}}>
      <VideoView 
        nativeControls={false} 
        player={player} 
        contentFit="cover"
        style={[StyleSheet.absoluteFill, {width, height}]}
      />

      {/* overlay */}
      <View style={[StyleSheet.absoluteFill, {backgroundColor: "rgba(0,0,0,0.5)", zIndex: 20}]} />

      {/* Hero text section */}
      <View style={styles.heroTextContainer}>
        <Animated.View style={[styles.mainTextContainer, mainTextContainer]}>
          <Text style={styles.heroTextMain}>{mainTextWords.join(" ")}</Text>
        </Animated.View>
        <Animated.View style={scriptTextAnimatedStyle}>
          <Text style={styles.heroTextScript}>{scriptPhrases[currentPhraseIndex]}</Text>
        </Animated.View>
      </View>
      {/* sliding menu with dyamic height */}
      {/* TODO: Gesture handler */}
      <Animated.View style={[styles.menuContainer, menuAnimatedStyle]}>

      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  menuContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: MENU_HEIGHT + 100,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
    borderRightWidth: 1.5,
    borderColor: "rgba(255, 255, 255, 0.15)",
    zIndex: 30,
  },
  handleContainer: {
    paddingVertical: 12,
    alignItems: "center",
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 2,
  },
  menuContent: {
    flex: 1,
    paddingHorizontal: 30,
  },
  viewContainer: {
    flex: 1,
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 24,
    paddingHorizontal: 10,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logo: {
    width: 25,
    height: 25,
    marginRight: 5,
    borderRadius: 12,
  },
  appName: {
    fontSize: 18,
    fontWeight: "700",
    color: "white",
  },
  statsContainer: {
    alignItems: "center",
  },
  rating: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
  buttonsContainer: {
    gap: 16,
  },
  loginButton: {
    backgroundColor: "rgba(60, 60, 67, 0.8)",
    borderColor: "rgba(120, 120, 128, 0.4)",
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 40,
  },
  appleIcon: {
    marginRight: 12,
  },
  googleIcon: {
    marginRight: 12,
  },
  emailIcon: {
    marginRight: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: -0.2,
  },
  heroTextContainer: {
    position: "absolute",
    top: height * 0.15,
    left: 30,
    right: 30,
    zIndex: 25,
  },
  mainTextContainer: {
    marginBottom: 0,
  },
  heroTextMain: {
    fontSize: verticalScale(45),
    fontWeight: "800",
    fontFamily: "System",
    color: "#fff4cc",
    lineHeight: verticalScale(50),
    letterSpacing: 0,
  },
  heroTextScript: {
    fontSize: verticalScale(55),
    fontFamily: "EBGaramond_500Medium_Italic",
    color: Colors.primaryAccentColor,
    letterSpacing: 0.5,
  },
});