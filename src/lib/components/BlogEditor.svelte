<script lang="ts">
  import { supabase } from '$lib/supabaseClient';
  import { goto } from '$app/navigation';
  import { marked } from 'marked';

  let { post }: { post: any } = $props();

  let content = $state(post.content || '');
  let title = $state(post.title || '');
  let tags = $state(Array.isArray(post.tags) ? post.tags.join(', ') : (post.tags || ''));
  let deleting = $state(false);
  let isSaving = $state(false);
  let previewMode = $state(false);

  let contentHtml = $derived(content ? marked(content) : '');

  function parseTags(raw: string): string[] {
    return raw.split(',').map(t => t.trim()).filter(Boolean);
  }

  async function saveDraft() {
    isSaving = true;
    await supabase.from('posts').update({ title, content }).eq('id', post.id);
    const tagList = parseTags(tags);
    if (tagList.length > 0) {
      const { error: _te } = await supabase.from('posts').update({ tags: tagList }).eq('id', post.id);
    }
    isSaving = false;
  }

  async function publish() {
    isSaving = true;
    await supabase.from('posts').update({ title, content, published: true }).eq('id', post.id);
    const tagList = parseTags(tags);
    if (tagList.length > 0) {
      const { error: _te } = await supabase.from('posts').update({ tags: tagList }).eq('id', post.id);
    }
    isSaving = false;
    goto(`/blog/${post.slug}`);
  }

  async function deletePost() {
    if (!confirm('ลบบทความนี้?')) return;
    deleting = true;
    await supabase.from('posts').delete().eq('id', post.id);
    await supabase.from('notebook_items').delete().eq('source_id', post.id).eq('type', 'blog');
    goto('/blog');
  }
</script>

<div class="editor-wrap">
  <div class="editor-header">
    <button class="btn-back" onclick={() => goto(`/blog/${post.slug}`)} type="button">← กลับ</button>
    <input class="title-input" bind:value={title} placeholder="ชื่อบทความ..." />
    <div class="header-actions">
      <button class="btn-save" onclick={saveDraft} disabled={isSaving} type="button">
        {isSaving ? 'กำลังบันทึก...' : 'บันทึกร่าง'}
      </button>
      <button class="btn-publish" onclick={publish} disabled={isSaving} type="button">เผยแพร่</button>
      <button class="btn-delete-editor" onclick={deletePost} disabled={deleting} type="button" title="ลบบทความ">🗑</button>
    </div>
  </div>

  <div class="tags-row">
    <input class="tags-input" bind:value={tags} placeholder="แท็ก: แนวคิด, ชีวิต, เทคโนโลยี (คั่นด้วยคอมม่า)" />
  </div>

  <div class="editor-toolbar">
    <div class="toolbar-tabs">
      <button class="tab-btn" class:active={!previewMode} onclick={() => previewMode = false} type="button">เขียน</button>
      <button class="tab-btn" class:active={previewMode} onclick={() => previewMode = true} type="button">พรีวิว</button>
    </div>
    {#if !previewMode}
      <span class="toolbar-hint">Markdown</span>
    {/if}
  </div>

  {#if previewMode}
    <div class="editor-preview prose prose-slate max-w-none">{@html contentHtml}</div>
  {:else}
    <textarea class="editor-textarea" bind:value={content} placeholder="เริ่มเขียนบทความของคุณด้วย Markdown..."></textarea>
  {/if}
</div>

<style>
  .editor-wrap {
    display: flex;
    flex-direction: column;
    height: 100%;
    max-width: 800px;
    margin: 0 auto;
  }

  .editor-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
  }

  .btn-back {
    font-size: 13px;
    color: #64748b;
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 6px;
    transition: all 0.15s;
  }
  .btn-back:hover {
    color: #0f172a;
    background: #f1f5f9;
  }

  .title-input {
    flex: 1;
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
    border: none;
    outline: none;
    background: transparent;
    padding: 4px 0;
  }
  .title-input::placeholder {
    color: #cbd5e1;
  }

  .header-actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;
  }

  .btn-save {
    font-size: 12px;
    padding: 7px 16px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #475569;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.15s;
  }
  .btn-save:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
  }
  .btn-save:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-publish {
    font-size: 12px;
    padding: 7px 16px;
    border-radius: 8px;
    border: none;
    background: #3b82f6;
    color: white;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.15s;
  }
  .btn-publish:hover {
    background: #2563eb;
  }
  .btn-publish:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-delete-editor {
    font-size: 16px;
    padding: 6px 10px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: none;
    cursor: pointer;
    opacity: 0.3;
    transition: all 0.15s;
  }
  .btn-delete-editor:hover {
    opacity: 1;
    background: #fef2f2;
    border-color: #fca5a5;
  }
  .btn-delete-editor:disabled {
    opacity: 0.15;
    cursor: not-allowed;
  }

  .tags-row {
    display: flex;
    padding: 8px 0;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
  }

  .tags-input {
    flex: 1;
    font-size: 12px;
    color: #64748b;
    border: none;
    outline: none;
    background: transparent;
    padding: 2px 0;
  }
  .tags-input::placeholder {
    color: #cbd5e1;
  }

  .editor-toolbar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 0;
    border-bottom: 1px solid #e2e8f0;
    flex-shrink: 0;
  }

  .toolbar-tabs {
    display: flex;
    gap: 2px;
    background: #f1f5f9;
    border-radius: 8px;
    padding: 2px;
  }

  .tab-btn {
    font-size: 12px;
    font-weight: 600;
    padding: 5px 14px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #64748b;
    cursor: pointer;
    transition: all 0.15s;
  }
  .tab-btn.active {
    background: white;
    color: #0f172a;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .tab-btn:hover:not(.active) {
    color: #0f172a;
  }

  .toolbar-hint {
    font-size: 10px;
    color: #94a3b8;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .editor-preview {
    flex: 1;
    overflow-y: auto;
    padding: 20px 0;
    font-size: 15px;
    line-height: 1.8;
    color: #334155;
  }
  .editor-preview :global(h1),
  .editor-preview :global(h2),
  .editor-preview :global(h3) {
    margin-top: 1.5em;
    margin-bottom: 0.5em;
    font-weight: 700;
    color: #0f172a;
  }
  .editor-preview :global(p) {
    margin-bottom: 1em;
  }
  .editor-preview :global(code) {
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
  }
  .editor-preview :global(pre) {
    background: #0f172a;
    color: #e2e8f0;
    padding: 16px;
    border-radius: 10px;
    overflow-x: auto;
  }
  .editor-preview :global(pre code) {
    background: none;
    padding: 0;
  }
  .editor-preview :global(img) {
    max-width: 100%;
    border-radius: 10px;
  }
  .editor-preview :global(blockquote) {
    border-left: 3px solid #e2e8f0;
    padding-left: 16px;
    color: #64748b;
    font-style: italic;
  }

  .editor-textarea {
    flex: 1;
    border: none;
    outline: none;
    resize: none;
    font-size: 15px;
    line-height: 1.8;
    color: #334155;
    background: transparent;
    padding: 20px 0;
    font-family: 'SF Mono', 'Fira Code', 'Cascadia Code', monospace;
    min-height: 300px;
  }
  .editor-textarea::placeholder {
    color: #cbd5e1;
  }
</style>
