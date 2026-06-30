export interface SlashNode {
  key: string;
  label: string;
  icon?: string;
  children?: SlashNode[];
  prompt?: string;          // text to insert as user message
  systemPrompt?: string;    // if set, becomes active system prompt
}

const TREE: SlashNode[] = [
  {
    key: 'astro', label: '🔮 ดูดวง', icon: '🔮', children: [
      {
        key: 'hd', label: 'Human Design', children: [
          { key: 'profile', label: 'Profile', systemPrompt: 'คุณคือนักวิเคราะห์ Human Design ผู้เชี่ยวชาญ ตอบอย่างละเอียด ตรงประเด็น', prompt: 'วิเคราะห์ Human Design Profile ของฉันให้ละเอียด' },
          { key: 'type', label: 'Energy Type', systemPrompt: 'คุณคือนักวิเคราะห์ Human Design ผู้เชี่ยวชาญ', prompt: 'Energy Type ของฉันใน Human Design คืออะไร?' },
        ]
      },
      {
        key: 'bazi', label: 'BaZi (八字)', children: [
          { key: 'chart', label: 'ดูดวงเต็ม', systemPrompt: 'คุณคืออาจารย์พยากรณ์ BaZi ผู้เชี่ยวชาญ', prompt: 'วิเคราะห์ BaZi ของฉันอย่างละเอียด' },
          { key: 'element', label: 'ธาตุ', systemPrompt: 'คุณคืออาจารย์พยากรณ์ BaZi', prompt: 'ธาตุประจำตัวของฉันคืออะไร?' },
        ]
      },
      {
        key: 'vedic', label: 'Vedic', children: [
          { key: 'lagna', label: 'ลัคนา', systemPrompt: 'คุณคือนักโหราศาสตร์ Vedic', prompt: 'ลัคนา (Lagna) ของฉันคืออะไร?' },
        ]
      },
      {
        key: 'western', label: 'Western', children: [
          { key: 'sign', label: 'ราศี', systemPrompt: 'คุณคือนักโหราศาสตร์ Western', prompt: 'ราศีของฉันคืออะไร?' },
        ]
      },
    ]
  },
  {
    key: 'personality', label: '🧠 บุคลิกภาพ', icon: '🧠', children: [
      { key: 'mbti', label: 'MBTI', systemPrompt: 'คุณคือนักจิตวิทยาผู้เชี่ยวชาญด้าน MBTI', prompt: 'MBTI ของฉันคืออะไร?' },
      { key: 'enneagram', label: 'Enneagram', systemPrompt: 'คุณคือนักจิตวิทยาผู้เชี่ยวชาญด้าน Enneagram', prompt: 'Enneagram Type ของฉันคืออะไร?' },
    ]
  },
  {
    key: 'blog', label: '📝 บทความ', icon: '📝', children: [
      { key: 'write', label: 'เขียนบทความ', systemPrompt: 'คุณคือนักเขียนบทความมืออาชีพ', prompt: 'ช่วยฉันเขียนบทความเกี่ยวกับ' },
      { key: 'edit', label: 'เรียบเรียง', systemPrompt: 'คุณคือบรรณาธิการ', prompt: 'ช่วยเรียบเรียงเนื้อหานี้ให้ดีขึ้น' },
    ]
  },
  {
    key: 'translate', label: '🌍 แปลภาษา', icon: '🌍', children: [
      { key: 'to-thai', label: 'เป็นไทย', systemPrompt: 'คุณคือนักแปล แปลจากภาษาอื่นเป็นไทย ธรรมชาติ', prompt: 'แปลข้อความนี้เป็นภาษาไทย:' },
      { key: 'to-en', label: 'เป็นอังกฤษ', systemPrompt: 'You are a professional English translator.', prompt: 'Translate this to English:' },
    ]
  },
  {
    key: 'help', label: '💡 ช่วยเหลือ', icon: '💡', prompt: 'คุณช่วยอะไรฉันได้บ้าง? แนะนำฟีเจอร์ทั้งหมด'
  },
  {
    key: 'clear', label: '🗑 ล้างแชท', icon: '🗑', prompt: '__CLEAR__'
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
