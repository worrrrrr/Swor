import type { Choice, AssessmentResult } from './types';

export class PersonalityInterpreter {
  public static calculateResult(selectedChoices: Choice[]): AssessmentResult {
    const mbtiScores: Record<string, number> = {
      E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0
    };

    const enneagramScores: Record<number, number> = {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
    };

    for (const choice of selectedChoices) {
      if (choice.mbtiImpact) {
        const { value, weight } = choice.mbtiImpact;
        mbtiScores[value] = (mbtiScores[value] || 0) + weight;
      }

      if (choice.enneagramImpact) {
        const { type, weight } = choice.enneagramImpact;
        enneagramScores[type] = (enneagramScores[type] || 0) + weight;

        if (choice.id === '9a') {
          enneagramScores[1] += 0.5;
          enneagramScores[9] += 0.5;
        } else if (choice.id === '9b') {
          enneagramScores[5] += 0.5;
          enneagramScores[7] += 0.5;
        } else if (choice.id === '9c') {
          enneagramScores[2] += 0.5;
          enneagramScores[4] += 0.5;
        }
      }
    }

    const mbtiResult = [
      mbtiScores['E'] >= mbtiScores['I'] ? 'E' : 'I',
      mbtiScores['S'] >= mbtiScores['N'] ? 'S' : 'N',
      mbtiScores['T'] >= mbtiScores['F'] ? 'T' : 'F',
      mbtiScores['J'] >= mbtiScores['P'] ? 'J' : 'P'
    ].join('');

    let finalEnneagramType = 1;
    let maxEnneagramScore = -1;

    for (let type = 1; type <= 9; type++) {
      if (enneagramScores[type] > maxEnneagramScore) {
        maxEnneagramScore = enneagramScores[type];
        finalEnneagramType = type;
      }
    }

    return {
      mbti: mbtiResult,
      enneagram: finalEnneagramType,
      rawScores: {
        mbti: mbtiScores,
        enneagram: enneagramScores
      }
    };
  }
}

export function formatPersonalityPrompt(personality: { mbti?: string; enneagram?: number; wing?: string }): string {
  if (!personality?.mbti) return '';
  return `ผู้ใช้คนนี้มีบุคลิกภาพ:
- MBTI: ${personality.mbti}
- Enneagram: ${personality.enneagram}${personality.wing || ''}

ปรับการตอบให้เหมาะกับบุคลิกนี้`;
}
