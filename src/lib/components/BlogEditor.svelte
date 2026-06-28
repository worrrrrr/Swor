<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';

  let { post }: { post: any } = $props();

  let content = $state(post.content || '');
  let title = $state(post.title || '');
  let deleting = $state(false);

  interface ChatMsg {
    id: string;
    role: 'user' | 'assistant';
    content: string;
  }

  let chatMessages = $state<ChatMsg[]>([]);
  let userQuestions = $state<{ id: string; text: string }[]>([]);
  let inputText = $state('');
  let isSending = $state(false);
  let isSaving = $state(false);
  let showQuestions = $state(false);
  let hoverTimer: ReturnType<typeof setTimeout> | null = null;

  function handleMouseEnter() {
    if (hoverTimer) clearTimeout(hoverTimer);
    showQuestions = true;
  }

  function handleMouseLeave() {
    hoverTimer = setTimeout(() => {
      showQuestions = false;
    }, 200);
  }

  function scrollToQuestion(qId: string) {
    const el = document.getElementById(`chat-msg-${qId}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showQuestions = false;
  }

  async function handleSend() {
    const trimmed = inputText.trim();
    if (!trimmed || isSending) return;

    const qId = crypto.randomUUID();
    const userMsg: ChatMsg = { id: qId, role: 'user', content: trimmed };

    chatMessages = [...chatMessages, userMsg];
    userQuestions = [...userQuestions, { id: qId, text: trimmed }];
    inputText = '';
    isSending = true;

    try {
      const userTopics = chatMessages
        .filter(m => m.role === 'user')
        .map(m => m.content.slice(0, 80).replace(/\n/g, ' '));
      const context = userTopics.join(' → ');
      const recent = chatMessages.slice(-4);

      const messagesForApi: { role: string; content: string }[] = [];
      if (context) {
        messagesForApi.push({ role: 'system', content: `Previous discussion: ${context}` });
      }
      for (const m of recent) {
        messagesForApi.push({ role: m.role, content: m.content });
      }

      const { data: { user } } = await supabase.auth.getUser();
      const meta = user?.user_metadata || {};
      const personality = meta.personality_mbti ? {
        mbti: meta.personality_mbti,
        enneagram: meta.personality_enneagram,
        wing: meta.personality_enneagram_wing,
      } : undefined;

      const astroProfile = meta.birth_date ? {
        birthDate: meta.birth_date,
        birthTime: meta.birth_time,
        latitude: meta.latitude,
        longitude: meta.longitude,
        timezoneOffset: meta.timezoneOffset,
      } : undefined;

      const res = await fetch('/api/chat/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: messagesForApi, blogContent: content, personality, astroProfile }),
      });

      const data = await res.json() as { reply?: string; blogAppend?: string | null };

      if (!res.ok) throw new Error(data.reply || 'API error');

      const assistantMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.reply || '',
      };
      chatMessages = [...chatMessages, assistantMsg];

      if (data.blogAppend) {
        content = content + '\n\n' + data.blogAppend;
      }
    } catch (err) {
      chatMessages = [...chatMessages, {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'ขออภัย เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง',
      }];
      console.error('[BlogEditor] send error:', err);
    } finally {
      isSending = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function saveDraft() {
    isSaving = true;
    await supabase.from('posts').update({ title, content }).eq('id', post.id);
    isSaving = false;
  }

  async function publish() {
    isSaving = true;
    await supabase.from('posts').update({ title, content, published: true }).eq('id', post.id);
    isSaving = false;
    goto(`/blog/${post.slug}`);
  }

  async function deletePost() {
    if (!confirm('ลบบทความนี้?')) return;
    deleting = true;
    await supabase.from('posts').delete().eq('id', post.id);
    await supabase.from('notebook_items').delete().eq('source_id', post.id).eq('type', 'blog');
    goto('/blog');
  }
</script>

<div class="blog-editor">
  <div class="editor-header">
    <button class="btn-back" onclick={() => goto('/blog')} type="button">←</button>
    <input class="title-input" bind:value={title} placeholder="ชื่อบทความ..." />
    <div class="header-actions">
      <button class="btn-save" onclick={saveDraft} disabled={isSaving} type="button">
        {isSaving ? 'กำลังบันทึก...' : '💾 Save Draft'}
      </button>
      <button class="btn-publish" onclick={publish} disabled={isSaving} type="button">
        📤 Publish
      </button>
      <button class="btn-delete-editor" onclick={deletePost} disabled={deleting} type="button" title="ลบบทความ">
        🗑
      </button>
    </div>
  </div>

  <div class="editor-body">
    <div class="editor-main">
      <div class="markdown-area">
        <textarea
          class="content-textarea"
          bind:value={content}
          placeholder="เริ่มเขียนบทความของคุณด้วย Markdown..."
        ></textarea>
        <div
          class="questions-trigger"
          onmouseenter={handleMouseEnter}
          onmouseleave={handleMouseLeave}
          role="button"
          tabindex="0"
        >
          <span class="trigger-icon">📝</span>
        </div>

        {#if showQuestions}
          <div
            class="questions-popup"
            onmouseenter={handleMouseEnter}
            onmouseleave={handleMouseLeave}
            role="dialog"
            aria-label="สารบัญคำถาม"
          >
            <div class="popup-header">สารบัญคำถาม</div>
            {#if userQuestions.length === 0}
              <div class="popup-empty">ยังไม่มีคำถาม</div>
            {:else}
              {#each userQuestions as q (q.id)}
                <button
                  class="question-item"
                  onclick={() => scrollToQuestion(q.id)}
                  type="button"
                >
                  {q.text}
                </button>
              {/each}
            {/if}
          </div>
        {/if}
      </div>

      <div class="chat-section">
        <div class="chat-messages">
          {#each chatMessages as msg (msg.id)}
            <div id="chat-msg-{msg.id}" class="chat-msg {msg.role}">
              <div class="msg-label">{msg.role === 'user' ? 'คุณ' : 'AI'}</div>
              <div class="msg-content">{msg.content}</div>
            </div>
          {/each}
          {#if isSending}
            <div class="chat-msg assistant">
              <div class="msg-label">AI</div>
              <div class="msg-content typing">กำลังพิมพ์...</div>
            </div>
          {/if}
        </div>
        <div class="chat-input-row">
          <textarea
            class="chat-input"
            bind:value={inputText}
            onkeydown={handleKeydown}
            placeholder="ถาม AI เกี่ยวกับเนื้อหาที่จะเขียน..."
            rows="1"
            disabled={isSending}
          ></textarea>
          <button class="btn-send-chat" onclick={handleSend} disabled={!inputText.trim() || isSending} type="button">
            ส่ง
          </button>
        </div>
      </div>
    </div>
  </div>
</div>

<style>
  .blog-editor {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 900px;
    margin: 0 auto;
  }

  .editor-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
  }

  .btn-back {
    font-size: 16px;
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    padding: 4px 8px;
    border-radius: 6px;
  }
  .btn-back:hover {
    color: #0f172a;
    background: #f1f5f9;
  }

  .title-input {
    flex: 1;
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
    border: none;
    outline: none;
    background: transparent;
    padding: 4px 0;
  }
  .title-input::placeholder {
    color: #94a3b8;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .btn-save {
    font-size: 12px;
    padding: 6px 14px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #475569;
    cursor: pointer;
    font-weight: 500;
  }
  .btn-save:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
  .btn-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-publish {
    font-size: 12px;
    padding: 6px 14px;
    border-radius: 8px;
    border: none;
    background: #3b82f6;
    color: white;
    cursor: pointer;
    font-weight: 500;
  }
  .btn-publish:hover {
    background: #2563eb;
  }
  .btn-publish:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-delete-editor {
    font-size: 16px;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: none;
    cursor: pointer;
    opacity: 0.3;
    transition: all 0.15s;
  }
  .btn-delete-editor:hover {
    opacity: 1;
    background: #fef2f2;
    border-color: #fca5a5;
  }
  .btn-delete-editor:disabled {
    opacity: 0.15;
    cursor: not-allowed;
  }

  .editor-body {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .editor-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .markdown-area {
    flex: 1;
    position: relative;
    display: flex;
    overflow: hidden;
    min-height: 0;
  }

  .content-textarea {
    flex: 1;
    border: none;
    outline: none;
    resize: none;
    font-size: 14px;
    line-height: 1.7;
    color: #334155;
    background: transparent;
    padding: 20px 24px;
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
  .content-textarea::placeholder {
    color: #cbd5e1;
  }

  .questions-trigger {
    position: absolute;
    right: 8px;
    top: 12px;
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    cursor: pointer;
    z-index: 10;
    background: white;
    border: 1px solid #e2e8f0;
    opacity: 0.5;
    transition: opacity 0.15s;
  }
  .questions-trigger:hover {
    opacity: 1;
    background: #f8fafc;
  }

  .trigger-icon {
    font-size: 14px;
    line-height: 1;
  }

  .questions-popup {
    position: absolute;
    right: 42px;
    top: 8px;
    width: 240px;
    max-height: 300px;
    overflow-y: auto;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    z-index: 20;
    padding: 8px;
  }

  .popup-header {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    padding: 4px 8px 8px;
    letter-spacing: 0.05em;
  }

  .popup-empty {
    font-size: 12px;
    color: #cbd5e1;
    padding: 8px;
    text-align: center;
  }

  .question-item {
    display: block;
    width: 100%;
    text-align: left;
    font-size: 12px;
    color: #475569;
    background: none;
    border: none;
    padding: 6px 8px;
    border-radius: 6px;
    cursor: pointer;
    line-height: 1.4;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .question-item:hover {
    background: #f1f5f9;
    color: #0f172a;
  }

  .chat-section {
    flex-shrink: 0;
    border-top: 1px solid #e2e8f0;
    background: #fafbfc;
    max-height: 300px;
    display: flex;
    flex-direction: column;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 12px 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 80px;
  }

  .chat-msg {
    max-width: 85%;
  }
  .chat-msg.user {
    align-self: flex-end;
  }
  .chat-msg.assistant {
    align-self: flex-start;
  }

  .msg-label {
    font-size: 10px;
    font-weight: 700;
    color: #94a3b8;
    margin-bottom: 2px;
    text-transform: uppercase;
  }
  .chat-msg.user .msg-label {
    text-align: right;
  }

  .msg-content {
    font-size: 13px;
    line-height: 1.5;
    color: #334155;
    background: white;
    padding: 8px 12px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .chat-msg.user .msg-content {
    background: #3b82f6;
    color: white;
    border-color: #3b82f6;
  }

  .typing {
    color: #94a3b8 !important;
    font-style: italic;
  }

  .chat-input-row {
    display: flex;
    gap: 8px;
    padding: 8px 16px;
    border-top: 1px solid #e2e8f0;
    background: white;
  }

  .chat-input {
    flex: 1;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 8px 12px;
    font-size: 13px;
    outline: none;
    resize: none;
    font-family: inherit;
    line-height: 1.4;
    max-height: 80px;
  }
  .chat-input:focus {
    border-color: #3b82f6;
  }
  .chat-input:disabled {
    background: #f8fafc;
  }

  .btn-send-chat {
    font-size: 12px;
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    background: #3b82f6;
    color: white;
    cursor: pointer;
    font-weight: 600;
    white-space: nowrap;
  }
  .btn-send-chat:hover:not(:disabled) {
    background: #2563eb;
  }
  .btn-send-chat:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>
