export const SUGGESTIONS: { text: string; tags: string[] }[] = [
  // Human Design
  { text: 'Human Design Profile ของฉันคืออะไร?', tags: ['hd', 'human design', 'profile'] },
  { text: 'Energy Type ของฉันคืออะไร Generator Manifestor Projector Reflector?', tags: ['hd', 'type'] },
  { text: 'Authority ใน Human Design ของฉันคืออะไร?', tags: ['hd', 'authority'] },
  { text: 'ศูนย์พลังงานทั้ง 9 ใน Human Design อธิบาย', tags: ['hd', 'centers'] },
  { text: 'เปิด Center กับ ปิด Center ต่างกันยังไง?', tags: ['hd', 'centers'] },
  { text: 'Profile 1/3 กับ 4/6 ต่างกันยังไง?', tags: ['hd', 'profile'] },
  { text: 'Human Design Chart ของฉันเป็นยังไง?', tags: ['hd', 'chart'] },
  { text: 'Incarnation Cross คืออะไร?', tags: ['hd', 'cross'] },
  { text: 'Generator กับ Manifestor ต่างกันยังไง?', tags: ['hd', 'type'] },

  // BaZi
  { text: 'BaZi (八字) ของฉันคืออะไร วิเคราะห์ให้หน่อย', tags: ['bazi', 'chinese'] },
  { text: 'ธาตุประจำตัวฉันใน BaZi คืออะไร?', tags: ['bazi', 'element'] },
  { text: 'ปีนักษัตรของฉันคือปีอะไร?', tags: ['bazi', 'animal'] },
  { text: 'ธาตุทั้ง 5 (ไม้ ไฟ ดิน โลหะ น้ำ) ใน BaZi', tags: ['bazi', 'element'] },
  { text: 'ดูดวงจีน BaZi ปีนี้เป็นยังไง?', tags: ['bazi', 'year'] },
  { text: 'BaZi บอกอะไรเกี่ยวกับอาชีพการงาน?', tags: ['bazi', 'career'] },

  // Vedic
  { text: 'ลัคนา (Lagna) ของฉันคืออะไร?', tags: ['vedic', 'lagna'] },
  { text: 'Nakshatra ของฉันคืออะไร?', tags: ['vedic', 'nakshatra'] },
  { text: 'Vedic Astrology กับ Western ต่างกันยังไง?', tags: ['vedic', 'compare'] },

  // Western
  { text: 'ราศีของฉันคืออะไร?', tags: ['western', 'sign'] },
  { text: 'Planets ใน Western Astrology ส่งผลยังไง?', tags: ['western', 'planet'] },

  // MBTI
  { text: 'MBTI ของฉันคือประเภทไหน?', tags: ['mbti', 'personality'] },
  { text: 'Cognitive Functions คืออะไร?', tags: ['mbti', 'function'] },
  { text: 'Ni กับ Ne ต่างกันยังไง?', tags: ['mbti', 'function'] },
  { text: 'INTJ กับ INFJ ต่างกันยังไง?', tags: ['mbti', 'compare'] },
  { text: 'INFP กับ ENFP ต่างกันยังไง?', tags: ['mbti', 'compare'] },
  { text: 'Shadow Core ใน MBTI คืออะไร?', tags: ['mbti', 'shadow'] },
  { text: 'ทำแบบทดสอบ MBTI', tags: ['mbti', 'test'] },

  // Enneagram
  { text: 'Enneagram Type ของฉันคืออะไร?', tags: ['enneagram', 'personality'] },
  { text: 'Triad ใน Enneagram คืออะไร?', tags: ['enneagram', 'triad'] },
  { text: 'Wing ใน Enneagram คืออะไร?', tags: ['enneagram', 'wing'] },
  { text: 'Type 5 กับ Type 6 ต่างกันยังไง?', tags: ['enneagram', 'compare'] },
  { text: 'ทําแบบทดสอบ Enneagram', tags: ['enneagram', 'test'] },

  // Content & Writing
  { text: 'ช่วยเขียนบทความเกี่ยวกับดวงชะตา', tags: ['write', 'blog'] },
  { text: 'ช่วยเรียบเรียงเนื้อหานี้ให้ดีขึ้น', tags: ['write', 'edit'] },
  { text: 'ช่วย brainstorm หัวข้อบทความใหม่', tags: ['write', 'idea'] },
  { text: 'ช่วยเขียนอีเมลทางการ', tags: ['write', 'email'] },
  { text: 'ช่วยสรุปเนื้อหานี้ให้กระชับ', tags: ['write', 'summary'] },

  // Code & Tech
  { text: 'ช่วยเขียนโค้ด Python', tags: ['code', 'python'] },
  { text: 'อธิบาย REST API แบบง่ายๆ', tags: ['code', 'api'] },
  { text: 'React กับ Vue ต่างกันยังไง?', tags: ['code', 'compare'] },
  { text: 'ช่วย debug โค้ดนี้ให้หน่อย', tags: ['code', 'debug'] },

  // General
  { text: 'แนะนำหนังสือเกี่ยวกับโหราศาสตร์', tags: ['recommend', 'book'] },
  { text: 'ความเข้ากันได้ของคู่รักจากดวง', tags: ['love', 'compatibility'] },
  { text: 'วิเคราะห์อาชีพจากดวงชะตา', tags: ['career', 'analysis'] },
  { text: 'คํานวณดวงจากวันเกิดให้หน่อย', tags: ['astro', 'birth'] },
  { text: 'Human Design กับ BaZi ต่างกันยังไง?', tags: ['compare', 'system'] },
];

export function filterSuggestions(input: string): string[] {
  if (!input.trim() || input.length < 1) return [];
  const q = input.toLowerCase().trim();

  const scored = SUGGESTIONS.map(s => {
    const lower = s.text.toLowerCase();
    let score = 0;

    // Exact prefix match
    if (lower.startsWith(q)) score += 10;
    // Word starts with query
    else if (lower.split(' ').some(w => w.startsWith(q))) score += 5;
    // Contains query
    else if (lower.includes(q)) score += 2;
    // Tag match
    else if (s.tags.some(t => t.startsWith(q) || t.includes(q))) score += 3;

    return { text: s.text, score };
  })
    .filter(s => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return scored.map(s => s.text);
}
