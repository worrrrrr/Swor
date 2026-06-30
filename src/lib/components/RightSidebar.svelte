<script lang="ts">
  import { page } from '$app/state';
  import { goto } from '$app/navigation';
  import { supabase } from '$lib/supabaseClient';
  import { chatStore } from '$lib/chatStore.svelte';
  import Icon from './Icon.svelte';

  let { isOpen = $bindable(true) } = $props();

  let isNotebookPage = $derived(
    page.url.pathname.startsWith('/notebook/') && page.params.id
  );

  let isChatPage = $derived(
    page.url.pathname.startsWith('/chat/') && page.params.id
  );

  let isActivePage = $derived(
    isChatPage ||
    (page.url.pathname.startsWith('/blog/') && page.params.slug) ||
    isNotebookPage
  );

  function extractTag(content: string, tag: string): string | null {
    const regex = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = content.match(regex);
    return match ? match[1].trim() : null;
  }

  function stripTags(text: string): string {
    const tags = ['summary', 'blog', 'table', 'infographic', 'steps', 'code'];
    let result = text;
    for (const tag of tags) {
      result = result.replace(new RegExp(`<${tag}>[\\s\\S]*?<\\/${tag}>`, 'gi'), '');
    }
    return result.trim();
  }

  function chatToFormat(messages: any[], format: string, title: string): string {
    const assistantMsgs = messages.filter(m => m.role === 'assistant');

    // Try to use tagged content first
    if (format !== 'blog' && format !== 'summary') {
      for (const msg of assistantMsgs) {
        const extracted = extractTag(msg.content, format);
        if (extracted) {
          if (format === 'table') {
            return `# ${title}\n\n${extracted}`;
          }
          if (format === 'infographic') {
            return `# ${title}\n\n${extracted}`;
          }
          if (format === 'steps') {
            return `# ${title}\n\n${extracted}`;
          }
          if (format === 'code') {
            return `# ${title}\n\n\`\`\`\n${extracted}\n\`\`\``;
          }
        }
      }
    }

    // Fallback: generic formatting
    const pairs: { q: string; a: string }[] = [];
    let currentQ = '';
    for (const msg of messages) {
      if (msg.role === 'user') {
        currentQ = msg.content;
      } else if (msg.role === 'assistant' && currentQ) {
        pairs.push({ q: currentQ, a: stripTags(msg.content) });
        currentQ = '';
      }
    }

    switch (format) {
      case 'blog': {
        if (pairs.length === 0) {
          const all = assistantMsgs.map(m => stripTags(m.content)).join('\n\n');
          return `# ${title}\n\n${all}`;
        }
        let blog = `# ${title}\n\n`;
        const firstQ = pairs[0].q.replace(/^#+\s*/gm, '').slice(0, 150);
        blog += `> ${firstQ}\n\n---\n\n`;
        for (const p of pairs) {
          const st = p.q.replace(/^#+\s*/gm, '').slice(0, 80);
          blog += `## ${st}\n\n${stripTags(p.a)}\n\n---\n\n`;
        }
        return blog;
      }
      case 'summary': {
        const points = assistantMsgs.map(m => {
          const text = stripTags(m.content);
          const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
          return sentences.slice(0, 3).map(s => `- ${s.trim()}`).join('\n');
        }).filter(Boolean);
        return `# สรุป: ${title}\n\n> จากบทสนทนา ${messages.length} ข้อความ\n\n---\n\n${points.join('\n\n')}`;
      }
      case 'table': {
        let table = `# ${title}\n\n`;
        for (const p of pairs) {
          const lines = stripTags(p.a).split('\n').filter(l => l.trim());
          if (lines.some(l => l.includes('|') || l.includes('\t') || l.includes(','))) {
            table += `### ${p.q.slice(0, 60)}\n\n| รายการ | รายละเอียด |\n|-------|-----------|\n`;
            for (const line of lines.slice(0, 8)) {
              const clean = line.replace(/[|,\t]/g, ' | ').replace(/^[-*]\s*/, '');
              table += `| ${clean} |\n`;
            }
            table += '\n';
          } else {
            table += `### ${p.q.slice(0, 60)}\n\n${lines.join('\n')}\n\n`;
          }
        }
        return table;
      }
      case 'infographic': {
        let info = `# ${title}\n\n<div class="infographic">\n\n`;
        for (const p of pairs) {
          const lines = stripTags(p.a).split('\n').filter(l => l.trim());
          const key = p.q.replace(/^#+\s*/gm, '').slice(0, 60);
          info += `## 📌 ${key}\n\n`;
          for (const line of lines.slice(0, 6)) {
            const clean = line.replace(/^[-*]\s*/, '');
            if (/^\d+/.test(clean)) {
              info += `🔹 ${clean}\n\n`;
            } else if (clean.length > 30) {
              info += `▸ ${clean}\n\n`;
            } else {
              info += `• **${clean}**\n\n`;
            }
          }
          info += `---\n\n`;
        }
        return info + `</div>`;
      }
      case 'steps': {
        let steps = `# ขั้นตอน: ${title}\n\n`;
        let stepNum = 1;
        for (const p of pairs) {
          const lines = stripTags(p.a).split('\n').filter(l => l.trim());
          for (const line of lines.slice(0, 10)) {
            const clean = line.replace(/^\d+[.)]\s*/, '').replace(/^[-*]\s*/, '');
            if (clean) {
              steps += `### ขั้นตอนที่ ${stepNum}\n\n${clean}\n\n`;
              stepNum++;
            }
          }
        }
        return steps;
      }
      case 'code': {
        let code = `# ${title}\n\n`;
        for (const msg of assistantMsgs) {
          const codeBlocks = msg.content.match(/```[\s\S]*?```/g);
          if (codeBlocks) {
            code += codeBlocks.map((b: string) => `${b}\n\n`).join('');
          } else {
            code += `\`\`\`\n${stripTags(msg.content)}\n\`\`\`\n\n`;
          }
        }
        return code;
      }
      default:
        return chatToFormat(messages, 'blog', title);
    }
  }

  let converting_fmt = $state<string | null>(null);

  async function convertCurrentChat(format: string) {
    const messages = chatStore.activeSession?.messages?.filter(m => m.role !== 'system') || [];
    if (messages.length === 0) {
      alert('แชทนี้ยังไม่มีข้อความ');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const session = chatStore.activeSession;
    const title = session?.title || 'ไม่มีชื่อ';
    const formatLabels: Record<string, string> = {
      blog: 'บทความ', summary: 'สรุป', table: 'ตาราง',
      infographic: 'อินโฟกราฟิก', steps: 'ขั้นตอน', code: 'โค้ด',
    };

    const postTitle = `${title} (${formatLabels[format] || format})`;
    const slugBase = title.toLowerCase().replace(/[^a-z0-9ก-๙]+/g, '-').replace(/^-|-$/g, '') || 'from-chat';
    const slug = `${slugBase}-${Date.now().toString(36)}`;

    converting_fmt = format;

    let content: string;
    try {
      const res = await fetch('/api/chat/convert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, format, title }),
      });
      if (!res.ok) throw new Error('AI conversion failed');
      const data = await res.json() as { content: string };
      content = data.content;
    } catch {
      content = chatToFormat(messages, format, title);
    }

    const { data: post } = await supabase
      .from('posts')
      .insert({ title: postTitle, slug, content, published: false, user_id: user.id })
      .select('id')
      .single();

    converting_fmt = null;
    goto(`/blog/${slug}/edit`);
  }

  function downloadChatTxt() {
    const messages = chatStore.activeSession?.messages?.filter(m => m.role !== 'system') || [];
    if (messages.length === 0) { alert('แชทนี้ยังไม่มีข้อความ'); return; }

    const title = chatStore.activeSession?.title || 'แชท';
    const text = messages
      .map(m => {
        const label = m.role === 'user' ? 'คุณ' : 'SWOR';
        return `[${label}]\n${m.content}`;
      })
      .join('\n\n---\n\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // แบ่ง format เป็นกลุ่ม
  const formatGroups = [
    {
      label: 'AI สร้างเนื้อหา',
      items: [
        { key: 'blog', icon: 'publish', label: 'บทความ', desc: 'เขียนบทความจากแชท', color: 'text-blue-500' },
        { key: 'summary', icon: 'list', label: 'สรุป', desc: 'สรุปประเด็นสำคัญ', color: 'text-emerald-500' },
        { key: 'table', icon: 'library', label: 'ตาราง', desc: 'จัดข้อมูลเป็นตาราง', color: 'text-violet-500' },
        { key: 'infographic', icon: 'ai', label: 'อินโฟ', desc: 'อินโฟกราฟิกข้อความ', color: 'text-amber-500' },
        { key: 'steps', icon: 'coder', label: 'ขั้นตอน', desc: 'ขั้นตอนทีละขั้น', color: 'text-rose-500' },
        { key: 'code', icon: 'globe', label: 'โค้ด', desc: 'ดึงเฉพาะโค้ด', color: 'text-zinc-600' },
      ],
    },
    {
      label: 'ดาวน์โหลด',
      items: [
        { key: 'txt', icon: 'message', label: '.txt', desc: 'แชทเป็นไฟล์ข้อความ', color: 'text-zinc-500' },
      ],
    },
  ];
</script>

<aside
  class="bg-white border rounded-2xl shadow-sm flex flex-col overflow-hidden transition-all duration-300 shrink-0 box-border
  {isOpen ? 'w-72 ml-4 border-amber-200/80' : 'w-16 ml-4 border-amber-200/80'}"
  style="border-right: 3px solid #f59e0b;"
>
  <div class="h-14 px-3 flex items-center {isOpen ? 'justify-between' : 'justify-center'} shrink-0"
    style="background: linear-gradient(135deg, #f59e0b, #fbbf24);">
    <button
      onclick={() => isOpen = !isOpen}
      class="p-2 hover:bg-white/20 text-white/80 rounded-xl transition-all active:scale-95 flex items-center justify-center"
      aria-label="Toggle Sidebar"
    >
      <Icon name="list" size={18} class="text-white" />
    </button>
    {#if isOpen}
      <span class="text-xs font-bold text-white/80 uppercase tracking-wider">Format Studio</span>
    {/if}
  </div>

  <div class="flex-1 overflow-y-auto p-2 space-y-2">
    {#each formatGroups as group}
      <div class="group-section">
        {#if isOpen}
          <p class="group-label">{group.label}</p>
          <div class="format-grid">
            {#each group.items as fmt}
              <button
                class="format-card"
                class:disabled={!isActivePage || converting_fmt !== null}
                class:converting={converting_fmt === fmt.key}
                onclick={() => {
                  if (!isActivePage || converting_fmt !== null) return;
                  if (fmt.key === 'txt') { downloadChatTxt(); return; }
                  convertCurrentChat(fmt.key);
                }}
                disabled={!isActivePage || converting_fmt !== null}
                type="button"
              >
                {#if converting_fmt === fmt.key}
                  <span class="convert-spinner"></span>
                  <span>กำลังสร้าง...</span>
                {:else}
                  <div class="card-icon-wrap">
                    <Icon name={fmt.icon} size={16} class={fmt.color} />
                  </div>
                  <div class="card-text">
                    <span class="card-label">{fmt.label}</span>
                    <span class="card-desc">{fmt.desc}</span>
                  </div>
                {/if}
              </button>
            {/each}
          </div>
        {:else}
          <div class="collapsed-icons">
            {#each group.items as fmt}
              <button
                class="collapsed-icon-btn"
                title={fmt.label}
                onclick={() => {
                  if (!isActivePage) return;
                  if (fmt.key === 'txt') { downloadChatTxt(); return; }
                  convertCurrentChat(fmt.key);
                }}
                disabled={!isActivePage}
                type="button"
              >
                <Icon name={fmt.icon} size={16} class={fmt.color} />
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  </div>

  {#if isOpen}
    <div class="p-2.5 shrink-0" style="background: linear-gradient(180deg, transparent, #fffbeb);">
      <hr class="border-t border-amber-100 mb-2" />
      <p class="text-[9px] text-amber-500/50 text-center">คลิกเพื่อสร้างเนื้อหาจากแชทปัจจุบัน</p>
    </div>
  {/if}
</aside>

<style>
  .group-section {
    margin-bottom: 2px;
  }

  .group-label {
    font-size: 9px;
    font-weight: 700;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0 4px;
    margin: 0 0 6px 0;
  }

  .format-grid {
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .format-card {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    text-align: left;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    background: white;
    cursor: pointer;
    transition: all 0.15s;
  }
  .format-card:hover:not(.disabled) {
    border-color: #f59e0b;
    background: #fffbeb;
  }
  .format-card.disabled {
    opacity: 0.35;
    cursor: not-allowed;
    background: #fafafa;
    border-color: #f1f5f9;
  }
  .format-card.converting {
    border-color: #f59e0b;
    background: #fffbeb;
    justify-content: center;
    gap: 6px;
    color: #b45309;
    font-size: 11px;
    font-weight: 500;
  }

  .card-icon-wrap {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f8fafc;
    border-radius: 8px;
    flex-shrink: 0;
  }
  .format-card:hover:not(.disabled) .card-icon-wrap {
    background: #fff7ed;
  }

  .card-text {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 1px;
  }

  .card-label {
    font-size: 12px;
    font-weight: 600;
    color: #0f172a;
  }

  .card-desc {
    font-size: 10px;
    color: #94a3b8;
    line-height: 1.2;
  }

  .collapsed-icons {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 4px 0;
  }

  .collapsed-icon-btn {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid transparent;
    background: white;
    cursor: pointer;
    transition: all 0.12s;
  }
  .collapsed-icon-btn:hover:not(:disabled) {
    border-color: #f59e0b;
    background: #fffbeb;
  }
  .collapsed-icon-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .convert-spinner {
    display: inline-block;
    width: 14px;
    height: 14px;
    border: 2px solid #fde68a;
    border-top-color: #f59e0b;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }
</style>
