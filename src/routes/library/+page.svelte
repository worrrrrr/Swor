<script lang="ts">
  import { goto } from '$app/navigation';
  import Icon from '$lib/components/Icon.svelte';

  let { data } = $props<{ data: { notebooks: any[] } }>();
</script>

<div class="library-page">
  <div class="library-header">
    <div class="library-title-row">
      <Icon name="library" size={24} class="text-amber-500" />
      <h1 class="library-title">ห้องสมุด</h1>
    </div>
    <p class="library-sub">หนังสือและคู่มือที่เผยแพร่แล้ว</p>
  </div>

  {#if data.notebooks.length === 0}
    <div class="empty-state">
      <p class="empty-text">ยังไม่มีหนังสือที่เผยแพร่</p>
    </div>
  {:else}
    <div class="book-grid">
      {#each data.notebooks as nb}
        <button class="book-card" onclick={() => goto(`/library/${nb.id}`)} type="button">
          {#if nb.cover_url}
            <img src={nb.cover_url} alt={nb.title} class="book-cover" />
          {:else}
            <div class="book-cover-placeholder">
              <Icon name="library" size={32} class="text-zinc-300" />
            </div>
          {/if}
          <div class="book-info">
            <h2 class="book-title">{nb.title}</h2>
            {#if nb.description}
              <p class="book-desc">{nb.description}</p>
            {/if}
            <span class="book-meta">{nb.views || 0} ครั้ง</span>
          </div>
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .library-page {
    max-width: 800px;
    margin: 0 auto;
    padding: 8px 0 48px;
  }

  .library-header {
    margin-bottom: 32px;
  }

  .library-title-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 4px;
  }

  .library-title {
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
  }

  .library-sub {
    font-size: 14px;
    color: #94a3b8;
    margin: 4px 0 0;
  }

  .empty-state {
    text-align: center;
    padding: 48px 0;
  }

  .empty-text {
    color: #94a3b8;
    font-size: 14px;
    font-style: italic;
  }

  .book-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }

  .book-card {
    display: flex;
    flex-direction: column;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    overflow: hidden;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    padding: 0;
  }
  .book-card:hover {
    border-color: #94a3b8;
    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
    transform: translateY(-2px);
  }

  .book-cover {
    width: 100%;
    height: 140px;
    object-fit: cover;
  }

  .book-cover-placeholder {
    width: 100%;
    height: 140px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    background: #f1f5f9;
  }

  .book-info {
    padding: 14px;
  }

  .book-title {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 6px 0;
  }

  .book-desc {
    font-size: 12px;
    color: #64748b;
    margin: 0 0 8px 0;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    line-clamp: 2;
    overflow: hidden;
  }

  .book-meta {
    font-size: 11px;
    color: #94a3b8;
  }
</style>
