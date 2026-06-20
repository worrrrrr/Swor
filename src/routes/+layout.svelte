<script lang="ts">
	import './layout.css';
	import LeftSidebar from '$lib/components/LeftSidebar.svelte';
	import RightSidebar from '$lib/components/RightSidebar.svelte';

	let { children } = $props();
	
	// สเตทควบคุมการ พับ/กาง แผงควบคุมทั้งสองฝั่งให้ทำงานสมมาตรกันร้อยเปอร์เซ็นต์
	let isLeftOpen = $state(true);
	let isRightOpen = $state(true);
</script>

<div class="flex h-screen w-screen p-4 gap-4 bg-zinc-100 text-zinc-900 font-sans antialiased box-border">
	
	<div class="h-full bg-white border border-zinc-200/80 rounded-2xl shadow-sm transition-all duration-300 flex-shrink-0 {isLeftOpen ? 'w-64' : 'w-14'}">
		<LeftSidebar bind:isOpen={isLeftOpen} />
	</div>

	<main class="flex-1 flex flex-col min-w-0 h-full bg-white border border-zinc-200/80 rounded-2xl shadow-sm overflow-hidden">
		<header class="h-16 px-6 border-b border-zinc-100 bg-white flex items-center justify-between flex-shrink-0">
			<div class="flex items-center gap-2">
				<span class="font-bold tracking-tight text-sm text-zinc-800">Gemini Workspace</span>
				<span class="text-[10px] bg-amber-500/10 text-amber-700 px-2 py-0.5 rounded-full font-bold">
					NotebookLM Pro
				</span>
			</div>
		</header>

		<div class="flex-1 overflow-y-auto bg-zinc-50/20 p-6">
			{@render children()}
		</div>
	</main>

	<div class="h-full bg-white border border-zinc-200/80 rounded-2xl shadow-sm transition-all duration-300 flex-shrink-0 {isRightOpen ? 'w-80' : 'w-14'}">
		<RightSidebar bind:isOpen={isRightOpen} />
	</div>

</div>