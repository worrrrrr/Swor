<script lang="ts">
  import { marked } from 'marked';

  let { role, content, provider } = $props<{
    role: 'user' | 'assistant';
    content: string;
    provider?: string;
  }>();

  let showProvider = $state(false);
  let html = $derived(role === 'assistant' && content ? marked.parse(content, { breaks: true, gfm: true }) : '');
</script>

<div class="bubble-wrapper" class:user={role === 'user'} class:ai={role === 'assistant'}>
  {#if role === 'assistant'}
    <div class="avatar">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-indigo-500">
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
      </svg>
    </div>
  {/if}

  <div class="bubble">
    {#if role === 'assistant'}
      <div class="bubble-label">
        <span>Oracle</span>
        {#if provider}
          <button class="provider-tag" onclick={() => showProvider = !showProvider} type="button">
            {provider}
          </button>
        {/if}
      </div>
    {/if}

    {#if role === 'assistant' && html}
      <div class="chat-md">
        {@html html}
      </div>
    {:else if role === 'assistant'}
      <p class="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">{content}</p>
    {:else}
      <p class="text-sm text-white leading-relaxed whitespace-pre-wrap">{content}</p>
    {/if}
  </div>
</div>

<style>
  .bubble-wrapper {
    display: flex;
    gap: 10px;
    max-width: 85%;
    animation: fadeIn 0.2s ease-out;
  }
  .bubble-wrapper.user {
    align-self: flex-end;
    flex-direction: row-reverse;
  }
  .bubble-wrapper.ai {
    align-self: flex-start;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .avatar {
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    background: rgba(99, 102, 241, 0.1);
    flex-shrink: 0;
    margin-top: 2px;
  }

  .bubble-label {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 6px;
  }
  .bubble-label span {
    font-size: 12px;
    font-weight: 600;
    color: #0f172a;
  }

  .provider-tag {
    font-size: 9px;
    font-weight: 600;
    font-family: monospace;
    padding: 1px 7px;
    border-radius: 4px;
    border: none;
    background: #f1f5f9;
    color: #64748b;
    cursor: pointer;
    transition: 0.1s;
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }
  .provider-tag:hover {
    background: #e2e8f0;
    color: #0f172a;
  }

  .bubble {
    padding: 12px 16px;
    border-radius: 14px;
    line-height: 1.5;
    min-width: 60px;
    position: relative;
  }
  .bubble-wrapper.user .bubble {
    background: #0f172a;
    color: white;
    border-bottom-right-radius: 4px;
  }
  .bubble-wrapper.ai .bubble {
    background: white;
    color: #334155;
    border: 1px solid #e2e8f0;
    border-bottom-left-radius: 4px;
    box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  }

  .chat-md {
    font-size: 14px;
    line-height: 1.7;
  }
  .chat-md :global(p) { margin: 0 0 8px 0; }
  .chat-md :global(h1),
  .chat-md :global(h2),
  .chat-md :global(h3),
  .chat-md :global(h4) {
    font-weight: 600;
    color: #0f172a;
    margin: 16px 0 8px 0;
    line-height: 1.3;
  }
  .chat-md :global(h1) { font-size: 18px; }
  .chat-md :global(h2) { font-size: 16px; }
  .chat-md :global(h3) { font-size: 14px; }
  .chat-md :global(strong) { color: #0f172a; font-weight: 600; }
  .chat-md :global(em) { font-style: italic; }
  .chat-md :global(code) {
    background: #f1f5f9;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    color: #e11d48;
    font-family: ui-monospace, monospace;
  }
  .chat-md :global(pre) {
    background: #0f172a;
    color: #e2e8f0;
    padding: 14px;
    border-radius: 10px;
    overflow-x: auto;
    margin: 10px 0;
  }
  .chat-md :global(pre code) {
    background: none;
    padding: 0;
    color: inherit;
    font-size: 13px;
  }
  .chat-md :global(a) { color: #2563eb; text-decoration: none; }
  .chat-md :global(a:hover) { text-decoration: underline; }
  .chat-md :global(ul),
  .chat-md :global(ol) { margin: 6px 0; padding-left: 20px; }
  .chat-md :global(li) { margin: 2px 0; }
  .chat-md :global(blockquote) {
    border-left: 3px solid #d1d5db;
    padding-left: 12px;
    color: #64748b;
    font-style: italic;
    margin: 8px 0;
  }
  .chat-md :global(hr) { border: none; border-top: 1px solid #e2e8f0; margin: 16px 0; }
  .chat-md :global(table) {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
  }
  .chat-md :global(th),
  .chat-md :global(td) {
    border: 1px solid #d1d5db;
    padding: 6px 10px;
    text-align: left;
    font-size: 13px;
  }
  .chat-md :global(th) {
    background: #f8fafc;
    font-weight: 600;
    color: #0f172a;
  }
  .chat-md :global(tr:nth-child(even)) { background: #fafbfc; }
</style>
