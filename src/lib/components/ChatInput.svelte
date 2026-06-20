<script lang="ts">
  let { onSend } = $props<{ onSend: (text: string) => void }>();
  let text = $state('');

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    onSend(text);
    text = ''; // เคลียร์ข้อความหลังส่งออกไป
  }
</script>

<form onsubmit={handleSubmit} class="relative flex items-center bg-zinc-750 border border-zinc-700 rounded-xl overflow-hidden px-4 py-2">
  <input 
    type="text" 
    bind:value={text} 
    placeholder="พิมพ์คำถามหรือข้อมูลวันเกิดของคุณที่นี่..." 
    class="flex-1 bg-transparent text-sm focus:outline-none py-2 text-zinc-100"
  />
  <button 
    type="submit" 
    disabled={!text.trim()} 
    class="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs px-4 py-2 rounded-lg font-medium transition"
  >
    ส่ง
  </button>
</form>