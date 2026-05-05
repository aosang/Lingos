import couseData from '@/assets/data/course_content.json'
import Ionicons from '@expo/vector-icons/Ionicons'

export interface CourseData {
  chapters: Chapter[]
  scenarios: ConversationScenario
}

export interface ConversationScenario {
  id: string
  title: string
  icon: keyof typeof Ionicons.glyphMap
  isFree: boolean
  description: string
  goal: string
  tasks: string[]
  difficulty: "Beginner" | "Intermediater" | "Advanced"
  phrasebook?: PhrasebookEntry[]
}

interface PhrasebookEntry {
  hanzi: string
  pinyin: string
  english: string
}

export interface Chapter { 
  id: number
  title: string
  lessons: Lesson[]
  review?: Lesson
}

export interface Lesson {
  id: string
  title: string
  icon: keyof typeof Ionicons.glyphMap
  completionCount: number
  questions: Questions[]
}


interface BaseQuestion {
  id: number
}

interface MandarinPrompt {
  hanzi: string
  pinyin: string
}

export interface Word {
  hanzi: string
  pinyin: string
  english: string
}

interface MandarinPhrase {
  hanzi: string
  pinyin: string
  words: Word[]
  breakdown: string
}

export interface SpeakingOption {
  id: number
  english: string
  mandarin: MandarinPhrase
}

export interface ListeningOption {
  id: number
  english: string
}

interface MultipleChoiseQuestion extends BaseQuestion {
  type: "mutiple_choice"
  mandarin: MandarinPrompt
  options: SpeakingOption[]
}

interface SingleResponseQuestion extends BaseQuestion {
  type: "mutiple_choice"
  mandarin: MandarinPrompt
  options: [SpeakingOption]
}

interface LisnteningMutipleChoiceQuestion extends BaseQuestion {
  type: "listening_mc"
  mandarin: MandarinPrompt & {
    words: Word[]
    breakdown: string
  }
  options: ListeningOption[]
  correctOptionId: number
}

export type Questions = MultipleChoiseQuestion | SingleResponseQuestion | LisnteningMutipleChoiceQuestion

export const COURSE_DATA = couseData as unknown as CourseData