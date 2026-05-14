import { Question, SpeakingOption } from "@/constants/CourseData";
import {  View, StyleSheet, Animated } from "react-native"
import ProgressHeader from "./ProgressHeader";
import { useState, useRef, useMemo, useEffect } from "react";
import ConfirmDialog from "../ui/ConfirmDialog";
import { router } from "expo-router";
import { Audio, InterruptionModeIOS } from "expo-av"
import AudioPrompt from "./AudioPrompt";
import * as Speech from "expo-speech"
import { recordQuestionListend } from "@/lib/speakingListeningStats";
import MultipleChoiceMode from "./MultipleChoiceMode";
import ListeningMultipleChoiceMode from "./ListeningMultipleChoiceMode";
import SingleResponseMode from "./SingleResponseMode";
import { toast } from "sonner-native";
import * as FileSystem from "expo-file-system/legacy"
import { supabase } from "@/utils/supabase";

interface WrongQuestion {
  english: string
  mandarin: {
    hanzi: string
    pinyin: string
  }
  attempts: number
}

export interface LessonStats {
  correctAnswers: number
  totalQuestions: number
  accuracy: number
  wrongQuestions?: WrongQuestion[]
}

export default function LessonContent ({
  questions
} : {
  questions: Question[]
  lessonId: string
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [exitConfirmVisible, setExitConfirmVisible] = useState(false)
  const [showMandarin, setShowMandarin] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [hasListenedToAudio, setHasListenedToAudio] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [attemptCount, setAttemptCount] = useState(0)
  const [isRecognizing, setIsRecognizing] = useState(false)
  const recordingRef = useRef<Audio.Recording | null>(null)
  const [transcription, setTranscription] = useState<{
    expected: String
    said: string
  } | null>(null)

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex])
  const [isSpeechPlaying, setIsSpeechPlaying] = useState(false)

  // lesson completion
  const [showCompleteScreen, setShowCompleteScreen] = useState(false)
  const [lessonsState, setLessonsState] = useState<LessonStats | null>(null)
  const [questionAttempts, setQuestionAttempts] = useState<Record<number, number>>({});
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [wrongQuestions, setWrongQuestions] = useState<Set<number>>(new Set());

  const fadeAnim = useRef(new Animated.Value(0)).current
  const scaleAnim = useRef(new Animated.Value(1)).current
  const optionsAnimValue = useRef(new Animated.Value(0)).current
  const audioSectionAnimHeight = useRef(new Animated.Value(400)).current
  const optionSelectionAnim = useRef(new Animated.Value(0)).current
  const instructionOpacity = useRef(new Animated.Value(1)).current
  const listeningOpacity = useRef(new Animated.Value(0)).current
  const listeningScale = useRef(new Animated.Value(0.95)).current
  const [hasStartedFirstPlay, setHasStartedFirstPlay] = useState(false)

  const progress = ((currentQuestionIndex + 1)/questions.length) * 100

  const selectedSentence = useMemo((): SpeakingOption | null => {
    if(currentQuestion.type === "listening_mc") {
      if(showResult) {
        const correctEnglish = currentQuestion.options.find(
          (opt) => opt.id === currentQuestion.correctOptionId
        )?.english || "";

        return{
          id: currentQuestion.id,
          english: correctEnglish,
          mandarin: {
            ...currentQuestion.mandarin
          }
        }
      }

      return null
    }

    if(!selectedOption) return null
      return currentQuestion.options.find((opt) => opt.id === selectedOption)!
  }, [])

  useEffect(() => {
    if(isSpeechPlaying && !hasStartedFirstPlay && !hasListenedToAudio) {
      setHasStartedFirstPlay(true)
      Animated.parallel([
        Animated.timing(instructionOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(listeningOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true
        }),
        Animated.sequence([
          Animated.timing(listeningScale, {
            toValue: 1.05,
            duration: 150,
            useNativeDriver: true
          }),

          Animated.timing(listeningScale, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true
          })
        ])
      ]).start()
    }
  }, [isSpeechPlaying, hasStartedFirstPlay, hasListenedToAudio])
  
  useEffect(() => {
    if(currentQuestion.type === "single_response" && currentQuestion.options.length > 0 && hasListenedToAudio) {
      setSelectedOption(currentQuestion.options[0].id)
      Animated.timing(optionSelectionAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
      }).start()
    }
  }, [currentQuestion, hasListenedToAudio])

  const finishListening = () => {
    if(hasListenedToAudio) return
    setHasListenedToAudio(true)
    setIsSpeechPlaying(false)
    void recordQuestionListend()

    Animated.parallel([
      Animated.timing(audioSectionAnimHeight, {
        toValue: 200,
        duration: 800,
        useNativeDriver: false
      }),

      Animated.timing(optionsAnimValue, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true
      })
    ]).start()
  }

  const playAudio = () => {
    const textToSpeak = currentQuestion.mandarin.hanzi || currentQuestion.mandarin.pinyin

    if(isSpeechPlaying) {
      Speech.stop()
      setIsSpeechPlaying(false)
      return
    }

    setIsSpeechPlaying(true)
    Speech.speak(textToSpeak, {
      language: "zh-CN",
      onDone: () => {
        setIsSpeechPlaying(false)
        finishListening()
      },
      onStopped: () => {
        setIsSpeechPlaying(false)
      },
      onError: () => {
        setIsSpeechPlaying(false)
      }
    })
  }

  const startRecording = async () => {
    if(isSpeechPlaying) {
      Speech.stop()
      setIsSpeechPlaying(false)
    }

    try {
      const perm = await Audio.requestPermissionsAsync()
      if(!perm.granted) {
        toast.error("Microphone Permission", {
          description: "Microphone access is required to practise speaking."
        })
        return
      }
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        interruptionModeIOS: InterruptionModeIOS.DoNotMix,
        staysActiveInBackground: true
      })

      const preset = Audio.RecordingOptionsPresets.HIGH_QUALITY
      const { recording } = await Audio.Recording.createAsync({
        ...preset,
        ios: {
          ...preset.ios,
          extension: ".wav",
          audioQuality: Audio.IOSAudioQuality.MAX,
          outputFormat: Audio.IOSOutputFormat.LINEARPCM
        },
        android: {
          ...preset.ios,
          extension: ".wav",
          outputFormat: Audio.AndroidOutputFormat.DEFAULT,
          audioEncoder: Audio.AndroidAudioEncoder.DEFAULT
        }
      })

      recordingRef.current = recording
      setIsRecognizing(true)
    }catch(err) {
      console.error("Failed to start recording:", err)
      recordingRef.current = null
      setIsRecognizing(false)
      toast.error("Recording Error", {
        description: "Could not start recording."
      })
    }
  }

  const processSpeechResult = (transcript: string) => {
    setIsLoading(false)
    setShowResult(true)

    const punctuationRegex = /[.,\/#!$%\^&\*;:{}=\-_`~()?]/g;

    // const rawExpected = selected

    // Nǐ hǎo (correct)
    // Nǐ hǎo (user said)
  }

  const stopRecording = async () => {
    setIsLoading(true)
    setIsRecognizing(false)
    
    try {
      const recording = recordingRef.current
      if(!recording) {
        setIsLoading(false)
        return
      }

      await recording.stopAndUnloadAsync()
      const uri = recording.getURI()
      recordingRef.current = null

      if(!uri) {
        setIsLoading(false)
        toast.error("Recording Error", {
          description: "No audio was recored."
        })
        return
      }
      
      const base64Audio = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64
      })

      const { data, error } = await supabase.functions.invoke("transcriptbe-audio", {
        body: {
          inputAudio: {
            data: base64Audio,
            format: "wav"
          } 
        }
      })

      if(error) {
        throw error
      }

      if(data?.transcript) {

      }

    }catch(err) {

    }
  }

  const handleRevealMandarin = () => {
    if(showMandarin) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      }).start(() => setShowMandarin(false))
    }else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true
      }).start()
    }
  }

  const handleOptionPress = (id: number) => {
    if(currentQuestion.type === "listening_mc") {
      setSelectedOption(id)
      setIsCorrect(id === currentQuestion.correctOptionId)
      setShowResult(true)
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true
        })
      ]).start()
      return 
    }

    const isDeselecting = selectedOption === id
    const newSelectedOption = isDeselecting? null : id
    setSelectedOption(newSelectedOption)
    Animated.timing(optionSelectionAnim, {
      toValue: isDeselecting? 0 : 1,
      duration: 300,
      useNativeDriver: true
    }).start()
  }

  return (
    <View style={styles.container}>
      <ConfirmDialog 
        visible={exitConfirmVisible}
        title="Exit Practise"
        description="Are you sure you want to quit? Your progress will be lost."
        cancelLabel="Cancel"
        confirmLabel="Exit"
        onConfirm={() => {
          setExitConfirmVisible(false)

          // TODO: stop what we were doing
          router.push("/lessons")
        }}
        onCancel={() => setExitConfirmVisible(false)}
      />
      <ProgressHeader 
        progress={progress} 
        currentCount={currentQuestionIndex + 1} 
        totalCount={questions.length} 
        onClose={() => setExitConfirmVisible(true)} 
      />

      {/* main content */}
      <View style={styles.content}>
        <Animated.View style={[styles.audioSection, {
            backgroundColor: "#f9fafb",
            minHeight: audioSectionAnimHeight,
            flex: hasListenedToAudio? 0 : 1,
            justifyContent: "center",
            opacity: isLoading || showResult? 0.6 : 1
          },
        ]}
        pointerEvents={isLoading || showResult ? "none" : "auto"}
        >
          <AudioPrompt 
            isPlaying={isSpeechPlaying}
            isRecognizing={isRecognizing}
            hasListenedToAudio={hasListenedToAudio}
            onPlay={playAudio}
            onStartRecord={startRecording}
            onStopRecord={() => {}}
            onRevealMandarin={handleRevealMandarin}
            currentQuestion={currentQuestion}
            showMandarin={showMandarin}
            selectedOption={selectedOption}
            scaleAnim={scaleAnim}
            instructionOpacity={instructionOpacity}
            listeningOpacity={listeningOpacity}
            listeningScale={listeningScale}
            fadeAnim={fadeAnim}
          />
        </Animated.View> 

        {hasListenedToAudio && (
          <Animated.View style={[
            styles.optionsSection, 
            {
              opacity: Animated.multiply(
                optionsAnimValue,
                isLoading || showResult? 0.5 : 1
              ),
              transform:[
                {translateY: optionSelectionAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0]
                })}
              ]
            }
          ]}
          pointerEvents={isLoading || showResult? "none" : "auto"}
          >
            {currentQuestion.type === "multiple_choice" && (
              <MultipleChoiceMode 
                options={currentQuestion.options} 
                selectedOption={selectedOption} 
                handleOptionPress={handleOptionPress}
                optionsSelectionAnim={optionSelectionAnim}
                isLoading={isLoading}
                showResult={showResult}
              />
            )}

            {currentQuestion.type === "listening_mc" && (
              <ListeningMultipleChoiceMode 
                options={currentQuestion.options} 
                selectedOption={selectedOption} 
                handleOptionPress={handleOptionPress}
                isLoading={isLoading}
                showResult={showResult}
              />
            )}

            {currentQuestion.type === "single_response" && (
              <SingleResponseMode 
                option={currentQuestion.options[0]} 
                optionSelectionAnim={optionSelectionAnim}
              />
            )}
          </Animated.View>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  audioSection: {
    alignItems: "center",
    marginBottom: 40,
    padding: 20,
    borderRadius: 16,
    marginTop: 20,
  },
  optionsSection: {
    flex: 1,
    marginBottom: 30,
  },
  bottomSection: {
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  feedbackWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 1000,
  },
});