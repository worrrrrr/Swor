export type MBTIDimension = 'EI' | 'SN' | 'TF' | 'JP';

export interface MBTIMapping {
  dimension: MBTIDimension;
  value: 'E' | 'I' | 'S' | 'N' | 'T' | 'F' | 'J' | 'P';
  weight: number;
}

export interface EnneagramMapping {
  type: number;
  weight: number;
}

export interface Choice {
  id: string;
  text: string;
  mbtiImpact?: MBTIMapping;
  enneagramImpact?: EnneagramMapping;
}

export interface Question {
  id: number;
  type: 'mbti' | 'enneagram' | 'hybrid';
  scenario: string;
  choices: Choice[];
}

export interface AssessmentResult {
  mbti: string;
  enneagram: number;
  rawScores: {
    mbti: Record<string, number>;
    enneagram: Record<number, number>;
  };
}

export const MBTI_INFO: Record<string, { label: string; desc: string }> = {
  INTJ: { label: 'The Architect', desc: 'นักวางแผน มีวิสัยทัศน์ มุ่งเป้าหมาย' },
  INTP: { label: 'The Thinker', desc: 'นักคิด นักวิเคราะห์ รักความเข้าใจ' },
  ENTJ: { label: 'The Commander', desc: 'ผู้นำเด็ดขาด วางระบบ มุ่งผลลัพธ์' },
  ENTP: { label: 'The Debater', desc: 'นักโต้แย้ง มองโอกาส ชอบท้าทาย' },
  INFJ: { label: 'The Advocate', desc: 'มีอุดมการณ์ เข้าใจคน มีวิสัยทัศน์' },
  INFP: { label: 'The Mediator', desc: 'อุดมการณ์สูง รักความหมาย อ่อนโยน' },
  ENFJ: { label: 'The Protagonist', desc: 'ผู้นำที่มีเสน่ห์ ใส่ใจส่วนรวม' },
  ENFP: { label: 'The Campaigner', desc: 'สร้างสรรค์ มองโลกแง่ดี มีพลัง' },
  ISTJ: { label: 'The Inspector', desc: 'รับผิดชอบ รอบคอบ ยึดหลักการ' },
  ISFJ: { label: 'The Defender', desc: 'ผู้ปกป้อง อ่อนโยน ใส่ใจคนรอบข้าง' },
  ESTJ: { label: 'The Executive', desc: 'บริหารจัดการ มีระเบียบ ชัดเจน' },
  ESFJ: { label: 'The Consul', desc: 'เข้าสังคม ใส่ใจผู้อื่น มีน้ำใจ' },
  ISTP: { label: 'The Virtuoso', desc: 'ชอบปฏิบัติ แก้ปัญหาเฉพาะหน้าเก่ง' },
  ISFP: { label: 'The Adventurer', desc: 'รักอิสระ อ่อนไหว มีศิลปะ' },
  ESTP: { label: 'The Entrepreneur', desc: 'กล้าได้กล้าเสีย ชอบปฏิบัติจริง' },
  ESFP: { label: 'The Entertainer', desc: 'มีชีวิตชีวา สนุกสนาน ชอบสังคม' },
};

export const ENNEAGRAM_INFO: Record<number, { label: string; desc: string }> = {
  1: { label: 'The Perfectionist', desc: 'ต้องการความถูกต้อง กลัวผิด มีอุดมการณ์' },
  2: { label: 'The Helper', desc: 'ต้องการเป็นที่รัก กลัวไร้ค่า ใส่ใจผู้อื่น' },
  3: { label: 'The Achiever', desc: 'ต้องการความสำเร็จ กลัวล้มเหลว มุ่งมั่น' },
  4: { label: 'The Individualist', desc: 'ต้องการตัวตน กลัวไร้ความหมาย มีเอกลักษณ์' },
  5: { label: 'The Investigator', desc: 'ต้องการความรู้ กลัวไร้ความสามารถ ชอบวิเคราะห์' },
  6: { label: 'The Loyalist', desc: 'ต้องการความมั่นคง กลัวไม่ปลอดภัย ระวัง' },
  7: { label: 'The Enthusiast', desc: 'ต้องการความสุข กลัวจำเจ มองโลกดี' },
  8: { label: 'The Challenger', desc: 'ต้องการพลัง กลัวอ่อนแอ กล้าเผชิญ' },
  9: { label: 'The Peacemaker', desc: 'ต้องการสงบ กลัวขัดแย้ง ประนีประนอม' },
};
