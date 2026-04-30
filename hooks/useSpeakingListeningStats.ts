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

}