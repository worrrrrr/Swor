import type { RequestHandler } from './$types';
import { callAI, getCurrentProvider } from '$lib/ai/provider';

export const POST: RequestHandler = async ({ request }) => {
  const { messages, personality, astroProfile } = await request.json() as {
    messages: { role: string; content: string }[];
    personality?: { mbti?: string; enneagram?: number; wing?: string };
    astroProfile?: { birthDate?: string; birthTime?: string; latitude?: number; longitude?: number; timezoneOffset?: number };
  };

  let contextNote = '';
  if (personality?.mbti) {
    contextNote += `\nผู้ใช้มีบุคลิก: MBTI ${personality.mbti}, Enneagram ${personality.enneagram}${personality.wing || ''}`;
  }
  if (astroProfile?.birthDate) {
    contextNote += `\nข้อมูลเกิด: ${astroProfile.birthDate} ${astroProfile.birthTime || ''} พิกัด ${astroProfile.latitude ?? ''},${astroProfile.longitude ?? ''} UTC+${astroProfile.timezoneOffset ?? ''}`;
  }
  if (contextNote) {
    contextNote = `\n\nบริบทผู้ใช้:${contextNote}\n\nใช้ข้อมูลนี้ช่วยตอบให้ตรงกับผู้ใช้มากขึ้น`;
  }

  const systemPrompt = `คุณคือผู้ช่วย AI ชื่อ Grounded Oracle พูดจาเป็นกันเอง ให้คำแนะนำที่มีประโยชน์ ตอบเป็นภาษาไทย${contextNote}`;

  try {
    const reply = await callAI(messages, systemPrompt, 2048);
    return new Response(JSON.stringify({ reply, provider: getCurrentProvider() }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
