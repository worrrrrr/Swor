<script lang="ts">
  import { onMount } from 'svelte';
  import { chatStore } from '$lib/chatStore.svelte';
  import { filterSuggestions } from '$lib/suggestions';
  import { matchPath, findNode, TREE, type SlashNode } from '$lib/slashCommands';
  import Icon from './Icon.svelte';

  let text = $state('');
  let textareaRef: HTMLTextAreaElement | undefined = $state();
  let showSuggestions = $state(false);
  let selectedIdx = $state(-1);
  let isListening = $state(false);

  let slashPath = $state<string[]>([]);
  let slashPartial = $state('');
  let showSlash = $state(false);
  let slashNodes = $state<SlashNode[]>(TREE);
  let slashNode = $state<SlashNode | undefined>();

  let suggestions = $derived.by(() => {
    if (!text.trim() || chatStore.isProcessing || text.startsWith('/')) return [];
    return filterSuggestions(text);
  });

  let filteredSlashNodes = $derived.by(() => {
    if (!slashPartial) return slashNodes;
    const q = slashPartial.toLowerCase();
    return slashNodes.filter(n => n.key.includes(q) || n.label.toLowerCase().includes(q));
  });

  function autoResize() {
    if (!textareaRef) return;
    textareaRef.style.height = 'auto';
    textareaRef.style.height = Math.min(textareaRef.scrollHeight, 120) + 'px';
  }

  function updateSlash() {
    const parsed = matchPath(text);
    if (parsed.path.length > 0 || parsed.partial !== '' || text === '/') {
      const result = findNode(parsed.path);
      slashPath = parsed.path;
      slashPartial = parsed.partial;
      slashNodes = result.children;
      slashNode = result.node;
      showSlash = result.children.length > 0 || !!result.node?.children;
      selectedIdx = -1;
    } else {
      showSlash = false;
    }
  }

  function selectSlashNode(node: SlashNode) {
    if (node.children && node.children.length > 0) {
      const newPath = [...slashPath, node.key];
      const result = findNode(newPath);
      slashPath = newPath; slashPartial = ''; slashNodes = result.children; slashNode = result.node;
      text = '/' + newPath.join('/') + '/'; selectedIdx = -1; autoResize();
    } else if (node.prompt === '__CLEAR__') {
      chatStore.clearSession(); text = ''; showSlash = false; autoResize();
    } else if (node.systemPrompt || node.prompt) {
      if (node.systemPrompt) chatStore.setActivePrompt({ id: (node as any)._id || node.key, title: node.label, content: node.systemPrompt });
      text = node.prompt && node.prompt !== node.systemPrompt ? node.prompt + ' ' : '';
      showSlash = false; autoResize(); textareaRef?.focus();
    }
  }

  function goBackSlash() {
    if (slashPath.length === 0) { showSlash = false; text = ''; return; }
    const newPath = slashPath.slice(0, -1);
    const result = findNode(newPath);
    slashPath = newPath; slashPartial = ''; slashNodes = result.children; slashNode = result.node;
    text = '/' + newPath.join('/') + '/'; selectedIdx = -1; autoResize();
  }

  function selectSuggestion(s: string) {
    text = s; showSuggestions = false; selectedIdx = -1; autoResize(); textareaRef?.focus();
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || chatStore.isProcessing) return;
    text = ''; showSuggestions = false; showSlash = false; selectedIdx = -1; autoResize();
    chatStore.sendMessage(trimmed);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (showSlash && filteredSlashNodes.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = Math.min(selectedIdx + 1, filteredSlashNodes.length - 1); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); if (selectedIdx <= 0 && slashPath.length > 0) { goBackSlash(); return; } selectedIdx = Math.max(selectedIdx - 1, 0); return; }
      if (e.key === 'Tab' || (e.key === 'Enter' && selectedIdx >= 0)) { e.preventDefault(); if (selectedIdx >= 0) selectSlashNode(filteredSlashNodes[selectedIdx]); return; }
      if (e.key === 'Backspace' && text.endsWith('/') && slashPath.length > 0) { e.preventDefault(); goBackSlash(); return; }
    }
    if (!showSlash && showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') { e.preventDefault(); selectedIdx = Math.min(selectedIdx + 1, suggestions.length - 1); return; }
      if (e.key === 'ArrowUp') { e.preventDefault(); selectedIdx = Math.max(selectedIdx - 1, 0); return; }
      if (e.key === 'Tab' || (e.key === 'Enter' && selectedIdx >= 0)) { e.preventDefault(); if (selectedIdx >= 0) selectSuggestion(suggestions[selectedIdx]); return; }
    }
    if (e.key === 'Escape') { showSuggestions = false; showSlash = false; selectedIdx = -1; return; }
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  }

  function handleInput() {
    autoResize();
    if (text.startsWith('/')) { updateSlash(); showSuggestions = false; }
    else { showSlash = false; showSuggestions = suggestions.length > 0; selectedIdx = -1; }
  }

  function clearPrompt() { chatStore.setActivePrompt(null); }

  let recognition: any = null;
  function toggleVoice() {
    if (isListening) { recognition?.stop(); isListening = false; return; }
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { alert('เบราว์เซอร์นี้ไม่รองรับ Voice Input'); return; }
    recognition = new SpeechRecognition();
    recognition.lang = 'th-TH';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event: any) => {
      text = Array.from(event.results).map((r: any) => r[0].transcript).join('');
      autoResize();
    };
    recognition.onend = () => { isListening = false; };
    recognition.onerror = () => { isListening = false; };
    recognition.start();
    isListening = true;
  }
</script>

<div class="chat-input-wrapper">
  {#if chatStore.activePrompt}
    <div class="prompt-badge">
      <span class="prompt-dot">⚡</span>
      <span class="prompt-name">{chatStore.activePrompt.title}</span>
      <button class="prompt-x" onclick={clearPrompt} type="button">×</button>
    </div>
  {/if}

  <div class="input-area">
    {#if text.startsWith('/') && showSlash}
      <div class="slash-dropdown">
        <div class="slash-crumb">
          {#each slashPath as p, i}
            <span class="crumb-part">/ {p}</span>
            {#if i < slashPath.length - 1}<span class="crumb-sep">/</span>{/if}
          {/each}
          {#if slashNode}<span class="crumb-sep">/</span><span class="crumb-cur">{slashNode.label}</span>{/if}
        </div>
        <div class="slash-body">
          {#each filteredSlashNodes as node, i}
            <button class="slash-row" class:sel={i === selectedIdx} onmousedown={() => selectSlashNode(node)} type="button">
              <span class="slash-ico">{node.icon || '>'}</span>
              <span class="slash-txt">{node.label}</span>
              {#if node.children?.length}<span class="slash-sub">→</span>{/if}
              {#if node.systemPrompt}<span class="slash-tag">Prompt</span>{/if}
            </button>
          {/each}
          {#if filteredSlashNodes.length === 0}
            <div class="slash-none">ไม่มีคำสั่งนี้</div>
          {/if}
        </div>
      </div>
    {:else if showSuggestions && suggestions.length > 0}
      <div class="suggest-box">
        <div class="suggest-head">ถามต่อเนื่อง</div>
        {#each suggestions as s, i}
          <button class="suggest-row" class:sel={i === selectedIdx} onmousedown={() => selectSuggestion(s)} type="button">
            <span class="suggest-arr">→</span>
            <span>{s}</span>
          </button>
        {/each}
      </div>
    {/if}

    <div class="input-bar">
      <button class="bar-btn voice-btn" class:active={isListening} onclick={toggleVoice} type="button" title="พูด">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>
        </svg>
      </button>

      <textarea
        bind:this={textareaRef}
        bind:value={text}
        oninput={handleInput}
        onkeydown={handleKeydown}
        placeholder="Ask anything... (/ for skills)"
        rows="1"
        disabled={chatStore.isProcessing}
        class="input-field"
      />

      <button class="bar-btn cmd-btn" onclick={() => { text = '/'; autoResize(); textareaRef?.focus(); }} type="button" title="คำสั่ง">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/>
        </svg>
      </button>

      <button class="send-btn" onclick={handleSend} disabled={!text.trim() || chatStore.isProcessing} type="button">
        {#if chatStore.isProcessing}
          <span class="spinner"></span>
        {:else}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        {/if}
      </button>
    </div>
  </div>
</div>

<style>
  .chat-input-wrapper {
    width: 100%;
  }

  .prompt-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px 3px 8px;
    margin-bottom: 6px;
    border-radius: 20px;
    background: #f0f4ff;
    border: 1px solid #c7d2fe;
    font-size: 11px;
    color: #4338ca;
  }
  .prompt-dot { font-size: 10px; }
  .prompt-name { font-weight: 600; }
  .prompt-x { background: none; border: none; color: #a5b4fc; cursor: pointer; font-size: 14px; padding: 0 2px; line-height: 1; }
  .prompt-x:hover { color: #ef4444; }

  .input-area {
    position: relative;
  }

  .input-bar {
    display: flex;
    align-items: flex-end;
    gap: 4px;
    background: #f8fafc;
    border-radius: 16px;
    padding: 7px 7px 7px 11px;
    transition: all 0.2s;
    box-shadow: 0 0 0 0 transparent;
  }
  .input-bar:focus-within {
    background: white;
    box-shadow: 0 0 0 1px #e2e8f0, 0 4px 16px rgba(0,0,0,0.06);
    padding: 6px 6px 6px 10px;
  }

  .bar-btn {
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 10px; border: none; background: transparent;
    color: #94a3b8; cursor: pointer; transition: 0.15s; flex-shrink: 0;
  }
  .bar-btn:hover { background: #f1f5f9; color: #475569; }
  .voice-btn.active { background: #fef2f2; color: #ef4444; animation: pulse 1s infinite; }
  @keyframes pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.3); }
    50% { box-shadow: 0 0 0 8px rgba(239, 68, 68, 0); }
  }

  .input-field {
    flex: 1;
    background: transparent; border: none; outline: none;
    color: #0f172a; font-size: 14px; resize: none;
    padding: 6px 0; line-height: 1.5; min-height: 24px; max-height: 120px;
    font-family: inherit;
  }
  .input-field::placeholder { color: #cbd5e1; }
  .input-field:disabled { opacity: 0.5; }

  .send-btn {
    width: 34px; height: 34px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 10px; border: none; background: #0f172a;
    color: white; cursor: pointer; transition: 0.15s; flex-shrink: 0;
  }
  .send-btn:hover:not(:disabled) { background: #1e293b; transform: scale(1.05); }
  .send-btn:active:not(:disabled) { transform: scale(0.95); }
  .send-btn:disabled { opacity: 0.3; cursor: not-allowed; }

  .spinner {
    display: inline-block; width: 16px; height: 16px;
    border: 2px solid rgba(255,255,255,0.3); border-top-color: white;
    border-radius: 50%; animation: spin 0.6s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── Slash ── */
  .slash-dropdown {
    position: absolute; bottom: 100%; left: 0; right: 0; margin-bottom: 6px;
    background: white; border: 1px solid #e2e8f0; border-radius: 12px;
    overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); z-index: 50;
  }
  .slash-crumb {
    display: flex; align-items: center; gap: 4px; padding: 8px 14px;
    background: #f8fafc; border-bottom: 1px solid #e2e8f0; font-size: 11px; flex-wrap: wrap;
  }
  .crumb-part { color: #6366f1; font-weight: 600; }
  .crumb-sep { color: #cbd5e1; }
  .crumb-cur { color: #0f172a; font-weight: 600; }
  .slash-body { max-height: 240px; overflow-y: auto; }
  .slash-row {
    display: flex; align-items: center; gap: 8px;
    width: 100%; text-align: left; padding: 9px 14px;
    border: none; background: transparent; color: #334155;
    font-size: 13px; cursor: pointer; transition: 0.1s;
    border-bottom: 1px solid #f1f5f9;
  }
  .slash-row:last-child { border-bottom: none; }
  .slash-row:hover, .slash-row.sel { background: #f1f5f9; }
  .slash-ico { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: #f1f5f9; border-radius: 6px; flex-shrink: 0; font-size: 12px; }
  .slash-txt { flex: 1; font-weight: 500; }
  .slash-sub { color: #94a3b8; font-size: 12px; }
  .slash-tag { font-size: 8px; background: #eef2ff; color: #4338ca; padding: 1px 6px; border-radius: 4px; font-weight: 600; }
  .slash-none { padding: 16px; text-align: center; color: #94a3b8; font-size: 12px; }

  /* ── Suggestions ── */
  .suggest-box {
    position: absolute; bottom: 100%; left: 0; right: 0; margin-bottom: 6px;
    background: white; border: 1px solid #e2e8f0; border-radius: 12px;
    overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); z-index: 50;
  }
  .suggest-head {
    padding: 8px 14px 4px; font-size: 9px; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.08em;
    color: #6366f1; opacity: 0.6;
  }
  .suggest-row {
    display: flex; align-items: flex-start; gap: 10px;
    width: 100%; text-align: left; padding: 9px 14px;
    border: none; background: transparent; color: #334155;
    font-size: 13px; line-height: 1.4; cursor: pointer; transition: 0.1s;
    border-bottom: 1px solid #f1f5f9;
  }
  .suggest-row:last-child { border-bottom: none; }
  .suggest-row:hover, .suggest-row.sel { background: #f1f5f9; }
  .suggest-arr { color: #6366f1; flex-shrink: 0; font-size: 12px; margin-top: 2px; }
</style>
