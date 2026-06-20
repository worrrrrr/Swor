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

export class ChatStore {
	// ใช้ $state ล่าสุดของ Svelte 5 แทนการใช้ writable ของเวอร์ชันเก่า
	messages = $state<Message[]>([
		{
			id: '1',
			role: 'assistant',
			content: 'สวัสดีครับ! มีอะไรให้ผมช่วยเกี่ยวกับเอกสารนี้บ้างครับ?',
			timestamp: new SvelteDate()
		}
	]);

	isProcessing = $state<boolean>(false);
	activeEngineType = $state<string>('WESTERN');

	constructor() {}

	/**
	 * เพิ่มข้อความลงในชุดข้อมูลของแอปพลิเคชันอย่างปลอดภัย
	 */
	public addMessage(role: 'user' | 'assistant' | 'system', content: string): void {
		if (!content.trim()) return;
		this.messages = [
			...this.messages,
			{
				id: crypto.randomUUID(),
				role,
				content,
				timestamp: new SvelteDate()
			}
		];
	}
}

// ส่งออกแบบอินสแตนซ์เดี่ยว (Singleton Pattern) เพื่อใช้ร่วมกันทุกหน้าจอ
export const chatStore = new ChatStore();
