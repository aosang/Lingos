import AsyncStorage from "@react-native-async-storage/async-storage";

const STATS_KEY = "speaking_listening_stats";

const MINUTES_PER_QUESTION = 0.5;
const MINUTES_PER_CONVERSATION_TURN = 1;

export interface SpeakingListeningStats {
  minutesSpoken: number;
  minutesListened: number;
  lastUpdate: string;
  questionsAnswered: number;
  questionsListened: number;
  conversationTurns: number;
}

const readStats = async (): Promise<SpeakingListeningStats> => {
  try {
    const raw = await AsyncStorage.getItem(STATS_KEY);
    if (!raw) {
      return getDefaultStats();
    }

    return normalizeStats(JSON.parse(raw) as Partial<SpeakingListeningStats>);
  } catch {
    return getDefaultStats();
  }
};

const writeStats = async (stats: SpeakingListeningStats) => {
  await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
};

const getDefaultStats = (): SpeakingListeningStats => ({
  minutesSpoken: 0,
  minutesListened: 0,
  lastUpdate: new Date().toISOString(),
  questionsAnswered: 0,
  questionsListened: 0,
  conversationTurns: 0,
});

const toFiniteNumber = (value: unknown, fallback: number): number => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

/** Merge persisted JSON with defaults — partial/corrupt AsyncStorage must not produce NaN. */
const normalizeStats = (raw: Partial<SpeakingListeningStats>): SpeakingListeningStats => {
  const defaults = getDefaultStats();
  return {
    minutesSpoken: toFiniteNumber(raw.minutesSpoken, defaults.minutesSpoken),
    minutesListened: toFiniteNumber(raw.minutesListened, defaults.minutesListened),
    lastUpdate: typeof raw.lastUpdate === "string" ? raw.lastUpdate : defaults.lastUpdate,
    questionsAnswered: toFiniteNumber(raw.questionsAnswered, defaults.questionsAnswered),
    questionsListened: toFiniteNumber(raw.questionsListened, defaults.questionsListened),
    conversationTurns: toFiniteNumber(raw.conversationTurns, defaults.conversationTurns),
  };
};

export const recordQuestionAnswered = async () => {
  const stats = await readStats();
  stats.questionsAnswered += 1;
  stats.minutesSpoken = stats.questionsAnswered * MINUTES_PER_QUESTION;
  stats.lastUpdate = new Date().toISOString();
  await writeStats(stats);
};

export const recordQuestionListened = async () => {
  const stats = await readStats();
  stats.questionsListened += 1;
  stats.minutesListened = stats.questionsListened * MINUTES_PER_QUESTION;
  stats.lastUpdate = new Date().toISOString();
  await writeStats(stats);
};

export const recordConversationTurn = async () => {
  const stats = await readStats();
  stats.conversationTurns += 1;

  stats.minutesSpoken += MINUTES_PER_CONVERSATION_TURN;
  stats.minutesListened += MINUTES_PER_CONVERSATION_TURN;
  stats.lastUpdate = new Date().toISOString();
  await writeStats(stats);
};

const roundStat = (value: number) =>
  Math.round(toFiniteNumber(value, 0) * 10) / 10;

export const getWeeklyStats = async () => {
  const stats = await readStats();

  return {
    minutesSpoken: roundStat(stats.minutesSpoken),
    minutesListened: roundStat(stats.minutesListened),
    weeklyChange: {
      spoken: 0,
      listened: 0,
    },
  };
};
