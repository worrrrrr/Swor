<script lang="ts">
  import { chatStore } from '$lib/chatStore.svelte';
  import { filterSuggestions } from '$lib/suggestions';
  import { matchPath, findNode, TREE, type SlashNode } from '$lib/slashCommands';
  import Icon from './Icon.svelte';

  let text = $state('');
  let textareaRef: HTMLTextAreaElement | undefined = $state();
  let showSuggestions = $state(false);
  let selectedIdx = $state(-1);

  // Slash command state
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
    textareaRef.style.height = Math.min(textareaRef.scrollHeight, 140) + 'px';
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
      // ไป deeper
      const newPath = [...slashPath, node.key];
      const result = findNode(newPath);
      slashPath = newPath;
      slashPartial = '';
      slashNodes = result.children;
      slashNode = result.node;
      text = '/' + newPath.join('/') + '/';
      selectedIdx = -1;
      autoResize();
    } else if (node.prompt === '__CLEAR__') {
      chatStore.clearSession();
      text = '';
      showSlash = false;
      autoResize();
    } else if (node.prompt) {
      text = node.prompt + ' ';
      showSlash = false;
      autoResize();
      textareaRef?.focus();
    }
  }

  function goBackSlash() {
    if (slashPath.length === 0) {
      showSlash = false;
      text = '';
      return;
    }
    const newPath = slashPath.slice(0, -1);
    const result = findNode(newPath);
    slashPath = newPath;
    slashPartial = '';
    slashNodes = result.children;
    slashNode = result.node;
    text = newPath.length > 0 ? '/' + newPath.join('/') + '/' : '/';
    selectedIdx = -1;
    autoResize();
  }

  function selectSuggestion(s: string) {
    text = s;
    showSuggestions = false;
    selectedIdx = -1;
    autoResize();
    textareaRef?.focus();
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || chatStore.isProcessing) return;
    text = '';
    showSuggestions = false;
    showSlash = false;
    selectedIdx = -1;
    autoResize();
    chatStore.sendMessage(trimmed);
  }

  function handleKeydown(e: KeyboardEvent) {
    // Slash command navigation
    if (showSlash && filteredSlashNodes.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIdx = Math.min(selectedIdx + 1, filteredSlashNodes.length - 1);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (selectedIdx <= 0 && slashPath.length > 0) {
          goBackSlash();
          return;
        }
        selectedIdx = Math.max(selectedIdx - 1, 0);
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && selectedIdx >= 0)) {
        e.preventDefault();
        if (selectedIdx >= 0 && selectedIdx < filteredSlashNodes.length) {
          selectSlashNode(filteredSlashNodes[selectedIdx]);
        }
        return;
      }
      if (e.key === 'Backspace' && text.endsWith('/') && slashPath.length > 0) {
        e.preventDefault();
        goBackSlash();
        return;
      }
    }

    // Regular suggestion navigation
    if (!showSlash && showSuggestions && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIdx = Math.min(selectedIdx + 1, suggestions.length - 1);
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIdx = Math.max(selectedIdx - 1, 0);
        return;
      }
      if (e.key === 'Tab' || (e.key === 'Enter' && selectedIdx >= 0)) {
        e.preventDefault();
        if (selectedIdx >= 0 && selectedIdx < suggestions.length) {
          selectSuggestion(suggestions[selectedIdx]);
        }
        return;
      }
    }

    if (e.key === 'Escape') {
      showSuggestions = false;
      showSlash = false;
      selectedIdx = -1;
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleInput() {
    autoResize();
    if (text.startsWith('/')) {
      updateSlash();
      showSuggestions = false;
    } else {
      showSlash = false;
      showSuggestions = suggestions.length > 0;
      selectedIdx = -1;
    }
  }

  function handleAttach() {
    console.log('[ChatInput] แนบไฟล์');
  }

  function handleSearch() {
    console.log('[ChatInput] ค้นหา');
  }

  function handleBlur() {
    setTimeout(() => {
      showSuggestions = false;
      showSlash = false;
      selectedIdx = -1;
    }, 200);
  }
</script>

<div class="chat-input-wrapper">
  <div class="input-with-suggestions">
    {#if text.startsWith('/') && showSlash}
      <div class="slash-dropdown">
        <div class="slash-breadcrumb">
          {#each slashPath as p, i}
            <span class="crumb-item">{p}</span>
            {#if i < slashPath.length - 1}<span class="crumb-sep">/</span>{/if}
          {/each}
          {#if slashNode}
            <span class="crumb-sep">/</span>
            <span class="crumb-current">{slashNode.label}</span>
          {/if}
        </div>
        <div class="slash-list">
          {#each filteredSlashNodes as node, i}
            <button
              class="slash-item"
              class:selected={i === selectedIdx}
              onmousedown={() => selectSlashNode(node)}
              type="button"
            >
              <span class="slash-icon">{node.icon || '>'}</span>
              <div class="slash-info">
                <span class="slash-label">{node.label}</span>
                {#if node.children}<span class="slash-arrow">→ มีตัวเลือกย่อย</span>{/if}
              </div>
            </button>
          {/each}
          {#if filteredSlashNodes.length === 0}
            <div class="slash-empty">ไม่มีคำสั่งนี้</div>
          {/if}
        </div>
      </div>
    {:else if showSuggestions && suggestions.length > 0}
      <div class="suggestions-dropdown">
        {#each suggestions as s, i}
          <button
            class="suggestion-item"
            class:selected={i === selectedIdx}
            onmousedown={() => selectSuggestion(s)}
            type="button"
          >
            <Icon name="search" size={12} />
            <span>{s}</span>
          </button>
        {/each}
      </div>
    {/if}
    <textarea
      bind:this={textareaRef}
      bind:value={text}
      oninput={handleInput}
      onkeydown={handleKeydown}
      onblur={handleBlur}
      placeholder="พิมพ์ / เพื่อดูคำสั่ง หรือถาม Oracle ได้เลย..."
      rows="1"
      disabled={chatStore.isProcessing}
      class="chat-textarea"
    />
  </div>

  <div class="input-actions">
    <button class="icon-btn" onclick={handleAttach} type="button" aria-label="แนบไฟล์">
      <Icon name="plus-circle" size={20} />
    </button>
    <button class="icon-btn" onclick={handleSearch} type="button" aria-label="ค้นหา">
      <Icon name="search" size={20} />
    </button>
    <button 
      class="btn-send" 
      onclick={handleSend} 
      disabled={!text.trim() || chatStore.isProcessing}
      type="button"
    >
      {#if chatStore.isProcessing}
        <span class="spinner" />
      {:else}
        <Icon name="send" size={18} />
        ส่ง
      {/if}
    </button>
  </div>
</div>

<style>
  .chat-input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    background: #1a232f;
    border-radius: 24px;
    padding: 10px 16px 10px 22px;
    border: 1px solid #2f3b4b;
    transition: 0.2s;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    position: relative;
  }

  .chat-input-wrapper:focus-within {
    border-color: #5a7dff;
    box-shadow: 0 0 0 3px rgba(90, 125, 255, 0.2);
  }

  .input-with-suggestions {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
  }

  /* Slash dropdown */
  .slash-dropdown {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    margin-bottom: 6px;
    background: #1e293b;
    border: 1px solid #2f3b4b;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
    z-index: 50;
  }

  .slash-breadcrumb {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 14px;
    background: #0f172a;
    border-bottom: 1px solid #2f3b4b;
    font-size: 11px;
    flex-wrap: wrap;
  }

  .crumb-item {
    color: #5a7dff;
    font-weight: 600;
  }

  .crumb-sep {
    color: #475569;
  }

  .crumb-current {
    color: #e9f0f8;
    font-weight: 600;
  }

  .slash-list {
    max-height: 240px;
    overflow-y: auto;
  }

  .slash-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    text-align: left;
    padding: 10px 14px;
    border: none;
    background: transparent;
    color: #cbd5e1;
    font-size: 13px;
    cursor: pointer;
    transition: 0.1s;
    border-bottom: 1px solid #1a232f;
  }

  .slash-item:last-child { border-bottom: none; }

  .slash-item:hover,
  .slash-item.selected {
    background: #2a3648;
    color: #e9f0f8;
  }

  .slash-icon {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #2a3648;
    border-radius: 6px;
    flex-shrink: 0;
  }

  .slash-info {
    flex: 1;
    min-width: 0;
  }

  .slash-label {
    display: block;
    font-weight: 500;
  }

  .slash-arrow {
    display: block;
    font-size: 10px;
    color: #60738b;
    margin-top: 1px;
  }

  .slash-empty {
    padding: 16px;
    text-align: center;
    color: #60738b;
    font-size: 12px;
  }

  /* Suggestions dropdown */
  .suggestions-dropdown {
    position: absolute;
    bottom: 100%;
    left: 0;
    right: 0;
    margin-bottom: 6px;
    background: #1e293b;
    border: 1px solid #2f3b4b;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.4);
    z-index: 50;
  }

  .suggestion-item {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    text-align: left;
    padding: 8px 14px;
    border: none;
    background: transparent;
    color: #cbd5e1;
    font-size: 13px;
    cursor: pointer;
    transition: 0.1s;
  }

  .suggestion-item:hover,
  .suggestion-item.selected {
    background: #2a3648;
    color: #e9f0f8;
  }

  .suggestion-item :global(svg) {
    color: #5a7dff;
    flex-shrink: 0;
  }

  .chat-textarea {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: #e9f0f8;
    font-size: 15px;
    resize: none;
    padding: 6px 0;
    line-height: 1.6;
    min-height: 28px;
    max-height: 140px;
    font-weight: 400;
    letter-spacing: 0.2px;
    font-family: inherit;
  }

  .chat-textarea::placeholder {
    color: #60738b;
    font-weight: 350;
  }

  .chat-textarea:disabled {
    opacity: 0.5;
  }

  .input-actions {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: #7e93ad;
    padding: 6px;
    border-radius: 30px;
    cursor: pointer;
    transition: 0.15s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
  }

  .icon-btn:hover {
    background: #2a3648;
    color: #d3e2f5;
  }

  .btn-send {
    background: #3a5bdd;
    border: none;
    border-radius: 40px;
    padding: 8px 22px;
    color: white;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: 0.15s;
    box-shadow: 0 2px 10px rgba(58, 91, 221, 0.3);
    letter-spacing: 0.3px;
    white-space: nowrap;
  }

  .btn-send:hover:not(:disabled) {
    background: #4b6df5;
    transform: scale(1.01);
    box-shadow: 0 6px 18px rgba(58, 91, 221, 0.4);
  }

  .btn-send:active:not(:disabled) {
    transform: scale(0.96);
  }

  .btn-send:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .spinner {
    display: inline-block;
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  @media (max-width: 640px) {
    .chat-input-wrapper {
      flex-wrap: wrap;
      padding: 12px 14px;
    }

    .input-actions {
      width: 100%;
      justify-content: flex-end;
    }

    .btn-send {
      padding: 6px 16px;
      font-size: 13px;
    }
  }
</style>
