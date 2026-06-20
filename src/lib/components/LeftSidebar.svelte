<!-- src/lib/components/LeftSidebar.svelte -->
<div class="glass-panel h-full flex flex-col p-4">
  <div class="flex items-center justify-between mb-6">
    <span class="font-semibold text-zinc-800 text-lg">แหล่งข้อมูล</span>
  </div>

  <!-- ปุ่มเพิ่มเอกสารอ้างอิง -->
  <button class="border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center hover:bg-zinc-50 transition cursor-pointer mb-4">
    <span class="text-sm text-zinc-500 font-medium">+ เพิ่มแหล่งข้อมูล</span>
  </button>
  
  <!-- รายการเอกสาร -->
  <div class="flex-1 overflow-y-auto space-y-2">
    <div class="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-lg border border-[var(--border)] text-sm cursor-pointer transition">
      📄 ข้อมูลผูกดวงชะตา.pdf
    </div>
    <div class="p-3 bg-zinc-50 hover:bg-zinc-100 rounded-lg border border-[var(--border)] text-sm cursor-pointer transition">
      🌐 ลิงก์บันทึกโหราศาสตร์.link
    </div>
  </div>
</div>