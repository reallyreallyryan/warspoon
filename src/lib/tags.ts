import type { CollectionEntry } from 'astro:content';

export const TAG_MIN_POSTS = 2;

export function getFilterableTags(posts: CollectionEntry<'workshop'>[]): string[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .filter(([, count]) => count >= TAG_MIN_POSTS)
    .map(([tag]) => tag)
    .sort();
}
