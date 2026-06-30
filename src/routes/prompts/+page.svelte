<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import Icon from '$lib/components/Icon.svelte';

  let { data } = $props<{ data: { prompts: any[] } }>();

  let prompts = $state<any[]>([...data.prompts]);
  let showForm = $state(false);
  let editId = $state<string | null>(null);
  let formTitle = $state('');
  let formContent = $state('');
  let saving = $state(false);

  async function apiHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
    return headers;
  }

  async function loadPrompts() {
    const res = await fetch('/api/prompts', { headers: await apiHeaders() });
    if (res.ok) prompts = await res.json();
  }

  function openNew() {
    editId = null;
    formTitle = '';
    formContent = '';
    showForm = true;
  }

  function openEdit(p: any) {
    editId = p.id;
    formTitle = p.title;
    formContent = p.content;
    showForm = true;
  }

  async function save() {
    if (!formTitle.trim() || !formContent.trim() || saving) return;
    saving = true;

    try {
      let res: Response;
      const hdrs = await apiHeaders();
    if (editId) {
        res = await fetch(`/api/prompts/${editId}`, {
          method: 'PUT',
          headers: hdrs,
          body: JSON.stringify({ title: formTitle.trim(), content: formContent.trim() }),
        });
      } else {
        res = await fetch('/api/prompts', {
          method: 'POST',
          headers: hdrs,
          body: JSON.stringify({ title: formTitle.trim(), content: formContent.trim() }),
        });
      }

      if (!res.ok) {
        const err = await res.text();
        alert('บันทึกไม่สำเร็จ: ' + err);
        saving = false;
        return;
      }

      saving = false;
      showForm = false;
      editId = null;
      await loadPrompts();
    } catch (e: any) {
      alert('เกิดข้อผิดพลาด: ' + e.message);
      saving = false;
    }
  }

  async function delPrompt(id: string) {
    if (!confirm('ลบ prompt นี้?')) return;
    const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE', headers: await apiHeaders() });
    if (!res.ok) return alert('ลบไม่สำเร็จ');
    await loadPrompts();
  }

  function usePrompt(p: any) {
    goto(`/chat?prompt=${encodeURIComponent(p.id)}`);
  }
</script>

<div class="prompts-page">
  <div class="page-header">
    <div>
      <div class="flex items-center gap-3">
        <Icon name="ai" size={22} class="text-amber-500" />
        <h1>Prompt ของฉัน</h1>
      </div>
      <p class="page-sub">System prompts ที่คุณบันทึกไว้ ใช้ผ่าน <kbd>/prompts</kbd> ในแชท</p>
    </div>
    <button class="btn-new" onclick={openNew} type="button">+ สร้าง Prompt</button>
  </div>

  {#if showForm}
    <div class="form-card">
      <h2>{editId ? 'แก้ไข Prompt' : 'สร้าง Prompt ใหม่'}</h2>
      <input class="form-input" bind:value={formTitle} placeholder="ชื่อ Prompt เช่น นักเขียน, ติวเตอร์..." />
      <textarea class="form-textarea" bind:value={formContent} placeholder="System prompt ที่จะใช้ คำแนะนำนิสัยการตอบ..." rows="5"></textarea>
      <div class="form-actions">
        <button class="btn-cancel" onclick={() => { showForm = false; editId = null; }} type="button">ยกเลิก</button>
        <button class="btn-save" onclick={save} disabled={!formTitle.trim() || !formContent.trim() || saving} type="button">
          {saving ? 'กำลังบันทึก...' : 'บันทึก'}
        </button>
      </div>
    </div>
  {/if}

  {#if prompts.length === 0 && !showForm}
    <div class="empty-state">
      <p class="empty-text">ยังไม่มี Prompt ที่บันทึกไว้</p>
      <p class="empty-hint">สร้าง Prompt เพื่อใช้ในแชทผ่าน <kbd>/prompts</kbd></p>
    </div>
  {:else}
    <div class="prompts-list">
      {#each prompts as p}
        <div class="prompt-card">
          <div class="prompt-main">
            <div class="prompt-icon">⚡</div>
            <div class="prompt-info">
              <h3 class="prompt-title">{p.title}</h3>
              <p class="prompt-preview">{p.content.slice(0, 120)}{p.content.length > 120 ? '...' : ''}</p>
            </div>
          </div>
          <div class="prompt-actions">
            <button class="action-btn" onclick={() => openEdit(p)} type="button" title="แก้ไข"><Icon name="edit" size={14} /></button>
            <button class="action-btn" onclick={() => delPrompt(p.id)} type="button" title="ลบ"><Icon name="trash" size={14} /></button>
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <div class="howto">
    <h4>วิธีใช้ Prompt ในแชท</h4>
    <p>พิมพ์ <kbd>/prompts/</kbd> ในแชท แล้วเลือก Prompt ที่ต้องการ</p>
  </div>
</div>

<style>
  .prompts-page {
    max-width: 600px;
    margin: 0 auto;
    padding: 8px 0 48px;
  }

  .page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 24px;
  }
  .page-header h1 {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
  }
  .page-sub {
    font-size: 13px;
    color: #94a3b8;
    margin: 4px 0 0;
  }
  .page-sub kbd {
    background: #f1f5f9;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-family: monospace;
    color: #475569;
  }

  .btn-new {
    padding: 8px 18px;
    border-radius: 8px;
    border: none;
    background: #0f172a;
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }
  .btn-new:hover { background: #1e293b; }

  .form-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    padding: 18px;
    margin-bottom: 20px;
  }
  .form-card h2 {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    margin: 0 0 12px 0;
  }

  .form-input {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 13px;
    outline: none;
    margin-bottom: 10px;
    box-sizing: border-box;
  }
  .form-input:focus { border-color: #3b82f6; }

  .form-textarea {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 13px;
    outline: none;
    resize: vertical;
    font-family: inherit;
    box-sizing: border-box;
  }
  .form-textarea:focus { border-color: #3b82f6; }

  .form-actions {
    display: flex;
    gap: 8px;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .btn-cancel {
    padding: 7px 16px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-save {
    padding: 7px 18px;
    border-radius: 8px;
    border: none;
    background: #3b82f6;
    color: white;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
  }
  .btn-save:hover:not(:disabled) { background: #2563eb; }
  .btn-save:disabled { opacity: 0.5; cursor: not-allowed; }

  .empty-state {
    text-align: center;
    padding: 48px 0;
  }
  .empty-text { font-size: 14px; color: #94a3b8; font-style: italic; }
  .empty-hint { font-size: 12px; color: #cbd5e1; margin-top: 4px; }
  .empty-hint kbd { background: #f1f5f9; padding: 1px 6px; border-radius: 4px; font-size: 11px; }

  .prompts-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .prompt-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    background: white;
    transition: 0.15s;
  }
  .prompt-card:hover {
    border-color: #94a3b8;
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  }

  .prompt-main {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    flex: 1;
    min-width: 0;
  }

  .prompt-icon {
    font-size: 20px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .prompt-info {
    flex: 1;
    min-width: 0;
  }

  .prompt-title {
    font-size: 14px;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 3px 0;
  }

  .prompt-preview {
    font-size: 12px;
    color: #64748b;
    margin: 0;
    line-height: 1.4;
  }

  .prompt-actions {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  .action-btn {
    background: none;
    border: 1px solid transparent;
    cursor: pointer;
    font-size: 15px;
    padding: 4px 6px;
    border-radius: 6px;
    opacity: 0.4;
    transition: 0.15s;
  }
  .action-btn:hover { opacity: 1; background: #f8fafc; border-color: #e2e8f0; }

  .howto {
    margin-top: 32px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }
  .howto h4 {
    font-size: 13px;
    font-weight: 600;
    color: #0f172a;
    margin: 0 0 6px 0;
  }
  .howto p {
    font-size: 12px;
    color: #64748b;
    margin: 0;
  }
  .howto kbd {
    background: #e2e8f0;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-family: monospace;
  }
</style>
