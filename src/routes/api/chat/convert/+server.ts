import { callAI } from '$lib/ai/provider';
import type { RequestHandler } from './$types';

const SYSTEM_PROMPTS: Record<string, string> = {
  blog: `คุณคือนักเขียนบทความมืออาชีพ
แปลงบทสนทนาต่อไปนี้เป็นบทความภาษาไทยที่อ่านง่าย มีโครงสร้าง มีประโยชน์
- เขียนแบบคน สละสลวย ไม่ใช่ภาษา AI
- มีหัวข้อ แบ่งเป็นส่วน ๆ ชัดเจน
- ใช้คำเชื่อมธรรมชาติ ไม่ซ้ำซาก
- ไม่ขึ้นต้นว่า "โอเค" "ครับ/คะ" "สวัสดี"
- ตอบเฉพาะเนื้อหาบทความ ไม่มีคำอธิบายเพิ่มเติม`,

  summary: `คุณคือผู้ช่วยสรุปเนื้อหา
สรุปประเด็นสำคัญจากบทสนทนาต่อไปนี้ กระชับ ได้ใจความ
- เขียนเป็นภาษาไทย ใช้ภาษาที่อ่านง่าย
- แยกประเด็นเป็นข้อ ๆ
- ไม่เติมความเห็นส่วนตัว
- ตอบเฉพาะสรุป ไม่มีคำนำหรือคำลงท้าย`,

  table: `คุณคือผู้ช่วยจัดข้อมูล
แปลงข้อมูลจากบทสนทนาต่อไปนี้เป็นตารางภาษาไทย
- ใช้ Markdown table format
- หัวข้อตารางชัดเจน อ่านเข้าใจง่าย
- ถ้ามีหลายชุดข้อมูล ให้แยกเป็นหลายตาราง
- ตอบเฉพาะตาราง ไม่มีคำอธิบาย`,

  infographic: `คุณคือนักออกแบบอินโฟกราฟิก
แปลงข้อมูลจากบทสนทนาต่อไปนี้เป็นอินโฟกราฟิกแบบ text-based
- ใช้หัวข้อหลัก รอง และ bullet points
- เน้นตัวเลข สถิติ หรือข้อมูลสำคัญเด่น ๆ
- มีโครงสร้าง: ภาพรวม → รายละเอียด → สรุป
- ตอบเฉพาะเนื้อหา ไม่มีคำอธิบาย`,

  steps: `คุณคือผู้ช่วยเขียนขั้นตอน
แปลงเนื้อหาจากบทสนทนาต่อไปนี้เป็นขั้นตอนปฏิบัติทีละขั้น
- เรียงลำดับขั้นตอน 1, 2, 3...
- แต่ละขั้นตอนกระชับ เข้าใจง่าย
- ถ้ามีคำแนะนำเพิ่มเติมให้ใส่ในแต่ละขั้นตอน
- ตอบเฉพาะขั้นตอน ไม่มีคำอธิบาย`,

  code: `คุณคือโปรแกรมเมอร์
ดึงหรือเขียนโค้ดจากบทสนทนาต่อไปนี้
- ใช้ syntax highlighting ด้วย triple backticks
- มีคำอธิบายสั้น ๆ ก่อนโค้ด
- แยกส่วนของโค้ดออกเป็นส่วน ๆ ตามความเหมาะสม
- ตอบเฉพาะโค้ด คำอธิบายสั้น ๆ ไม่มีอย่างอื่น`,
};

export const POST: RequestHandler = async ({ request }) => {
  const { messages, format, title } = await request.json() as {
    messages: { role: string; content: string }[];
    format: string;
    title: string;
  };

  if (!messages?.length || !format) {
    return new Response('missing fields', { status: 400 });
  }

  const systemPrompt = SYSTEM_PROMPTS[format];
  if (!systemPrompt) {
    return new Response('unsupported format', { status: 400 });
  }

  const chatText = messages
    .filter(m => m.role !== 'system')
    .map(m => {
      const label = m.role === 'user' ? 'ผู้ถาม' : 'ผู้ตอบ';
      return `[${label}]\n${m.content}`;
    })
    .join('\n\n---\n\n');

  const userPrompt = `ชื่อบทความ/หัวข้อ: ${title || 'ไม่มีชื่อ'}\n\nบทสนทนา:\n\n${chatText}\n\n---\n\nโปรดแปลงบทสนทนานี้ตาม format ที่กำหนด`;

  try {
    const reply = await callAI(
      [{ role: 'user', content: userPrompt }],
      systemPrompt,
      4096
    );

    const clean = reply
      .replace(/^(โอเค|ครับ|คะ|สวัสดี|ขอบคุณ)/i, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const final = format === 'blog' ? `# ${title || 'ไม่มีชื่อ'}\n\n${clean}` : clean;

    return Response.json({ content: final });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};
