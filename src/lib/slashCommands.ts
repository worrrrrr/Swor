export interface SlashNode {
  key: string;
  label: string;
  icon?: string;
  children?: SlashNode[];
  prompt?: string; // ถ้าเป็น leaf → ส่ง prompt นี้ไปให้ AI
}

const TREE: SlashNode[] = [
  {
    key: 'astro', label: '🔮 ดูดวง', children: [
      {
        key: 'hd', label: 'Human Design', children: [
          { key: 'profile', label: 'Profile', prompt: 'วิเคราะห์ Human Design Profile ของฉันให้ละเอียด' },
          { key: 'type', label: 'Energy Type', prompt: 'Energy Type ของฉันใน Human Design คืออะไร?' },
          { key: 'authority', label: 'Authority', prompt: 'Inner Authority ของฉันใน Human Design คืออะไร?' },
          { key: 'centers', label: 'ศูนย์พลังงาน', prompt: 'อธิบายศูนย์พลังงานทั้ง 9 ใน Human Design ของฉัน' },
        ]
      },
      {
        key: 'bazi', label: 'BaZi (八字)', children: [
          { key: 'chart', label: 'ดูดวงเต็ม', prompt: 'วิเคราะห์ BaZi (八字) ของฉันอย่างละเอียด' },
          { key: 'element', label: 'ธาตุประจำตัว', prompt: 'ธาตุประจำตัวของฉันใน BaZi คืออะไร?' },
          { key: 'animal', label: 'ปีนักษัตร', prompt: 'ปีนักษัตรของฉันคืออะไร?' },
        ]
      },
      {
        key: 'vedic', label: 'Vedic', children: [
          { key: 'lagna', label: 'ลัคนา', prompt: 'ลัคนา (Lagna) ของฉันใน Vedic Astrology คืออะไร?' },
          { key: 'nakshatra', label: 'Nakshatra', prompt: 'Nakshatra ของฉันคืออะไร?' },
        ]
      },
      {
        key: 'western', label: 'Western', children: [
          { key: 'sign', label: 'ราศี', prompt: 'ราศีของฉันใน Western Astrology คืออะไร?' },
          { key: 'house', label: 'House', prompt: 'วิเคราะห์ House ใน Western Astrology ของฉัน' },
        ]
      },
    ]
  },
  {
    key: 'personality', label: '🧠 บุคลิกภาพ', children: [
      {
        key: 'mbti', label: 'MBTI', children: [
          { key: 'type', label: 'ประเภทของฉัน', prompt: 'MBTI ของฉันคืออะไร? อธิบาย' },
          { key: 'function', label: 'Cognitive Functions', prompt: 'อธิบาย Cognitive Functions ของ MBTI type ฉัน' },
          { key: 'shadow', label: 'Shadow Core', prompt: 'Shadow Core (แก่นที่ซ่อนอยู่) ของ MBTI type ฉันคืออะไร?' },
        ]
      },
      {
        key: 'enneagram', label: 'Enneagram', children: [
          { key: 'type', label: 'ประเภทของฉัน', prompt: 'Enneagram Type ของฉันคืออะไร? อธิบาย' },
          { key: 'triad', label: 'Triad', prompt: 'Triad ของ Enneagram type ฉันคืออะไร?' },
        ]
      },
    ]
  },
  {
    key: 'blog', label: '📝 บทความ', children: [
      { key: 'write', label: 'เขียนบทความ', prompt: 'ช่วยฉันเขียนบทความเกี่ยวกับ' },
      { key: 'edit', label: 'เรียบเรียง', prompt: 'ช่วยเรียบเรียงเนื้อหานี้ให้ดีขึ้น' },
    ]
  },
  {
    key: 'web', label: '🌐 สร้างเว็บ', children: [
      { key: 'ecommerce', label: 'ร้านค้าออนไลน์', prompt: 'ช่วยออกแบบเว็บร้านค้าออนไลน์' },
      { key: 'saas', label: 'SaaS', prompt: 'ช่วยออกแบบเว็บ SaaS' },
      { key: 'ai-agent', label: 'AI Agent', prompt: 'ช่วยออกแบบ AI Agent' },
      { key: 'blog-site', label: 'Blog Site', prompt: 'ช่วยออกแบบเว็บบล็อก' },
      { key: 'portfolio', label: 'Portfolio', prompt: 'ช่วยออกแบบ Portfolio' },
      { key: 'dashboard', label: 'Dashboard', prompt: 'ช่วยออกแบบ Dashboard' },
    ]
  },
  {
    key: 'help', label: '💡 ช่วยเหลือ', prompt: 'คุณช่วยอะไรฉันได้บ้าง? แนะนำฟีเจอร์ทั้งหมด'
  },
  {
    key: 'clear', label: '🗑 ล้างแชท', prompt: '__CLEAR__'
  },
];

export function findNode(path: string[]): { node?: SlashNode; children: SlashNode[]; isLeaf: boolean } {
  let current: SlashNode[] = TREE;
  let found: SlashNode | undefined;

  for (const key of path) {
    const match = current.find(n => n.key === key);
    if (!match) return { children: current, isLeaf: false };
    found = match;
    current = match.children || [];
  }

  return {
    node: found,
    children: current,
    isLeaf: !found?.children || found.children.length === 0,
  };
}

export function matchPath(input: string): { path: string[]; partial: string; rest: string } {
  if (!input.startsWith('/')) return { path: [], partial: '', rest: input };

  const parts = input.slice(1).split('/');
  const path = parts.slice(0, -1).filter(Boolean);
  const partial = parts[parts.length - 1] || '';
  const rest = parts.slice(path.length + 1).join('/');

  return { path, partial, rest };
}

export { TREE };
