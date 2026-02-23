import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { SITE_TITLE, SITE_DESCRIPTION } from '../consts';

export async function GET(context: APIContext) {
  const site = context.site!.href.replace(/\/$/, '');
  const posts = (await getCollection('workshop', ({ data }) => !data.draft))
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

  const mainPages = [
    `- [Home](${site}/): Recent hobby posts and site overview`,
    `- [Workshop](${site}/workshop/): Painting tutorials, paint recipes, and hobby projects`,
    `- [Gallery](${site}/gallery/): Photos of painted miniatures, terrain, and hobby projects`,
    `- [Downloads](${site}/downloads/): Free STL files for 3D printing terrain and accessories`,
    `- [About](${site}/about/): About Warspoon and the hobbyist behind it`,
    `- [FAQ](${site}/faq/): Answers to common miniature painting, basing, and 3D printing questions`,
  ];

  const workshopPosts = posts.map(
    (post) => `- [${post.data.title}](${site}/workshop/${post.id}/): ${post.data.description}`,
  );

  const body = `# ${SITE_TITLE}

> ${SITE_DESCRIPTION}

## Main Pages
${mainPages.join('\n')}

## Workshop Posts
${workshopPosts.join('\n')}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
