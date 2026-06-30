import { SvelteDate } from 'svelte/reactivity';
import { supabase } from '$lib/supabaseClient';
import { browser } from '$app/environment';
import { BUILTIN_STYLES, type PromptStyle } from '$lib/promptStyles';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  blocks?: any[]; // เพิ่มรองรับ JSON Blocks
  timestamp: Date;
  provider?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
}

export interface PromptInfo {
  id: string;
  title: string;
  content: string;
}

function storageKey(sessionId: string) { return `chat_messages_${sessionId}`; }
function saveToLocal(sessionId: string, messages: Message[]) {
  if (!browser) return;
  try { localStorage.setItem(storageKey(sessionId), JSON.stringify(messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() })))); } catch {}
}
function loadFromLocal(sessionId: string): Message[] {
  if (!browser) return [];
  try {
    const raw = localStorage.getItem(storageKey(sessionId));
    if (!raw) return [];
    return JSON.parse(raw).map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) }));
  } catch { return []; }
}
function removeFromLocal(sessionId: string) { if (browser) { try { localStorage.removeItem(storageKey(sessionId)); } catch {} } }

function buildContextSummary(messages: Message[]): { context: string; recent: Message[] } {
  const userTopics = messages.filter(m => m.role === 'user').map(m => m.content.slice(0, 80).replace(/\n/g, ' '));
  return { context: userTopics.join(' → '), recent: messages.slice(-4) };
}

export class ChatStore {
  sessions = $state<ChatSession[]>([]);
  activeSessionId = $state<string>('');
  isProcessing = $state<boolean>(false);
  activeEngineType = $state<string>('WESTERN');
  activePrompt = $state<PromptInfo | null>(null);
  activeStyleId = $state<string>('default');
  acceptedBlocks = $state<any[]>([]); // เก็บ Blocks ที่ผู้ใช้กด Accept

  get activeStyle(): PromptStyle { return BUILTIN_STYLES.find(s => s.id === this.activeStyleId) || BUILTIN_STYLES[0]; }

  constructor() { this.createNewSession('แชทใหม่'); }
  get activeSession(): ChatSession { return this.sessions.find(s => s.id === this.activeSessionId) || this.sessions[0]; }

  public setActivePrompt(prompt: PromptInfo | null) { this.activePrompt = prompt; }
  public setStyle(styleId: string, customPrompt?: PromptInfo) {
    this.activeStyleId = styleId;
    if (styleId === 'default') { this.activePrompt = null; } 
    else if (customPrompt) { this.activePrompt = customPrompt; } 
    else {
      const style = BUILTIN_STYLES.find(s => s.id === styleId);
      if (style) this.activePrompt = { id: style.id, title: style.label, content: style.systemPrompt };
    }
  }

  public createNewSession(title: string, existingId?: string): string {
    const newId = existingId || crypto.randomUUID();
    const newSession: ChatSession = {
      id: newId, title,
      messages: [{ id: crypto.randomUUID(), role: 'assistant', content: 'สวัสดีครับ! มีอะไรให้ผมช่วยได้บ้าง?', timestamp: new SvelteDate() }]
    };
    this.sessions = [newSession, ...this.sessions];
    this.activeSessionId = newId;
    this.acceptedBlocks = []; // Reset blocks
    return newId;
  }

  public clearSession(): void {
    const idx = this.sessions.findIndex(s => s.id === this.activeSessionId);
    if (idx === -1) return;
    this.sessions[idx].messages = [{ id: crypto.randomUUID(), role: 'assistant', content: 'เคลียร์แล้วครับ พร้อมเริ่มต้นใหม่!', timestamp: new SvelteDate() }];
    this.activePrompt = null;
    this.acceptedBlocks = [];
    removeFromLocal(this.activeSessionId);
  }

  private async saveMessageToDb(msg: Message): Promise<void> {
    try {
      const { error } = await supabase.from('chat_messages').insert({
        id: msg.id, session_id: this.activeSessionId, role: msg.role,
        content: msg.content, provider: msg.provider || null,
        created_at: msg.timestamp.toISOString(),
      });
      if (error) console.warn('[ChatStore] DB save error:', error.message);
    } catch (e) { console.warn('[ChatStore] DB save failed:', e); }
  }

  public async loadMessagesFromDb(sessionId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase.from('chat_messages').select('*').eq('session_id', sessionId).order('created_at', { ascending: true });
      if (error) throw error;
      if (data && data.length > 0) return data.map((m: any) => ({ id: m.id, role: m.role, content: m.content, blocks: m.blocks || [], timestamp: new Date(m.created_at), provider: m.provider || undefined }));
    } catch (e) { console.warn('[ChatStore] DB load failed:', e); }
    return [];
  }

  private addMessage(role: 'user' | 'assistant' | 'system', content: string, provider?: string, blocks?: any[]): void {
    if (!content.trim() && !blocks?.length) return;
    const sessionIndex = this.sessions.findIndex(s => s.id === this.activeSessionId);
    if (sessionIndex === -1) return;
    const newMessage: Message = { id: crypto.randomUUID(), role, content, timestamp: new SvelteDate(), provider, blocks };
    this.sessions[sessionIndex].messages = [...this.sessions[sessionIndex].messages, newMessage];
    saveToLocal(this.activeSessionId, this.sessions[sessionIndex].messages);
    this.saveMessageToDb(newMessage);
  }

  public async restoreLocalMessages(sessionId: string) {
    const local = loadFromLocal(sessionId);
    if (local.length === 0) return;
    const session = this.sessions.find(s => s.id === sessionId);
    if (!session) return;
    const dbMessages = await this.loadMessagesFromDb(sessionId);
    if (dbMessages.length > 0) return;
    session.messages = local;
  }

  public async sendMessage(text: string): Promise<void> {
    if (!text.trim() || this.isProcessing) return;
    this.addMessage('user', text);
    this.isProcessing = true;
    try {
      const session = this.activeSession;
      const { context, recent } = buildContextSummary(session.messages);
      const messagesForApi: { role: string; content: string }[] = [];
      if (context) messagesForApi.push({ role: 'system', content: `Previous discussion: ${context}` });
      for (const m of recent) messagesForApi.push({ role: m.role, content: m.content });
      
      const body: Record<string, any> = { messages: messagesForApi };
      if (this.activePrompt) body.system_prompt = this.activePrompt.content;

      const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json() as { reply?: string; blocks?: any[]; provider?: string; error?: string };

      if (!res.ok) throw new Error(data.error || 'API error');
      this.addMessage('assistant', data.reply || '', data.provider, data.blocks);
    } catch (err) {
      this.addMessage('assistant', 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ');
      console.error('[ChatStore] sendMessage error:', err);
    } finally { this.isProcessing = false; }
  }

  // ฟังก์ชันจัดการ Accept/Edit Block
  public acceptBlock(block: any) {
    if (!this.acceptedBlocks.find(b => b.id === block.id)) {
      this.acceptedBlocks = [...this.acceptedBlocks, block];
    }
  }
  
  public async editBlock(block: any) {
    const newText = prompt('แก้ไขเนื้อหา:', block.content);
    if (newText !== null) {
      await this.sendMessage(`ช่วยแก้ไขย่อหน้านี้ให้ใหม่: "${newText}" (อ้างอิงจาก: ${block.content})`);
    }
  }
}
export const chatStore = new ChatStore();