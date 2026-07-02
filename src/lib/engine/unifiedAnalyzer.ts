// Unified Astrology Analyzer - รวมการวิเคราะห์จาก 3 ระบบ + MBTI/Enneagram

import type { FullWesternChart } from './westernResolver';
import type { EasternResult } from './easternInterpreter';
import type { BaziResult } from './baziInterpreter';
import { analyzePersonality } from './utils/personalityMapper';
import { WESTERN_ZODIAC_MEANINGS, ELEMENT_MEANINGS } from './constants/westernMeanings';
import { VEDIC_SIGN_MEANINGS, NAKSHATRA_MEANINGS, LANNADAY_MEANINGS } from './constants/easternMeanings';
import { BAZI_ELEMENT_MEANINGS, BAZI_ANIMAL_MEANINGS } from './constants/baziMeanings';

export interface UnifiedAnalysis {
  // ข้อมูลพื้นฐาน
  birthInfo: {
    date: string;
    time: string;
    location: string;
    timezone: number;
  };

  // Western Astrology
  western: {
    sunSign: string;
    moonSign: string;
    ascendant: string;
    dominantElement: string;
    dominantQuality: string;
    keyPlanets: Array<{ name: string; sign: string; house?: number }>;
    summary: string;
    strengths: string[];
    challenges: string[];
  };

  // Eastern/Vedic Astrology
  eastern: {
    lagna: string;
    rashi: string;
    nakshatra: string;
    thaiDay: string;
    tithi: string;
    yearAnimal: string;
    summary: string;
    strengths: string[];
    challenges: string[];
  };

  // Bazi Astrology
  bazi: {
    dayMaster: string;
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    dominantElement: string;
    weakElement: string;
    summary: string;
    strengths: string[];
    challenges: string[];
  };

  // Personality Analysis
  personality: {
    mbti: string;
    enneagram: number;
    confidence: number;
    reasoning: string[];
    description: string;
  };

  // Cross-System Synthesis
  synthesis: {
    commonThemes: string[];
    uniqueInsights: string[];
    lifePath: string;
    careerGuidance: string;
    relationshipGuidance: string;
    healthGuidance: string;
    spiritualGrowth: string;
  };

  // Detailed Reading (สำหรับ AI Chat)
  fullReading: string;
}

/**
 * วิเคราะห์ดวงแบบรวมทุก系统进行分析
 */
export function analyzeAllSystems(
  western: FullWesternChart,
  eastern: EasternResult,
  bazi: BaziResult,
  birthDate: Date,
  birthTime: string,
  location: string,
  timezone: number
): UnifiedAnalysis {
  // วิเคราะห์ Western
  const westernAnalysis = analyzeWestern(western);
  
  // วิเคราะห์ Eastern
  const easternAnalysis = analyzeEastern(eastern);
  
  // วิเคราะห์ Bazi
  const baziAnalysis = analyzeBazi(bazi);
  
  // วิเคราะห์ Personality (MBTI + Enneagram)
  const personality = analyzePersonality(western, eastern, bazi);
  
  // สร้าง Personality Description
  const personalityDescription = generatePersonalityDescription(personality.mbti, personality.enneagram);
  
  // Synthesis ข้ามระบบ
  const synthesis = createSynthesis(westernAnalysis, easternAnalysis, baziAnalysis, personality);
  
  // สร้าง Full Reading แบบละเอียด
  const fullReading = generateFullReading(
    westernAnalysis,
    easternAnalysis,
    baziAnalysis,
    personality,
    synthesis
  );

  return {
    birthInfo: {
      date: birthDate.toISOString().split('T')[0],
      time: birthTime,
      location,
      timezone
    },
    western: westernAnalysis,
    eastern: easternAnalysis,
    bazi: baziAnalysis,
    personality: {
      ...personality,
      description: personalityDescription
    },
    synthesis,
    fullReading
  };
}

/**
 * วิเคราะห์ Western Astrology แบบละเอียด
 */
function analyzeWestern(chart: FullWesternChart) {
  const sunSign = chart.planets.find(p => p.name === 'Sun')?.signName || 'Unknown';
  const moonSign = chart.planets.find(p => p.name === 'Moon')?.signName || 'Unknown';
  const ascendant = chart.ascendant.signName;
  
  // หาธาตุที่โดดเด่น
  const elementCounts: Record<string, number> = { ไฟ: 0, ดิน: 0, ลม: 0, น้ำ: 0 };
  chart.planets.forEach(planet => {
    const signData = WESTERN_ZODIAC_MEANINGS[planet.signName];
    if (signData) {
      elementCounts[signData.element] = (elementCounts[signData.element] || 0) + 1;
    }
  });
  
  const dominantElement = Object.entries(elementCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
  
  // หา Quality ที่โดดเด่น
  const qualityCounts: Record<string, number> = { Cardinal: 0, Fixed: 0, Mutable: 0 };
  chart.planets.forEach(planet => {
    const signData = WESTERN_ZODIAC_MEANINGS[planet.signName];
    if (signData) {
      qualityCounts[signData.quality] = (qualityCounts[signData.quality] || 0) + 1;
    }
  });
  
  const dominantQuality = Object.entries(qualityCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
  
  // ดาวสำคัญ
  const keyPlanets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn']
    .map(name => {
      const planet = chart.planets.find(p => p.name === name);
      return planet ? { 
        name, 
        sign: planet.signName,
        house: planet.house 
      } : null;
    })
    .filter(Boolean) as Array<{ name: string; sign: string; house?: number }>;
  
  // สรุป
  const sunData = WESTERN_ZODIAC_MEANINGS[sunSign];
  const moonData = WESTERN_ZODIAC_MEANINGS[moonSign];
  const ascData = WESTERN_ZODIAC_MEANINGS[ascendant];
  
  const summary = `คุณคือคนราศี${sunData?.name || sunSign} มีจันทร์ใน${moonData?.name || moonSign} ลัคนา${ascData?.name || ascendant} 
    ${sunData?.traits || ''} ${moonData?.traits ? 'อารมณ์และความต้องการลึกๆ คือ ' + moonData.traits : ''}`;
  
  const strengths = extractStrengths([sunData, moonData, ascData].filter(Boolean));
  const challenges = extractChallenges([sunData, moonData, ascData].filter(Boolean));
  
  return {
    sunSign,
    moonSign,
    ascendant,
    dominantElement,
    dominantQuality,
    keyPlanets,
    summary,
    strengths,
    challenges
  };
}

/**
 * วิเคราะห์ Eastern/Vedic Astrology
 */
function analyzeEastern(eastern: EasternResult) {
  const lagna = eastern.vedic.lagna;
  const rashi = eastern.vedic.rashi;
  const nakshatra = eastern.vedic.nakshatra;
  const thaiDay = eastern.thai.lannaDay;
  const tithi = eastern.thai.tithi;
  const yearAnimal = eastern.thai.naksatYear;
  
  const lagnaData = VEDIC_SIGN_MEANINGS[lagna];
  const nakshatraData = NAKSHATRA_MEANINGS[nakshatra];
  const dayData = LANNADAY_MEANINGS[thaiDay];
  
  const summary = `ลัคนา${lagnaData?.name || lagna} ในนักษัตร${nakshatraData?.name || nakshatra} เกิดวัน${dayData?.name || thaiDay}
    ${lagnaData?.traits || ''} ${nakshatraData?.traits ? ' นักษัตรให้พลัง: ' + nakshatraData.traits : ''}`;
  
  const strengths = [
    ...(lagnaData?.traits ? [lagnaData.traits.split(' ')[0]] : []),
    ...(nakshatraData?.traits ? [nakshatraData.traits.split(' ')[0]] : []),
    ...(dayData ? ['มีพลังวันเกิดที่เหมาะสม'] : [])
  ];
  
  const challenges = [
    'อาจต้องพัฒนาความสมดุลระหว่างความเป็นตัวตนกับความต้องการของผู้อื่น',
    'ระวังเรื่องอารมณ์ที่แปรปรวนตามจังหวะดวงจันทร์'
  ];
  
  return {
    lagna,
    rashi,
    nakshatra,
    thaiDay,
    tithi,
    yearAnimal,
    summary,
    strengths,
    challenges
  };
}

/**
 * วิเคราะห์ Bazi Astrology
 */
function analyzeBazi(bazi: BaziResult) {
  const dayMaster = bazi.dayPillar.element;
  const yearPillar = `${bazi.yearPillar.element}${bazi.yearPillar.animal}`;
  const monthPillar = `${bazi.monthPillar.element}${bazi.monthPillar.animal}`;
  const dayPillar = `${bazi.dayPillar.element}${bazi.dayPillar.animal}`;
  const hourPillar = `${bazi.hourPillar.element}${bazi.hourPillar.animal}`;
  
  const dmData = BAZI_ELEMENT_MEANINGS[dayMaster];
  const animalData = BAZI_ANIMAL_MEANINGS[bazi.yearPillar.animal];
  
  // หาธาตุที่โดดเด่นและธาตุที่อ่อนแอ
  const elementCounts: Record<string, number> = {};
  [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar].forEach(pillar => {
    const elem = pillar.element.replace('หยาง', '').replace('หยิน', '');
    elementCounts[elem] = (elementCounts[elem] || 0) + 1;
  });
  
  const dominantElement = Object.entries(elementCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
  
  const weakElement = Object.entries(elementCounts)
    .sort((a, b) => a[1] - b[1])[0]?.[0] || 'Unknown';
  
  const summary = `คุณเกิดวัน${dmData?.name || dayMaster} ปี${animalData?.name || bazi.yearPillar.animal}
    ${dmData?.traits || ''} ${animalData?.traits ? ' ปีนักษัตรให้พลัง: ' + animalData.traits : ''}`;
  
  const strengths = [
    ...(dmData?.traits ? [dmData.traits.split(' ')[0]] : []),
    ...(animalData?.traits ? [animalData.traits.split(' ')[0]] : []),
    'มีความสามารถในการปรับตัวตามสถานการณ์'
  ];
  
  const challenges = [
    'อาจต้องระวังเรื่องความสมดุลของธาตุในชีวิต',
    'เรียนรู้ที่จะใช้จุดแข็งของธาตุวันเกิดให้เป็นประโยชน์'
  ];
  
  return {
    dayMaster,
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    dominantElement,
    weakElement,
    summary,
    strengths,
    challenges
  };
}

/**
 * สร้าง Synthesis ข้ามระบบ
 */
function createSynthesis(
  western: any,
  eastern: any,
  bazi: any,
  personality: any
) {
  const commonThemes: string[] = [];
  const uniqueInsights: string[] = [];
  
  // หา themes ร่วม
  if (western.dominantElement === 'ไฟ' || bazi.dominantElement.includes('ไฟ')) {
    commonThemes.push('มีพลังแห่งไฟ: ความกระตือรือร้น ความเป็นผู้นำ ความคิดสร้างสรรค์');
  }
  if (western.dominantElement === 'น้ำ' || bazi.dominantElement.includes('น้ำ')) {
    commonThemes.push('มีพลังแห่งน้ำ: ความลึกซึ้ง อารมณ์อ่อนไหว ปัญญา');
  }
  if (western.dominantElement === 'ดิน' || bazi.dominantElement.includes('ดิน')) {
    commonThemes.push('มีพลังแห่งดิน: ความมั่นคง  практичный อดทน');
  }
  if (western.dominantElement === 'ลม' || bazi.dominantElement.includes('ไม้')) {
    commonThemes.push('มีพลังแห่งลม/ไม้: การสื่อสาร การเติบโต การปรับตัว');
  }
  
  // Unique insights จากระบบแต่ละระบบ
  uniqueInsights.push(`Western: ${western.summary.substring(0, 100)}...`);
  uniqueInsights.push(`Eastern: ${eastern.summary.substring(0, 100)}...`);
  uniqueInsights.push(`Bazi: ${bazi.summary.substring(0, 100)}...`);
  uniqueInsights.push(`Personality: MBTI ${personality.mbti}, Enneagram ${personality.enneagram}`);
  
  // Life Path
  const lifePath = `ชีวิตของคุณเป็นการเดินทางเพื่อ${getLifePurpose(personality.mbti, personality.enneagram)} 
    โดยใช้จุดแข็งจาก${commonThemes.join(', ') || 'พลังภายในที่หลากหลาย'}`;
  
  // Career Guidance
  const careerGuidance = generateCareerGuidance(western, eastern, bazi, personality);
  
  // Relationship Guidance
  const relationshipGuidance = generateRelationshipGuidance(western, eastern, bazi, personality);
  
  // Health Guidance
  const healthGuidance = generateHealthGuidance(western, bazi);
  
  // Spiritual Growth
  const spiritualGrowth = generateSpiritualGuidance(personality);
  
  return {
    commonThemes,
    uniqueInsights,
    lifePath,
    careerGuidance,
    relationshipGuidance,
    healthGuidance,
    spiritualGrowth
  };
}

/**
 * Generate Full Reading แบบละเอียด
 */
function generateFullReading(
  western: any,
  eastern: any,
  bazi: any,
  personality: any,
  synthesis: any
): string {
  return `
## 🌟 การวิเคราะห์ดวงชะตาแบบละเอียด

### ข้อมูลการเกิด
- วันที่: ${western.birthInfo?.date || 'ไม่ระบุ'}
- เวลา: ${western.birthInfo?.time || 'ไม่ระบุ'}
- สถานที่: ${western.birthInfo?.location || 'ไม่ระบุ'}

---

## ♈ 1. โหราศาสตร์ตะวันตก (Western Astrology)

**อาทิตย์** ใน${western.sunSign}: ${western.summary}

**จุดแข็ง:**
${western.strengths.map(s => `- ${s}`).join('\n')}

**ความท้าทาย:**
${western.challenges.map(c => `- ${c}`).join('\n')}

---

## 🕉️ 2. โหราศาสตร์เวท/ไทย (Eastern/Vedic Astrology)

**ลัคนา** ใน${eastern.lagna}: ${eastern.summary}

**นักษัตร:** ${eastern.nakshatra}
**วันเกิด:** ${eastern.thaiDay}

**จุดแข็ง:**
${eastern.strengths.map(s => `- ${s}`).join('\n')}

---

## 🐉 3. โปยยี่สี่เถียว (Bazi Astrology)

**เจ้าชะตาวัน (Day Master):** ${bazi.dayMaster}
**ปี:** ${bazi.yearPillar}
**เดือน:** ${bazi.monthPillar}
**วัน:** ${bazi.dayPillar}
**ชั่วโมง:** ${bazi.hourPillar}

${bazi.summary}

---

## 🧠 4. วิเคราะห์บุคลิกภาพ (MBTI + Enneagram)

**MBTI Type:** ${personality.mbti}
**Enneagram Type:** ${personality.enneagram}
**ความมั่นใจ:** ${personality.confidence}%

${personality.description}

**เหตุผลจากการวิเคราะห์:**
${personality.reasoning.map(r => `- ${r}`).join('\n')}

---

## 🔮 5. บทสรุปและการสังเคราะห์

### Themes หลัก
${synthesis.commonThemes.map(t => `- ${t}`).join('\n')}

### แนวทางชีวิต
${synthesis.lifePath}

### การงานและอาชีพ
${synthesis.careerGuidance}

### ความรักและความสัมพันธ์
${synthesis.relationshipGuidance}

### สุขภาพ
${synthesis.healthGuidance}

### การเติบโตทางจิตวิญญาณ
${synthesis.spiritualGrowth}

---

*การวิเคราะห์นี้ผสมผสาน wisdom จาก 3 ระบบโหราศาสตร์ชั้นนำของโลก พร้อมการวิเคราะห์บุคลิกภาพทางจิตวิทยาสมัยใหม่*
`;
}

// Helper Functions
function extractStrengths(signs: any[]): string[] {
  const strengths: string[] = [];
  signs.forEach(sign => {
    if (sign?.traits) {
      const traitWords = sign.traits.split(' ').filter(w => w.length > 2);
      strengths.push(...traitWords.slice(0, 3));
    }
  });
  return [...new Set(strengths)].slice(0, 5);
}

function extractChallenges(signs: any[]): string[] {
  const challenges: string[] = [];
  signs.forEach(sign => {
    if (sign?.weakness) {
      challenges.push(sign.weakness);
    }
  });
  return challenges.slice(0, 3);
}

function getLifePurpose(mbti: string, enneagram: number): string {
  const purposes: Record<string, string> = {
    'INTJ': 'พัฒนาวิสัยทัศน์และสร้างระบบที่มีประสิทธิภาพ',
    'INTP': 'ค้นหาความจริงและพัฒนาความรู้เชิงลึก',
    'ENTJ': 'เป็นผู้นำและสร้างการเปลี่ยนแปลงในวงกว้าง',
    'ENTP': 'สร้างนวัตกรรมและท้าทายสถานะเดิม',
    'INFJ': 'ช่วยเหลือผู้อื่นให้เติบโตและค้นพบความหมาย',
    'INFP': 'แสดงออกถึงคุณค่าและความงามผ่านความคิดสร้างสรรค์',
    'ENFJ': 'สร้างแรงบันดาลใจและนำพาผู้อื่นสู่ศักยภาพสูงสุด',
    'ENFP': 'สร้างแรงบันดาลใจและเชื่อมโยงผู้คนเข้าด้วยกัน',
    'ISTJ': 'รักษาความเป็นระเบียบและสร้างความมั่นคง',
    'ISFJ': 'ดูแลและปกป้องคนที่รัก',
    'ESTJ': 'จัดระบบและนำทีมสู่ความสำเร็จ',
    'ESFJ': 'สร้างบรรยากาศที่อบอุ่นและสามัคคี',
    'ISTP': 'แก้ปัญหาและเชี่ยวชาญในทักษะเฉพาะ',
    'ISFP': 'แสดงออกถึงความงามและใช้ชีวิตอย่างอิสระ',
    'ESTP': 'ลงมือทำและคว้าโอกาสในชีวิต',
    'ESFP': 'สร้างความสุขและทำให้ชีวิตมีชีวิตชีวา'
  };
  
  return purposes[mbti] || 'ค้นพบและแสดงออกถึงตัวตนที่แท้จริงของคุณ';
}

function generateCareerGuidance(western: any, eastern: any, bazi: any, personality: any): string {
  const guidances: string[] = [];
  
  if (western.dominantElement === 'ไฟ') {
    guidances.push('เหมาะกับงานที่ใช้ความเป็นผู้นำ ความคิดสร้างสรรค์ การแสดงออก');
  } else if (western.dominantElement === 'ดิน') {
    guidances.push('เหมาะกับงานที่ต้องการความมั่นคง การจัดการ ระบบระเบียบ');
  } else if (western.dominantElement === 'ลม') {
    guidances.push('เหมาะกับงานที่ใช้การสื่อสาร การคิดวิเคราะห์ สังคม');
  } else if (western.dominantElement === 'น้ำ') {
    guidances.push('เหมาะกับงานที่ใช้ความเข้าใจผู้อื่น ศิลปะ การบำบัด');
  }
  
  if (personality.mbti.startsWith('N')) {
    guidances.push('งานที่เปิดโอกาสให้ใช้จินตนาการและวิสัยทัศน์');
  }
  if (personality.mbti.endsWith('J')) {
    guidances.push('งานที่มีโครงสร้างชัดเจนและสามารถวางแผนได้');
  }
  
  return guidances.join(' แนะนำ: ') || 'ค้นหางานที่สอดคล้องกับธรรมชาติและความสนใจของคุณ';
}

function generateRelationshipGuidance(western: any, eastern: any, bazi: any, personality: any): string {
  if (western.moonSign in ['Cancer', 'Scorpio', 'Pisces']) {
    return 'คุณต้องการความสัมพันธ์ที่ลึกซึ้ง มีความหมาย และปลอดภัยทางอารมณ์ คู่ที่เหมาะคือคนที่เข้าใจโลกภายในของคุณ';
  }
  if (western.moonSign in ['Aries', 'Leo', 'Sagittarius']) {
    return 'คุณต้องการความสัมพันธ์ที่มีอิสระ ความตื่นเต้น และการผจญภัยร่วมกัน';
  }
  if (western.moonSign in ['Taurus', 'Virgo', 'Capricorn']) {
    return 'คุณต้องการความสัมพันธ์ที่มั่นคง ซื่อสัตย์ และสามารถสร้างอนาคตร่วมกันได้';
  }
  if (western.moonSign in ['Gemini', 'Libra', 'Aquarius']) {
    return 'คุณต้องการความสัมพันธ์ที่มีการสื่อสารดี มีมิตรภาพ และเคารพในพื้นที่ส่วนตัว';
  }
  
  return 'สร้างความสัมพันธ์ที่สมดุลระหว่างการให้และการรับ เปิดใจสื่อสารอย่างจริงใจ';
}

function generateHealthGuidance(western: any, bazi: any): string {
  const advice: string[] = [];
  
  if (bazi.weakElement === 'ไฟ') {
    advice.push('ระวังเรื่องระบบหัวใจและการไหลเวียนเลือด ออกกำลังกายสม่ำเสมอ');
  }
  if (bazi.weakElement === 'ดิน') {
    advice.push('ระวังเรื่องระบบย่อยอาหาร กินอาหารที่มีประโยชน์และเป็นเวลา');
  }
  if (bazi.weakElement === 'ทอง') {
    advice.push('ระวังเรื่องระบบทางเดินหายใจ ดูแลปอดและระบบภูมิคุ้มกัน');
  }
  if (bazi.weakElement === 'น้ำ') {
    advice.push('ระวังเรื่องระบบขับถ่ายและไต ดื่มน้ำเพียงพอ พักผ่อนให้เพียงพอ');
  }
  if (bazi.weakElement === 'ไม้') {
    advice.push('ระวังเรื่องตับและระบบประสาท จัดการความเครียดให้ดี');
  }
  
  return advice.join(' ') || 'ดูแลสุขภาพแบบองค์รวม ทั้งกาย ใจ และจิตวิญญาณ';
}

function generateSpiritualGuidance(personality: any): string {
  const enneagramGuidance: Record<number, string> = {
    1: 'เรียนรู้ที่จะยอมรับความไม่สมบูรณ์แบบและฝึกความเห็นอกเห็นใจตนเอง',
    2: 'เรียนรู้ที่จะให้โดยไม่คาดหวัง และดูแลความต้องการของตนเองด้วย',
    3: 'ค้นหาคุณค่าที่แท้จริงนอกเหนือจากความสำเร็จและการยอมรับ',
    4: 'ยอมรับความธรรมดาและค้นพบความงามในชีวิตประจำวัน',
    5: 'เปิดใจเชื่อมต่อกับผู้อื่นและแบ่งปันความรู้ที่มี',
    6: 'พัฒนาความไว้วางใจในตนเองและจักรวาล ลดความกังวล',
    7: 'เรียนรู้ที่จะอยู่กับปัจจุบันและยอมรับความเจ็บปวดเป็นส่วนหนึ่งของชีวิต',
    8: 'ใช้พลังเพื่อปกป้องและยกระดับผู้อื่น แทนการควบคุม',
    9: 'ตระหนักถึงคุณค่าของตนเองและกล้าแสดงออกอย่างเหมาะสม'
  };
  
  return enneagramGuidance[personality.enneagram] || 'เดินทางสู่การรู้จักตนเองอย่างลึกซึ้งและยอมรับทุกส่วนของตัวตน';
}

function generatePersonalityDescription(mbti: string, enneagram: number): string {
  const mbtiDescriptions: Record<string, string> = {
    'INTJ': 'นักยุทธศาสตร์: มีวิสัยทัศน์ วางแผนระยะยาว คิดอย่างเป็นระบบ',
    'INTP': 'นักตรรกะ: ชอบวิเคราะห์ ค้นหาความจริง คิดอย่างมีเหตุผล',
    'ENTJ': 'ผู้บัญชาการ: เป็นผู้นำโดยธรรมชาติ มุ่งมั่นสู่เป้าหมาย',
    'ENTP': 'ผู้ริเริ่ม: สร้างสรรค์ไอเดียใหม่ๆ ท้าทายความคิดเดิม',
    'INFJ': 'ที่ปรึกษา: เข้าใจผู้อื่นลึกซึ้ง มีอุดมการณ์สูง',
    'INFP': 'ผู้เยียวยา: มีอุดมการณ์ เห็นอกเห็นใจ สร้างสรรค์',
    'ENFJ': 'พระเอก: สร้างแรงบันดาลใจ นำพาผู้อื่นสู่สิ่งที่ดีกว่า',
    'ENFP': 'นักรณรงค์: กระตือรือร้น สร้างสรรค์ เชื่อมโยงผู้คน',
    'ISTJ': 'ผู้ตรวจสอบ: รับผิดชอบสูง มีระเบียบ เชื่อถือได้',
    'ISFJ': 'ผู้ปกป้อง: ใส่ใจดูแลผู้อื่น ละเอียดรอบคอบ',
    'ESTJ': 'ผู้บริหาร: จัดการเก่ง ตัดสินใจเด็ดขาด',
    'ESFJ': 'ผู้ให้คำปรึกษา: เข้าสังคมเก่ง ใส่ใจความรู้สึกผู้อื่น',
    'ISTP': 'ช่างฝีมือ: แก้ปัญหาเก่ง ปฏิบัติจริง',
    'ISFP': 'ศิลปิน: มีสุนทรียะ ใช้ชีวิตอย่างอิสระ',
    'ESTP': 'ผู้ประกอบการ: กล้าเสี่ยง ลงมือทำเร็ว',
    'ESFP': 'ผู้ให้ความบันเทิง: สร้างความสุข รักชีวิต'
  };
  
  const enneagramDescriptions: Record<number, string> = {
    1: 'The Perfectionist: มุ่งมั่นสู่ความสมบูรณ์แบบ มีหลักการสูง',
    2: 'The Helper: ให้โดยไม่หวังผล ใส่ใจความต้องการผู้อื่น',
    3: 'The Achiever: มุ่งสู่ความสำเร็จ ปรับตัวเก่ง',
    4: 'The Individualist: มีเอกลักษณ์ ลึกซึ้งทางอารมณ์',
    5: 'The Investigator: ชอบวิเคราะห์ แสวงหาความรู้',
    6: 'The Loyalist: ซื่อสัตย์ ระวังภัย วางแผนล่วงหน้า',
    7: 'The Enthusiast: มองโลกในแง่ดี รักอิสระ สนุกกับชีวิต',
    8: 'The Challenger: มั่นใจ กล้าหาญ ปกป้องผู้อื่น',
    9: 'The Peacemaker: รักสงบ ประนีประนอม เข้าใจทุกฝ่าย'
  };
  
  return `${mbtiDescriptions[mbti] || 'มีบุคลิกเฉพาะตัว'} | ${enneagramDescriptions[enneagram] || 'มีแรงจูงใจเฉพาะตัว'}`;
}
