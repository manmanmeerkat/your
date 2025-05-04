import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm'; // GFM（GitHub Flavored Markdown）プラグインを追加
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export function processMarkdown(markdown: string): string {
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm) // GFMサポートを追加
    .use(remarkRehype)
    .use(rehypeHighlight)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeStringify)
    .processSync(markdown);

  return String(file);
}