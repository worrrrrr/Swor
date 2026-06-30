<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { marked } from 'marked';

  let { data } = $props<{ data: { notebook: any; sources: any[]; isOwner: boolean; userId: string | null } }>();

  let showFull = $state(false);
  let chatMessages = $state<{ role: string; content: string }[]>([]);
  let chatInput = $state('');
  let chatting = $state(false);

  let previewHtml = $derived(showFull || !data.notebook.premium
    ? marked(data.notebook.preview_content || '')
    : '');

  let previewLength = $derived((data.notebook.preview_content || '').length);

  onMount(async () => {
    await fetch('/api/blog/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: data.notebook.id }),
    });
  });

  async function sendChat() {
    if (!chatInput.trim() || chatting) return;
    const userMsg = chatInput.trim();
    chatMessages = [...chatMessages, { role: 'user', content: userMsg }];
    chatInput = '';
    chatting = true;

    try {
      const res = await fetch('/api/notebook/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notebook_id: data.notebook.id,
          messages: [{ role: 'user', content: userMsg }],
        }),
      });
      const result = await res.json() as { reply?: string; error?: string };
      chatMessages = [...chatMessages, { role: 'assistant', content: result.reply || 'เกิดข้อผิดพลาด' }];
    } catch {
      chatMessages = [...chatMessages, { role: 'assistant', content: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' }];
    }
    chatting = false;
  }

  function readingTime(content: string): string {
    const words = (content || '').replace(/[#*`\[\]()!>-]/g, '').split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.round(words / 200))} นาที`;
  }
</script>

<div class="book-page">
  <button class="back-link" onclick={() => goto('/library')} type="button">← กลับไปห้องสมุด</button>

  <article class="book-article">
    <header class="book-header">
      <h1 class="book-title">{data.notebook.title}</h1>
      {#if data.notebook.description}
        <p class="book-desc">{data.notebook.description}</p>
      {/if}
      <div class="book-meta">
        <span>{data.sources.length} แหล่งข้อมูล</span>
        <span class="meta-sep">·</span>
        <span>{readingTime(data.notebook.preview_content || '')} อ่าน</span>
        <span class="meta-sep">·</span>
        <span>{data.notebook.views || 0} ครั้ง</span>
      </div>
    </header>

    {#if previewHtml}
      <div class="book-content prose prose-slate max-w-none">{@html previewHtml}</div>
    {:else if !data.notebook.premium}
      <p class="empty-content">ยังไม่มีเนื้อหา</p>
    {/if}

    {#if data.notebook.premium && !showFull}
      <div class="premium-gate">
        <div class="gate-icon">🔒</div>
        <h3>เนื้อหาพรีเมียม</h3>
        <p>หนังสือเล่มนี้เป็นเนื้อหาพรีเมียม {previewLength > 0 ? 'คุณได้อ่านตัวอย่างแล้ว' : ''}</p>
        {#if previewLength > 0}
          <button class="btn-gate" onclick={() => showFull = true} type="button">อ่านตัวอย่างเพิ่มเติม</button>
        {:else}
          <button class="btn-gate" onclick={() => goto('/login')} type="button">เข้าสู่ระบบเพื่ออ่านต่อ</button>
        {/if}
      </div>
    {/if}
  </article>

  {#if data.isOwner}
    <div class="owner-actions">
      <button class="btn-edit" onclick={() => goto(`/notebook/${data.notebook.id}`)} type="button">
        แก้ไข Notebook
      </button>
    </div>
  {/if}

  {#if data.userId}
    <div class="chat-section">
      <h3 class="chat-heading">💬 ถามเกี่ยวกับเนื้อหานี้</h3>

      {#if chatMessages.length > 0}
        <div class="chat-messages">
          {#each chatMessages as msg}
            <div class="chat-msg" class:user={msg.role === 'user'} class:ai={msg.role === 'assistant'}>
              <p class="msg-text">{msg.content}</p>
            </div>
          {/each}
        </div>
      {/if}

      <div class="chat-form">
        <input
          class="chat-input"
          bind:value={chatInput}
          placeholder="ถามเกี่ยวกับเนื้อหา..."
          onkeydown={(e) => e.key === 'Enter' && sendChat()}
          disabled={chatting}
        />
        <button class="btn-send" onclick={sendChat} disabled={!chatInput.trim() || chatting} type="button">
          {chatting ? '...' : 'ส่ง'}
        </button>
      </div>
    </div>
  {:else}
    <div class="login-hint">
      <a href="/login">เข้าสู่ระบบ</a> เพื่อถามเกี่ยวกับเนื้อหานี้
    </div>
  {/if}
</div>

<style>
  .book-page {
    max-width: 680px;
    margin: 0 auto;
    padding: 8px 0 48px;
  }

  .back-link {
    font-size: 13px;
    color: #64748b;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 0 24px;
    display: inline-block;
    transition: 0.15s;
  }
  .back-link:hover { color: #0f172a; }

  .book-article { margin-bottom: 32px; }
  .book-header { margin-bottom: 24px; }

  .book-title {
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 8px 0;
    line-height: 1.25;
  }

  .book-desc {
    font-size: 14px;
    color: #64748b;
    margin: 0 0 8px 0;
    line-height: 1.5;
  }

  .book-meta {
    font-size: 12px;
    color: #94a3b8;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }
  .meta-sep { color: #cbd5e1; }

  .book-content {
    font-size: 15px;
    line-height: 1.8;
  }

  .empty-content {
    color: #94a3b8;
    font-size: 14px;
    font-style: italic;
  }

  .premium-gate {
    text-align: center;
    padding: 40px 20px;
    margin-top: 32px;
    border: 2px dashed #e2e8f0;
    border-radius: 16px;
    background: #fafbfc;
  }
  .gate-icon { font-size: 48px; margin-bottom: 8px; }
  .premium-gate h3 { font-size: 18px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; }
  .premium-gate p { font-size: 13px; color: #64748b; margin: 0 0 16px 0; }
  .btn-gate {
    padding: 10px 24px;
    border-radius: 10px;
    border: none;
    background: #0f172a;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.15s;
  }
  .btn-gate:hover { background: #1e293b; }

  .owner-actions {
    margin-top: 24px;
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
  }
  .btn-edit {
    padding: 8px 20px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #475569;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-edit:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }

  .chat-section {
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
  }

  .chat-heading {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 14px 0;
  }

  .chat-messages {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 12px;
    max-height: 300px;
    overflow-y: auto;
  }

  .chat-msg {
    padding: 10px 14px;
    border-radius: 10px;
    font-size: 13px;
    line-height: 1.5;
  }
  .chat-msg.user {
    background: #f1f5f9;
    align-self: flex-end;
  }
  .chat-msg.ai {
    background: #f0fdf4;
    align-self: flex-start;
  }
  .msg-text { margin: 0; white-space: pre-wrap; }

  .chat-form {
    display: flex;
    gap: 8px;
  }

  .chat-input {
    flex: 1;
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    font-size: 13px;
    outline: none;
  }
  .chat-input:focus { border-color: #3b82f6; }

  .btn-send {
    padding: 8px 18px;
    border-radius: 8px;
    border: none;
    background: #0f172a;
    color: white;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-send:hover:not(:disabled) { background: #1e293b; }
  .btn-send:disabled { opacity: 0.4; cursor: not-allowed; }

  .login-hint {
    text-align: center;
    margin-top: 32px;
    font-size: 13px;
    color: #94a3b8;
  }
  .login-hint a { color: #3b82f6; text-decoration: none; }
</style>
