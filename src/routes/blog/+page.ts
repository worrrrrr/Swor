import { supabase } from '$lib/supabaseClient';
import type { PageLoad } from './$types';

function makeExcerpt(content: string, maxLen = 200): string {
  const plain = content
    .replace(/^#+\s+/gm, '')
    .replace(/\*{1,2}(.+?)\*{1,2}/g, '$1')
    .replace(/`{1,3}.+?`{1,3}/g, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/!\[.*?\]\(.+?\)/g, '')
    .replace(/[-*_]{3,}/g, '')
    .replace(/\n{2,}/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plain.length > maxLen ? plain.slice(0, maxLen) + '…' : plain;
}

export const load: PageLoad = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  const { data: published } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })
    .limit(20);

  let drafts: any[] = [];
  if (user) {
    const { data: userDrafts } = await supabase
      .from('posts')
      .select('*')
      .eq('published', false)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);
    drafts = userDrafts ?? [];
  }

  const postsWithExcerpt = (published ?? []).map((p) => ({
    ...p,
    excerpt: makeExcerpt(p.content || ''),
  }));

  const draftsWithExcerpt = drafts.map((p) => ({
    ...p,
    excerpt: makeExcerpt(p.content || ''),
  }));

  return {
    published: postsWithExcerpt,
    drafts: draftsWithExcerpt,
    userId: user?.id || null,
  };
};
