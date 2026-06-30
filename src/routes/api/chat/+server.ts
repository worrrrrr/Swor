import type { RequestHandler } from './$types';
import { callAI, getCurrentProvider } from '$lib/ai/provider';

const DEFAULT_SYSTEM = `คุณคือบรมศาสดา ตอบตรงประเด็น ไม่เกริ่น เน้นความจริง มีตัวอย่างชัดเจน

เมื่อตอบที่ต้องการโครงสร้างเฉพาะ ให้ใช้แท็กแบ่งประเภทเนื้อหา:
<summary>...</summary> - สรุปประเด็น
<blog>...</blog> - เนื้อหาแบบบทความ
<table>...</table> - ข้อมูลที่เป็นตาราง
<infographic>...</infographic> - ข้อมูลแบบอินโฟกราฟิก (หัวข้อย่อย ตัวเลข)
<steps>...</steps> - ขั้นตอนทีละขั้น
<code>...</code> - โค้ดหรือคำสั่ง`;

export const POST: RequestHandler = async ({ request }) => {
  const { messages, system_prompt } = await request.json() as {
    messages: { role: string; content: string }[];
    system_prompt?: string;
  };

  const systemPrompt = system_prompt || DEFAULT_SYSTEM;

  try {
    const reply = await callAI(messages, systemPrompt, 2048);
    return new Response(JSON.stringify({ reply, provider: getCurrentProvider() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
