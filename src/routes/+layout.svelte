<script lang="ts">
	import './layout.css';
	import LeftSidebar from '$lib/components/LeftSidebar.svelte';
	import RightSidebar from '$lib/components/RightSidebar.svelte';
	import Icon from '$lib/components/Icon.svelte';
	
	let { children } = $props();

	// State สำหรับควบคุม Sidebar
	let isLeftOpen = $state(true);
	let isRightOpen = $state(true);
</script>

<div class="h-screen w-screen bg-zinc-100 p-4 gap-4 flex overflow-hidden select-none font-sans">
	<!-- Left Sidebar -->
	<LeftSidebar bind:isOpen={isLeftOpen} />

	<!-- Main Content Area -->
	<main class="flex-1 bg-white border border-zinc-200/80 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 relative">
		
		<!-- Header -->
		<header class="h-16 px-6 border-b border-zinc-100 flex items-center justify-between shrink-0 bg-white z-10">
			<div class="flex items-center gap-4">
				<!-- ปุ่มเปิด/ปิด Left Sidebar -->
				
				
				<h1 class="text-sm font-bold text-zinc-800 tracking-widest uppercase">
					Grounded Oracle Intelligence
				</h1>
			</div>

			<div class="flex items-center gap-3">
				<span class="hidden sm:inline-flex text-[10px] bg-zinc-100 text-zinc-600 font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
					Workspace Active
				</span>
				
				<!-- ปุ่มเปิด/ปิด Right Sidebar -->
				<button 
					onclick={() => isRightOpen = !isRightOpen}
					class="p-2 hover:bg-zinc-100 rounded-lg transition-colors text-zinc-500"
				>
					<Icon name="list" size={20} />
				</button>
			</div>
		</header>

		<!-- Page Content -->
		<div class="flex-1 overflow-y-auto p-6 md:p-8 bg-zinc-50/30">
			{@render children()}
		</div>
	</main>

	<!-- Right Sidebar -->
	<RightSidebar bind:isOpen={isRightOpen} />
</div>