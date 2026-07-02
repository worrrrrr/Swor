// Personality Mapper: Astrology -> MBTI + Enneagram

import type { FullWesternChart } from '../westernResolver';
import type { EasternResult } from '../easternInterpreter';
import type { BaziResult } from '../baziInterpreter';
import type { MBTIMapping, EnneagramMapping } from '$lib/personality/types';

export interface PersonalityInsight {
  mbti: string;
  enneagram: number;
  confidence: number;
  reasoning: string[];
}

/**
 * Map Western astrology placements to MBTI dimensions
 */
export function mapWesternToMBTI(chart: FullWesternChart): { scores: Record<string, number>; reasoning: string[] } {
  const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  const reasoning: string[] = [];

  // Sun sign influence on E/I
  const fireSigns = ['Aries', 'Leo', 'Sagittarius'];
  const airSigns = ['Gemini', 'Libra', 'Aquarius'];
  const earthSigns = ['Taurus', 'Virgo', 'Capricorn'];
  const waterSigns = ['Cancer', 'Scorpio', 'Pisces'];

  const sunSign = chart.planets.find(p => p.name === 'Sun')?.signName || '';
  
  if (fireSigns.includes(sunSign) || airSigns.includes(sunSign)) {
    scores.E += 2;
    reasoning.push(`อาทิตย์ใน${sunSign}: มีพลัง外向 ชอบสังคม`);
  } else {
    scores.I += 2;
    reasoning.push(`อาทิตย์ใน${sunSign}: มีพลัง内向 ชอบใคร่ครวญ`);
  }

  // Moon sign influence on F/T
  const moonSign = chart.planets.find(p => p.name === 'Moon')?.signName || '';
  
  if (waterSigns.includes(moonSign) || moonSign === 'Libra' || moonSign === 'Taurus') {
    scores.F += 2;
    reasoning.push(`จันทร์ใน${moonSign}: ตัดสินใจด้วยอารมณ์และความรู้สึก`);
  } else {
    scores.T += 2;
    reasoning.push(`จันทร์ใน${moonSign}: ตัดสินใจด้วยตรรกะและเหตุผล`);
  }

  // Mercury sign influence on S/N
  const mercurySign = chart.planets.find(p => p.name === 'Mercury')?.signName || '';
  const intuitiveSigns = ['Scorpio', 'Pisces', 'Sagittarius', 'Aquarius'];
  
  if (intuitiveSigns.includes(mercurySign)) {
    scores.N += 2;
    reasoning.push(`พุธใน${mercurySign}: คิดแบบนามธรรม มองภาพใหญ่`);
  } else {
    scores.S += 2;
    reasoning.push(`พุธใน${mercurySign}: คิดแบบรูปธรรม ใส่ใจรายละเอียด`);
  }

  // Ascendant influence on J/P
  const ascSign = chart.ascendant.signName;
  const cardinalSigns = ['Aries', 'Cancer', 'Libra', 'Capricorn'];
  const fixedSigns = ['Taurus', 'Leo', 'Scorpio', 'Aquarius'];
  
  if (cardinalSigns.includes(ascSign) || fixedSigns.includes(ascSign)) {
    scores.J += 2;
    reasoning.push(`ลัคนา${ascSign}: ชอบโครงสร้าง วางแผนชัดเจน`);
  } else {
    scores.P += 2;
    reasoning.push(`ลัคนา${ascSign}: ยืดหยุ่น ปรับตัวตามสถานการณ์`);
  }

  // Human Design influence
  if (chart.humanDesign.type === 'Manifestor' || chart.humanDesign.type === 'ManifestingGenerator') {
    scores.E += 1;
    scores.P += 1;
    reasoning.push(`Human Design ${chart.humanDesign.type}: พลังงานเชิงรุก กล้าริเริ่ม`);
  }
  
  if (chart.humanDesign.authority === 'Emotional') {
    scores.F += 1;
    reasoning.push('Human Design Emotional Authority: ตัดสินใจผ่านอารมณ์');
  }

  return { scores, reasoning };
}

/**
 * Map Eastern/Vedic astrology to MBTI dimensions
 */
export function mapEasternToMBTI(easternResult: EasternResult): { scores: Record<string, number>; reasoning: string[] } {
  const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  const reasoning: string[] = [];

  const lagna = easternResult.vedic.lagna;
  const rashi = easternResult.vedic.rashi;

  // Lagna influence on E/I
  const fireLagnas = ['เมษ', 'สิงห์', 'ธนู'];
  const airLagnas = ['เมถุน', 'ตุลย์', 'กุมภ์'];
  
  if (fireLagnas.includes(lagna) || airLagnas.includes(lagna)) {
    scores.E += 2;
    reasoning.push(`ลัคนา${lagna}: มีพลัง外向`);
  } else {
    scores.I += 2;
    reasoning.push(`ลัคนา${lagna}: มีพลัง内向`);
  }

  // Nakshatra influence on S/N
  const intuitiveNakshatras = ['Ashwini', 'Ardra', 'Mula', 'Shatabhisha', 'Revati'];
  const nakshatra = easternResult.vedic.nakshatra;
  
  if (intuitiveNakshatras.includes(nakshatra)) {
    scores.N += 2;
    reasoning.push(`นักษัตร${nakshatra}: ลางสังหรณ์สูง คิดแบบนามธรรม`);
  } else {
    scores.S += 2;
    reasoning.push(`นักษัตร${nakshatra}: ใส่ใจรายละเอียด รูปธรรม`);
  }

  // Thai day influence on F/T
  const feelingDays = ['จันทร์', 'ศุกร์', 'พฤหัสบดี'];
  const thinkingDays = ['อาทิตย์', 'อังคาร', 'เสาร์', 'พุธ'];
  const thaiDay = easternResult.thai.lannaDay;
  
  if (feelingDays.includes(thaiDay)) {
    scores.F += 2;
    reasoning.push(`วัน${thaiDay}: ตัดสินใจด้วยความรู้สึก`);
  } else {
    scores.T += 2;
    reasoning.push(`วัน${thaiDay}: ตัดสินใจด้วยเหตุผล`);
  }

  return { scores, reasoning };
}

/**
 * Map Bazi elements to MBTI dimensions
 */
export function mapBaziToMBTI(baziResult: BaziResult): { scores: Record<string, number>; reasoning: string[] } {
  const scores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };
  const reasoning: string[] = [];

  const dayElement = baziResult.dayPillar.element;
  const yearAnimal = baziResult.yearPillar.animal;

  // Element influence
  const extrovertElements = ['ไฟ', 'ไม้'];
  const introvertElements = ['น้ำ', 'ทอง'];
  
  if (extrovertElements.includes(dayElement)) {
    scores.E += 2;
    reasoning.push(`ธาตุวัน${dayElement}: พลังงาน外向`);
  } else if (introvertElements.includes(dayElement)) {
    scores.I += 2;
    reasoning.push(`ธาตุวัน${dayElement}: พลังงาน内向`);
  } else {
    scores.J += 1;
    reasoning.push(`ธาตุดิน: มั่นคง มีโครงสร้าง`);
  }

  // Animal influence
  const socialAnimals = ['ม้า', 'ลิง', 'ไก่', 'สุนัข'];
  const solitaryAnimals = ['งู', 'เสือ', 'หนู', 'กระต่าย'];
  
  if (socialAnimals.includes(yearAnimal)) {
    scores.E += 1;
    reasoning.push(`ปี${yearAnimal}: ชอบสังคม`);
  } else if (solitaryAnimals.includes(yearAnimal)) {
    scores.I += 1;
    reasoning.push(`ปี${yearAnimal}: ชอบอยู่คนเดียว`);
  }

  return { scores, reasoning };
}

/**
 * Calculate final MBTI type from scores
 */
export function calculateMBTI(scores: Record<string, number>): string {
  const ei = scores.E >= scores.I ? 'E' : 'I';
  const sn = scores.S >= scores.N ? 'S' : 'N';
  const tf = scores.T >= scores.F ? 'T' : 'F';
  const jp = scores.J >= scores.P ? 'J' : 'P';
  
  return ei + sn + tf + jp;
}

/**
 * Map astrology to Enneagram
 */
export function mapToEnneagram(
  western: FullWesternChart,
  eastern?: EasternResult,
  bazi?: BaziResult
): { type: number; reasoning: string[] } {
  const reasoning: string[] = [];
  const typeScores: Record<number, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  };

  // Western influences
  const sunSign = western.planets.find(p => p.name === 'Sun')?.signName || '';
  const moonSign = western.planets.find(p => p.name === 'Moon')?.signName || '';
  const ascSign = western.ascendant.signName;

  // Type 1 - Perfectionist (Virgo, Capricorn influence)
  if (sunSign === 'Virgo' || sunSign === 'Capricorn' || ascSign === 'Virgo') {
    typeScores[1] += 2;
    reasoning.push('อิทธิพลราศีแห่งความสมบูรณ์แบบ -> Enneagram 1');
  }

  // Type 2 - Helper (Cancer, Libra, Taurus)
  if (moonSign === 'Cancer' || sunSign === 'Libra' || sunSign === 'Taurus') {
    typeScores[2] += 2;
    reasoning.push('อิทธิพลราศีแห่งการให้ -> Enneagram 2');
  }

  // Type 3 - Achiever (Leo, Capricorn, Aries)
  if (sunSign === 'Leo' || sunSign === 'Capricorn' || sunSign === 'Aries') {
    typeScores[3] += 2;
    reasoning.push('อิทธิพลราศีแห่งความสำเร็จ -> Enneagram 3');
  }

  // Type 4 - Individualist (Cancer, Scorpio, Pisces)
  if (moonSign === 'Cancer' || sunSign === 'Scorpio' || sunSign === 'Pisces') {
    typeScores[4] += 2;
    reasoning.push('อิทธิพลราศีแห่งความลึกซึ้ง -> Enneagram 4');
  }

  // Type 5 - Investigator (Aquarius, Virgo, Scorpio)
  if (sunSign === 'Aquarius' || sunSign === 'Virgo' || moonSign === 'Scorpio') {
    typeScores[5] += 2;
    reasoning.push('อิทธิพลราศีแห่งการวิเคราะห์ -> Enneagram 5');
  }

  // Type 6 - Loyalist (Cancer, Capricorn, Taurus)
  if (moonSign === 'Cancer' || sunSign === 'Capricorn' || sunSign === 'Taurus') {
    typeScores[6] += 2;
    reasoning.push('อิทธิพลราศีแห่งความมั่นคง -> Enneagram 6');
  }

  // Type 7 - Enthusiast (Sagittarius, Gemini, Aquarius)
  if (sunSign === 'Sagittarius' || sunSign === 'Gemini' || sunSign === 'Aquarius') {
    typeScores[7] += 2;
    reasoning.push('อิทธิพลราศีแห่งความสนุกสนาน -> Enneagram 7');
  }

  // Type 8 - Challenger (Scorpio, Aries, Leo)
  if (sunSign === 'Scorpio' || sunSign === 'Aries' || sunSign === 'Leo') {
    typeScores[8] += 2;
    reasoning.push('อิทธิพลราศีแห่งพลัง -> Enneagram 8');
  }

  // Type 9 - Peacemaker (Libra, Pisces, Taurus)
  if (sunSign === 'Libra' || sunSign === 'Pisces' || sunSign === 'Taurus') {
    typeScores[9] += 2;
    reasoning.push('อิทธิพลราศีแห่งความสงบ -> Enneagram 9');
  }

  // Find highest score
  let maxType = 9;
  let maxScore = 0;
  for (const [type, score] of Object.entries(typeScores)) {
    if (score > maxScore) {
      maxScore = score;
      maxType = parseInt(type);
    }
  }

  return { type: maxType, reasoning };
}

/**
 * Combined personality analysis from all systems
 */
export function analyzePersonality(
  western: FullWesternChart,
  eastern?: EasternResult,
  bazi?: BaziResult
): PersonalityInsight {
  const allReasoning: string[] = [];
  const totalScores: Record<string, number> = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 };

  // Western analysis
  const westernMBTI = mapWesternToMBTI(western);
  for (const [key, value] of Object.entries(westernMBTI.scores)) {
    totalScores[key] += value;
  }
  allReasoning.push(...westernMBTI.reasoning);

  // Eastern analysis
  if (eastern) {
    const easternMBTI = mapEasternToMBTI(eastern);
    for (const [key, value] of Object.entries(easternMBTI.scores)) {
      totalScores[key] += value * 0.8; // Weight slightly less
    }
    allReasoning.push(...easternMBTI.reasoning);
  }

  // Bazi analysis
  if (bazi) {
    const baziMBTI = mapBaziToMBTI(bazi);
    for (const [key, value] of Object.entries(baziMBTI.scores)) {
      totalScores[key] += value * 0.6; // Weight least
    }
    allReasoning.push(...baziMBTI.reasoning);
  }

  const mbti = calculateMBTI(totalScores);
  const enneagram = mapToEnneagram(western, eastern, bazi);

  return {
    mbti,
    enneagram: enneagram.type,
    confidence: Math.min(100, Math.round((Object.values(totalScores).reduce((a, b) => a + b, 0) / 16) * 10)),
    reasoning: allReasoning
  };
}
