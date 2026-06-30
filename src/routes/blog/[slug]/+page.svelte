<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { page } from '$app/state';
  import { supabase } from '$lib/supabaseClient';
  import { marked } from 'marked';
  import Icon from '$lib/components/Icon.svelte';
  import CommentSection from '$lib/components/CommentSection.svelte';

  let { data } = $props<{ data: { post: any; isAuthor: boolean } }>();

  let contentHtml = $derived(data.post?.content ? marked(data.post.content) : '');
  let liked = $state(false);
  let likesCount = $state(data.post?.likes_count || 0);
  let copied = $state(false);
  let viewTracked = $state(false);
  let showNotebookPicker = $state(false);
  let userNotebooks = $state<any[]>([]);
  let addingToNotebook = $state(false);

  onMount(async () => {
    if (!data.post) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: like } = await supabase
        .from('post_likes')
        .select('id')
        .eq('post_id', data.post.id)
        .eq('user_id', user.id)
        .maybeSingle();
      liked = !!like;
    }

    if (!viewTracked) {
      viewTracked = true;
      await fetch('/api/blog/view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: data.post.slug }),
      });
    }
  });

  async function toggleLike() {
    if (!page.data.userId) { goto('/login'); return; }
    const res = await fetch('/api/blog/like', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug: data.post.slug }),
    });
    if (res.ok) {
      const result = await res.json() as { liked: boolean; likes_count: number };
      liked = result.liked;
      likesCount = result.likes_count;
    }
  }

  async function sharePost() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copied = true;
      setTimeout(() => copied = false, 2000);
    } catch { alert('ไม่สามารถคัดลอกลิงก์ได้'); }
  }

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('th-TH', {
      year: 'numeric', month: 'long', day: 'numeric'
    });
  }

  function readingTime(content: string): string {
    const text = content.replace(/[#*`\[\]()!>-]/g, '');
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 200));
    return `${minutes} นาที`;
  }

  async function authFetch(url: string, opts: RequestInit = {}): Promise<Response> {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = { ...(opts.headers || {}), 'Content-Type': 'application/json' } as Record<string, string>;
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
    return fetch(url, { ...opts, headers });
  }

  async function openNotebookPicker() {
    const res = await authFetch('/api/blog/notebooks');
    if (res.ok) userNotebooks = await res.json();
    showNotebookPicker = true;
  }

  async function addToNotebook(notebookId: string) {
    addingToNotebook = true;
    const res = await authFetch('/api/blog/add-to-notebook', {
      method: 'POST',
      body: JSON.stringify({ post_id: data.post.id, notebook_id: notebookId }),
    });
    if (res.ok) {
      showNotebookPicker = false;
    } else if (res.status === 409) {
      alert('บทความนี้อยู่ใน Notebook นั้นแล้ว');
    } else {
      alert('เกิดข้อผิดพลาด');
    }
    addingToNotebook = false;
  }

  async function deletePost() {
    if (!confirm('ลบบทความนี้?')) return;
    await supabase.from('posts').delete().eq('id', data.post.id);
    await supabase.from('notebook_items').delete().eq('source_id', data.post.id).eq('type', 'blog');
    goto('/blog');
  }
</script>

<div class="article-page">
  <button class="back-link" onclick={() => goto('/blog')} type="button">
    <Icon name="arrow-left" size={14} class="inline mr-1" /> กลับไปบทความทั้งหมด
  </button>

  <article class="article">
    <header class="article-header">
      <h1 class="article-title">{data.post.title}</h1>
      <div class="article-meta">
        <time datetime={data.post.created_at}>{formatDate(data.post.created_at)}</time>
        <span class="meta-sep">·</span>
        <span>{readingTime(data.post.content || '')} อ่าน</span>
        <span class="meta-sep">·</span>
        <span>{data.post.views || 0} ครั้ง</span>
      </div>
      {#if data.post.tags?.length}
        <div class="article-tags">
          {#each data.post.tags as tag}
            <span class="article-tag">{tag as string}</span>
          {/each}
        </div>
      {/if}
    </header>

    {#if contentHtml}
      <div class="prose prose-slate max-w-none">{@html contentHtml}</div>
    {:else}
      <p class="empty-text">ยังไม่มีเนื้อหา</p>
    {/if}
  </article>

  <div class="post-actions">
    <button class="action-btn" class:liked onclick={toggleLike} type="button">
      <Icon name="ai" size={14} />
      <span>{likesCount}</span>
    </button>
    <button class="action-btn" onclick={sharePost} type="button">
      <Icon name="publish" size={14} />
      <span>{copied ? 'คัดลอกแล้ว' : 'แชร์'}</span>
    </button>
  </div>

  <CommentSection slug={data.post.slug} />

  {#if data.isAuthor}
    <div class="author-actions">
      <button class="btn-edit" onclick={() => goto(`/blog/${data.post.slug}/edit`)} type="button">
        แก้ไข
      </button>
      <button class="btn-nb" onclick={openNotebookPicker} type="button">
        เพิ่มใน Notebook
      </button>
      <button class="btn-delete" onclick={deletePost} type="button">
        ลบ
      </button>
    </div>
  {/if}

  {#if showNotebookPicker}
    <div class="nb-overlay" onclick={() => showNotebookPicker = false} role="dialog">
      <div class="nb-modal" onclick={(e) => e.stopPropagation()}>
        <h3>เพิ่มใน Notebook</h3>
        {#if userNotebooks.length === 0}
          <p class="nb-empty">ยังไม่มี Notebook</p>
        {:else}
          <div class="nb-list">
            {#each userNotebooks as nb}
              <button class="nb-option" onclick={() => addToNotebook(nb.id)} disabled={addingToNotebook} type="button">
                <span class="nb-option-title">{nb.title}</span>
                <span class="nb-option-add">{addingToNotebook ? '...' : '+'}</span>
              </button>
            {/each}
          </div>
        {/if}
        <button class="nb-cancel" onclick={() => showNotebookPicker = false} type="button">ยกเลิก</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .article-page {
    max-width: 680px;
    margin: 0 auto;
    padding: 8px 0 48px;
  }

  .back-link {
    font-size: 13px;
    color: #64748b;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0 0 24px;
    display: inline-block;
    transition: color 0.15s;
  }
  .back-link:hover {
    color: #0f172a;
  }

  .article-header {
    margin-bottom: 32px;
  }

  .article-title {
    font-size: 32px;
    font-weight: 800;
    color: #0f172a;
    margin: 0 0 12px 0;
    line-height: 1.25;
    letter-spacing: -0.02em;
  }

  .article-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 4px;
    font-size: 13px;
    color: #94a3b8;
  }

  .meta-sep {
    color: #cbd5e1;
  }

  .empty-text {
    color: #94a3b8;
    font-size: 14px;
    font-style: italic;
  }

  .article-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 12px;
  }

  .article-tag {
    font-size: 11px;
    padding: 3px 10px;
    border-radius: 9999px;
    background: #f1f5f9;
    color: #64748b;
    font-weight: 500;
  }

  .post-actions {
    display: flex;
    gap: 8px;
    margin-top: 32px;
    padding-top: 20px;
    border-top: 1px solid #e2e8f0;
  }

  .action-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 7px 16px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }
  .action-btn:hover {
    border-color: #94a3b8;
    background: #f8fafc;
  }
  .action-btn.liked {
    border-color: #f43f5e;
    color: #f43f5e;
    background: #fff1f2;
  }

  .author-actions {
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid #e2e8f0;
    display: flex;
    gap: 8px;
  }

  .btn-edit {
    padding: 8px 20px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #475569;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-edit:hover {
    border-color: #3b82f6;
    color: #3b82f6;
    background: #f8faff;
  }

  .btn-delete {
    padding: 8px 20px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: none;
    color: #94a3b8;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-delete:hover {
    color: #ef4444;
    border-color: #fca5a5;
    background: #fef2f2;
  }

  .btn-nb {
    padding: 8px 20px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #f59e0b;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
  }
  .btn-nb:hover {
    border-color: #f59e0b;
    background: #fffbeb;
  }

  .nb-overlay {
    position: fixed; inset: 0; z-index: 50;
    background: rgba(0,0,0,0.3);
    display: flex; align-items: center; justify-content: center;
    backdrop-filter: blur(4px);
  }
  .nb-modal {
    background: white; border-radius: 16px; padding: 20px;
    width: 90%; max-width: 360px; box-shadow: 0 20px 60px rgba(0,0,0,0.15);
  }
  .nb-modal h3 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 14px 0; }
  .nb-empty { font-size: 13px; color: #94a3b8; font-style: italic; }
  .nb-list { display: flex; flex-direction: column; gap: 4px; margin-bottom: 14px; max-height: 200px; overflow-y: auto; }
  .nb-option {
    display: flex; align-items: center; justify-content: space-between;
    width: 100%; text-align: left; padding: 10px 14px;
    border-radius: 10px; border: 1px solid #e2e8f0; background: white;
    font-size: 13px; color: #0f172a; cursor: pointer; transition: 0.12s;
  }
  .nb-option:hover { border-color: #f59e0b; background: #fffbeb; }
  .nb-option:disabled { opacity: 0.5; }
  .nb-option-title { font-weight: 500; }
  .nb-option-add { color: #f59e0b; font-weight: 700; font-size: 18px; }
  .nb-cancel {
    width: 100%; padding: 8px; border-radius: 8px; border: 1px solid #e2e8f0;
    background: white; color: #64748b; font-size: 12px; cursor: pointer;
  }
  .nb-cancel:hover { background: #f8fafc; }
</style>
