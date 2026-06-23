<script lang="ts">
	import Icon from './Icon.svelte';

	// รับค่า isOpen แบบ Two-way binding จาก Layout หลัก
	let { isOpen = $bindable(true) } = $props();

	let notebooks = $state([
		{ id: 1, title: 'Personal Work', count: 0, active: true },
		{ id: 2, title: 'Research Notes', count: 12, active: false },
		{ id: 3, title: 'Project Ideas', count: 5, active: false }
	]);
</script>

<aside
	class="bg-white border rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 shrink-0 box-border
	{isOpen ? 'w-64 mr-4 border-zinc-200/80' : 'w-16 mr-4 border-zinc-200/80'}"
>
	<div class="h-16 px-4 border-b border-zinc-100 flex items-center {isOpen ? 'justify-between' : 'justify-center'} shrink-0">
		{#if isOpen}
			<span class="text-xs font-bold text-zinc-400 uppercase tracking-wider pl-2">Navigation</span>
		{/if}
		<button 
			onclick={() => isOpen = !isOpen}
			class="p-2 hover:bg-zinc-100 text-zinc-500 rounded-xl transition-all active:scale-95 flex items-center justify-center border border-transparent hover:border-zinc-200/40"
			aria-label="Toggle Sidebar"
		>
			<Icon name="menu" size={18} />
		</button>
	</div>

	<div class="p-3 border-b border-zinc-100 shrink-0 flex justify-center">
		<button
			class="flex items-center justify-center gap-2 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-all active:scale-95
			{isOpen ? 'w-full px-3 py-2.5' : 'w-10 h-10 p-0 shrink-0'}"
			title="สร้าง Notebook ใหม่"
		>
			<Icon name="plus" size={16} />
			{#if isOpen}
				<span class="truncate">สร้าง Notebook ใหม่</span>
			{/if}
		</button>
	</div>

	<div class="flex-1 overflow-y-auto p-2 space-y-6 overflow-x-hidden">
		<div>
			<div class="flex items-center {isOpen ? 'gap-2 px-2 mb-4' : 'flex-col gap-3 py-2 mb-2'}">
				<a href="/astro" class="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-base flex items-center justify-center" title="Astrology Engine">🔮</a>
				<a href="/" class="p-2 hover:bg-zinc-100 rounded-xl transition-colors text-base flex items-center justify-center" title="Home">🏠</a>
			</div>

			{#if isOpen}
				<h3 class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 mb-2">
					Notebooks
				</h3>
			{/if}
			
			<div class="space-y-1">
				{#each notebooks as notebook}
					<button
						class="flex items-center rounded-xl transition-all text-left group
						{isOpen ? 'w-full gap-3 px-3 py-2.5' : 'w-12 h-12 p-0 justify-center mx-auto'}
						{notebook.active ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-zinc-50 text-zinc-600'}"
						title={notebook.title}
					>
						<Icon
							name="folder"
							size={18}
							class="shrink-0 {notebook.active ? 'text-indigo-500' : 'text-zinc-400 group-hover:text-zinc-600'}"
						/>
						{#if isOpen}
							<div class="flex-1 min-w-0">
								<div class="text-sm font-medium truncate">{notebook.title}</div>
								{#if notebook.count > 0}
									<div class="text-[10px] text-zinc-400 mt-0.5">{notebook.count} sources</div>
								{/if}
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>

		<div>
			{#if isOpen}
				<h3 class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2 mb-2">
					Collections
				</h3>
			{/if}
			<div class="space-y-1">
				<button
					class="flex items-center rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors text-left
					{isOpen ? 'w-full gap-3 px-3 py-2' : 'w-12 h-12 p-0 justify-center mx-auto'}"
					title="All Files"
				>
					<Icon name="globe" size={18} class="text-zinc-400 shrink-0" />
					{#if isOpen}
						<span class="text-sm font-medium">All Files</span>
					{/if}
				</button>
				<button
					class="flex items-center rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors text-left
					{isOpen ? 'w-full gap-3 px-3 py-2' : 'w-12 h-12 p-0 justify-center mx-auto'}"
					title="Recent Chats"
				>
					<Icon name="message" size={18} class="text-zinc-400 shrink-0" />
					{#if isOpen}
						<span class="text-sm font-medium">Recent Chats</span>
					{/if}
				</button>
			</div>
		</div>
	</div>
</aside>