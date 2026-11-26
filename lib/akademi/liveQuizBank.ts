import { AG_LIVE_QUESTIONS } from './liveQuizBank/agTemelleri';
import { PC_LIVE_QUESTIONS } from './liveQuizBank/pcDonanimi';
import { GP_LIVE_QUESTIONS } from './liveQuizBank/gorselProgramlama';

export interface LiveQuizQuestion {
  id: string;
  weekOrder: number; // 1..5 or 0 for overall
  prompt: string;
  options: { id: 'A' | 'B' | 'C' | 'D'; text: string }[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation: string;
}

export function getLiveQuizQuestions(
  courseCode: string,
  weekOrder: number
): LiveQuizQuestion[] {
  const bank =
    courseCode === 'pc-donanimi'
      ? PC_LIVE_QUESTIONS
      : courseCode === 'gorsel-programlama'
      ? GP_LIVE_QUESTIONS
      : AG_LIVE_QUESTIONS;

  if (weekOrder === 0) {
    // Ders sonu tüm haftaları kapsayan 10 soruluk özet (her haftadan ilk 2 soru)
    const summary: LiveQuizQuestion[] = [];
    for (let w = 1; w <= 5; w++) {
      summary.push(...bank.filter((q) => q.weekOrder === w).slice(0, 2));
    }
    return summary;
  }

  const filtered = bank.filter((q) => q.weekOrder === weekOrder);
  return filtered.length > 0 ? filtered : bank.slice(0, 10);
}
