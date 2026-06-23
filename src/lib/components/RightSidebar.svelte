<script lang="ts">
	import Icon from './Icon.svelte';

	// รับค่า isOpen แบบ Two-way binding จาก Layout หลัก
	let { isOpen = $bindable(true) } = $props();

	let tools = $state([
		{ icon: 'ai', label: 'AI Assistant', desc: 'Ask anything', color: 'text-purple-500' },
		{ icon: 'publish', label: 'Publish', desc: 'Share workspace', color: 'text-blue-500' },
		{ icon: 'user', label: 'Community', desc: 'Join groups', color: 'text-emerald-500' },
		{ icon: 'coder', label: 'Developer', desc: 'API & Docs', color: 'text-zinc-600' },
	]);
</script>

<aside 
	class="bg-white border rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 shrink-0 box-border
	{isOpen ? 'w-64 ml-4 border-zinc-200/80' : 'w-16 ml-4 border-zinc-200/80'}"
>
	<div class="h-16 px-4 border-b border-zinc-100 flex items-center {isOpen ? 'justify-between' : 'justify-center'} shrink-0">
		<button 
			onclick={() => isOpen = !isOpen}
			class="p-2 hover:bg-zinc-100 text-zinc-500 rounded-xl transition-all active:scale-95 flex items-center justify-center border border-transparent hover:border-zinc-200/40"
			aria-label="Toggle Sidebar"
		>
			<Icon name="list" size={18} />
		</button>
		{#if isOpen}
			<span class="text-xs font-bold text-zinc-800 uppercase tracking-widest pr-2">Tools</span>
		{/if}
	</div>

	<div class="flex-1 overflow-y-auto p-2 space-y-1 overflow-x-hidden">
		{#each tools as tool}
			<button 
				class="flex items-start rounded-xl hover:bg-zinc-50 transition-colors text-left group
				{isOpen ? 'w-full gap-3 px-3 py-3' : 'w-12 h-12 p-0 justify-center items-center mx-auto'}"
				title={tool.label}
			>
				<div class="rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 group-hover:border-zinc-200 group-hover:bg-white transition-colors
					{isOpen ? 'w-9 h-9' : 'w-10 h-10'}">
					<Icon name={tool.icon} size={18} class={tool.color} />
				</div>
				{#if isOpen}
					<div class="flex-1 min-w-0 pt-0.5">
						<div class="text-sm font-semibold text-zinc-800 truncate">{tool.label}</div>
						<div class="text-[11px] text-zinc-400 truncate mt-0.5">{tool.desc}</div>
					</div>
				{/if}
			</button>
		{/each}
	</div>

	{#if isOpen}
		<div class="p-4 border-t border-zinc-100 shrink-0">
			<div class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-3.5 border border-indigo-100/50">
				<div class="flex items-center gap-2 mb-2">
					<Icon name="ai" size={14} class="text-indigo-500" />
					<span class="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">Pro Tip</span>
				</div>
				<p class="text-[11px] text-zinc-600 leading-relaxed">
					Use <kbd class="px-1.5 py-0.5 bg-white rounded border border-zinc-200 text-[10px] font-mono text-zinc-500">⌘K</kbd> to search across all notebooks instantly.
				</p>
			</div>
		</div>
	{/if}
</aside>