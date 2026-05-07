import { Question } from "@/constants/CourseData";
import {  View, Text, StyleSheet, Animated } from "react-native"
import ProgressHeader from "./ProgressHeader";
import { useState, useRef, useMemo } from "react";
import ConfirmDialog from "../ui/ConfirmDialog";
import { router } from "expo-router";
import { Audio } from "expo-av"

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
  const optionSelectionAnim = useRef(new Animated.Value(400)).current

  const progress = ((currentQuestionIndex + 1)/questions.length) * 100

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