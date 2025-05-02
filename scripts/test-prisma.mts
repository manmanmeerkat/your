// scripts/test-prisma.mts
import { prisma } from '../lib/prisma.ts';

const articles = await prisma.article.findMany({
  select: { slug: true },
});

console.log('✅ Prisma articles:', articles);
process.exit();