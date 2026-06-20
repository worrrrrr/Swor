<script lang="ts">
  let { isOpen = $bindable(true) } = $props<{ isOpen?: boolean }>();

  let chatSessions = $state([
    { id: 'session-1', title: 'ตรวจดวงพิชัยสงครามปี 2026' },
    { id: 'session-2', title: 'วิเคราะห์พื้นดวงจีนสี่แถว (BaZi)' }
  ]);
  let activeSessionId = $state('session-1');

  function createNewChat() {
    const title = `บันทึกดวงชะตาใหม่ #${chatSessions.length + 1}`;
    chatSessions = [{ id: crypto.randomUUID(), title }, ...chatSessions];
  }
</script>

{#if isOpen}
  <div class="w-full h-full flex flex-col p-4 box-border">
    <div class="flex items-center gap-2 mb-5 flex-shrink-0 h-9">
      <button 
        onclick={() => isOpen = false}
        class="w-8 h-8 rounded-full border border-zinc-200 hover:bg-zinc-50 transition cursor-pointer flex items-center justify-center bg-white shadow-sm active:scale-95 focus:outline-none"
        title="ซ่อนเมนูซ้าย"
      >
        <img src="/src/lib/icons/icon-home.svg" alt="Home Close" class="w-4 h-4 text-zinc-600" />
      </button>
      <span class="font-bold text-sm text-zinc-900 tracking-tight">AstroAI Core</span>
    </div>

    <button 
      onclick={createNewChat}
      class="w-full flex items-center justify-center gap-2 py-2 px-4 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-bold transition shadow-sm cursor-pointer text-zinc-800 flex-shrink-0 mb-4"
    >
      <img src="/src/lib/icons/icon-plus.svg" alt="Plus" class="w-3.5 h-3.5" />
      ผูกดวงชะตาบทใหม่
    </button>

    <div class="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
      <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider px-2 block mb-2">ประวัติคำทำนาย</span>
      {#each chatSessions as session (session.id)}
        <button 
          onclick={() => activeSessionId = session.id}
          class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition text-left cursor-pointer {
            activeSessionId === session.id ?
            'bg-zinc-100 text-zinc-900 font-bold border border-zinc-200' : 'hover:bg-zinc-50 text-zinc-600 hover:text-zinc-900 border border-transparent'
          }"
        >
          <img src="/src/lib/icons/icon-chat.svg" alt="Chat" class="w-3.5 h-3.5 opacity-70" />
          <span class="truncate flex-1">{session.title}</span>
        </button>
      {/each}
    </div>

    <div class="pt-4 border-t border-zinc-100 mt-auto flex items-center gap-2 flex-shrink-0">
      <div class="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center shadow-sm overflow-hidden">
        <img src="/src/lib/icons/icon-user.svg" alt="User Profile" class="w-4 h-4 text-zinc-500" />
      </div>
      <div class="flex flex-col text-xs min-w-0">
        <span class="text-zinc-800 font-bold truncate w-28">Senior Architect</span>
        <span class="text-zinc-400 text-[10px]">Premium Member</span>
      </div>
    </div>
  </div>
{:else}
  <div class="w-full h-full flex flex-col items-center p-2 box-border pt-4">
    <button 
      onclick={() => isOpen = true}
      class="w-9 h-9 rounded-full border border-zinc-200 hover:bg-zinc-50 transition cursor-pointer flex items-center justify-center bg-white shadow-sm active:scale-95 focus:outline-none"
      title="แสดงเมนูซ้าย"
    >
      <img src="/src/lib/icons/icon-home.svg" alt="Home Open" class="w-4 h-4 text-zinc-600" />
    </button>
  </div>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar { width: 4px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #e4e4e7; border-radius: 4px; }
</style>