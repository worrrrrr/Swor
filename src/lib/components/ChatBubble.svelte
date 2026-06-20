<script lang="ts">
  // Svelte 5: กำหนด Type และรับ Props ผ่าน $props Rune อย่างชัดเจน
  let { role, content } = $props<{ role: 'user' | 'assistant'; content: string }>();
</script>

<div class="flex gap-4 {role === 'user' ? 'justify-end' : 'justify-start'}">
  <div class="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm transition-all
    {role === 'user' 
      ? 'bg-indigo-600 text-white rounded-br-none' 
      : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-100 rounded-bl-none border border-zinc-200 dark:border-zinc-600'}">
    
    <div class="font-bold text-[10px] uppercase tracking-wider mb-1 opacity-70
      {role === 'user' ? 'text-indigo-200' : 'text-zinc-500 dark:text-zinc-400'}">
      {role === 'user' ? 'คุณ' : 'ผู้ช่วย Astro'}
    </div>
    
    <p class="whitespace-pre-wrap">{content}</p>
  </div>
</div>