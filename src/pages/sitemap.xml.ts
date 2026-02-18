import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';

export async function GET(context: APIContext) {
  const site = context.site!.href.replace(/\/$/, '');
  const posts = (await getCollection('workshop', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const staticPages = ['/', '/about/', '/gallery/', '/downloads/', '/workshop/'];

  const urls = [
    ...staticPages.map((path) => `  <url><loc>${site}${path}</loc></url>`),
    ...posts.map(
      (post) =>
        `  <url><loc>${site}/workshop/${post.id}/</loc><lastmod>${post.data.date.toISOString().slice(0, 10)}</lastmod></url>`,
    ),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
