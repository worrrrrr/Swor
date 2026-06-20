<script lang="ts">
  // Svelte 5: รับค่า Callback ฟังก์ชันส่งข้อมูลจาก Parent Component
  let { onSend } = $props<{ onSend: (text: string) => void }>();
  let text = $state('');

  function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    const trimmedText = text.trim();
    if (!trimmedText) return;
    
    onSend(trimmedText);
    text = ''; // ล้างช่องข้อมูลหลังจากส่งคำถามสำเร็จ
  }
</script>

<form 
  onsubmit={handleSubmit} 
  class="relative flex items-center bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden px-3 py-1.5 shadow-sm focus-within:border-indigo-500 dark:focus-within:border-indigo-400 transition-all"
>
  <input 
    type="text" 
    bind:value={text} 
    placeholder="พิมพ์คำถามหรือข้อมูลวันเกิดของคุณที่นี่..." 
    class="flex-1 bg-transparent text-sm focus:outline-none py-2 text-zinc-800 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500"
  />
  <button 
    type="submit" 
    disabled={!text.trim()} 
    class="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 disabled:cursor-not-allowed text-white text-xs px-4 py-2 rounded-lg font-medium transition-all shadow-sm"
  >
    ส่ง
  </button>
</form>