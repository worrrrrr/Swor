<script lang="ts">
  let { isOpen = $bindable(true) } = $props<{ isOpen?: boolean }>();

  let sources = $state([
    { id: '1', name: 'ข้อมูลผูกดวงชะตา.pdf', type: 'pdf' },
    { id: '2', name: 'ลิงก์บันทึกโหราศาสตร์.link', type: 'link' }
  ]);

  function handleAddSource() {
    const name = prompt('กรอกชื่อแหล่งข้อมูล หรือ URL:');
    if (!name) return;
    const type = name.includes('http') || name.includes('.link') ? 'link' : 'pdf';
    sources = [...sources, { id: crypto.randomUUID(), name, type }];
  }
</script>

{#if isOpen}
  <div class="w-full h-full flex flex-col p-4 box-border">
    <div class="flex items-center justify-between mb-4 flex-shrink-0 h-9">
      <span class="font-bold text-zinc-800 text-sm tracking-tight flex items-center gap-2">
        <button 
          onclick={() => isOpen = false}
          class="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-50 transition cursor-pointer flex items-center justify-center bg-white shadow-sm active:scale-95 focus:outline-none"
          title="ซ่อนคลังข้อมูล"
        >
          <img src="/src/lib/icons/icon-library.svg" alt="Library Close" class="w-4 h-4 text-amber-500" />
        </button>
        คลังข้อมูลชะตา
      </span>
    </div>

    <button 
      onclick={handleAddSource}
      class="border border-dashed border-zinc-200 bg-white hover:bg-zinc-50 rounded-xl p-4 text-center transition cursor-pointer mb-4 group flex-shrink-0 shadow-sm"
    >
      <span class="text-xs text-zinc-500 group-hover:text-zinc-800 font-bold flex items-center justify-center gap-1.5">
        <img src="/src/lib/icons/icon-plus-circle.svg" alt="Add" class="w-3.5 h-3.5 opacity-70" />
        + เพิ่มแหล่งข้อมูล (RAG)
      </span>
    </button>
    
    <div class="flex-1 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
      {#each sources as source (source.id)}
        <div class="p-3 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-medium cursor-pointer transition shadow-sm flex items-center gap-2.5 text-zinc-700">
          {#if source.type === 'pdf'}
            <img src="/src/lib/icons/icon-folder.svg" alt="PDF" class="w-3.5 h-3.5 text-red-500 flex-shrink-0" />
            <span class="truncate flex-1">{source.name}</span>
          {:else}
            <img src="/src/lib/icons/icon-globe.svg" alt="Link" class="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span class="truncate flex-1">{source.name}</span>
          {/if}
        </div>
      {/each}
    </div>
  </div>
{:else}
  <div class="w-full h-full flex flex-col items-center p-2 box-border pt-4">
    <button 
      onclick={() => isOpen = true}
      class="w-9 h-9 rounded-full border border-zinc-200 hover:bg-zinc-50 transition cursor-pointer flex items-center justify-center bg-white shadow-sm active:scale-95 focus:outline-none"
      title="กางเปิดคลังข้อมูล"
    >
      <img src="/src/lib/icons/icon-library.svg" alt="Library Open" class="w-4 h-4 text-zinc-600" />
    </button>
  </div>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 4px; }
</style>