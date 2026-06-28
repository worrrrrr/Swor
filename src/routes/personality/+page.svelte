<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import { MBTI_INFO, ENNEAGRAM_INFO } from '$lib/personality/types';

  let mbti = $state('');
  let enneagram = $state(0);
  let wing = $state('');
  let calculatedMbti = $state('');
  let calculatedEnneagram = $state(0);
  let history = $state<any[]>([]);
  let loading = $state(true);
  let deletingIdx = $state<number | null>(null);

  onMount(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const meta = user?.user_metadata || {};
    mbti = meta.personality_mbti || '';
    enneagram = meta.personality_enneagram || 0;
    wing = meta.personality_enneagram_wing || '';
    calculatedMbti = meta.personality_calculated_mbti || '';
    calculatedEnneagram = meta.personality_calculated_enneagram || 0;
    history = meta.personality_history || [];
    loading = false;
  });

  function formatDate(ts: string) {
    return new Date(ts).toLocaleString('th-TH', {
      day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  async function deleteHistoryEntry(index: number) {
    if (!confirm('ลบประวัติรายการนี้?')) return;
    deletingIdx = index;
    const newHistory = history.filter((_, i) => i !== index);
    const { data: { user } } = await supabase.auth.getUser();
    const meta = user?.user_metadata || {};
    await supabase.auth.updateUser({
      data: {
        ...meta,
        personality_history: newHistory,
        personality_taken: newHistory.length > 0,
        personality_mbti: newHistory.length > 0 ? newHistory[newHistory.length - 1].mbti : '',
        personality_enneagram: newHistory.length > 0 ? newHistory[newHistory.length - 1].enneagram : 0,
        personality_enneagram_wing: newHistory.length > 0 ? (newHistory[newHistory.length - 1].wing || '') : '',
      }
    });
    history = newHistory;
    if (newHistory.length === 0) {
      mbti = ''; enneagram = 0; wing = '';
    }
    deletingIdx = null;
  }

  function showDiff(calc: string, chosen: string): boolean {
    return !!calc && calc !== chosen;
  }
</script>

<div class="page">
  {#if loading}
    <p class="empty">กำลังโหลด...</p>
  {:else if !mbti}
    <div class="empty-state">
      <p class="empty">ยังไม่เคยทำแบบทดสอบ</p>
      <button class="btn-primary" onclick={() => goto('/test')} type="button">เริ่มทำแบบทดสอบ</button>
    </div>
  {:else}
    <div class="current-section">
      <h1>🧠 บุคลิกภาพของคุณ</h1>

      <!-- You chose -->
      <div class="type-cards">
        <div class="type-card blue">
          <span class="type-badge-label">MBTI · คุณเลือกเอง</span>
          <span class="type-value">{mbti}</span>
          <span class="type-label">{MBTI_INFO[mbti]?.label || ''}</span>
          <span class="type-desc">{MBTI_INFO[mbti]?.desc || ''}</span>
        </div>
        <div class="type-card purple">
          <span class="type-badge-label">Enneagram · คุณเลือกเอง</span>
          <span class="type-value">{enneagram}{wing}</span>
          <span class="type-label">{ENNEAGRAM_INFO[enneagram]?.label || ''}</span>
          <span class="type-desc">{ENNEAGRAM_INFO[enneagram]?.desc || ''}</span>
        </div>
      </div>

      <!-- Diff badge -->
      {#if showDiff(calculatedMbti, mbti) || (calculatedEnneagram && calculatedEnneagram !== enneagram)}
        <div class="diff-notice">
          <div class="diff-row">
            <span class="diff-label">ระบบคำนวณ:</span>
            {#if calculatedMbti}
              <span class="badge-blue-sm">{calculatedMbti}</span>
            {/if}
            {#if calculatedEnneagram}
              <span class="badge-purple-sm">{calculatedEnneagram}</span>
            {/if}
          </div>
          <p class="diff-text">คุณเลือกต่างจากที่ระบบคำนวณ — ทั้งคู่เป็นจริงในคนๆ เดียว ระบบวัดพฤติกรรม คุณวัดตัวตน</p>
        </div>
      {/if}

      <button class="btn-outline" onclick={() => goto('/test')} type="button">ทำแบบทดสอบอีกครั้ง</button>
    </div>

    <div class="history-section">
      <h2>📋 ประวัติการทดสอบ</h2>
      {#if history.length === 0}
        <p class="empty">ไม่มีประวัติ</p>
      {:else}
        <div class="history-list">
          {#each [...history].reverse() as entry, i}
            <div class="history-item">
              <div class="history-types">
                <span class="badge-mbti">{entry.mbti}</span>
                <span class="badge-ene">{entry.enneagram}{entry.wing || ''}</span>
                {#if entry.calculatedMbti && entry.calculatedMbti !== entry.mbti}
                  <span class="badge-calc">ระบบ: {entry.calculatedMbti}</span>
                {/if}
              </div>
              <div class="history-right">
                <span class="history-date">{formatDate(entry.timestamp)}</span>
                <button class="btn-del-history" onclick={() => deleteHistoryEntry(history.length - 1 - i)} disabled={deletingIdx === history.length - 1 - i} type="button" title="ลบ">🗑</button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .page { max-width: 600px; margin: 0 auto; padding: 32px 16px; display: flex; flex-direction: column; gap: 32px; }

  .current-section h1 { font-size: 22px; font-weight: 700; color: #0f172a; margin: 0 0 20px 0; text-align: center; }

  .type-cards { display: flex; gap: 16px; margin-bottom: 12px; }
  .type-card { flex: 1; padding: 24px; border-radius: 16px; text-align: center; }
  .type-card.blue { background: #eff6ff; border: 1px solid #bfdbfe; }
  .type-card.purple { background: #f5f3ff; border: 1px solid #ddd6fe; }
  .type-badge-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 8px; }
  .type-card.blue .type-badge-label { color: #3b82f6; }
  .type-card.purple .type-badge-label { color: #8b5cf6; }
  .type-value { display: block; font-size: 32px; font-weight: 800; color: #0f172a; margin-bottom: 4px; }
  .type-label { display: block; font-size: 14px; font-weight: 600; color: #0f172a; margin-bottom: 4px; }
  .type-desc { display: block; font-size: 12px; color: #64748b; }

  .diff-notice { padding: 14px 16px; background: #fef9c3; border: 1px solid #fde68a; border-radius: 12px; margin-bottom: 12px; }
  .diff-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
  .diff-label { font-size: 12px; color: #92400e; font-weight: 500; }
  .badge-blue-sm { font-size: 13px; font-weight: 700; color: #3b82f6; background: #dbeafe; padding: 2px 10px; border-radius: 6px; }
  .badge-purple-sm { font-size: 13px; font-weight: 700; color: #8b5cf6; background: #ede9fe; padding: 2px 10px; border-radius: 6px; }
  .diff-text { font-size: 12px; color: #92400e; margin: 0; line-height: 1.5; }

  .btn-primary { padding: 12px 24px; border-radius: 10px; border: none; background: #0f172a; color: white; font-size: 14px; font-weight: 600; cursor: pointer; display: inline-block; }
  .btn-primary:hover { background: #1e293b; }
  .btn-outline { padding: 10px 20px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; color: #475569; font-size: 13px; cursor: pointer; display: inline-block; }
  .btn-outline:hover { background: #f8fafc; }

  .history-section h2 { font-size: 16px; font-weight: 700; color: #0f172a; margin: 0 0 12px 0; }
  .history-list { display: flex; flex-direction: column; gap: 6px; }
  .history-item { display: flex; align-items: center; justify-content: space-between; background: white; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 16px; }
  .history-types { display: flex; gap: 6px; align-items: center; }
  .badge-mbti { font-size: 12px; font-weight: 700; color: #3b82f6; background: #eff6ff; padding: 2px 10px; border-radius: 6px; }
  .badge-ene { font-size: 12px; font-weight: 700; color: #8b5cf6; background: #f5f3ff; padding: 2px 10px; border-radius: 6px; }
  .badge-calc { font-size: 10px; color: #92400e; background: #fef9c3; padding: 2px 8px; border-radius: 4px; }
  .history-date { font-size: 11px; color: #94a3b8; }
  .history-right { display: flex; align-items: center; gap: 8px; }
  .btn-del-history { background: none; border: 1px solid transparent; cursor: pointer; font-size: 13px; padding: 2px 4px; border-radius: 4px; opacity: 0; transition: 0.1s; }
  .history-item:hover .btn-del-history { opacity: 0.3; }
  .history-item:hover .btn-del-history:hover { opacity: 1; background: #fef2f2; border-color: #fca5a5; }
  .btn-del-history:disabled { opacity: 0.1; cursor: not-allowed; }
  .empty { color: #94a3b8; font-size: 13px; font-style: italic; text-align: center; padding: 20px 0; }
  .empty-state { text-align: center; padding: 60px 0; }
  .empty-state .btn-primary { margin-top: 16px; }
</style>
