<script lang="ts">
	import Icon from './Icon.svelte';

	// รับค่า isOpen แบบ Two-way binding
	let { isOpen = $bindable(true) } = $props();

	let notebooks = $state([
		{ id: 1, title: 'Personal Work', count: 0, active: true },
		{ id: 2, title: 'Research Notes', count: 12, active: false },
		{ id: 3, title: 'Project Ideas', count: 5, active: false }
	]);
</script>

{#if isOpen}
	<aside
		class="w-64 bg-white border border-zinc-200/80 rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 animate-fade-in-left"
	>
		<div class="p-4 border-b border-zinc-100">
			<button
				class="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-zinc-900 text-white text-sm font-medium rounded-xl hover:bg-zinc-800 transition-all active:scale-95"
			>
				<Icon name="plus" size={16} />
				<span>สร้าง Notebook ใหม่</span>
			</button>
		</div>

		<div class="flex-1 overflow-y-auto p-3 space-y-6">
			<div>
				<a href="/astro" class=""> 🔮 </a>
				<a href="/" class=""> 🏠 </a>
				<h3 class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-2">
					Notebooks
				</h3>
				<div class="space-y-1">
					{#each notebooks as notebook}
						<button
							class="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group {notebook.active
								? 'bg-indigo-50 text-indigo-700'
								: 'hover:bg-zinc-50 text-zinc-600'}"
						>
							<Icon
								name="folder"
								size={18}
								class={notebook.active
									? 'text-indigo-500'
									: 'text-zinc-400 group-hover:text-zinc-600'}
							/>
							<div class="flex-1 min-w-0">
								<div class="text-sm font-medium truncate">{notebook.title}</div>
								{#if notebook.count > 0}
									<div class="text-[10px] text-zinc-400 mt-0.5">{notebook.count} sources</div>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			</div>

			<div>
				<h3 class="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-2">
					Collections
				</h3>
				<div class="space-y-1">
					<button
						class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors text-left"
					>
						<Icon name="globe" size={18} class="text-zinc-400" />
						<span class="text-sm font-medium">All Files</span>
					</button>
					<button
						class="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-zinc-50 text-zinc-600 transition-colors text-left"
					>
						<Icon name="message" size={18} class="text-zinc-400" />
						<span class="text-sm font-medium">Recent Chats</span>
					</button>
				</div>
			</div>
		</div>
	</aside>
{/if}
