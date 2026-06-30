<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { chatStore } from '$lib/chatStore.svelte';
  import { BUILTIN_STYLES } from '$lib/promptStyles';

  let userPrompts = $state<any[]>([]);
  let showAllPrompts = $state(false);

  onMount(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers: Record<string, string> = {};
    if (session?.access_token) headers['Authorization'] = `Bearer ${session.access_token}`;
    const res = await fetch('/api/prompts', { headers });
    if (res.ok) userPrompts = await res.json();
  });

  function selectStyle(styleId: string) {
    if (styleId === 'default') {
      chatStore.setStyle('default');
    } else {
      chatStore.setStyle(styleId);
    }
    showAllPrompts = false;
  }

  function selectUserPrompt(p: any) {
    chatStore.setStyle(p.id, { id: p.id, title: p.title, content: p.content });
    showAllPrompts = false;
  }
</script>

<div class="prompt-bar">
  <div class="styles-row">
    {#each BUILTIN_STYLES as style}
      <button
        class="style-btn"
        class:active={chatStore.activeStyleId === style.id}
        onclick={() => selectStyle(style.id)}
        type="button"
      >
        <span class="style-icon">{style.icon}</span>
        <span class="style-label">{style.label}</span>
      </button>
    {/each}

    {#if userPrompts.length > 0}
      <div class="style-sep"></div>
      {#each userPrompts.slice(0, showAllPrompts ? undefined : 2) as p}
        <button
          class="style-btn style-custom"
          class:active={chatStore.activePrompt?.id === p.id}
          onclick={() => selectUserPrompt(p)}
          type="button"
        >
          <span class="style-icon">⚡</span>
          <span class="style-label">{p.title}</span>
        </button>
      {/each}
      {#if userPrompts.length > 2}
        <button class="style-btn style-more" onclick={() => showAllPrompts = !showAllPrompts} type="button">
          <span>{showAllPrompts ? '▲' : `+${userPrompts.length - 2}`}</span>
        </button>
      {/if}
    {/if}
  </div>
</div>

<style>
  .prompt-bar {
    padding: 4px 0 8px;
    overflow-x: auto;
  }

  .styles-row {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-wrap: wrap;
  }

  .style-btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 5px 12px;
    border-radius: 20px;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .style-btn:hover {
    border-color: #94a3b8;
    background: #f8fafc;
    color: #334155;
  }
  .style-btn.active {
    border-color: transparent;
    color: white;
    font-weight: 600;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  }
  .style-btn.active:nth-child(1) { background: linear-gradient(135deg, #64748b, #94a3b8); }
  .style-btn.active:nth-child(2) { background: linear-gradient(135deg, #3b82f6, #60a5fa); }
  .style-btn.active:nth-child(3) { background: linear-gradient(135deg, #10b981, #34d399); }
  .style-btn.active:nth-child(4) { background: linear-gradient(135deg, #8b5cf6, #a78bfa); }
  .style-btn.active:nth-child(5) { background: linear-gradient(135deg, #f59e0b, #fbbf24); }

  .style-custom.active {
    background: linear-gradient(135deg, #f43f5e, #fb7185) !important;
  }

  .style-sep {
    width: 1px;
    height: 20px;
    background: #e2e8f0;
    flex-shrink: 0;
  }

  .style-more {
    font-size: 11px;
    color: #94a3b8;
    padding: 5px 10px;
  }

  .style-icon { font-size: 13px; }
  .style-label { font-size: 11px; }
</style>
