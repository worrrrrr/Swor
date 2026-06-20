<script lang="ts">
  import ChatBubble from './ChatBubble.svelte';
  import ChatInput from './ChatInput.svelte';
  import { messages } from '$lib/chatStore';

  let chatContainer = $state<HTMLDivElement | null>(null);

  // ฟังก์ชันช่วยเลื่อนแชตลงด้านล่างสุดโดยอัตโนมัติ
  function scrollToBottom() {
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: 'smooth'
      });
    }
  }

  // Svelte 5: ตรวจจับสเตตจำนวนข้อความเปลี่ยนเพื่อเลื่อนอัตโนมัติ
  $effect(() => {
    const messageCount = $messages.length;
    if (messageCount > 0) {
      setTimeout(scrollToBottom, 60); // ทิ้งจังหวะให้ DOM เรนเดอร์ข้อความเสร็จสิ้นก่อนเลื่อน
    }
  });

  function handleSendMessage(text: string) {
    // 1. เพิ่มข้อความของผู้ใช้ลงไปใน Store
    messages.update(prev => [
      ...prev,
      { id: crypto.randomUUID(), role: 'user', content: text }
    ]);

    // 2. จำลองการตอบกลับอัตโนมัติจากระบบ (Mock Response เพื่อทดสอบระบบส่งข้อมูล)
    setTimeout(() => {
      messages.update(prev => [
        ...prev,
        { 
          id: crypto.randomUUID(), 
          role: 'assistant', 
          content: `ได้รับคำถามเรื่อง "${text}" แล้วครับ ระบบกำลังประมวลผลข้อมูลทางโหราศาสตร์ตามเอกสารอ้างอิงของคุณสักครู่...` 
        }
      ]);
    }, 800);
  }
</script>

<div class="glass-panel h-full flex flex-col border-l border-[var(--border)] bg-[var(--bg-surface)] text-[var(--text-main)]">
  <div class="p-4 border-b border-[var(--border)] bg-zinc-50 dark:bg-zinc-800/40">
    <span class="font-semibold text-zinc-700 dark:text-zinc-200 text-sm">💬 ถามตอบเกี่ยวกับสมุดบันทึก</span>
  </div>

  <div 
    bind:this={chatContainer}
    class="flex-1 overflow-y-auto p-4 space-y-4 bg-white/50 dark:bg-zinc-900/10"
  >
    {#each $messages as msg (msg.id)}
      <ChatBubble role={msg.role} content={msg.content} />
    {/each}
  </div>

  <div class="p-4 border-t border-[var(--border)] bg-zinc-50 dark:bg-zinc-800/40">
    <ChatInput onSend={handleSendMessage} />
  </div>
</div>