<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import type { User } from '@supabase/supabase-js';
	import Icon from '$lib/components/Icon.svelte';

	// ✅ จัดการ Props และ State สไตล์ Svelte 5
	let { isOpen: isOpenProp = true, user }: { isOpen?: boolean; user: User } = $props();
	let isOpen = $state(isOpenProp);
	
	let notebooks = $state<any[]>([]);
	let recentChats = $state<any[]>([]);
	let isLoading = $state(true);
	let showCreateModal = $state(false);
	let newNotebookTitle = $state('');
	let isCreating = $state(false);
	let showLogout = $state(false);

	function toggleSidebar() {
		isOpen = !isOpen;
	}

	function toggleLogout() {
		showLogout = !showLogout;
	}

	onMount(async () => {
		if (!user) return;
		await loadData();
	});

	async function loadData() {
		isLoading = true;
		const { data: notebooksData } = await supabase
			.from('notebooks')
			.select('*')
			.eq('user_id', user.id)
			.order('created_at', { ascending: true });
		notebooks = notebooksData || [];

		const { data: chatsData } = await supabase
			.from('chat_sessions')
			.select('id, title, created_at')
			.eq('user_id', user.id)
			.order('created_at', { ascending: false })
			.limit(10);
		recentChats = chatsData || [];

		isLoading = false;
	}

	async function createNotebook() {
		if (!newNotebookTitle.trim() || isCreating) return;
		isCreating = true;
		const { data, error } = await supabase
			.from('notebooks')
			.insert({
				title: newNotebookTitle.trim(),
				user_id: user.id,
			})
			.select()
			.single();

		if (!error && data) {
			notebooks = [data, ...notebooks];
			newNotebookTitle = '';
			showCreateModal = false;
			goto(`/notebook/${data.id}`);
		}
		isCreating = false;
	}

	async function logout() {
		await supabase.auth.signOut();
		goto('/login');
	}

	function getInitials(email: string | undefined) {
		if (!email) return '👤';
		return email.charAt(0).toUpperCase();
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			toggleLogout();
		}
	}

	function handleModalKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			showCreateModal = false;
			newNotebookTitle = '';
		}
	}
</script>

<aside 
	class="bg-white border rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 shrink-0 box-border h-full
	{isOpen ? 'w-56 border-zinc-200/80' : 'w-14 border-zinc-200/80'}"
>
	<div class="h-12 px-3 border-b border-zinc-100 flex items-center {isOpen ? 'justify-between' : 'justify-center'} shrink-0">
		<button 
			onclick={toggleSidebar}
			class="p-1.5 hover:bg-zinc-100 text-zinc-500 rounded-lg transition-all active:scale-95 flex items-center justify-center"
			aria-label={isOpen ? 'ปิดเมนู' : 'เปิดเมนู'}
			type="button"
		>
			<Icon name={isOpen ? 'ai' : 'ai'} size={18} class={isOpen ? 'text-zinc-500' : 'text-blue-500'} />
		</button>
	</div>

	<div class="flex-1 overflow-y-auto p-1.5 space-y-0.5 overflow-x-hidden">

		<div class="pt-1">
			{#if isOpen}
				<div class="flex items-center justify-between px-2 py-0.5">
					<span class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider">Notebooks</span>
					<button
						onclick={() => showCreateModal = true}
						class="nb-plus"
						type="button"
						title="สร้าง Notebook ใหม่"
					>+</button>
				</div>
			{/if}
			
			{#if isLoading}
				{#if isOpen}<div class="text-xs text-zinc-400 px-2 py-1">กำลังโหลด...</div>{/if}
			{:else if notebooks.length === 0}
				{#if isOpen}<div class="text-xs text-zinc-400 px-2 py-1">ยังไม่มี Notebook</div>{/if}
			{:else}
				{#each notebooks as notebook (notebook.id)}
					<div class="nb-item">
						<a 
							href={`/notebook/${notebook.id}`} 
							class="flex items-center gap-2 rounded-lg transition-colors
							{isOpen ? 'px-2.5 py-1.5' : 'px-0 py-1.5 justify-center'}
							{page.url.pathname === `/notebook/${notebook.id}` ? 'bg-blue-50/70 text-blue-600 font-medium' : 'text-zinc-700 hover:bg-zinc-50'}"
						>
							<div class="rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 w-7 h-7 text-zinc-600">
								<Icon name="folder" size={14} />
							</div>
							{#if isOpen}
								<span class="text-xs truncate flex-1">{notebook.title}</span>
							{/if}
						</a>
						{#if isOpen}
							<button
								class="nb-delete"
								onclick={async (e) => {
									e.preventDefault();
									if (!confirm(`ลบ Notebook "${notebook.title}" ทั้งหมด?`)) return;
									await supabase.from('notebook_items').delete().eq('notebook_id', notebook.id);
									await supabase.from('notebooks').delete().eq('id', notebook.id);
									notebooks = notebooks.filter((n: any) => n.id !== notebook.id);
								}}
								type="button"
								title="ลบ Notebook"
							>🗑</button>
						{/if}
					</div>
				{/each}
			{/if}
		</div>

		<div class="pt-1">
			{#if isOpen}<div class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-0.5">Collections</div>{/if}
			
			<a href="/chat" class="flex items-center gap-2 rounded-lg transition-colors
				{isOpen ? 'px-2.5 py-1.5' : 'px-0 py-1.5 justify-center'}
				{page.url.pathname === '/chat' ? 'bg-blue-50/70 text-blue-600 font-medium' : 'text-zinc-700 hover:bg-zinc-50'}">
				<div class="rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 w-7 h-7 text-zinc-600">
					<Icon name="chat" size={14} />
				</div>
				{#if isOpen}
					<span class="text-xs">Recent Chats</span>
				{/if}
			</a>
		</div>

		<div class="pt-1">
			{#if isOpen}<div class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-0.5">Blog</div>{/if}
			
			<a href="/blog" class="flex items-center gap-2 rounded-lg transition-colors
				{isOpen ? 'px-2.5 py-1.5' : 'px-0 py-1.5 justify-center'}
				{page.url.pathname === '/blog' ? 'bg-blue-50/70 text-blue-600 font-medium' : 'text-zinc-700 hover:bg-zinc-50'}">
				<div class="rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 w-7 h-7 text-zinc-600">
					<Icon name="library" size={14} />
				</div>
				{#if isOpen}
					<span class="text-xs">บทความทั้งหมด</span>
				{/if}
			</a>
		</div>

		<div class="pt-1">
			{#if isOpen}<div class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-0.5">Astro</div>{/if}
			
			<a href="/astro" class="flex items-center gap-2 rounded-lg transition-colors
				{isOpen ? 'px-2.5 py-1.5' : 'px-0 py-1.5 justify-center'}
				{page.url.pathname === '/astro' ? 'bg-blue-50/70 text-blue-600 font-medium' : 'text-zinc-700 hover:bg-zinc-50'}">
				<div class="rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 w-7 h-7 text-zinc-600">
					<Icon name="globe" size={14} />
				</div>
				{#if isOpen}
					<span class="text-xs">Astro Dashboard</span>
				{/if}
			</a>
		</div>

		<!-- Personality -->
		<div class="pt-1">
			{#if isOpen}<div class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-0.5">Personality</div>{/if}
			
			<a href="/personality" class="flex items-center gap-2 rounded-lg transition-colors
				{isOpen ? 'px-2.5 py-1.5' : 'px-0 py-1.5 justify-center'}
				{page.url.pathname === '/personality' ? 'bg-blue-50/70 text-blue-600 font-medium' : 'text-zinc-700 hover:bg-zinc-50'}">
				<div class="rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 w-7 h-7 text-zinc-600">
					<Icon name="user" size={14} />
				</div>
				{#if isOpen}
					<span class="text-xs">บุคลิกภาพ (MBTI)</span>
				{/if}
			</a>
		</div>

		<div class="pt-1">
			{#if isOpen}<div class="text-[9px] font-bold text-zinc-400 uppercase tracking-wider px-2 py-0.5">Recent Chats</div>{/if}
			
			{#if isLoading}
				{#if isOpen}<div class="text-xs text-zinc-400 px-2 py-1">กำลังโหลด...</div>{/if}
			{:else if recentChats.length === 0}
				{#if isOpen}<div class="text-xs text-zinc-400 px-2 py-1">ยังไม่มีแชท</div>{/if}
			{:else}
				{#each recentChats as chat (chat.id)}
					<a href={`/chat/${chat.id}`} class="flex items-center gap-2 rounded-lg transition-colors
						{isOpen ? 'px-2.5 py-1.5' : 'px-0 py-1.5 justify-center'}
						{page.url.pathname === `/chat/${chat.id}` ? 'bg-blue-50/70 text-blue-600 font-medium' : 'text-zinc-700 hover:bg-zinc-50'}">
						<div class="rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center shrink-0 w-7 h-7 text-zinc-600">
							<Icon name="message" size={14} />
						</div>
						{#if isOpen}
							<span class="text-xs truncate flex-1">{chat.title || 'แชทใหม่'}</span>
						{/if}
					</a>
				{/each}
			{/if}
		</div>
	</div>

	<div class="border-t border-zinc-100 shrink-0 p-1.5">
		{#if isOpen}
			<button 
				onclick={toggleLogout}
				onkeydown={handleKeydown}
				class="flex items-center gap-2 w-full px-2 py-1 rounded-lg hover:bg-zinc-50 transition-colors text-left"
				type="button"
				aria-expanded={showLogout}
				aria-label="เมนูผู้ใช้"
			>
				<div class="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
					{getInitials(user?.email)}
				</div>
				<span class="text-xs font-medium text-zinc-700 truncate flex-1">
					{user?.email?.split('@')[0] || 'User'}
				</span>
				<Icon name="chevron-down" size={12} class="text-zinc-400 transition-transform {showLogout ? 'rotate-180' : ''}" />
			</button>

			{#if showLogout}
				<button 
					onclick={logout}
					class="flex items-center gap-2 w-full mt-0.5 px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 transition-colors text-red-600"
					type="button"
				>
					<Icon name="log-out" size={14} />
					<span class="text-xs font-medium">ออกจากระบบ</span>
				</button>
			{/if}
		{:else}
			<div class="flex justify-center py-1">
				<div class="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
					{getInitials(user?.email)}
				</div>
			</div>
		{/if}
	</div>

	{#if showCreateModal}
		<div 
			class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50" 
			onclick={() => { showCreateModal = false; newNotebookTitle = ''; }}
			onkeydown={handleModalKeydown}
			role="dialog"
			aria-modal="true"
			aria-label="สร้าง Notebook ใหม่"
			tabindex="-1"
		>
			<div 
				class="bg-white rounded-2xl p-5 max-w-sm w-full mx-4 shadow-xl" 
				onclick={(e) => e.stopPropagation()}
				role="document"
				aria-label="ฟอร์มสร้าง Notebook"
			>
				<h3 class="text-base font-bold text-zinc-800 mb-3">📓 สร้าง Notebook ใหม่</h3>
				<input 
					type="text" 
					bind:value={newNotebookTitle} 
					placeholder="ชื่อ Notebook..."
					class="w-full px-3 py-2.5 border border-zinc-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					onkeydown={(e) => e.key === 'Enter' && createNotebook()}
				/>
				<div class="flex gap-2 justify-end mt-3">
					<button 
						onclick={() => { showCreateModal = false; newNotebookTitle = ''; }}
						class="px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors"
						type="button"
					>
						ยกเลิก
					</button>
					<button 
						onclick={createNotebook} 
						disabled={!newNotebookTitle.trim() || isCreating}
						class="px-4 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
						type="button"
					>
						{isCreating ? 'กำลังสร้าง...' : 'สร้าง'}
					</button>
				</div>
			</div>
		</div>
	{/if}
</aside>

<style>
	.nb-item {
		display: flex;
		align-items: center;
		gap: 2px;
	}
	.nb-item > a {
		flex: 1;
		min-width: 0;
	}
	.nb-delete {
		flex-shrink: 0;
		width: 24px;
		height: 24px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 12px;
		border-radius: 4px;
		opacity: 0;
		transition: opacity 0.15s;
		padding: 0;
	}
	.nb-item:hover .nb-delete {
		opacity: 0.35;
	}
	.nb-item:hover .nb-delete:hover {
		opacity: 1;
		background: #fef2f2;
	}
	.nb-plus {
		width: 20px;
		height: 20px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: none;
		cursor: pointer;
		font-size: 16px;
		font-weight: 600;
		color: #94a3b8;
		border-radius: 4px;
		transition: all 0.15s;
		padding: 0;
		line-height: 1;
	}
	.nb-plus:hover {
		color: #3b82f6;
		background: #eff6ff;
	}
</style>