<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import Icon from '$lib/components/Icon.svelte';
	import ChatInput from '$lib/components/ChatInput.svelte';

	// ✅ ใช้ $props() แทน export let
	let { data }: { data: any } = $props();

	let notebook = data.notebook;
	let items = data.items || [];
	
	let showAddNote = $state(false);
	let newNoteTitle = $state('');
	let newNoteType = $state<'chat' | 'blog' | 'note'>('note');
	let isSubmitting = $state(false);

	let chatCount = $derived(items.filter((i: any) => i.type === 'chat').length);
	let blogCount = $derived(items.filter((i: any) => i.type === 'blog').length);
	let noteCount = $derived(items.filter((i: any) => i.type === 'note').length);

	let deletingNotebook = $state(false);
	let deletingItemId = $state<string | null>(null);

	async function deleteNotebook() {
		if (!confirm(`ลบ Notebook "${notebook.title}" ทั้งหมด?`)) return;
		deletingNotebook = true;
		await supabase.from('notebook_items').delete().eq('notebook_id', notebook.id);
		await supabase.from('notebooks').delete().eq('id', notebook.id);
		goto('/');
	}

	async function deleteItem(item: any) {
		if (!confirm(`ลบ${item.type === 'blog' ? 'บทความ' : item.type === 'chat' ? 'แชท' : 'โน้ต'}นี้?`)) return;
		deletingItemId = item.id;
		if (item.type === 'chat' && item.source_id) {
			await supabase.from('chat_sessions').delete().eq('id', item.source_id);
		} else if (item.type === 'blog' && item.source_id) {
			await supabase.from('posts').delete().eq('id', item.source_id);
		} else if (item.type === 'note') {
			await supabase.from('notes').delete().eq('id', item.source_id);
		}
		await supabase.from('notebook_items').delete().eq('id', item.id);
		window.location.reload();
	}

	async function createNewNote() {
		if (!newNoteTitle.trim() || isSubmitting) return;
		isSubmitting = true;

		try {
			if (newNoteType === 'chat') {
				const { data: session, error } = await supabase
					.from('chat_sessions')
					.insert({
						user_id: (await supabase.auth.getUser()).data.user?.id,
						title: newNoteTitle,
						notebook_id: notebook.id,
					})
					.select('id')
					.single();
				if (error) throw error;
				goto(`/chat/${session.id}`);
			} else if (newNoteType === 'blog') {
				const slug = newNoteTitle
					.toLowerCase()
					.replace(/[^a-z0-9]+/g, '-')
					.replace(/^-|-$/g, '');
				const { data: post, error } = await supabase
					.from('posts')
					.insert({
						title: newNoteTitle,
						slug: slug,
						content: '# เริ่มเขียนบทความของคุณ...',
						published: false,
						user_id: (await supabase.auth.getUser()).data.user?.id,
						notebook_id: notebook.id,
					})
					.select('id')
					.single();
				if (error) throw error;
				goto(`/blog/${slug}`);
			} else {
				await supabase.from('notes').insert({
					title: newNoteTitle,
					content: '',
					user_id: (await supabase.auth.getUser()).data.user?.id,
					notebook_id: notebook.id,
				});
				window.location.reload();
			}
		} catch (error) {
			console.error('Error creating note:', error);
			alert('เกิดข้อผิดพลาด กรุณาลองใหม่');
		} finally {
			isSubmitting = false;
			showAddNote = false;
			newNoteTitle = '';
		}
	}

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('th-TH', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
		});
	}

	function getIcon(type: string) {
		switch (type) {
			case 'chat': return 'chat';
			case 'blog': return 'library';
			case 'note': return 'file-text';
			default: return 'file';
		}
	}

	function getTypeLabel(type: string) {
		switch (type) {
			case 'chat': return 'แชท';
			case 'blog': return 'บทความ';
			case 'note': return 'โน้ต';
			default: return 'ไฟล์';
		}
	}

	function handleItemClick(item: any) {
		if (item.type === 'chat' && item.source_id) {
			goto(`/chat/${item.source_id}`);
		} else if (item.type === 'blog' && item.sourceData?.slug) {
			goto(`/blog/${item.sourceData.slug}`);
		}
	}
</script>

<div class="notebook-page">
	<!-- Header -->
	<header class="notebook-header">
		<div class="header-left">
			<button class="back-btn" onclick={() => goto('/')}>← กลับ</button>
			<h1 class="notebook-title">{notebook.title}</h1>
			<span class="notebook-badge">{items.length} รายการ</span>
			<button class="btn-delete-nb" onclick={deleteNotebook} disabled={deletingNotebook} type="button" title="ลบ Notebook">🗑</button>
		</div>
		<button class="btn-add" onclick={() => showAddNote = !showAddNote}>
			+ เพิ่ม
		</button>
	</header>

	<!-- Stats -->
	<div class="stats-row">
		<div class="stat-item"><span class="stat-number">{chatCount}</span><span class="stat-label">💬 แชท</span></div>
		<div class="stat-item"><span class="stat-number">{blogCount}</span><span class="stat-label">📝 บทความ</span></div>
		<div class="stat-item"><span class="stat-number">{noteCount}</span><span class="stat-label">📌 โน้ต</span></div>
	</div>

	<!-- Add Form -->
	{#if showAddNote}
		<div class="add-note-form">
			<div class="form-row">
				<input type="text" bind:value={newNoteTitle} placeholder="ชื่อ..." class="input-title" onkeydown={(e) => e.key === 'Enter' && createNewNote()} />
				<select bind:value={newNoteType} class="select-type">
					<option value="note">📌 โน้ต</option>
					<option value="chat">💬 แชท</option>
					<option value="blog">📝 บทความ</option>
				</select>
				<button class="btn-create" onclick={createNewNote} disabled={!newNoteTitle.trim() || isSubmitting}>
					{isSubmitting ? 'กำลังสร้าง...' : 'สร้าง'}
				</button>
				<button class="btn-cancel" onclick={() => { showAddNote = false; newNoteTitle = ''; }}>ยกเลิก</button>
			</div>
		</div>
	{/if}

	<!-- Items -->
	<div class="items-grid">
		{#if items.length === 0}
			<div class="empty-state"><span class="empty-icon">📭</span><p class="empty-text">ยังไม่มีโน้ต</p></div>
		{:else}
			{#each items as item (item.id)}
				<div class="item-row">
					<div class="item-card" onclick={() => handleItemClick(item)}>
						<div class="item-icon"><Icon name={getIcon(item.type)} size={18} /></div>
						<div class="item-content">
							<h3 class="item-title">{item.title}</h3>
							<div class="item-meta">
								<span class="item-type">{getTypeLabel(item.type)}</span>
								<span class="item-date">{formatDate(item.created_at)}</span>
							</div>
						</div>
						<div class="item-arrow">→</div>
					</div>
					<button class="btn-delete-item" onclick={() => deleteItem(item)} disabled={deletingItemId === item.id} type="button" title="ลบ">🗑</button>
				</div>
			{/each}
		{/if}
	</div>
</div>

<style>
	.notebook-page { padding: 4px 2px; max-width: 800px; margin: 0 auto; }
	.notebook-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
	.header-left { display: flex; align-items: center; gap: 10px; }
	.back-btn { background: transparent; border: none; color: #64748b; font-size: 13px; cursor: pointer; padding: 4px 10px; border-radius: 6px; }
	.back-btn:hover { background: #f1f5f9; color: #1e293b; }
	.notebook-title { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }
	.notebook-badge { background: #e2e8f0; color: #475569; font-size: 11px; font-weight: 500; padding: 2px 10px; border-radius: 10px; }
	.btn-add { background: #3b82f6; border: none; color: white; font-size: 13px; font-weight: 500; padding: 6px 16px; border-radius: 10px; cursor: pointer; }
	.btn-add:hover { background: #2563eb; }
	.stats-row { display: flex; gap: 12px; margin-bottom: 16px; flex-wrap: wrap; }
	.stat-item { display: flex; align-items: center; gap: 6px; background: #f8fafc; padding: 4px 14px 4px 10px; border-radius: 10px; border: 1px solid #e2e8f0; }
	.stat-number { font-size: 16px; font-weight: 700; color: #0f172a; }
	.stat-label { font-size: 12px; color: #64748b; }
	.add-note-form { background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 14px; padding: 12px 16px; margin-bottom: 16px; }
	.form-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
	.input-title { flex: 1; min-width: 150px; padding: 8px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; background: white; outline: none; }
	.input-title:focus { border-color: #3b82f6; }
	.select-type { padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 13px; background: white; }
	.btn-create { background: #22c55e; border: none; color: white; font-size: 13px; font-weight: 500; padding: 8px 20px; border-radius: 8px; cursor: pointer; }
	.btn-create:hover:not(:disabled) { background: #16a34a; }
	.btn-create:disabled { opacity: 0.5; cursor: not-allowed; }
	.btn-cancel { background: transparent; border: 1px solid #e2e8f0; color: #64748b; font-size: 13px; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
	.btn-cancel:hover { background: #f1f5f9; }
	.items-grid { display: flex; flex-direction: column; gap: 6px; }
	.item-row { display: flex; align-items: center; gap: 8px; }
	.item-card { display: flex; align-items: center; gap: 12px; padding: 12px 16px; background: white; border: 1px solid #e2e8f0; border-radius: 10px; cursor: pointer; transition: 0.15s; flex: 1; }
	.item-card:hover { border-color: #94a3b8; box-shadow: 0 2px 8px rgba(0,0,0,0.04); transform: translateX(2px); }
	.btn-delete-nb { background: none; border: 1px solid transparent; cursor: pointer; font-size: 14px; padding: 4px 6px; border-radius: 6px; opacity: 0.3; transition: 0.15s; }
	.btn-delete-nb:hover { opacity: 1; background: #fef2f2; border-color: #fca5a5; }
	.btn-delete-nb:disabled { opacity: 0.15; cursor: not-allowed; }
	.btn-delete-item { background: none; border: 1px solid transparent; cursor: pointer; font-size: 16px; width: 36px; height: 36px; border-radius: 8px; opacity: 0; transition: 0.15s; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
	.item-row:hover .btn-delete-item { opacity: 0.4; border-color: #e2e8f0; }
	.item-row:hover .btn-delete-item:hover { opacity: 1; background: #fef2f2; border-color: #fca5a5; }
	.btn-delete-item:disabled { opacity: 0.2; }
	.item-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background: #f1f5f9; border-radius: 8px; flex-shrink: 0; color: #475569; }
	.item-content { flex: 1; min-width: 0; }
	.item-title { font-size: 14px; font-weight: 600; color: #0f172a; margin: 0 0 2px 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.item-meta { display: flex; gap: 10px; flex-wrap: wrap; font-size: 12px; color: #64748b; }
	.item-type { background: #f1f5f9; padding: 0 8px; border-radius: 4px; font-size: 10px; font-weight: 500; color: #475569; }
	.item-arrow { color: #94a3b8; font-size: 16px; flex-shrink: 0; }
	.empty-state { text-align: center; padding: 40px 20px; color: #94a3b8; }
	.empty-icon { font-size: 40px; display: block; margin-bottom: 8px; }
	.empty-text { font-size: 16px; font-weight: 500; color: #475569; margin: 0; }
	@media (max-width: 640px) {
		.notebook-header { flex-direction: column; align-items: stretch; }
		.notebook-title { font-size: 18px; }
		.form-row { flex-direction: column; }
		.input-title { width: 100%; min-width: unset; }
		.btn-create, .btn-cancel { width: 100%; justify-content: center; }
	}
</style>