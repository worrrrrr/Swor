<script lang="ts">
  import { goto } from '$app/navigation';
  import Icon from '$lib/components/Icon.svelte';

  let { data } = $props<{ data: { recent: any[]; popular: any[]; notebooks: any[] } }>();

  function readingTime(content: string): string {
    const words = (content || '').replace(/[#*`\[\]()!>-]/g, '').split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.round(words / 200))} นาที`;
  }
</script>

<div class="home-page">
  <section class="hero">
    <h1 class="hero-title">Grounded Intelligence</h1>
    <p class="hero-sub">เรื่องราว แนวคิด และประสบการณ์</p>
  </section>

  {#if data.notebooks.length > 0}
    <section class="home-section" style="margin-bottom: 32px;">
      <h2 class="section-title">
        <Icon name="library" size={14} class="text-amber-500 inline mr-1" />
        หนังสือล่าสุด
      </h2>
      <div class="book-strip">
        {#each data.notebooks as nb}
          <button class="book-mini" onclick={() => goto(`/library/${nb.id}`)} type="button">
            <div class="book-mini-cover">
              <Icon name="library" size={28} class="text-zinc-300" />
            </div>
            <h3 class="book-mini-title">{nb.title}</h3>
            {#if nb.description}
              <p class="book-mini-desc">{nb.description}</p>
            {/if}
            <span class="book-mini-meta">{nb.views || 0} ครั้ง</span>
          </button>
        {/each}
      </div>
      <button class="see-all" onclick={() => goto('/library')} type="button">ดูทั้งหมด <Icon name="list" size={12} class="inline" /></button>
    </section>
  {/if}

  <div class="home-grid">
    <section class="home-section">
      <h2 class="section-title">
        <Icon name="publish" size={14} class="text-blue-500 inline mr-1" />
        ล่าสุด
      </h2>
      {#if data.recent.length === 0}
        <p class="empty-text">ยังไม่มีบทความ</p>
      {:else}
        <div class="post-cards">
          {#each data.recent as post}
            <button class="post-card" onclick={() => goto(`/blog/${post.slug}`)} type="button">
              <h3 class="card-title">{post.title}</h3>
              <p class="card-meta">{readingTime(post.content)} · {new Date(post.created_at).toLocaleDateString('th-TH')}</p>
              {#if post.tags?.length}
                <div class="card-tags">
                  {#each post.tags as tag}
                    <span class="card-tag">{tag as string}</span>
                  {/each}
                </div>
              {/if}
            </button>
          {/each}
        </div>
        <button class="see-all" onclick={() => goto('/blog')} type="button">ดูทั้งหมด <Icon name="list" size={12} class="inline" /></button>
      {/if}
    </section>

    <section class="home-section">
      <h2 class="section-title">ยอดนิยม</h2>
      {#if data.popular.length === 0}
        <p class="empty-text">ยังไม่มีข้อมูล</p>
      {:else}
        <div class="post-cards">
          {#each data.popular as post, i}
            <button class="post-card" onclick={() => goto(`/blog/${post.slug}`)} type="button">
              <div class="popular-rank">{i + 1}</div>
              <div class="popular-content">
                <h3 class="card-title">{post.title}</h3>
                <p class="card-meta">{post.views || 0} ครั้ง · {readingTime(post.content)}</p>
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </section>
  </div>
</div>

<style>
  .home-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 24px 0 48px;
  }

  .hero {
    margin-bottom: 40px;
  }

  .hero-title {
    font-size: 28px;
    font-weight: 800;
    margin: 0;
    letter-spacing: -0.02em;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  .hero-sub {
    font-size: 14px;
    color: #94a3b8;
    margin: 4px 0 0;
  }

  .home-grid {
    display: flex;
    flex-direction: column;
    gap: 36px;
  }

  .home-section {
    min-width: 0;
  }

  .section-title {
    font-size: 13px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 14px 0;
  }

  .empty-text {
    color: #94a3b8;
    font-size: 13px;
    font-style: italic;
  }

  .post-cards {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .post-card {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    width: 100%;
    text-align: left;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1px solid transparent;
    background: none;
    cursor: pointer;
    transition: all 0.15s;
  }
  .post-card:hover {
    background: #f8fafc;
    border-color: #e2e8f0;
  }

  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 4px 0;
    line-height: 1.3;
  }

  .card-meta {
    font-size: 11px;
    color: #94a3b8;
    margin: 0;
  }

  .card-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;
  }

  .card-tag {
    font-size: 9px;
    padding: 1px 7px;
    border-radius: 9999px;
    background: #f1f5f9;
    color: #64748b;
    font-weight: 500;
  }

  .popular-rank {
    width: 24px;
    height: 24px;
    border-radius: 6px;
    background: #0f172a;
    color: white;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .popular-content {
    flex: 1;
    min-width: 0;
  }

  .book-strip {
    display: flex;
    gap: 12px;
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .book-mini {
    flex-shrink: 0;
    width: 160px;
    text-align: left;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px;
    cursor: pointer;
    transition: all 0.15s;
  }
  .book-mini:hover {
    border-color: #94a3b8;
    box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  }

  .book-mini-cover {
    font-size: 36px;
    text-align: center;
    margin-bottom: 8px;
  }

  .book-mini-title {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 4px 0;
    line-height: 1.3;
  }

  .book-mini-desc {
    font-size: 11px;
    color: #64748b;
    margin: 0 0 6px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
  }

  .book-mini-meta {
    font-size: 10px;
    color: #94a3b8;
  }

  .see-all {
    font-size: 12px;
    font-weight: 600;
    color: #3b82f6;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px 14px;
    margin-top: 4px;
    transition: 0.15s;
  }
  .see-all:hover {
    color: #2563eb;
  }
</style>
