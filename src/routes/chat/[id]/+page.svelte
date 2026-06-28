<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import { chatStore } from '$lib/chatStore.svelte';
  import ChatBubble from '$lib/components/ChatBubble.svelte';
  import ChatInput from '$lib/components/ChatInput.svelte';

  let { data } = $props<{ data: { session: any; sessionId: string } }>();

  let initialized = $state(false);
  let deleting = $state(false);

  onMount(() => {
    const existing = chatStore.sessions.find(s => s.id === data.sessionId);
    if (existing) {
      chatStore.activeSessionId = data.sessionId;
    } else {
      chatStore.createNewSession(data.session?.title || 'แชท', data.sessionId);
    }
    initialized = true;
  });

  async function deleteChat() {
    if (!confirm('ลบแชทนี้?')) return;
    deleting = true;
    await supabase.from('chat_sessions').delete().eq('id', data.sessionId);
    await supabase.from('notebook_items').delete().eq('source_id', data.sessionId).eq('type', 'chat');
    goto('/chat');
  }
</script>

<div class="chat-page">
  <header class="chat-header">
    <div class="chat-header-left">
      <button class="back-btn" onclick={() => goto('/chat')} type="button">←</button>
      <h2 class="chat-title">{data.session?.title || 'แชท'}</h2>
    </div>
    <div class="chat-header-right">
      {#if chatStore.activeSession.messages.length > 0}
        {@const lastMsg = chatStore.activeSession.messages[chatStore.activeSession.messages.length - 1]}
        {#if lastMsg?.provider}
          <span class="provider-badge">{lastMsg.provider}</span>
        {/if}
      {/if}
      <button class="btn-icon-sm" onclick={deleteChat} disabled={deleting} type="button" title="ลบแชท">🗑</button>
    </div>
  </header>

  <div class="chat-messages">
    {#if initialized}
      {#each chatStore.activeSession.messages as msg (msg.id)}
        <ChatBubble role={msg.role as 'user' | 'assistant'} content={msg.content} provider={msg.provider} />
      {/each}

      {#if chatStore.isProcessing}
        <div class="typing-indicator">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      {/if}
    {/if}
  </div>

  <div class="chat-input-container">
    <ChatInput />
  </div>
</div>

<style>
  .chat-page {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .chat-header {
    padding: 16px 0;
    border-bottom: 1px solid #f1f5f9;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .chat-header-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .back-btn {
    font-size: 16px;
    background: none;
    border: none;
    cursor: pointer;
    color: #64748b;
    padding: 4px 8px;
    border-radius: 6px;
  }
  .back-btn:hover {
    color: #0f172a;
    background: #f1f5f9;
  }

  .chat-header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .provider-badge {
    font-size: 9px;
    font-weight: 600;
    font-family: monospace;
    padding: 2px 8px;
    border-radius: 4px;
    background: #d1fae5;
    color: #065f46;
    text-transform: uppercase;
  }

  .chat-title {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    margin: 0;
  }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .typing-indicator {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    background: #f1f5f9;
    border-radius: 16px;
    align-self: flex-start;
    margin-top: 4px;
  }

  .dot {
    width: 8px;
    height: 8px;
    background: #94a3b8;
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out;
  }

  .dot:nth-child(2) { animation-delay: 0.2s; }
  .dot:nth-child(3) { animation-delay: 0.4s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: translateY(0); }
    40% { transform: translateY(-6px); }
  }

  .chat-input-container {
    flex-shrink: 0;
    padding: 16px 0;
  }
</style>
