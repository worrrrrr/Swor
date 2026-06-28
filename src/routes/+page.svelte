<script lang="ts">
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';

  let { data } = $props<{ data: { posts: any[]; userId: string | null } }>();

  let chatText = $state('');
  let creating = $state(false);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  async function startChat() {
    const trimmed = chatText.trim();
    if (!trimmed || creating || !data.userId) return;
    creating = true;

    const { data: notebooks } = await supabase
      .from('notebooks')
      .select('id')
      .eq('user_id', data.userId)
      .eq('title', 'แชทของฉัน')
      .limit(1);

    let notebookId: string;
    if (notebooks && notebooks.length > 0) {
      notebookId = notebooks[0].id;
    } else {
      const { data: newNb } = await supabase
        .from('notebooks')
        .insert({ title: 'แชทของฉัน', user_id: data.userId })
        .select('id')
        .single();
      notebookId = newNb!.id;
    }

    const { data: session } = await supabase
      .from('chat_sessions')
      .insert({
        title: trimmed,
        user_id: data.userId,
        notebook_id: notebookId,
      })
      .select('id')
      .single();

    if (session) {
      await supabase.from('notebook_items').insert({
        notebook_id: notebookId,
        type: 'chat',
        title: trimmed,
        source_id: session.id,
      });
      goto(`/chat/${session.id}`);
    }
    creating = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startChat();
    }
  }
</script>

<div class="page-wrap" style="display: flex; flex-direction: column; gap: 32px;">
  <div style="text-align: center; padding: 40px 0 20px;">
    <h1 style="font-size: 28px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0;">Grounded Oracle</h1>
    <p style="font-size: 14px; color: #64748b; margin: 0 0 24px 0;">ถามอะไรก็ได้ พร้อมวิเคราะห์ดวงชะตาด้วย AI</p>
    <div style="display: flex; gap: 8px; max-width: 520px; margin: 0 auto;">
      <input
        class="input-base"
        bind:value={chatText}
        onkeydown={handleKeydown}
        placeholder="ถาม Oracle ได้เลย..."
        disabled={creating}
      />
      <button class="btn-dark" onclick={startChat} disabled={!chatText.trim() || creating} type="button">
        {creating ? '...' : 'ส่ง'}
      </button>
    </div>
  </div>

  <div style="display: flex; flex-direction: column; gap: 24px;">
    <section>
      <div class="section-header">
        <h2>📝 บทความล่าสุด</h2>
        <button class="see-all" onclick={() => goto('/blog')} type="button">ดูทั้งหมด</button>
      </div>

      {#if data.posts.length === 0}
        <p class="empty-text">ยังไม่มีบทความ</p>
      {:else}
        <div>
          {#each data.posts as post (post.id)}
            <button class="card" onclick={() => goto(`/blog/${post.slug}`)} type="button" style="margin-bottom: 6px;">
              <div class="card-title">{post.title}</div>
              <div class="card-meta">{formatDate(post.created_at)}</div>
            </button>
          {/each}
        </div>
      {/if}
    </section>

    <section>
      <div class="section-header">
        <h2>🔮 Astro Dashboard</h2>
        <button class="see-all" onclick={() => goto('/astro')} type="button">เปิด</button>
      </div>
      <p class="empty-text" style="text-align: left; padding: 0;">ตรวจสอบดวงชะตาด้วย Human Design, BaZi (八字) และโหราศาสตร์ตะวันออก</p>
    </section>

    <section>
      <div class="section-header">
        <h2>💬 แชทล่าสุด</h2>
        <button class="see-all" onclick={() => goto('/chat')} type="button">ดูทั้งหมด</button>
      </div>
      <p class="empty-text" style="text-align: left; padding: 0;">พิมพ์ข้อความด้านบนเพื่อเริ่มแชท หรือไปที่หน้าแชททั้งหมด</p>
    </section>
  </div>
</div>

<style>
  .see-all {
    font-size: 12px;
    color: #3b82f6;
    background: none;
    border: none;
    cursor: pointer;
    font-weight: 500;
  }
  .see-all:hover {
    text-decoration: underline;
  }
</style>
