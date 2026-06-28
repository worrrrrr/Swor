<script lang="ts">
  import { goto } from '$app/navigation';
  import { marked } from 'marked';
  import BlogEditor from '$lib/components/BlogEditor.svelte';

  let { data } = $props<{ data: { post: any; isAuthor: boolean } }>();

  let showEditor = $derived(!data.post.published || data.isAuthor);
  let content = $derived(data.post?.content ? marked(data.post.content) : '');
</script>

{#if showEditor}
  <BlogEditor post={data.post} />
{:else}
  <div class="page-wrap">
    <header>
      <button class="back-btn" onclick={() => goto('/blog')}>← กลับ</button>
      <h1 class="post-title">{data.post.title}</h1>
      {#if data.post.published}
        <span class="badge-published">เผยแพร่แล้ว</span>
      {:else}
        <span class="badge-draft">ร่าง</span>
      {/if}
    </header>

    <article class="post-content">
      {#if content}
        <div>{@html content}</div>
      {:else}
        <p class="empty-text">ยังไม่มีเนื้อหา</p>
      {/if}
    </article>
  </div>
{/if}

<style>
  .back-btn {
    font-size: 13px;
    color: #64748b;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    margin-bottom: 16px;
    display: block;
  }
  .back-btn:hover {
    color: #0f172a;
  }

  .post-title {
    font-size: 28px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 8px 0;
    line-height: 1.3;
  }

  .post-content {
    font-size: 15px;
    line-height: 1.8;
    color: #334155;
    margin-top: 32px;
  }

  .post-content :global(h1),
  .post-content :global(h2),
  .post-content :global(h3) {
    color: #0f172a;
    margin-top: 28px;
    margin-bottom: 12px;
  }

  .post-content :global(p) {
    margin-bottom: 16px;
  }

  .post-content :global(a) {
    color: #3b82f6;
    text-decoration: underline;
  }

  .post-content :global(img) {
    max-width: 100%;
    border-radius: 12px;
    margin: 16px 0;
  }

  .post-content :global(pre) {
    background: #1e293b;
    color: #e2e8f0;
    padding: 16px;
    border-radius: 12px;
    overflow-x: auto;
  }

  .post-content :global(code) {
    font-size: 13px;
  }
</style>
