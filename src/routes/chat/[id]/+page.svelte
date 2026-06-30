<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import { chatStore } from '$lib/chatStore.svelte';
  import { BUILTIN_STYLES } from '$lib/promptStyles';
  import ChatBubble from '$lib/components/ChatBubble.svelte';
  import ChatInput from '$lib/components/ChatInput.svelte';
  import PromptBar from '$lib/components/PromptBar.svelte';

  let { data } = $props<{ data: { session: any; sessionId: string } }>();

  let initialized = $state(false);
  let copied = $state(false);
  let showModel = $state(false);
  let currentModel = $state('groq');

  const models = [
    { id: 'groq', label: 'Groq Llama 3.3', tag: 'เร็ว' },
    { id: 'gemini', label: 'Gemini 2.0 Flash', tag: 'แม่นยำ' },
    { id: 'deepseek', label: 'DeepSeek Chat', tag: 'แม่นยำ' },
  ];

  onMount(async () => {
    const existing = chatStore.sessions.find(s => s.id === data.sessionId);
    if (existing) chatStore.activeSessionId = data.sessionId;
    else chatStore.createNewSession(data.session?.title || 'แชท', data.sessionId);

    const msgs = await chatStore.loadMessagesFromDb(data.sessionId);
    if (msgs.length > 0) {
      const s = chatStore.sessions.find(s => s.id === data.sessionId);
      if (s) s.messages = msgs;
    } else { await chatStore.restoreLocalMessages(data.sessionId); }
    initialized = true;
  });

  function chatText() {
    return chatStore.activeSession.messages.filter(m => m.role !== 'system')
      .map(m => `**${m.role === 'user' ? 'คุณ' : 'AI'}**: ${m.content}`).join('\n\n---\n\n');
  }

  async function copyChat() {
    try { await navigator.clipboard.writeText(chatText()); copied = true; setTimeout(() => copied = false, 2000); }
    catch { alert('ไม่สามารถคัดลอกได้'); }
  }

  function downloadChat() {
    const blob = new Blob([chatText()], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `${data.session?.title || 'chat'}.txt`; a.click(); URL.revokeObjectURL(url);
  }

  async function deleteChat() {
    if (!confirm('ลบแชทนี้?')) return;
    await supabase.from('chat_sessions').delete().eq('id', data.sessionId);
    goto('/chat');
  }

  const hasMsgs = $derived(chatStore.activeSession.messages.length > 1);
</script>

<div class="chat" class:has-msgs={hasMsgs}>
  <!-- ── Header ── -->
  {#if hasMsgs}
    <header class="ch-head">
      <div class="ch-left">
        <button class="cbtn" onclick={() => goto('/chat')} type="button" aria-label="Back">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
        </button>
        <h1 class="ch-title">{data.session?.title || 'Chat'}</h1>
        {#if chatStore.activePrompt}
          <span class="ch-badge">{chatStore.activePrompt.title}</span>
        {/if}
      </div>
      <div class="ch-right">
        <div class="mdl">
          <button class="mdl-btn" onclick={() => showModel = !showModel} type="button">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10"/><path d="M12 12 2 12"/></svg>
            {models.find(m => m.id === currentModel)?.label || 'Groq'}
          </button>
          {#if showModel}
            <div class="mdl-dd">
              {#each models as m}
                <button class="mdl-opt" class:active={currentModel === m.id} onclick={() => { currentModel = m.id; showModel = false; }} type="button">
                  <span>{m.label}</span>
                  <span class="mdl-tag">{m.tag}</span>
                </button>
              {/each}
            </div>
          {/if}
        </div>
        <button class="cbtn" onclick={copyChat} type="button" title="Copy">
          {#if copied}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-green-500"><polyline points="20 6 9 17 4 12"/></svg>
          {:else}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/><path d="M20 8h-8c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/></svg>
          {/if}
        </button>
        <button class="cbtn" onclick={downloadChat} type="button" title="Download">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button class="cbtn del" onclick={deleteChat} type="button" title="Delete">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
        </button>
      </div>
    </header>
  {/if}

  <!-- ── Body ── -->
  <div class="ch-body">
    {#if initialized}
      {#if !hasMsgs}
        <div class="welcome">
          <div class="welcome-text">
            <h1 class="welcome-title">What do you want to know?</h1>
            <p class="welcome-sub">Ask anything or type <kbd>/</kbd> for skills</p>
          </div>
          <div class="welcome-actions">
            {#each BUILTIN_STYLES as s}
              {#if s.id !== 'default'}
                <button class="w-btn" onclick={() => chatStore.setStyle(s.id)} type="button">
                  <span>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              {/if}
            {/each}
          </div>
        </div>
      {:else}
        <div class="msgs">
          {#each chatStore.activeSession.messages as msg, i}
            {#if i > 0 || msg.content !== 'สวัสดีครับ! มีอะไรให้ผมช่วยได้บ้าง?'}
              <ChatBubble role={msg.role as 'user' | 'assistant'} content={msg.content} provider={msg.provider} />
            {/if}
          {/each}
          {#if chatStore.isProcessing}
            <div class="typing"><span></span><span></span><span></span></div>
          {/if}
        </div>
      {/if}
    {/if}
  </div>

  <!-- ── Input ── -->
  <div class="ch-input">
    <div class="ch-input-inner">
      <PromptBar />
      <ChatInput />
    </div>
  </div>
</div>

<style>
  .chat {
    display: flex; flex-direction: column; height: 100%;
    background: white;
  }
  .chat.has-msgs { background: #fafbfc; }

  /* ── Header ── */
  .ch-head {
    display: flex; align-items: center; justify-content: space-between;
    padding: 6px 16px; border-bottom: 1px solid #f1f5f9;
    flex-shrink: 0; background: white; z-index: 10;
  }
  .ch-left { display: flex; align-items: center; gap: 8px; min-width: 0; }
  .ch-right { display: flex; align-items: center; gap: 2px; }
  .ch-title { font-size: 14px; font-weight: 600; color: #0f172a; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .ch-badge { font-size: 10px; font-weight: 600; padding: 2px 10px; border-radius: 999px; background: #f0f4ff; color: #4338ca; white-space: nowrap; }

  .cbtn {
    width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;
    border-radius: 8px; border: none; background: transparent;
    color: #94a3b8; cursor: pointer; transition: 0.15s;
  }
  .cbtn:hover { background: #f1f5f9; color: #0f172a; }
  .cbtn.del:hover { background: #fef2f2; color: #ef4444; }

  /* ── Model ── */
  .mdl { position: relative; }
  .mdl-btn {
    display: flex; align-items: center; gap: 4px; padding: 4px 10px;
    border-radius: 8px; border: none; background: transparent;
    color: #94a3b8; font-size: 11px; cursor: pointer; transition: 0.15s;
  }
  .mdl-btn:hover { background: #f1f5f9; color: #475569; }
  .mdl-dd {
    position: absolute; right: 0; top: 100%; margin-top: 4px; z-index: 50;
    background: white; border: 1px solid #e2e8f0; border-radius: 10px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.1); min-width: 180px; overflow: hidden;
  }
  .mdl-opt {
    display: flex; align-items: center; gap: 8px; width: 100%; text-align: left;
    padding: 9px 14px; border: none; background: none; font-size: 12px;
    color: #334155; cursor: pointer; border-bottom: 1px solid #f1f5f9;
  }
  .mdl-opt:last-child { border-bottom: none; }
  .mdl-opt:hover { background: #f8fafc; }
  .mdl-opt.active { background: #f0f4ff; color: #4338ca; font-weight: 600; }
  .mdl-tag { font-size: 9px; padding: 1px 7px; border-radius: 4px; background: #d1fae5; color: #065f46; font-weight: 600; margin-left: auto; }

  /* ── Body ── */
  .ch-body { flex: 1; overflow-y: auto; display: flex; flex-direction: column; }

  .msgs {
    flex: 1; max-width: 680px; width: 100%; margin: 0 auto;
    padding: 16px 20px; display: flex; flex-direction: column; gap: 10px;
  }

  /* ── Typing ── */
  .typing { display: flex; gap: 5px; padding: 8px 0; align-self: flex-start; padding-left: 40px; }
  .typing span {
    width: 6px; height: 6px; background: #cbd5e1; border-radius: 50%;
    animation: tb 1.4s infinite ease-in-out;
  }
  .typing span:nth-child(2) { animation-delay: 0.2s; }
  .typing span:nth-child(3) { animation-delay: 0.4s; }
  @keyframes tb { 0%,80%,100% { transform: translateY(0); } 40% { transform: translateY(-6px); } }

  /* ── Welcome ── */
  .welcome {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    padding: 40px 24px; max-width: 520px; margin: 0 auto; width: 100%;
  }
  .welcome-text { text-align: center; margin-bottom: 32px; }
  .welcome-title { font-size: 24px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0; }
  .welcome-sub { font-size: 14px; color: #94a3b8; margin: 0; }
  .welcome-sub kbd { background: #f1f5f9; padding: 1px 7px; border-radius: 5px; font-size: 12px; font-family: inherit; border: 1px solid #e2e8f0; }
  .welcome-actions { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }

  .w-btn {
    display: flex; align-items: center; gap: 5px;
    padding: 8px 16px; border-radius: 999px;
    border: 1px solid #e2e8f0; background: white;
    font-size: 12px; color: #475569; cursor: pointer;
    transition: 0.15s;
  }
  .w-btn:hover { border-color: #6366f1; background: #f0f4ff; color: #4338ca; }

  /* ── Input ── */
  .ch-input {
    flex-shrink: 0;
    padding: 6px 20px 18px;
    max-width: 680px; width: 100%; margin: 0 auto;
  }
  .chat:not(.has-msgs) .ch-input { padding-top: 0; }
  .ch-input-inner { display: flex; flex-direction: column; gap: 6px; }

  @media (max-width: 640px) {
    .ch-head { padding: 4px 10px; }
    .welcome { padding: 24px 16px; }
    .welcome-title { font-size: 20px; }
    .msgs { padding: 12px; }
    .ch-input { padding: 4px 12px 14px; }
  }
</style>
