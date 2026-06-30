import { supabase } from '$lib/supabaseClient';
import { callAI } from '$lib/ai/provider';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('unauthorized', { status: 401 });

  const { notebook_id, messages } = await request.json() as {
    notebook_id: string;
    messages: { role: string; content: string }[];
  };

  if (!notebook_id || !messages?.length) {
    return new Response('missing fields', { status: 400 });
  }

  const { data: notebook } = await supabase
    .from('notebooks')
    .select('title, description')
    .eq('id', notebook_id)
    .single();

  const { data: sources } = await supabase
    .from('notebook_sources')
    .select('title, content')
    .eq('notebook_id', notebook_id);

  const sourceText = (sources || [])
    .map(s => `[${s.title}]\n${s.content.slice(0, 3000)}`)
    .join('\n\n---\n\n');

  const systemPrompt = `คุณคือผู้ช่วย AI สำหรับ Notebook "${notebook?.title || 'ไม่มีชื่อ'}"
${notebook?.description ? `คำอธิบาย: ${notebook.description}` : ''}

เนื้อหาอ้างอิงใน notebook นี้:
${sourceText || '(ไม่มีแหล่งข้อมูล)'}

ตอบโดยอ้างอิงจากเนื้อหาด้านบน ถ้าเนื้อหาไม่พอให้บอกว่าไม่พบข้อมูล
ตอบเป็นภาษาไทย กระชับ ตรงประเด็น`;

  try {
    const reply = await callAI(messages, systemPrompt, 4096);
    return Response.json({ reply });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};
