import { supabase } from '$lib/supabaseClient';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, parent }) => {
  // โหลด layout data (สำหรับ user)
  const layoutData = await parent();
  
  // 1. ดึงข้อมูล notebook
  const { data: notebook, error: notebookError } = await supabase
    .from('notebooks')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (notebookError || !notebook) {
    throw new Error('Notebook not found');
  }
  
  // 2. ดึงรายการโน้ตใน notebook นี้
  const { data: items, error: itemsError } = await supabase
    .from('notebook_items')
    .select(`
      id,
      type,
      title,
      source_id,
      content,
      created_at,
      updated_at
    `)
    .eq('notebook_id', params.id)
    .order('created_at', { ascending: false });
  
  // 3. ถ้ามี source_id ให้โหลดข้อมูลเพิ่ม
  let enrichedItems = items || [];
  
  // ดึงข้อมูลจาก chat_sessions
  const chatIds = items
    ?.filter(item => item.type === 'chat' && item.source_id)
    .map(item => item.source_id) || [];
  
  if (chatIds.length > 0) {
    const { data: chats } = await supabase
      .from('chat_sessions')
      .select('id, title, created_at, updated_at')
      .in('id', chatIds);
    
    // Merge ข้อมูล
    enrichedItems = enrichedItems.map(item => {
      if (item.type === 'chat' && item.source_id) {
        const chat = chats?.find(c => c.id === item.source_id);
        if (chat) {
          return { ...item, sourceData: chat };
        }
      }
      return item;
    });
  }
  
  // ดึงข้อมูลจาก posts (blog)
  const postIds = items
    ?.filter(item => item.type === 'blog' && item.source_id)
    .map(item => item.source_id) || [];
  
  if (postIds.length > 0) {
    const { data: posts } = await supabase
      .from('posts')
      .select('id, title, slug, published, created_at')
      .in('id', postIds);
    
    enrichedItems = enrichedItems.map(item => {
      if (item.type === 'blog' && item.source_id) {
        const post = posts?.find(p => p.id === item.source_id);
        if (post) {
          return { ...item, sourceData: post };
        }
      }
      return item;
    });
  }
  
  return {
    notebook,
    items: enrichedItems,
  };
};