import { writable } from 'svelte/store';

export interface Message {
	id: string;
	role: 'user' | 'assistant';
	content: string;
}

export const messages = writable<Message[]>([
	{ id: '1', role: 'assistant', content: 'สวัสดีครับ! มีอะไรให้ผมช่วยเกี่ยวกับเอกสารนี้บ้างครับ?' }
]);
