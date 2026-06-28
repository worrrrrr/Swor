<script lang="ts">
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';

  let { data } = $props<{ data: { posts: any[]; userId: string | null } }>();

  let showNew = $state(false);
  let newTitle = $state('');
  let creating = $state(false);
  let deleting = $state<string | null>(null);

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  async function createBlog() {
    if (!newTitle.trim() || creating || !data.userId) return;
    creating = true;

    try {
      const slug = newTitle.trim()
        .toLowerCase()
        .replace(/[^a-z0-9ก-๙]+/g, '-')
        .replace(/^-|-$/g, '') || 'untitled';

      const { data: notebooks } = await supabase
        .from('notebooks')
        .select('id')
        .eq('user_id', data.userId)
        .eq('title', 'บทความของฉัน')
        .limit(1);

      let notebookId: string;
      if (notebooks && notebooks.length > 0) {
        notebookId = notebooks[0].id;
      } else {
        const { data: newNb } = await supabase
          .from('notebooks')
          .insert({ title: 'บทความของฉัน', user_id: data.userId })
          .select('id')
          .single();
        notebookId = newNb!.id;
      }

      const { data: post } = await supabase
        .from('posts')
        .insert({
          title: newTitle.trim(),
          slug,
          content: '# ' + newTitle.trim(),
          published: false,
          user_id: data.userId,
          notebook_id: notebookId,
        })
        .select('id')
        .single();

      if (post) {
        await supabase.from('notebook_items').insert({
          notebook_id: notebookId,
          type: 'blog',
          title: newTitle.trim(),
          source_id: post.id,
        });
      }

      goto(`/blog/${slug}`);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด');
    } finally {
      creating = false;
      showNew = false;
      newTitle = '';
    }
  }

  async function deletePost(postId: string, slug: string) {
    if (!confirm('ลบบทความนี้?')) return;
    deleting = postId;
    await supabase.from('posts').delete().eq('id', postId);
    await supabase.from('notebook_items').delete().eq('source_id', postId).eq('type', 'blog');
    goto('/blog');
  }
</script>

<div class="page-wrap">
  <div class="list-header">
    <div>
      <h1>📝 บทความทั้งหมด</h1>
    </div>
    <button class="btn-dark" onclick={() => showNew = true} type="button">＋ เขียนบทความใหม่</button>
  </div>

  {#if showNew}
    <div class="modal-overlay" onclick={() => { showNew = false; newTitle = ''; }} role="dialog">
      <div class="modal-card" onclick={(e) => e.stopPropagation()}>
        <h3>เขียนบทความใหม่</h3>
        <input
          type="text"
          bind:value={newTitle}
          placeholder="ชื่อบทความ..."
          class="input-base"
          onkeydown={(e) => e.key === 'Enter' && createBlog()}
        />
        <div class="modal-actions">
          <button class="btn-secondary" onclick={() => { showNew = false; newTitle = ''; }} type="button">ยกเลิก</button>
          <button class="btn-dark" onclick={createBlog} disabled={!newTitle.trim() || creating} type="button">
            {creating ? 'กำลังสร้าง...' : 'สร้าง'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if data.posts.length === 0}
    <div class="empty-text">ยังไม่มีบทความ</div>
  {:else}
    <div>
      {#each data.posts as post (post.id)}
        <div class="card-row">
          <button class="card" onclick={() => goto(`/blog/${post.slug}`)} type="button">
            <div class="card-title">{post.title}</div>
            <div class="card-meta">
              <span class={post.published ? 'badge-published' : 'badge-draft'}>
                {post.published ? 'เผยแพร่' : 'ร่าง'}
              </span>
              <span>{formatDate(post.created_at)}</span>
            </div>
          </button>
          <button
            class="btn-icon"
            onclick={() => deletePost(post.id, post.slug)}
            disabled={deleting === post.id}
            type="button"
            title="ลบบทความ"
          >🗑</button>
        </div>
      {/each}
    </div>
  {/if}
</div>
