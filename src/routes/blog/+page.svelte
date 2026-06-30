<script lang="ts">
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import Icon from '$lib/components/Icon.svelte';

  let { data } = $props<{ data: { published: any[]; drafts: any[]; userId: string | null } }>();

  let showNew = $state(false);
  let newTitle = $state('');
  let newTags = $state('');
  let creating = $state(false);
  let activeTag = $state('');

  let filteredPublished = $derived(
    activeTag
      ? data.published.filter((p: any) => p.tags?.some?.((t: string) => t.toLowerCase() === activeTag.toLowerCase()))
      : data.published
  );

  let allTags = $derived(
    [...new Set<string>(data.published.flatMap((p: any) => p.tags || []))]
  );

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'วันนี้';
    if (days === 1) return 'เมื่อวาน';
    if (days < 7) return `${days} วันที่แล้ว`;
    return formatDate(date);
  }

  function parseTags(raw: string): string[] {
    return raw.split(',').map(t => t.trim()).filter(Boolean);
  }

  async function createBlog() {
    if (!newTitle.trim() || creating || !data.userId) return;
    creating = true;

    try {
      const slug = newTitle.trim()
        .toLowerCase()
        .replace(/[^a-z0-9ก-๙]+/g, '-')
        .replace(/^-|-$/g, '') || 'untitled';

      const { data: post } = await supabase
        .from('posts')
        .insert({
          title: newTitle.trim(),
          slug,
          content: '# ' + newTitle.trim(),
          published: false,
          user_id: data.userId,
        })
        .select('id')
        .single();

      if (post) {
        const tagList = parseTags(newTags);
        if (tagList.length > 0) {
          const { error: _te } = await supabase.from('posts').update({ tags: tagList }).eq('id', post.id);
        }
      }

      goto(`/blog/${slug}/edit`);
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาด');
    } finally {
      creating = false;
      showNew = false;
      newTitle = '';
      newTags = '';
    }
  }
</script>

<div class="blog-page">
  <div class="blog-header">
    <div>
      <h1 class="blog-title">บทความ</h1>
      <p class="blog-subtitle">เรื่องราว แนวคิด และประสบการณ์</p>
    </div>
    {#if data.userId}
      <button class="btn-new" onclick={() => showNew = true} type="button">
        เขียนบทความใหม่
      </button>
    {/if}
  </div>

  {#if showNew}
    <div class="modal-overlay" onclick={() => { showNew = false; newTitle = ''; }} role="dialog" tabindex="-1" onkeydown={(e) => e.key === 'Escape' && (showNew = false)}>
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div class="modal-card" onclick={(e) => e.stopPropagation()}>
        <h3>เขียนบทความใหม่</h3>
        <input
          type="text"
          bind:value={newTitle}
          placeholder="ชื่อบทความ..."
          class="input-base"
          onkeydown={(e) => e.key === 'Enter' && createBlog()}
        />
        <input
          type="text"
          bind:value={newTags}
          placeholder="แท็ก: แนวคิด, ชีวิต (คั่นด้วยคอมม่า)"
          class="input-base"
          style="margin-top: 8px;"
        />
        <div class="modal-actions">
          <button class="btn-secondary" onclick={() => { showNew = false; newTitle = ''; newTags = ''; }} type="button">ยกเลิก</button>
          <button class="btn-dark" onclick={createBlog} disabled={!newTitle.trim() || creating} type="button">
            {creating ? 'กำลังสร้าง...' : 'สร้าง'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  {#if allTags.length > 0}
    <div class="tags-bar">
      <button class="tag-filter" class:active={!activeTag} onclick={() => activeTag = ''} type="button">ทั้งหมด</button>
      {#each allTags as tag}
        <button class="tag-filter" class:active={activeTag === tag} onclick={() => activeTag = activeTag === tag ? '' : tag} type="button">{tag}</button>
      {/each}
    </div>
  {/if}

  {#if data.drafts.length > 0}
    <section class="drafts-section">
      <h2 class="section-heading">
        <span class="draft-dot"></span>
        ร่างของฉัน
      </h2>
      <div class="drafts-list">
        {#each data.drafts as post (post.id)}
          <button class="draft-card" onclick={() => goto(`/blog/${post.slug}/edit`)} type="button">
            <span class="draft-title">{post.title}</span>
            <span class="draft-date">{timeAgo(post.created_at)}</span>
          </button>
        {/each}
      </div>
    </section>
  {/if}

  {#if filteredPublished.length === 0 && data.drafts.length === 0 && !activeTag}
    <div class="empty-state">
      <Icon name="publish" size={32} class="text-zinc-200 mx-auto mb-2 block" />
      <p class="empty-text">ยังไม่มีบทความ</p>
      {#if data.userId}
        <button class="btn-new" onclick={() => showNew = true} type="button">เริ่มเขียนบทความแรก</button>
      {/if}
    </div>
  {:else if filteredPublished.length === 0}
    <div class="empty-state">
      <Icon name="search" size={32} class="text-zinc-200 mx-auto mb-2 block" />
      <p class="empty-text">{activeTag ? `ไม่มีบทความในแท็ก "${activeTag}"` : 'ยังไม่มีบทความที่เผยแพร่'}</p>
    </div>
  {:else}
    <div class="posts-list">
      {#each filteredPublished as post (post.id)}
        <a href={`/blog/${post.slug}`} class="post-card">
          <time class="post-date">{formatDate(post.created_at)}</time>
          <h2 class="post-title">{post.title}</h2>
          <p class="post-excerpt">{post.excerpt || 'ไม่มีเนื้อหา'}</p>
          <div class="post-meta-row">
            <span>{post.likes_count || 0} ❤️ · {post.views || 0} 👁</span>
            {#if post.tags?.length}
              <div class="post-tags">
                {#each post.tags as tag}
                  <span class="post-tag">{tag}</span>
                {/each}
              </div>
            {/if}
          </div>
          <span class="read-more">อ่านต่อ <Icon name="list" size={12} class="inline" /></span>
        </a>
      {/each}
    </div>
  {/if}
</div>

<style>
  .blog-page {
    max-width: 680px;
    margin: 0 auto;
    padding: 8px 0 48px;
  }

  .blog-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 32px;
  }

  .blog-title {
    font-size: 28px;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .blog-subtitle {
    font-size: 14px;
    color: #94a3b8;
    margin: 4px 0 0 0;
  }

  .btn-new {
    padding: 8px 20px;
    border-radius: 8px;
    border: none;
    background: #0f172a;
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
    transition: background 0.15s;
    flex-shrink: 0;
  }
  .btn-new:hover {
    background: #1e293b;
  }

  /* Drafts section */
  .drafts-section {
    margin-bottom: 40px;
    padding-bottom: 24px;
    border-bottom: 1px solid #e2e8f0;
  }

  .section-heading {
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #94a3b8;
    margin: 0 0 12px 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .draft-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #f59e0b;
    display: inline-block;
  }

  .drafts-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .draft-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid #f1f5f9;
    background: #fafbfc;
    cursor: pointer;
    transition: all 0.15s;
    width: 100%;
    text-align: left;
  }
  .draft-card:hover {
    background: #f1f5f9;
    border-color: #e2e8f0;
  }

  .draft-title {
    font-size: 13px;
    font-weight: 500;
    color: #475569;
  }

  .draft-date {
    font-size: 11px;
    color: #94a3b8;
    flex-shrink: 0;
  }

  /* Tags filter bar */
  .tags-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 24px;
  }

  .tag-filter {
    font-size: 11px;
    padding: 4px 12px;
    border-radius: 9999px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.15s;
  }
  .tag-filter:hover {
    border-color: #94a3b8;
    color: #0f172a;
  }
  .tag-filter.active {
    background: #0f172a;
    color: white;
    border-color: #0f172a;
  }

  /* Post tags */
  .post-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-bottom: 8px;
  }

  .post-tag {
    font-size: 10px;
    padding: 2px 8px;
    border-radius: 9999px;
    background: #f1f5f9;
    color: #64748b;
    font-weight: 500;
  }

  /* Published posts */
  .posts-list {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .post-card {
    cursor: pointer;
    padding: 0;
    border: none;
    background: none;
    text-align: left;
    transition: opacity 0.15s;
  }
  .post-card:hover {
    opacity: 0.8;
  }

  .post-date {
    font-size: 12px;
    color: #94a3b8;
    display: block;
    margin-bottom: 6px;
  }

  .post-title {
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 8px 0;
    line-height: 1.3;
  }

  .post-excerpt {
    font-size: 14px;
    color: #64748b;
    line-height: 1.6;
    margin: 0 0 8px 0;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    line-clamp: 3;
    overflow: hidden;
  }

  .read-more {
    font-size: 13px;
    font-weight: 600;
    color: #3b82f6;
  }

  /* Empty state */
  .empty-state {
    text-align: center;
    padding: 48px 0;
  }

  .empty-icon {
    font-size: 40px;
    margin-bottom: 12px;
  }

  .empty-text {
    color: #94a3b8;
    font-size: 14px;
    margin-bottom: 16px;
  }
</style>
