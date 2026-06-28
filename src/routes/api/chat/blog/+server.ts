import type { RequestHandler } from './$types';
import { callAI } from '$lib/ai/provider';

export const POST: RequestHandler = async ({ request }) => {
  const { messages, blogContent, personality, astroProfile } = await request.json() as {
    messages: { role: string; content: string }[];
    blogContent: string;
    personality?: { mbti?: string; enneagram?: number; wing?: string };
    astroProfile?: { birthDate?: string; birthTime?: string; latitude?: number; longitude?: number; timezoneOffset?: number };
  };

  let contextNote = '';
  if (personality?.mbti) {
    contextNote += `\nผู้เขียนมีบุคลิก: MBTI ${personality.mbti}, Enneagram ${personality.enneagram}${personality.wing || ''}`;
  }
  if (astroProfile?.birthDate) {
    contextNote += `\nวันเกิดผู้เขียน: ${astroProfile.birthDate} ${astroProfile.birthTime || ''}`;
  }
  if (contextNote) {
    contextNote = `\n\nบริบทผู้เขียน:${contextNote}`;
  }

  const systemPrompt = `คุณคือผู้ช่วยเขียนบทความ (Blog Writing Assistant)

บทความที่กำลังเขียนอยู่:
---
${blogContent || '(ยังไม่มีเนื้อหา)'}
---

กฎการตอบ:
- ถ้าต้องการพูดคุยกับผู้ใช้ ให้ใช้ <q>...</q> ล้อมรอบข้อความสนทนานั้น
- ข้อความนอก <q>...</q> จะถูกนำไปต่อท้ายบทความโดยอัตโนมัติ
- สามารถมี <q>...</q> ได้หลายอันในหนึ่งคำตอบ
- ตอบเป็นภาษาไทย${contextNote}`;

  try {
    const fullReply = await callAI(messages, systemPrompt, 4096);

    const qRegex = /<q>([\s\S]*?)<\/q>/g;
    const chatParts: string[] = [];
    const blogParts: string[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = qRegex.exec(fullReply)) !== null) {
      chatParts.push(match[1].trim());
      if (match.index > lastIndex) {
        blogParts.push(fullReply.slice(lastIndex, match.index).trim());
      }
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < fullReply.length) {
      blogParts.push(fullReply.slice(lastIndex).trim());
    }

    const reply = chatParts.join('\n\n') || fullReply;
    const blogAppend = blogParts.filter(Boolean).join('\n\n');

    return new Response(JSON.stringify({ reply, blogAppend: blogAppend || null }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
