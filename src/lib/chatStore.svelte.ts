import { SvelteDate } from 'svelte/reactivity';
import { supabase } from '$lib/supabaseClient';

export interface Message {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: Date;
	provider?: string;
}

export interface ChatSession {
	id: string;
	title: string;
	messages: Message[];
}

function buildContextSummary(messages: Message[]): { context: string; recent: Message[] } {
	const userTopics = messages
		.filter(m => m.role === 'user')
		.map(m => m.content.slice(0, 80).replace(/\n/g, ' '));
	const context = userTopics.join(' → ');
	const recent = messages.slice(-4);
	return { context, recent };
}

export class ChatStore {
	sessions = $state<ChatSession[]>([]);

	activeSessionId = $state<string>('');
	isProcessing = $state<boolean>(false);
	activeEngineType = $state<string>('WESTERN');

	constructor() {
		this.createNewSession('แชทใหม่');
	}

	get activeSession(): ChatSession {
		return this.sessions.find(s => s.id === this.activeSessionId) || this.sessions[0];
	}

	public createNewSession(title: string, existingId?: string): string {
		const newId = existingId || crypto.randomUUID();
		const newSession: ChatSession = {
			id: newId,
			title,
			messages: [
				{
					id: crypto.randomUUID(),
					role: 'assistant',
					content: 'สวัสดีครับ! มีอะไรให้ผมช่วยได้บ้าง?',
					timestamp: new SvelteDate()
				}
			]
		};

		this.sessions = [newSession, ...this.sessions];
		this.activeSessionId = newId;
		return newId;
	}

	public clearSession(): void {
		const idx = this.sessions.findIndex(s => s.id === this.activeSessionId);
		if (idx === -1) return;
		this.sessions[idx].messages = [
			{
				id: crypto.randomUUID(),
				role: 'assistant',
				content: 'เคลียร์แล้วครับ พร้อมเริ่มต้นใหม่!',
				timestamp: new SvelteDate()
			}
		];
	}

	private addMessage(role: 'user' | 'assistant' | 'system', content: string, provider?: string): void {
		if (!content.trim()) return;

		const sessionIndex = this.sessions.findIndex(s => s.id === this.activeSessionId);
		if (sessionIndex === -1) return;

		const newMessage: Message = {
			id: crypto.randomUUID(),
			role,
			content,
			timestamp: new SvelteDate(),
			provider,
		};

		this.sessions[sessionIndex].messages = [
			...this.sessions[sessionIndex].messages,
			newMessage
		];
	}

	public async sendMessage(text: string): Promise<void> {
		if (!text.trim() || this.isProcessing) return;

		this.addMessage('user', text);
		this.isProcessing = true;

		try {
			const session = this.activeSession;
			const { context, recent } = buildContextSummary(session.messages);

			const messagesForApi: { role: string; content: string }[] = [];
			if (context) {
				messagesForApi.push({ role: 'system', content: `Previous discussion: ${context}` });
			}
			for (const m of recent) {
				messagesForApi.push({ role: m.role, content: m.content });
			}

			const { data: { user } } = await supabase.auth.getUser();
			const meta = user?.user_metadata || {};
			const personality = meta.personality_mbti ? {
				mbti: meta.personality_mbti,
				enneagram: meta.personality_enneagram,
				wing: meta.personality_enneagram_wing,
			} : undefined;

			const astroProfile = meta.birth_date ? {
				birthDate: meta.birth_date,
				birthTime: meta.birth_time,
				latitude: meta.latitude,
				longitude: meta.longitude,
				timezoneOffset: meta.timezoneOffset,
			} : undefined;

			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ messages: messagesForApi, personality, astroProfile }),
			});

			const data = await res.json() as { reply?: string; provider?: string; error?: string };

			if (!res.ok) {
				throw new Error(data.error || 'API error');
			}

			this.addMessage('assistant', data.reply || 'ขออภัย ไม่สามารถตอบได้ในตอนนี้', data.provider);
		} catch (err) {
			this.addMessage('assistant', 'ขออภัย เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง');
			console.error('[ChatStore] sendMessage error:', err);
		} finally {
			this.isProcessing = false;
		}
	}
}

export const chatStore = new ChatStore();
