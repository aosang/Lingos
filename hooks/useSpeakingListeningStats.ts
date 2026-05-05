import { getWeeklyStats } from "@/lib/speakingListeningStats";
import { useState, useEffect } from "react";

interface WeeklyStats {
  minutesSpoken: number,
  minutesListened: number,
  weeklyChange: {
    spoken: number,
    listened: number
  }
}

export const useSpeakingListeningStats = () => {
  const [stats, setStats] = useState<WeeklyStats | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    try {
      const weeklyStats = await getWeeklyStats()
      setStats(weeklyStats)
    }catch(err) {
      console.error("Failed to load sepaking/listening stats", err)
    }finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  return { stats, loading, refresh }
}