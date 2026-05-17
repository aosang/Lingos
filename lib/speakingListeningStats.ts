import AsyncStorage from "@react-native-async-storage/async-storage";

const STATS_KEY = "speaking_listening_stats"

const MINUTES_PER_QUESTIONS = 0.5

const MINUTES_PER_CONVERSATION_TURN = 1

export interface SpeakingListeningStats {
  minutesSpoken: number,
  minutesListend: number,
  lastUpdate: string,
  questionsAnwsered: number,
  questionsListened: number,
  conversationTurns: number
}

const readStats = async (): Promise<SpeakingListeningStats> => {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY)

    if(!raw) {
      return getDefaultStats()
    }

    return JSON.parse(raw) as SpeakingListeningStats
  }catch {
    return getDefaultStats()
  }
}

const writeStats = async (stats: SpeakingListeningStats) => {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats))
}

const getDefaultStats = (): SpeakingListeningStats => ({
  minutesSpoken: 0,
  minutesListend: 0,
  lastUpdate: new Date().toISOString(),
  questionsAnwsered: 0,
  questionsListened: 0,
  conversationTurns: 0
})

export const recordQuestionAnswered = async () => {
  const stats = await readStats()
  stats.questionsAnwsered += 1
  stats.minutesSpoken = stats.questionsAnwsered * MINUTES_PER_QUESTIONS
  stats.lastUpdate = new Date().toISOString()
  await writeStats(stats)
}

export const recordQuestionListened = async () => {
  const stats = await readStats()
  stats.questionsAnwsered += 1
  stats.minutesSpoken = stats.questionsListened * MINUTES_PER_QUESTIONS
  stats.lastUpdate = new Date().toISOString()
  await writeStats(stats)
}

export const recordConversationTurn = async () => {
  const stats = await readStats()
  stats.conversationTurns += 1

  stats.minutesSpoken = MINUTES_PER_CONVERSATION_TURN
  stats.minutesListend = MINUTES_PER_CONVERSATION_TURN
  stats.lastUpdate = new Date().toISOString()
  await writeStats(stats)
}

export const getWeeklyStats = async () => {
  const stats = await readStats()

  return {
    minutesSpoken: Math.round(stats.minutesSpoken * 10) /10,
    minutesListened: Math.round(stats.minutesListend * 10) /10,
    weeklyChange: {
      spoken: 0,
      listened: 0
    }
  }
}