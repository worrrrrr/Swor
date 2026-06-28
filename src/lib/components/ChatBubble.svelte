<script lang="ts">
  let { role, content, provider } = $props<{ role: 'user' | 'assistant'; content: string; provider?: string }>();
  let showInfo = $state(false);
</script>

<div class="flex gap-4 {role === 'user' ? 'justify-end' : 'justify-start'}">
  <div class="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all relative
    {role === 'user' 
      ? 'bg-indigo-600 text-white rounded-br-none' 
      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-bl-none border border-zinc-200 dark:border-zinc-600'}">
    
    <div class="flex items-center gap-2 mb-1">
      <span class="font-bold text-[10px] uppercase tracking-wider opacity-70
        {role === 'user' ? 'text-indigo-200' : 'text-zinc-500 dark:text-zinc-400'}">
        {role === 'user' ? 'คุณ' : 'ผู้ช่วย Astro'}
      </span>
      {#if provider && role === 'assistant'}
        <button 
          class="text-[9px] px-1.5 py-0.5 rounded font-mono opacity-40 hover:opacity-100 transition-opacity
          {provider === 'groq' ? 'bg-emerald-100 text-emerald-700' : provider === 'gemini' ? 'bg-blue-100 text-blue-700' : provider === 'deepseek' ? 'bg-yellow-100 text-yellow-700' : 'bg-zinc-200 text-zinc-600'}"
          onclick={() => showInfo = !showInfo}
          type="button"
          title="ดูรายละเอียด"
        >{provider}</button>
      {/if}
    </div>
    
    <p class="whitespace-pre-wrap">{content}</p>

    {#if showInfo && provider}
      <div class="mt-2 pt-2 border-t border-zinc-300/30 text-[10px] text-zinc-400 font-mono">
        <div>provider: {provider}</div>
        <div>model: {provider === 'groq' ? 'llama-3.3-70b' : provider === 'gemini' ? 'gemini-2.0-flash' : provider === 'deepseek' ? 'deepseek-chat' : 'ollama'}</div>
      </div>
    {/if}
  </div>
</div>
