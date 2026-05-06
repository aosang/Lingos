import { COURSE_DATA } from "@/constants/CourseData"
import { useLocalSearchParams, Redirect } from "expo-router"
import { useState } from "react"
import { View, Text, StyleSheet } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import VocabularyIntroScreen from "@/components/lesson/VocabularyIntroScreen"

export default function PractiseScreen () {
  const { lessonId } = useLocalSearchParams()
  const [isStudyingVocabulary, setIsStudyingVocabulary] = useState(true)

  const allLessons = COURSE_DATA.chapters.flatMap((c) => c.review? [...c.lessons, c.review] : c.lessons)
  const currentLesson = allLessons.find((l) => l.id === lessonId)
  const questions = currentLesson? currentLesson.questions : []

  if(questions.length === 0) {
    return <Redirect href="/(tabs)/lessons" />
  }

  if(isStudyingVocabulary) {
    return (
      <SafeAreaView style={styles.container}>
        <VocabularyIntroScreen 
          questions={questions}
          onStartLesson={() => setIsStudyingVocabulary(false)}
        />
      </SafeAreaView>
    )
  }

  return (
    <View>
  
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white"
  }
})