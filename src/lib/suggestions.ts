export const SUGGESTIONS = [
  // ====== Intent: อยากได้ / ต้องการ ======
  'อยากได้ Human Design เต็มๆ',
  'อยากได้ BaZi (八字) เต็มๆ',
  'อยากได้โหราศาสตร์อินเดีย (Vedic)',
  'อยากได้ Western Astrology',
  'อยากได้วิเคราะห์ MBTI + Enneagram',
  'อยากได้คำทำนายวันนี้',
  'อยากได้เนื้อหาบทความเกี่ยวกับดวง',
  'อยากได้ข้อมูลเปรียบเทียบดวง',

  // ====== Intent: ดู / เช็ค ======
  'ดูดวงจีน BaZi ให้หน่อย',
  'ดู Human Design Profile',
  'ดูศูนย์พลังงานทั้ง 9',
  'ดู Authority ของฉัน',
  'ดูความเข้ากันได้ทางพลังงาน',
  'เช็คธาตุประจำตัว',
  'เช็คปีนักษัตร',

  // ====== Intent: คืออะไร / หมายถึง ======
  'Human Design คืออะไร?',
  'BaZi (八字) คืออะไร?',
  'MBTI คืออะไร?',
  'Enneagram คืออะไร?',
  'Energy Type คืออะไร?',
  'Authority ใน Human Design คืออะไร?',
  'Profile 4/6 คืออะไร?',
  'Cognitive Functions คืออะไร?',
  'Ni vs Ne ต่างกันยังไง?',
  'Introverted Sensing (Si) คืออะไร?',
  'Projector ใน Human Design คืออะไร?',
  'Generator vs Manifestor ต่างกันยังไง?',

  // ====== Intent: วิเคราะห์ ======
  'วิเคราะห์ดวงชะตาจีนเต็มรูปแบบ',
  'วิเคราะห์พลังธาตุทั้ง 5',
  'วิเคราะห์บุคลิกภาพ MBTI',
  'วิเคราะห์ Enneagram Type',
  'วิเคราะห์ Human Design Chart',
  'วิเคราะห์ความเข้ากันได้ของคู่รัก',
  'วิเคราะห์อาชีพจากดวง',

  // ====== Intent: เปรียบเทียบ ======
  'INTJ กับ INFJ ต่างกันยังไง?',
  'INFP กับ ENFP ต่างกันยังไง?',
  'Type 5 กับ Type 6 ต่างกันยังไง?',
  'Human Design กับ BaZi ต่างกันยังไง?',

  // ====== Intent: ช่วย ======
  'ช่วยเขียนบทความเกี่ยวกับโหราศาสตร์',
  'ช่วยเรียบเรียงเนื้อหาบทความ',
  'ช่วยแนะนำหัวข้อ Blog',
  'ช่วยคำนวณหาความเข้ากันได้',
  'ช่วยวางแผนชีวิตจากดวง',

  // ====== Intent: สิ่งที่ชอบ/สนใจ ======
  'สนใจโหราศาสตร์ไทย',
  'สนใจ Human Design',
  'สนใจ MBTI และ Enneagram',
  'สนใจ BaZi (八字)',
  'สนใจพลังธาตุ',

  // ====== Specific topics ======
  'ธาตุประจำตัวฉันคืออะไร?',
  'ปีนักษัตรของฉันคืออะไร?',
  'ลัคนา (Lagna) ของฉันคืออะไร?',
  'ศูนย์พลังงานทั้ง 9 ของฉัน',
  'Human Design Profile ของฉัน',
  'Authority ของฉันคืออะไร?',
  'ทำแบบทดสอบบุคลิกภาพ',
  'แนะนำหนังสือเกี่ยวกับโหราศาสตร์',
  'คำนวณดวงจากวันเกิดให้หน่อย',
  '9.8 - 9.11 = ?',

  // ====== Greetings ======
  'สวัสดี',
  'What can you do?',
  '你是谁？',
];

export function filterSuggestions(input: string): string[] {
  if (!input.trim() || input.length < 1) return [];
  const q = input.toLowerCase().trim();

  const exact = SUGGESTIONS.filter(s => s.toLowerCase().startsWith(q));
  const fuzzy = SUGGESTIONS.filter(s => s.toLowerCase().includes(q));

  const merged = [...new Set([...exact, ...fuzzy])];
  return merged.slice(0, 6);
}
