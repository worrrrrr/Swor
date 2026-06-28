<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import { QUESTIONS } from '$lib/personality/questions';
  import { PersonalityInterpreter } from '$lib/personality/interpreter';
  import { MBTI_INFO, ENNEAGRAM_INFO, type Choice } from '$lib/personality/types';

  const TOTAL_MBTI = Object.keys(MBTI_INFO);
  const TOTAL_ENNEAGRAM = [1,2,3,4,5,6,7,8,9];

  let current = $state(0);
  let selectedChoices = $state<Choice[]>([]);
  let rawScores = $state<any>(null);
  let calculatedMbti = $state('');
  let calculatedEnneagram = $state(0);
  let saving = $state(false);
  let existing = $state<{ mbti: string; enneagram: number; wing: string } | null>(null);
  let showTest = $state(false);

  // User self-selection
  let step: 'test' | 'scores' | 'mbti_choose' | 'enneagram_choose' | 'compare' = $state('test');
  let chosenMbti = $state('');
  let chosenEnneagram = $state(0);
  let chosenWing = $state('');

  const totalQ = QUESTIONS.length;

  onMount(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const meta = user?.user_metadata || {};
    if (meta.personality_mbti) {
      existing = { mbti: meta.personality_mbti, enneagram: meta.personality_enneagram, wing: meta.personality_enneagram_wing || '' };
    }
  });

  function startTest() {
    showTest = true;
    existing = null;
    current = 0;
    selectedChoices = [];
    rawScores = null;
    step = 'test';
  }

  function handleChoice(choice: Choice) {
    selectedChoices = [...selectedChoices, choice];
    if (current < totalQ - 1) {
      current += 1;
    } else {
      const r = PersonalityInterpreter.calculateResult(selectedChoices);
      rawScores = r.rawScores;
      calculatedMbti = r.mbti;
      calculatedEnneagram = r.enneagram;
      step = 'scores';
    }
  }

  function chooseMbti(type: string) {
    chosenMbti = type;
    step = 'enneagram_choose';
  }

  function chooseEnneagram(num: number) {
    chosenEnneagram = num;
    calcWing();
    step = 'compare';
  }

  function calcWing() {
    const s = rawScores.enneagram;
    const wings = chosenEnneagram === 1 ? [9, 2] : chosenEnneagram === 9 ? [8, 1] : [chosenEnneagram - 1, chosenEnneagram + 1];
    const best = wings.sort((a: number, b: number) => (s[b] || 0) - (s[a] || 0))[0];
    chosenWing = best ? `w${best}` : '';
  }

  function calcPct(a: number, b: number) {
    const total = a + b || 1;
    return (a / total) * 100;
  }

  function getEnneagramScores(): { type: number; score: number }[] {
    return Object.entries(rawScores?.enneagram || {}).map(([k, v]) => ({ type: Number(k), score: v as number }));
  }

  async function saveResult() {
    if (!chosenMbti || !chosenEnneagram || saving) return;
    saving = true;

    const entry = {
      mbti: chosenMbti,
      enneagram: chosenEnneagram,
      wing: chosenWing,
      calculatedMbti,
      calculatedEnneagram,
      timestamp: new Date().toISOString(),
      scores: rawScores,
    };

    const { data: { user } } = await supabase.auth.getUser();
    const existingHistory = user?.user_metadata?.personality_history || [];

    await supabase.auth.updateUser({
      data: {
        personality_mbti: chosenMbti,
        personality_enneagram: chosenEnneagram,
        personality_enneagram_wing: chosenWing,
        personality_calculated_mbti: calculatedMbti,
        personality_calculated_enneagram: calculatedEnneagram,
        personality_taken: true,
        personality_history: [...existingHistory, entry],
      }
    });
    goto('/personality');
  }

  function goBack() {
    if (current > 0) {
      selectedChoices = selectedChoices.slice(0, -1);
      current -= 1;
    }
  }

  const progress = $derived(Math.round(((current) / totalQ) * 100));
</script>

<div class="page">
  {#if !showTest && existing}
    <!-- Existing result -->
    <div class="card">
      <h1>ผลลัพธ์ที่บันทึกไว้</h1>
      <div class="type-row">
        <div class="type-badge blue">{existing.mbti}</div>
        <div class="type-badge purple">{existing.enneagram}{existing.wing}</div>
      </div>
      <p class="text-sm text-slate-500 text-center mb-4">{MBTI_INFO[existing.mbti]?.label || ''} · {ENNEAGRAM_INFO[existing.enneagram]?.label || ''}</p>
      <button class="btn-outline w-full" onclick={startTest} type="button">ทำแบบทดสอบอีกครั้ง</button>
      <button class="btn-ghost w-full" onclick={() => goto('/personality')} type="button">← กลับไปบุคลิกภาพ</button>
    </div>

  {:else if step === 'test'}
    <!-- Question -->
    <div class="card">
      <div class="progress-bar"><div class="progress-fill" style="width: {progress}%"></div></div>
      <div class="progress-text">ข้อที่ {current + 1} / {totalQ}</div>
      <div class="scenario">{QUESTIONS[current].scenario}</div>
      <div class="choices">
        {#each QUESTIONS[current].choices as choice}
          <button class="choice" onclick={() => handleChoice(choice)} type="button">{choice.text}</button>
        {/each}
      </div>
      <div class="flex-between mt-4">
        {#if current > 0}
          <button class="btn-text" onclick={goBack} type="button">← ย้อนกลับ</button>
        {:else}
          <span></span>
        {/if}
      </div>
    </div>

  {:else if step === 'scores'}
    <!-- Raw scores -->
    <div class="card">
      <h1>📊 ผลคะแนนดิบของคุณ</h1>
      <p class="desc">ระบบคำนวณแนวโน้มของคุณออกมาแล้ว — <strong>แต่คุณคือคนที่รู้จักตัวเองดีที่สุด</strong><br>เลือก type ที่คุณคิดว่าตรงกับตัวคุณมากที่สุด</p>

      <div class="score-section">
        <h2>MBTI</h2>
        <div class="bars">
          <div class="bar-row"><span>E {Math.round(rawScores.mbti.E)}</span><div class="track"><div class="fill" style="width:{calcPct(rawScores.mbti.E, rawScores.mbti.I)}%"></div></div><span>I {Math.round(rawScores.mbti.I)}</span></div>
          <div class="bar-row"><span>S {Math.round(rawScores.mbti.S)}</span><div class="track"><div class="fill" style="width:{calcPct(rawScores.mbti.S, rawScores.mbti.N)}%"></div></div><span>N {Math.round(rawScores.mbti.N)}</span></div>
          <div class="bar-row"><span>T {Math.round(rawScores.mbti.T)}</span><div class="track"><div class="fill" style="width:{calcPct(rawScores.mbti.T, rawScores.mbti.F)}%"></div></div><span>F {Math.round(rawScores.mbti.F)}</span></div>
          <div class="bar-row"><span>J {Math.round(rawScores.mbti.J)}</span><div class="track"><div class="fill" style="width:{calcPct(rawScores.mbti.J, rawScores.mbti.P)}%"></div></div><span>P {Math.round(rawScores.mbti.P)}</span></div>
        </div>
        <p class="hint">คะแนนที่ระบบคำนวณ: <strong>{calculatedMbti}</strong> ({MBTI_INFO[calculatedMbti]?.label})</p>
      </div>

      <div class="score-section">
        <h2>Enneagram</h2>
        <div class="bars">
          {#each getEnneagramScores() as e}
            <div class="bar-row"><span>{e.type}</span><div class="track"><div class="fill purple" style="width:{(e.score / 6) * 100}%"></div></div><span>{Math.round(e.score)}</span></div>
          {/each}
        </div>
        <p class="hint">คะแนนที่ระบบคำนวณ: <strong>{calculatedEnneagram}</strong> ({ENNEAGRAM_INFO[calculatedEnneagram]?.label})</p>
      </div>

      <button class="btn-primary w-full" onclick={() => step = 'mbti_choose'} type="button">เลือก MBTI ที่คุณคิดว่าตรง →</button>
    </div>

  {:else if step === 'mbti_choose'}
    <!-- Pick MBTI -->
    <div class="card">
      <h1>🧠 เลือก MBTI ของคุณ</h1>
      <p class="desc">ระบบคำนวณได้ <strong>{calculatedMbti}</strong> — แต่คุณอาจจะรู้สึกตรงกับ type อื่นมากกว่า<br>เลือก type ที่คุณคิดว่าตรงกับตัวคุณที่สุด</p>
      <div class="grid-4">
        {#each TOTAL_MBTI as type}
          <button class="type-btn" class:active={chosenMbti === type} onclick={() => chooseMbti(type)} type="button">
            <span class="type-code">{type}</span>
            <span class="type-label-sm">{MBTI_INFO[type].label}</span>
          </button>
        {/each}
      </div>
    </div>

  {:else if step === 'enneagram_choose'}
    <!-- Pick Enneagram -->
    <div class="card">
      <h1>🎯 เลือก Enneagram ของคุณ</h1>
      <p class="desc">ระบบคำนวณได้ <strong>{calculatedEnneagram}</strong> — แต่คุณอาจจะรู้สึกตรงกับ type อื่นมากกว่า<br>เลือก type ที่คุณคิดว่าตรงกับตัวคุณที่สุด</p>
      <div class="grid-3">
        {#each TOTAL_ENNEAGRAM as num}
          <button class="type-btn purple" class:active={chosenEnneagram === num} onclick={() => chooseEnneagram(num)} type="button">
            <span class="type-code">{num}</span>
            <span class="type-label-sm">{ENNEAGRAM_INFO[num].label}</span>
          </button>
        {/each}
      </div>
      <button class="btn-text mt-2" onclick={() => step = 'mbti_choose'} type="button">← กลับไปเลือก MBTI</button>
    </div>

  {:else if step === 'compare'}
    <!-- Compare -->
    <div class="card">
      <h1>✅ สรุป</h1>

      <div class="compare-box">
        <div class="compare-item">
          <span class="cmp-label">ระบบคำนวณ</span>
          <div class="cmp-values">
            <span class="badge-blue">{calculatedMbti}</span>
            <span class="badge-purple">{calculatedEnneagram}</span>
          </div>
        </div>
        <div class="compare-arrow">↓</div>
        <div class="compare-item you">
          <span class="cmp-label">คุณเลือกเอง</span>
          <div class="cmp-values">
            <span class="badge-blue selected">{chosenMbti}</span>
            <span class="badge-purple selected">{chosenEnneagram}{chosenWing}</span>
          </div>
        </div>
      </div>

      {#if calculatedMbti !== chosenMbti || calculatedEnneagram !== chosenEnneagram}
        <div class="insight">
          <p>คุณเลือกต่างจากที่ระบบคำนวณ — ซึ่งเป็นเรื่องปกติ</p>
          <p class="text-xs text-slate-400 mt-1">ระบบวัด "พฤติกรรม" คุณวัด "ตัวตน" — ทั้งคู่เป็นจริงในคนๆ เดียว</p>
        </div>
      {:else}
        <div class="insight match">
          <p>คุณกับระบบเห็นตรงกัน — ยิ่งตอกย้ำว่า type นี้ตรงกับคุณจริงๆ</p>
        </div>
      {/if}

      <div class="flex gap-2 mt-4">
        <button class="btn-primary flex-1" onclick={saveResult} disabled={saving} type="button">
          {saving ? 'กำลังบันทึก...' : '💾 บันทึกผล'}
        </button>
        <button class="btn-outline" onclick={() => step = 'mbti_choose'} type="button">แก้ไข</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .page { max-width: 640px; margin: 0 auto; padding: 32px 16px; }
  .card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 28px; box-shadow: 0 2px 12px rgba(0,0,0,0.04); }
  .card h1 { font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0; text-align: center; }
  .desc { font-size: 14px; color: #64748b; text-align: center; margin: 0 0 20px 0; line-height: 1.6; }
  .hint { font-size: 12px; color: #94a3b8; text-align: center; margin: 12px 0 0 0; }
  .progress-bar { height: 4px; background: #e2e8f0; border-radius: 2px; margin-bottom: 4px; overflow: hidden; }
  .progress-fill { height: 100%; background: #3b82f6; border-radius: 2px; transition: width 0.3s; }
  .progress-text { font-size: 11px; color: #94a3b8; text-align: right; margin-bottom: 16px; }
  .scenario { font-size: 16px; font-weight: 500; color: #0f172a; margin: 0 0 16px 0; line-height: 1.6; padding: 12px 16px; background: #f8fafc; border-radius: 10px; }
  .choices { display: flex; flex-direction: column; gap: 8px; }
  .choice { width: 100%; text-align: left; padding: 14px 16px; border: 1px solid #e2e8f0; border-radius: 10px; background: white; cursor: pointer; font-size: 14px; color: #334155; line-height: 1.5; transition: 0.1s; }
  .choice:hover { border-color: #3b82f6; background: #f8faff; }
  .flex-between { display: flex; justify-content: space-between; }
  .btn-text { font-size: 13px; color: #64748b; background: none; border: none; cursor: pointer; padding: 4px 0; }
  .btn-text:hover { color: #0f172a; }
  .w-full { width: 100%; }
  .mt-1 { margin-top: 4px; }
  .mt-2 { margin-top: 8px; }
  .mt-4 { margin-top: 16px; }
  .gap-2 { gap: 8px; }
  .flex { display: flex; }

  /* Scores */
  .score-section { margin-bottom: 20px; }
  .score-section h2 { font-size: 14px; font-weight: 700; color: #0f172a; margin: 0 0 10px 0; }
  .bars { display: flex; flex-direction: column; gap: 6px; }
  .bar-row { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #64748b; }
  .bar-row span { width: 28px; text-align: right; }
  .bar-row span:first-child { text-align: left; }
  .track { flex: 1; height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; }
  .fill { height: 100%; background: #3b82f6; border-radius: 4px; min-width: 2px; }
  .fill.purple { background: #8b5cf6; }

  /* Grid */
  .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }

  .type-btn {
    padding: 12px 4px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: white;
    cursor: pointer;
    text-align: center;
    transition: 0.1s;
  }
  .type-btn:hover { border-color: #3b82f6; }
  .type-btn.active { border-color: #3b82f6; background: #eff6ff; box-shadow: 0 0 0 2px rgba(59,130,246,0.2); }
  .type-btn.purple.active { border-color: #8b5cf6; background: #f5f3ff; box-shadow: 0 0 0 2px rgba(139,92,246,0.2); }
  .type-code { display: block; font-size: 14px; font-weight: 700; color: #0f172a; }
  .type-label-sm { display: block; font-size: 9px; color: #94a3b8; margin-top: 2px; }

  /* Compare */
  .compare-box { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 20px; background: #f8fafc; border-radius: 12px; margin: 16px 0; }
  .compare-item { text-align: center; }
  .cmp-label { display: block; font-size: 11px; color: #94a3b8; font-weight: 600; margin-bottom: 6px; text-transform: uppercase; }
  .cmp-values { display: flex; gap: 8px; justify-content: center; }
  .compare-arrow { font-size: 20px; color: #94a3b8; }
  .badge-blue { font-size: 18px; font-weight: 800; color: #3b82f6; background: #eff6ff; padding: 4px 14px; border-radius: 8px; }
  .badge-purple { font-size: 18px; font-weight: 800; color: #8b5cf6; background: #f5f3ff; padding: 4px 14px; border-radius: 8px; }
  .badge-blue.selected { background: #3b82f6; color: white; }
  .badge-purple.selected { background: #8b5cf6; color: white; }

  .insight { padding: 12px 16px; background: #fef9c3; border-radius: 10px; font-size: 13px; color: #854d0e; text-align: center; }
  .insight.match { background: #dcfce7; color: #166534; }

  .type-row { display: flex; gap: 12px; justify-content: center; margin: 16px 0; }
  .type-badge { font-size: 24px; font-weight: 800; color: white; padding: 6px 18px; border-radius: 10px; }
  .type-badge.blue { background: #3b82f6; }
  .type-badge.purple { background: #8b5cf6; }

  .btn-primary { padding: 12px 20px; border-radius: 10px; border: none; background: #0f172a; color: white; font-size: 14px; font-weight: 600; cursor: pointer; display: block; }
  .btn-primary:hover { background: #1e293b; }
  .btn-primary:disabled { opacity: 0.4; cursor: not-allowed; }

  .btn-outline { padding: 12px 20px; border-radius: 10px; border: 1px solid #e2e8f0; background: white; color: #475569; font-size: 14px; cursor: pointer; display: block; }
  .btn-outline:hover { background: #f8fafc; }

  .btn-ghost { display: block; padding: 10px; border-radius: 10px; border: none; background: none; color: #64748b; font-size: 13px; cursor: pointer; text-align: center; margin-top: 4px; }
  .btn-ghost:hover { color: #0f172a; }
</style>
