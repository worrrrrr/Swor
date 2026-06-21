<script lang="ts">
	import Icon from './Icon.svelte';

	let { isOpen = $bindable(true) } = $props();

	let tools = $state([
		{ icon: 'ai', label: 'AI Assistant', desc: 'Ask anything', color: 'text-purple-500' },
		{ icon: 'publish', label: 'Publish', desc: 'Share workspace', color: 'text-blue-500' },
		{ icon: 'user', label: 'Community', desc: 'Join groups', color: 'text-emerald-500' },
		{ icon: 'coder', label: 'Developer', desc: 'API & Docs', color: 'text-zinc-600' },
	]);
</script>

{#if isOpen}
	<aside class="w-64 bg-white border border-zinc-200/80 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 animate-fade-in-right">
		<div class="p-4 border-b border-zinc-100">
			<h3 class="text-xs font-bold text-zinc-800 uppercase tracking-widest">
				Tools & Features
			</h3>
		</div>

		<div class="flex-1 overflow-y-auto p-3 space-y-1">
			{#each tools as tool}
				<button class="w-full flex items-start gap-3 px-3 py-3 rounded-xl hover:bg-zinc-50 transition-colors text-left group">
					<div class="w-9 h-9 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 group-hover:border-zinc-200 group-hover:bg-white transition-colors">
						<Icon name={tool.icon} size={18} class={tool.color} />
					</div>
					<div class="flex-1 min-w-0 pt-0.5">
						<div class="text-sm font-semibold text-zinc-800 truncate">{tool.label}</div>
						<div class="text-[11px] text-zinc-400 truncate mt-0.5">{tool.desc}</div>
					</div>
				</button>
			{/each}
		</div>

		<!-- Pro Tip Card -->
		<div class="p-4 border-t border-zinc-100">
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
	</aside>
{/if}