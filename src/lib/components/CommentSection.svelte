<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/state';

  let { slug }: { slug: string } = $props();

  let comments = $state<any[]>([]);
  let newComment = $state('');
  let loading = $state(true);
  let posting = $state(false);

  onMount(() => loadComments());

  async function loadComments() {
    loading = true;
    const res = await fetch(`/api/blog/comment?slug=${encodeURIComponent(slug)}`);
    if (res.ok) comments = await res.json();
    loading = false;
  }

  async function postComment() {
    if (!newComment.trim() || posting) return;
    posting = true;
    const res = await fetch('/api/blog/comment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug, content: newComment.trim() }),
    });
    if (res.ok) {
      const comment = await res.json();
      comments = [...comments, comment];
      newComment = '';
    } else {
      alert('ไม่สามารถส่งความคิดเห็นได้');
    }
    posting = false;
  }

  async function deleteComment(id: string) {
    if (!confirm('ลบความคิดเห็นนี้?')) return;
    const res = await fetch('/api/blog/comment/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      comments = comments.filter(c => c.id !== id);
    }
  }

  function timeAgo(date: string) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'เมื่อสักครู่';
    if (mins < 60) return `${mins} นาทีที่แล้ว`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
    const days = Math.floor(hours / 24);
    return `${days} วันที่แล้ว`;
  }
</script>

<div class="comment-section">
  <h3 class="comment-heading">ความคิดเห็น ({comments.length})</h3>

  {#if page.data.userId}
    <div class="comment-form">
      <textarea
        class="comment-input"
        bind:value={newComment}
        placeholder="เขียนความคิดเห็น..."
        rows="2"
      ></textarea>
      <button class="btn-post" onclick={postComment} disabled={!newComment.trim() || posting} type="button">
        {posting ? 'กำลังส่ง...' : 'ส่ง'}
      </button>
    </div>
  {:else}
    <p class="login-hint"><a href="/login">เข้าสู่ระบบ</a> เพื่อแสดงความคิดเห็น</p>
  {/if}

  {#if loading}
    <p class="loading-text">กำลังโหลด...</p>
  {:else if comments.length === 0}
    <p class="empty-text">ยังไม่มีความคิดเห็น</p>
  {:else}
    <div class="comments-list">
      {#each comments as c}
        <div class="comment-item">
          <div class="comment-header">
            <span class="comment-author">{c.author}</span>
            <span class="comment-time">{timeAgo(c.created_at)}</span>
            {#if page.data.userId === c.user_id}
              <button class="btn-delete-comment" onclick={() => deleteComment(c.id)} type="button">×</button>
            {/if}
          </div>
          <p class="comment-body">{c.content}</p>
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .comment-section {
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid #e2e8f0;
  }

  .comment-heading {
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 16px 0;
  }

  .comment-form {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
  }

  .comment-input {
    flex: 1;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 10px 14px;
    font-size: 13px;
    font-family: inherit;
    resize: none;
    outline: none;
    transition: 0.15s;
  }
  .comment-input:focus {
    border-color: #3b82f6;
  }

  .btn-post {
    padding: 8px 18px;
    border-radius: 8px;
    border: none;
    background: #0f172a;
    color: white;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: 0.15s;
    align-self: flex-start;
  }
  .btn-post:hover:not(:disabled) {
    background: #1e293b;
  }
  .btn-post:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .login-hint {
    font-size: 12px;
    color: #94a3b8;
    margin-bottom: 20px;
  }
  .login-hint a {
    color: #3b82f6;
    text-decoration: none;
  }

  .loading-text {
    font-size: 12px;
    color: #94a3b8;
  }

  .empty-text {
    font-size: 12px;
    color: #94a3b8;
    font-style: italic;
  }

  .comments-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .comment-item {
    padding: 12px 14px;
    background: #f8fafc;
    border-radius: 10px;
  }

  .comment-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }

  .comment-author {
    font-size: 12px;
    font-weight: 600;
    color: #0f172a;
  }

  .comment-time {
    font-size: 10px;
    color: #94a3b8;
  }

  .btn-delete-comment {
    margin-left: auto;
    background: none;
    border: none;
    cursor: pointer;
    color: #cbd5e1;
    font-size: 16px;
    padding: 0 4px;
    transition: 0.15s;
  }
  .btn-delete-comment:hover {
    color: #ef4444;
  }

  .comment-body {
    font-size: 13px;
    color: #475569;
    margin: 0;
    line-height: 1.5;
    white-space: pre-wrap;
  }
</style>
