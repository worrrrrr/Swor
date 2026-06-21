/**
 * @file chatStore.svelte.ts
 * @description Enterprise Class-Based State Management using Svelte 5 Runes.
 */
import { SvelteDate } from 'svelte/reactivity';

export interface Message {
	id: string;
	role: 'user' | 'assistant' | 'system';
	content: string;
	timestamp: Date;
}

export interface ChatSession {
	id: string;
	title: string;
	messages: Message[];
}

export class ChatStore {
	// 1. บริหารจัดการกลุ่มข้อมูลเซสชันแยกขาดจากกันผ่านรูน $state
	sessions = $state<ChatSession[]>([
		{
			id: 'session-1',
			title: 'ตรวจดวงพิชัยสงครามปี 2026',
			messages: [
				{
					id: 'm1',
					role: 'assistant',
					content: 'สวัสดีครับ! มีอะไรให้ผมช่วยเกี่ยวกับเอกสารนี้บ้างครับ?',
					timestamp: new SvelteDate()
				}
			]
		},
		{
			id: 'session-2',
			title: 'วิเคราะห์พื้นดวงจีนสี่แถว (BaZi)',
			messages: [
				{
					id: 'm2',
					role: 'assistant',
					content: 'ระบบโหราศาสตร์จีน BaZi พร้อมคำนวณและวิเคราะห์พลังงานธาตุเจ้าเรือนแล้วครับ',
					timestamp: new SvelteDate()
				}
			]
		}
	]);

	activeSessionId = $state<string>('session-1');
	isProcessing = $state<boolean>(false);
	activeEngineType = $state<string>('WESTERN');

	constructor() {}

	/**
	 * กฎเหล็กของ Svelte 5: การสร้าง Derived State ภายในโครงสร้าง Class 
	 * ต้องใช้ JavaScript Getter เมธอด (get) เท่านั้น ห้ามใช้รูปแบบ activeSession = $derived(...) เด็ดขาด
	 */
	get activeSession(): ChatSession {
		return this.sessions.find(s => s.id === this.activeSessionId) || this.sessions[0];
	}

	/**
	 * สร้างเซสชันห้องสนทนาชุดใหม่และสลับ Pointer การนำทางไปห้องนั้นทันที
	 */
	public createNewSession(title: string): string {
		const newId = crypto.randomUUID();
		const newSession: ChatSession = {
			id: newId,
			title,
			messages: [
				{
					id: crypto.randomUUID(),
					role: 'assistant',
					content: `เริ่มต้นพื้นที่จัดเตรียมข้อมูลสำหรับ: ${title}`,
					timestamp: new SvelteDate()
				}
			]
		};

		this.sessions = [newSession, ...this.sessions];
		this.activeSessionId = newId;
		return newId;
	}

	/**
	 * เพิ่มข้อความลงในเซสชันย่อยที่กำลังเชื่อมต่ออยู่ในปัจจุบันอย่างปลอดภัย
	 */
	public addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
		if (!content.trim()) return;
		
		const sessionIndex = this.sessions.findIndex(s => s.id === this.activeSessionId);
		if (sessionIndex === -1) return;

		const newMessage: Message = {
			id: crypto.randomUUID(),
			role,
			content,
			timestamp: new SvelteDate()
		};

		// อัปเดตข้อมูลด้วยวิธี Reactive Immutable Update ป้องกันสถานะแฝงตกหล่น
		this.sessions[sessionIndex].messages = [
			...this.sessions[sessionIndex].messages,
			newMessage
		];
	}
}

// ส่งออกแบบอินสแตนซ์เดี่ยว (Singleton Pattern) เพื่อใช้ร่วมกันทุกหน้าจอ
export const chatStore = new ChatStore();