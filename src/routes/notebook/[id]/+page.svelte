<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import { marked } from 'marked';
  import Icon from '$lib/components/Icon.svelte';

  let { data }: { data: any } = $props();

  let notebook = $state(data.notebook);
  let sources = $state<any[]>([]);
  let addMode: 'menu' | 'manual' | 'blog' | 'chat' | 'hidden' = 'hidden';
  let newSourceTitle = $state('');
  let newSourceContent = $state('');
  let addingSource = $state(false);
  let loadingSources = $state(true);
  let selectedSource = $state<any | null>(null);

  // Picker state
  let availableBlogs = $state<any[]>([]);
  let availableChats = $state<any[]>([]);
  let loadingList = $state(false);
  let pickerQuery = $state('');

  // Chat
  let chatMessages = $state<{ role: string; content: string }[]>([]);
  let chatInput = $state('');
  let chatting = $state(false);

  // Publish sidebar
  let showPublish = $state(false);
  let description = $state(notebook.description || '');
  let previewContent = $state(notebook.preview_content || '');
  let isPremium = $state(notebook.premium || false);
  let isPublished = $state(notebook.published || false);
  let saving = $state(false);

  let previewHtml = $derived(previewContent ? marked(previewContent) : '');
  let selectedSourceHtml = $derived(selectedSource ? marked(selectedSource.content) : '');
  let filteredBlogs = $derived(
    pickerQuery
      ? availableBlogs.filter((b: any) => b.title.toLowerCase().includes(pickerQuery.toLowerCase()))
      : availableBlogs
  );
  let filteredChats = $derived(
    pickerQuery
      ? availableChats.filter((c: any) => c.title?.toLowerCase().includes(pickerQuery.toLowerCase()))
      : availableChats
  );

  onMount(() => loadSources());

  async function loadSources() {
    loadingSources = true;
    const res = await fetch(`/api/notebook/source?notebook_id=${notebook.id}`);
    if (res.ok) sources = await res.json();
    loadingSources = false;
  }

  async function openPicker(type: 'blog' | 'chat') {
    addMode = type;
    pickerQuery = '';
    loadingList = true;

    if (type === 'blog') {
      const { data: posts } = await supabase
        .from('posts')
        .select('id, title, content')
        .eq('user_id', data.notebook.user_id)
        .order('created_at', { ascending: false })
        .limit(20);
      availableBlogs = (posts || []).filter((p: any) => p.content);
    } else {
      const { data: sessions } = await supabase
        .from('chat_sessions')
        .select('id, title')
        .eq('user_id', data.notebook.user_id)
        .order('created_at', { ascending: false })
        .limit(20);
      availableChats = sessions || [];
    }

    loadingList = false;
  }

  async function addBlogSource(post: any) {
    addingSource = true;
    await fetch('/api/notebook/source', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notebook_id: notebook.id, title: post.title, content: post.content }),
    });
    await loadSources();
    addingSource = false;
    addMode = 'menu';
  }

  async function addChatSource(session: any) {
    addingSource = true;
    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });
    const text = (msgs || [])
      .map((m: any) => {
        const label = m.role === 'user' ? 'ผู้ถาม' : 'AI';
        return `[${label}]\n${m.content}`;
      })
      .join('\n\n---\n\n');
    await fetch('/api/notebook/source', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notebook_id: notebook.id, title: session.title || 'แชท', content: text }),
    });
    await loadSources();
    addingSource = false;
    addMode = 'menu';
  }

  async function addManualSource() {
    if (!newSourceTitle.trim() || !newSourceContent.trim()) return;
    addingSource = true;
    const res = await fetch('/api/notebook/source', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notebook_id: notebook.id, title: newSourceTitle.trim(), content: newSourceContent.trim() }),
    });
    if (res.ok) {
      await loadSources();
      newSourceTitle = '';
      newSourceContent = '';
      addMode = 'menu';
    }
    addingSource = false;
  }

  async function deleteSource(id: string) {
    if (!confirm('ลบแหล่งข้อมูลนี้?')) return;
    await fetch(`/api/notebook/source?id=${id}`, { method: 'DELETE' });
    sources = sources.filter(s => s.id !== id);
    if (selectedSource?.id === id) selectedSource = null;
  }

  async function sendChat() {
    if (!chatInput.trim() || chatting) return;
    const msg = chatInput.trim();
    chatMessages = [...chatMessages, { role: 'user', content: msg }];
    chatInput = '';
    chatting = true;

    try {
      const res = await fetch('/api/notebook/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notebook_id: notebook.id, messages: [{ role: 'user', content: msg }] }),
      });
      const result = await res.json() as { reply?: string; error?: string };
      chatMessages = [...chatMessages, { role: 'assistant', content: result.reply || 'เกิดข้อผิดพลาด' }];
    } catch {
      chatMessages = [...chatMessages, { role: 'assistant', content: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' }];
    }
    chatting = false;
  }

  async function savePublish() {
    saving = true;
    await supabase.from('notebooks').update({ description, preview_content: previewContent, premium: isPremium, published: isPublished }).eq('id', notebook.id);
    notebook = { ...notebook, description, preview_content: previewContent, premium: isPremium, published: isPublished };
    saving = false;
    showPublish = false;
  }

  function sourceWordCount(text: string): number {
    return text.split(/\s+/).filter(Boolean).length;
  }
</script>

<div class="notebook-lm">
  <!-- ── Left Panel: Sources (1/3) ── -->
  <aside class="source-panel">
    <div class="panel-header">
      <div class="panel-header-top">
        <button class="back-btn" onclick={() => goto('/')} type="button">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
        <h1 class="panel-title">{notebook.title}</h1>
        <button class="icon-btn" onclick={() => showPublish = !showPublish} type="button" title="ตั้งค่า">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>
      <div class="panel-meta">
        <span>{sources.length} แหล่งข้อมูล</span>
        {#if notebook.published}
          <span class="status-badge">{notebook.premium ? 'พรีเมียม' : 'เผยแพร่'}</span>
        {/if}
      </div>
    </div>

    <!-- ── Sources List ── -->
    <div class="sources-area">
      <div class="sources-toolbar">
        <span class="sources-count">แหล่งข้อมูล {sources.length} รายการ</span>
        <button class="btn-add-source" onclick={() => addMode = addMode === 'menu' ? 'hidden' : 'menu'} type="button">+</button>
      </div>

      {#if addMode !== 'hidden' && addMode !== 'blog' && addMode !== 'chat'}
        <div class="add-menu">
          {#if addMode === 'menu'}
            <button class="add-menu-btn" onclick={() => addMode = 'manual'} type="button">
              <Icon name="edit" size={14} class="text-blue-500" />
              <span>เพิ่มข้อความ</span>
            </button>
            <button class="add-menu-btn" onclick={async () => { await openPicker('blog'); }} type="button">
              <Icon name="publish" size={14} class="text-amber-500" />
              <span>เพิ่มบทความ</span>
            </button>
            <button class="add-menu-btn" onclick={async () => { await openPicker('chat'); }} type="button">
              <Icon name="chat" size={14} class="text-emerald-500" />
              <span>เพิ่มแชท</span>
            </button>
          {:else}
            <div class="add-source-card">
              <input class="src-input" bind:value={newSourceTitle} placeholder="ชื่อแหล่งที่มา..." />
              <textarea class="src-textarea" bind:value={newSourceContent} placeholder="วางข้อความที่นี่..." rows="3"></textarea>
              <div class="add-actions">
                <button class="btn-cancel" onclick={() => { addMode = 'menu'; newSourceTitle = ''; newSourceContent = ''; }} type="button">ยกเลิก</button>
                <button class="btn-confirm" onclick={addManualSource} disabled={!newSourceTitle.trim() || !newSourceContent.trim() || addingSource} type="button">
                  {addingSource ? 'กำลังเพิ่ม...' : 'เพิ่ม'}
                </button>
              </div>
            </div>
          {/if}
        </div>
      {/if}

      {#if addMode === 'blog' || addMode === 'chat'}
        <div class="picker-panel">
          <div class="picker-header">
            <span>{addMode === 'blog' ? 'เลือกบทความ' : 'เลือกแชท'}</span>
            <button class="picker-close" onclick={() => addMode = 'menu'} type="button">×</button>
          </div>
          <input class="picker-search" bind:value={pickerQuery} placeholder="ค้นหา..." />
          {#if loadingList}
            <div class="empty-state" style="padding: 16px;">กำลังโหลด...</div>
          {:else if addMode === 'blog' && filteredBlogs.length === 0}
            <div class="empty-state" style="padding: 16px;">ไม่มีบทความ</div>
          {:else if addMode === 'chat' && filteredChats.length === 0}
            <div class="empty-state" style="padding: 16px;">ไม่มีแชท</div>
          {:else}
            <div class="picker-list">
              {#if addMode === 'blog'}
                {#each filteredBlogs as post}
                  <button class="picker-item" onclick={() => addBlogSource(post)} disabled={addingSource} type="button">
                    <Icon name="publish" size={14} class="text-amber-500" />
                    <span class="picker-item-title">{post.title}</span>
                    <span class="picker-item-add">+</span>
                  </button>
                {/each}
              {:else}
                {#each filteredChats as session}
                  <button class="picker-item" onclick={() => addChatSource(session)} disabled={addingSource} type="button">
                    <Icon name="chat" size={14} class="text-emerald-500" />
                    <span class="picker-item-title">{session.title || 'แชท'}</span>
                    <span class="picker-item-add">+</span>
                  </button>
                {/each}
              {/if}
            </div>
          {/if}
        </div>
      {/if}

      {#if loadingSources}
        <div class="empty-state">กำลังโหลด...</div>
      {:else if sources.length === 0}
        <div class="empty-state">
          <Icon name="folder" size={32} class="text-zinc-200 mx-auto mb-2 block" />
          <p>ยังไม่มีแหล่งข้อมูล</p>
          <p class="empty-hint">เพิ่มเนื้อหาเพื่อให้ AI อ้างอิง</p>
        </div>
      {:else}
        <div class="source-thumbnails">
          {#each sources as src}
            <div class="source-thumb" class:active={selectedSource?.id === src.id} onclick={() => selectedSource = selectedSource?.id === src.id ? null : src} role="button" tabindex="0" onkeydown={(e) => e.key === 'Enter' && (selectedSource = selectedSource?.id === src.id ? null : src)}>
              <Icon name="folder" size={16} class="text-zinc-400 flex-shrink-0" />
              <div class="thumb-info">
                <span class="thumb-title">{src.title}</span>
                <span class="thumb-meta">{sourceWordCount(src.content)} คำ</span>
              </div>
              <button class="thumb-del" onclick={(e) => { e.stopPropagation(); deleteSource(src.id); }} type="button">×</button>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- ── Source Preview ── -->
    {#if selectedSource}
      <div class="source-preview-panel">
        <div class="preview-header">
          <span class="preview-title">{selectedSource.title}</span>
          <button class="preview-close" onclick={() => selectedSource = null} type="button">×</button>
        </div>
        <div class="preview-content prose prose-sm max-w-none">{@html selectedSourceHtml}</div>
      </div>
    {/if}

    <!-- ── Publish Settings ── -->
    {#if showPublish}
      <div class="publish-panel">
        <div class="publish-header">
          <span>ตั้งค่า Notebook</span>
          <button class="preview-close" onclick={() => showPublish = false} type="button">×</button>
        </div>
        <div class="publish-body">
          <textarea class="pub-input" bind:value={description} placeholder="คำอธิบาย..." rows="2"></textarea>
          <textarea class="pub-input" bind:value={previewContent} placeholder="เนื้อหาตัวอย่าง..." rows="4"></textarea>
          <label class="pub-toggle"><input type="checkbox" bind:checked={isPublished} /> เผยแพร่</label>
          <label class="pub-toggle"><input type="checkbox" bind:checked={isPremium} disabled={!isPublished} /> พรีเมียม</label>
          <button class="btn-save-pub" onclick={savePublish} disabled={saving} type="button">{saving ? '...' : 'บันทึก'}</button>
          {#if isPublished}
            <a href="/library/{notebook.id}" class="view-link">ดูหน้าเผยแพร่ →</a>
          {/if}
        </div>
      </div>
    {/if}
  </aside>

  <!-- ── Right Panel: Chat (2/3) ── -->
  <main class="chat-panel">
    <div class="chat-messages-area">
      {#if chatMessages.length === 0}
        <div class="chat-welcome">
          <Icon name="chat" size={36} class="text-zinc-200 mb-3" />
          <h2>ถามเกี่ยวกับเนื้อหาใน Notebook</h2>
          <p>AI จะตอบโดยอ้างอิงจาก {sources.length} แหล่งข้อมูล</p>
        </div>
      {:else}
        <div class="messages-scroll">
          {#each chatMessages as msg}
            <div class="msg-bubble" class:user={msg.role === 'user'} class:ai={msg.role === 'assistant'}>
              <div class="msg-avatar" class:user={msg.role === 'user'}>
                {#if msg.role === 'user'}
                  <Icon name="user" size={14} class="text-blue-500" />
                {:else}
                  <Icon name="ai" size={14} class="text-emerald-500" />
                {/if}
              </div>
              <div class="msg-content">
                <p>{msg.content}</p>
              </div>
            </div>
          {/each}
          {#if chatting}
            <div class="typing-indicator">
              <span class="t-dot"></span><span class="t-dot"></span><span class="t-dot"></span>
            </div>
          {/if}
        </div>
      {/if}
    </div>

    <div class="chat-input-area">
      <div class="chat-box">
        <textarea
          class="chat-textarea"
          bind:value={chatInput}
          placeholder="ถามเกี่ยวกับเนื้อหาใน Notebook..."
          rows="1"
          onkeydown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendChat())}
          disabled={chatting}
        ></textarea>
        <button class="chat-send" onclick={sendChat} disabled={!chatInput.trim() || chatting} type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        </button>
      </div>
    </div>
  </main>
</div>

<style>
  .notebook-lm {
    display: flex;
    height: 100%;
    background: white;
    border-radius: 12px;
    overflow: hidden;
  }

  /* ── Source Panel (1/3) ── */
  .source-panel {
    width: 33.333%;
    min-width: 260px;
    max-width: 360px;
    border-right: 1px solid #e2e8f0;
    display: flex;
    flex-direction: column;
    background: #fafbfc;
    position: relative;
  }

  .panel-header {
    padding: 14px 14px 8px;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
    background: white;
  }

  .panel-header-top {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .back-btn {
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    border: none; background: none; color: #64748b; cursor: pointer;
    border-radius: 6px; flex-shrink: 0;
  }
  .back-btn:hover { background: #f1f5f9; color: #0f172a; }

  .panel-title {
    flex: 1; font-size: 15px; font-weight: 700; color: #0f172a;
    margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .icon-btn {
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    border: none; background: none; color: #94a3b8; cursor: pointer;
    border-radius: 6px; flex-shrink: 0;
  }
  .icon-btn:hover { background: #f1f5f9; color: #475569; }

  .panel-meta {
    display: flex; align-items: center; gap: 8px;
    margin-top: 4px; font-size: 11px; color: #94a3b8;
  }

  .status-badge {
    font-size: 9px; font-weight: 600; padding: 1px 7px; border-radius: 4px;
    background: #fef3c7; color: #b45309;
  }

  .sources-area { flex: 1; overflow-y: auto; padding: 8px; }

  .sources-toolbar {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 8px; padding: 0 4px;
  }
  .sources-count { font-size: 10px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; }

  .btn-add-source {
    width: 24px; height: 24px; display: flex; align-items: center; justify-content: center;
    border: none; background: transparent; color: #94a3b8; font-size: 18px; font-weight: 400;
    cursor: pointer; border-radius: 4px;
  }
  .btn-add-source:hover { background: #e2e8f0; color: #475569; }

  .add-menu {
    margin-bottom: 8px;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .add-menu-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    text-align: left;
    padding: 7px 10px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    font-size: 12px;
    color: #475569;
    cursor: pointer;
    transition: 0.1s;
  }
  .add-menu-btn:hover { border-color: #94a3b8; background: #f8fafc; }

  .picker-panel {
    margin-bottom: 8px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    overflow: hidden;
  }
  .picker-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 10px;
    font-size: 11px;
    font-weight: 600;
    color: #0f172a;
    border-bottom: 1px solid #f1f5f9;
  }
  .picker-close { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 16px; padding: 0 2px; }
  .picker-search {
    width: 100%;
    padding: 7px 10px;
    border: none;
    border-bottom: 1px solid #f1f5f9;
    font-size: 12px;
    outline: none;
    box-sizing: border-box;
  }
  .picker-list { max-height: 180px; overflow-y: auto; }
  .picker-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    text-align: left;
    padding: 7px 10px;
    border: none;
    background: transparent;
    font-size: 11px;
    color: #334155;
    cursor: pointer;
    transition: 0.1s;
    border-bottom: 1px solid #f8fafc;
  }
  .picker-item:last-child { border-bottom: none; }
  .picker-item:hover { background: #f8fafc; }
  .picker-item:disabled { opacity: 0.5; }
  .picker-item-title { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .picker-item-add { color: #3b82f6; font-weight: 700; font-size: 16px; }

  .add-source-card {
    background: white; border: 1px solid #e2e8f0; border-radius: 10px;
    padding: 10px; margin-bottom: 10px; display: flex; flex-direction: column; gap: 8px;
  }
  .src-input, .src-textarea {
    width: 100%; padding: 7px 10px; border: 1px solid #e2e8f0; border-radius: 6px;
    font-size: 12px; outline: none; font-family: inherit; resize: vertical; box-sizing: border-box;
  }
  .src-input:focus, .src-textarea:focus { border-color: #3b82f6; }
  .add-actions { display: flex; gap: 6px; justify-content: flex-end; }
  .btn-cancel { padding: 5px 12px; border-radius: 6px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-size: 11px; cursor: pointer; }
  .btn-confirm { padding: 5px 14px; border-radius: 6px; border: none; background: #0f172a; color: white; font-size: 11px; font-weight: 600; cursor: pointer; }
  .btn-confirm:disabled { opacity: 0.4; cursor: not-allowed; }

  .empty-state { text-align: center; padding: 32px 12px; color: #94a3b8; font-size: 12px; }
  .empty-icon { font-size: 28px; margin-bottom: 6px; }
  .empty-hint { font-size: 11px; color: #cbd5e1; margin-top: 2px; }

  .source-thumbnails { display: flex; flex-direction: column; gap: 4px; }

  .source-thumb {
    display: flex; align-items: center; gap: 8px;
    width: 100%; text-align: left; padding: 8px 10px;
    border-radius: 8px; border: 1px solid transparent; background: white;
    cursor: pointer; transition: all 0.12s;
  }
  .source-thumb:hover { border-color: #e2e8f0; background: #f8fafc; }
  .source-thumb.active { border-color: #3b82f6; background: #eff6ff; }

  .thumb-icon { font-size: 16px; flex-shrink: 0; }
  .thumb-info { flex: 1; min-width: 0; }
  .thumb-title { display: block; font-size: 12px; font-weight: 600; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .thumb-meta { font-size: 10px; color: #94a3b8; }
  .thumb-del { width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; border: none; background: none; color: #cbd5e1; cursor: pointer; font-size: 14px; border-radius: 4px; flex-shrink: 0; opacity: 0; }
  .source-thumb:hover .thumb-del { opacity: 1; }
  .thumb-del:hover { color: #ef4444; background: #fef2f2; }

  /* ── Source Preview ── */
  .source-preview-panel {
    border-top: 1px solid #e2e8f0;
    padding: 10px 12px;
    max-height: 200px;
    overflow-y: auto;
    background: white;
    flex-shrink: 0;
  }
  .preview-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
  .preview-title { font-size: 11px; font-weight: 600; color: #0f172a; }
  .preview-close { background: none; border: none; color: #94a3b8; cursor: pointer; font-size: 16px; padding: 0 2px; }
  .preview-content { font-size: 12px; line-height: 1.5; color: #475569; }
  .preview-content :global(p) { margin-bottom: 0.4em; }

  /* ── Publish Panel ── */
  .publish-panel {
    border-top: 1px solid #e2e8f0;
    background: white;
    flex-shrink: 0;
  }
  .publish-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 12px; font-weight: 600; color: #0f172a; }
  .publish-body { padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
  .pub-input { width: 100%; padding: 7px 10px; border: 1px solid #e2e8f0; border-radius: 6px; font-size: 12px; outline: none; font-family: inherit; resize: vertical; box-sizing: border-box; }
  .pub-input:focus { border-color: #3b82f6; }
  .pub-toggle { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #475569; cursor: pointer; }
  .pub-toggle input { width: 14px; height: 14px; }
  .btn-save-pub { padding: 6px 16px; border-radius: 6px; border: none; background: #3b82f6; color: white; font-size: 11px; font-weight: 600; cursor: pointer; align-self: flex-start; }
  .btn-save-pub:hover:not(:disabled) { background: #2563eb; }
  .btn-save-pub:disabled { opacity: 0.5; }
  .view-link { font-size: 11px; color: #3b82f6; text-decoration: none; }

  /* ── Chat Panel (2/3) ── */
  .chat-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    background: white;
  }

  .chat-messages-area {
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .chat-welcome {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 40px 24px;
    color: #94a3b8;
  }
  .welcome-icon { font-size: 40px; margin-bottom: 12px; }
  .chat-welcome h2 { font-size: 18px; font-weight: 600; color: #0f172a; margin: 0 0 6px 0; }
  .chat-welcome p { font-size: 13px; margin: 0; }

  .messages-scroll {
    padding: 20px 24px;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .msg-bubble {
    display: flex;
    gap: 10px;
    max-width: 85%;
  }
  .msg-bubble.user { align-self: flex-end; flex-direction: row-reverse; }
  .msg-bubble.ai { align-self: flex-start; }

  .msg-avatar {
    width: 28px; height: 28px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    background: #f1f5f9; font-size: 14px; flex-shrink: 0;
  }
  .msg-bubble.user .msg-avatar { background: #dbeafe; }

  .msg-content {
    background: #f8fafc;
    padding: 10px 14px;
    border-radius: 14px;
    border: 1px solid #e2e8f0;
    font-size: 13px;
    line-height: 1.6;
    color: #334155;
  }
  .msg-bubble.user .msg-content {
    background: #eff6ff;
    border-color: #bfdbfe;
  }
  .msg-content p { margin: 0; white-space: pre-wrap; }

  .typing-indicator {
    display: flex; gap: 4px; padding: 12px 0; align-self: flex-start;
  }
  .t-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #94a3b8; animation: tb 1.4s infinite ease-in-out;
  }
  .t-dot:nth-child(2) { animation-delay: 0.2s; }
  .t-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes tb { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }

  /* ── Chat Input ── */
  .chat-input-area {
    flex-shrink: 0;
    padding: 12px 20px 16px;
    border-top: 1px solid #e2e8f0;
  }

  .chat-box {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 6px 6px 6px 14px;
    transition: 0.2s;
  }
  .chat-box:focus-within {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.08);
  }

  .chat-textarea {
    flex: 1;
    border: none; outline: none; resize: none;
    font-size: 13px; line-height: 1.5;
    padding: 6px 0; font-family: inherit;
    max-height: 100px;
  }
  .chat-textarea::placeholder { color: #94a3b8; }

  .chat-send {
    width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
    border-radius: 10px; border: none; background: #0f172a; color: white; cursor: pointer; flex-shrink: 0;
    transition: 0.15s;
  }
  .chat-send:hover:not(:disabled) { background: #1e293b; transform: scale(1.05); }
  .chat-send:disabled { opacity: 0.3; cursor: not-allowed; }
  .chat-send:active:not(:disabled) { transform: scale(0.95); }

  @media (max-width: 768px) {
    .notebook-lm { flex-direction: column; }
    .source-panel { width: 100%; min-width: unset; max-width: unset; border-right: none; border-bottom: 1px solid #e2e8f0; max-height: 40vh; }
  }
</style>
