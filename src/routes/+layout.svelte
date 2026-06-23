<script lang="ts">
	import './layout.css';
	import LeftSidebar from '$lib/components/LeftSidebar.svelte';
	import RightSidebar from '$lib/components/RightSidebar.svelte';
	import ChatBubble from '$lib/components/ChatBubble.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';

	let { children } = $props();

	// State สำหรับควบคุมการเปิด/ปิด (ขยาย/หด) ของ Sidebar ทั้งสองฝั่ง
	let isLeftOpen = $state(true);
	let isRightOpen = $state(true);
</script>

<div class="h-screen w-screen bg-zinc-100 p-4 flex overflow-hidden select-none font-sans box-border">
	<LeftSidebar bind:isOpen={isLeftOpen} />

	<main class="flex-1 bg-white border border-zinc-200/80 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 relative">
		
		<header class="h-16 px-6 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white z-10">
			<div class="flex items-center">
				<h1 class="text-sm font-bold text-zinc-800 tracking-widest uppercase">
					Grounded Oracle Intelligence
				</h1>
			</div>

			<div class="flex items-center">
				<span class="text-[10px] bg-zinc-100 text-zinc-600 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
					Workspace Active
				</span>
			</div>
		</header>

		<div class="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-50/30">
			{@render children()}
		</div>
	</main>

	<RightSidebar bind:isOpen={isRightOpen} />
</div>