<script lang="ts">
  let { role, content } = $props<{ role: string; content: string }>();
</script>

<div class="flex gap-4 {role === 'user' ? 'justify-end' : 'justify-start'}">
  <div class="max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed 
    {role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-zinc-700 text-zinc-100 rounded-bl-none'}">
    
    <div class="font-bold text-xs mb-1 text-zinc-300">
      {role === 'user' ? 'คุณ' : 'ผู้ช่วย Astro'}
    </div>
    
    <p>{content}</p>
  </div>
</div>