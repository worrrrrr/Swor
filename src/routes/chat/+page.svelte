<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import Icon from '$lib/components/Icon.svelte';

  let chats = $state<any[]>([]);
  let loading = $state(true);
  let deleting = $state<string | null>(null);
  let chatText = $state('');
  let creating = $state(false);

  onMount(async () => {
    await loadChats();
  });

  async function loadChats() {
    loading = true;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('chat_sessions')
      .select('id, title, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    chats = data || [];
    loading = false;
  }

  async function startChat() {
    const trimmed = chatText.trim();
    if (!trimmed || creating) return;
    creating = true;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: session } = await supabase
      .from('chat_sessions')
      .insert({ title: trimmed, user_id: user.id })
      .select('id')
      .single();

    if (session) goto(`/chat/${session.id}`);
    creating = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startChat();
    }
  }

  async function deleteChat(id: string) {
    if (!confirm('ลบแชทนี้?')) return;
    deleting = id;
    await supabase.from('chat_sessions').delete().eq('id', id);
    await supabase.from('notebook_items').delete().eq('source_id', id).eq('type', 'chat');
    await loadChats();
    deleting = null;
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }
</script>

<div class="page-wrap">
  <div class="list-header">
    <div class="flex items-center gap-3">
      <Icon name="chat" size={22} class="text-emerald-500" />
      <h1>แชททั้งหมด</h1>
    </div>
  </div>

  <div class="hero-input">
    <input
      class="chat-start-input"
      bind:value={chatText}
      onkeydown={handleKeydown}
      placeholder="พิมพ์ / เพื่อดูคำสั่ง หรือพิมพ์ข้อความเพื่อเริ่มแชท..."
      disabled={creating}
    />
    <button class="btn-start" onclick={startChat} disabled={!chatText.trim() || creating} type="button">
      {creating ? '...' : 'เริ่มแชท'}
    </button>
  </div>

  {#if loading}
    <p class="empty-text">กำลังโหลด...</p>
  {:else if chats.length === 0}
    <p class="empty-text">ยังไม่มีแชท</p>
  {:else}
    <div class="chat-list-section">
      <p class="section-label">ประวัติแชทล่าสุด</p>
      {#each chats as chat (chat.id)}
        <div class="card-row">
          <button class="card" onclick={() => goto(`/chat/${chat.id}`)} type="button">
            <span class="card-title">{chat.title || 'แชทใหม่'}</span>
            <span class="card-meta" style="margin-top: 2px;">{formatDate(chat.created_at)}</span>
          </button>
          <button
            class="btn-icon"
            onclick={() => deleteChat(chat.id)}
            disabled={deleting === chat.id}
            type="button"
            title="ลบแชท"
          ><Icon name="trash" size={14} /></button>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .page-wrap { max-width: 720px; margin: 0 auto; padding: 32px 16px; }

  .list-header { margin-bottom: 20px; }
  .list-header h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0; }

  .hero-input {
    display: flex;
    gap: 8px;
    margin-bottom: 28px;
  }

  .chat-start-input {
    flex: 1;
    padding: 12px 18px;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    font-size: 14px;
    outline: none;
    background: white;
  }
  .chat-start-input:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59,130,246,0.1);
  }

  .btn-start {
    padding: 12px 24px;
    border-radius: 12px;
    border: none;
    background: #0f172a;
    color: white;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }
  .btn-start:hover:not(:disabled) { background: #1e293b; }
  .btn-start:disabled { opacity: 0.4; cursor: not-allowed; }

  .chat-list-section { margin-top: 8px; }

  .section-label {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    margin: 0 0 10px 0;
    letter-spacing: 0.05em;
  }

  .card-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }

  .card {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    text-align: left;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 16px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .card:hover { border-color: #3b82f6; }

  .card-title { font-size: 14px; font-weight: 500; color: #0f172a; }
  .card-meta { font-size: 11px; color: #94a3b8; }

  .btn-icon {
    width: 36px; height: 36px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: none;
    cursor: pointer;
    font-size: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.15s;
    flex-shrink: 0;
    padding: 0;
  }
  .card-row:hover .btn-icon { opacity: 0.4; border-color: #e2e8f0; }
  .card-row:hover .btn-icon:hover { opacity: 1; background: #fef2f2; border-color: #fca5a5; }
  .btn-icon:disabled { opacity: 0.2; cursor: not-allowed; }

  .empty-text { color: #94a3b8; font-size: 13px; font-style: italic; text-align: center; padding: 40px 0; }
</style>
