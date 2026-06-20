<script lang="ts">
  import ThemeToggle from './ThemeToggle.svelte';
  let darkMode = $state(false);
</script>

<div class="glass-panel h-full flex flex-col p-4 bg-[var(--bg-surface)] text-[var(--text-main)]">
  <div class="flex items-center justify-between mb-6 pb-2 border-b border-[var(--border)]">
    <span class="font-semibold text-zinc-800 dark:text-zinc-100 text-base">📁 แหล่งข้อมูล</span>
    <ThemeToggle bind:darkMode />
  </div>

  <button class="border-2 border-dashed border-[var(--border)] rounded-xl p-5 text-center bg-zinc-50/30 hover:bg-zinc-100/50 dark:bg-zinc-800/20 dark:hover:bg-zinc-800/50 transition-all cursor-pointer mb-4 group">
    <span class="text-xs text-zinc-500 dark:text-zinc-400 font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
      + เพิ่มแหล่งข้อมูล
    </span>
  </button>
  
  <div class="flex-1 overflow-y-auto space-y-2 pr-1">
    <div class="p-3 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 rounded-lg border border-[var(--border)] text-xs cursor-pointer transition-all flex items-center gap-2">
      <span>📄</span> <span class="truncate text-zinc-700 dark:text-zinc-300">ข้อมูลผูกดวงชะตา.pdf</span>
    </div>
    <div class="p-3 bg-zinc-50 dark:bg-zinc-800/40 hover:bg-zinc-100 dark:hover:bg-zinc-800/70 rounded-lg border border-[var(--border)] text-xs cursor-pointer transition-all flex items-center gap-2">
      <span>🌐</span> <span class="truncate text-zinc-700 dark:text-zinc-300">ลิงก์บันทึกโหราศาสตร์.link</span>
    </div>
  </div>
</div>