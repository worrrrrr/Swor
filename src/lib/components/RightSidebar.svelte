<!-- src/lib/components/RightSidebar.svelte -->
<script lang="ts">
  import ChatBubble from './ChatBubble.svelte';
  import ChatInput from './ChatInput.svelte';
</script>

<div class="glass-panel h-full flex flex-col border-l border-[var(--border)]">
  <!-- หัวข้อแชต -->
  <div class="p-4 border-b border-[var(--border)] bg-zinc-50">
    <span class="font-semibold text-zinc-700">ถามตอบเกี่ยวกับสมุดบันทึก</span>
  </div>

  <!-- พื้นที่แสดงข้อความสนทนา -->
  <div class="flex-1 overflow-y-auto p-4 space-y-4">
    <!-- ตัวอย่างข้อความจากระบบ -->
    <ChatBubble role="assistant" content="สวัสดีครับ ผมได้ทำการวิเคราะห์แหล่งข้อมูลทั้งหมดที่คุณอัปโหลดไว้แล้ว สามารถสอบถามข้อมูลเชิงลึกได้เลยครับ" />
  </div>

  <!-- ฟอร์มส่งข้อมูล (แชตบาร์) -->
  <div class="p-4 border-t border-[var(--border)] bg-zinc-50">
    <ChatInput />
  </div>
</div>