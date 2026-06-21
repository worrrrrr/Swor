<script lang="ts">
	import Icon from '$lib/components/Icon.svelte';

	let messages = $state([
		{
			id: 1,
			type: 'system',
			content: 'สวัสดีครับ ผมคือ Grounded Oracle Intelligence พร้อมช่วยเหลือคุณในการวิเคราะห์ข้อมูลและตอบคำถามจากแหล่งข้อมูลที่เชื่อถือได้',
			time: '09:00'
		}
	]);

	let inputMessage = $state('');

	function handleSubmit() {
		if (!inputMessage.trim()) return;
		
		messages = [
			...messages,
			{
				id: messages.length + 1,
				type: 'user',
				content: inputMessage,
				time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
			}
		];
		
		inputMessage = '';
		
		// จำลองการตอบกลับของ AI
		setTimeout(() => {
			messages = [
				...messages,
				{
					id: messages.length + 1,
					type: 'system',
					content: 'ผมได้รับข้อความของคุณแล้ว กำลังประมวลผลข้อมูลจากแหล่งข้อมูลที่เชื่อมโยงอยู่...',
					time: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
				}
			];
		}, 1000);
	}
</script>

<div class="h-full flex flex-col max-w-4xl mx-auto">
	<!-- Messages Area -->
	<div class="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
		{#each messages as message}
			<div class="flex gap-4 animate-fade-in-up">
				{#if message.type === 'system'}
					<div class="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-md shadow-indigo-200">
						<Icon name="ai" size={20} class="text-white" />
					</div>
					<div class="flex-1 bg-white border border-zinc-200/80 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm">
						<p class="text-sm text-zinc-700 leading-relaxed">{message.content}</p>
						<span class="text-[10px] text-zinc-400 mt-3 block font-medium">{message.time}</span>
					</div>
				{:else}
					<div class="flex-1 flex justify-end">
						<div class="bg-zinc-900 text-white rounded-2xl rounded-tr-none px-5 py-4 max-w-[80%] shadow-md shadow-zinc-200">
							<p class="text-sm leading-relaxed">{message.content}</p>
							<span class="text-[10px] text-zinc-400 mt-3 block text-right font-medium">{message.time}</span>
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>

	<!-- Input Area -->
	<div class="mt-6 bg-white border border-zinc-200/80 rounded-2xl p-2 shadow-sm shadow-zinc-100">
		<div class="flex items-end gap-2">
			<!-- Attachment Buttons -->
			<div class="flex gap-1 pb-1.5">
				<button class="w-9 h-9 rounded-xl hover:bg-zinc-100 flex items-center justify-center transition-colors text-zinc-500 hover:text-zinc-700">
					<Icon name="plus-circle" size={18} />
				</button>
				<button class="w-9 h-9 rounded-xl hover:bg-zinc-100 flex items-center justify-center transition-colors text-zinc-500 hover:text-zinc-700">
					<Icon name="search" size={18} />
				</button>
			</div>

			<!-- Text Input -->
			<textarea
				bind:value={inputMessage}
				placeholder="ถามคำถามหรือเพิ่มคำสั่ง..."
				rows="1"
				class="flex-1 resize-none border-0 focus:ring-0 text-sm text-zinc-700 placeholder-zinc-400 py-3 px-2 bg-transparent max-h-32 custom-scrollbar"
				onkeydown={(e) => {
					if (e.key === 'Enter' && !e.shiftKey) {
						e.preventDefault();
						handleSubmit();
					}
				}}
			></textarea>
			
			<!-- Send Button -->
			<button 
				onclick={handleSubmit}
				disabled={!inputMessage.trim()}
				class="w-10 h-10 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-zinc-900 transition-all flex items-center justify-center shrink-0 shadow-md shadow-zinc-200 active:scale-95"
			>
				<Icon name="send" size={18} />
			</button>
		</div>
	</div>
</div>

<style>
	/* Custom Scrollbar for Chat */
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: rgba(0, 0, 0, 0.08);
		border-radius: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb:hover {
		background: rgba(0, 0, 0, 0.15);
	}

	/* Animations */
	@keyframes fade-in-up {
		from { opacity: 0; transform: translateY(12px); }
		to { opacity: 1; transform: translateY(0); }
	}
	.animate-fade-in-up {
		animation: fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
	}

	@keyframes fade-in-left {
		from { opacity: 0; transform: translateX(-20px); }
		to { opacity: 1; transform: translateX(0); }
	}
	
</style>